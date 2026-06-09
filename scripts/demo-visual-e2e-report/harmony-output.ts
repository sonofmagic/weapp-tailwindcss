import fs from 'node:fs/promises'
import path from 'pathe'
import postcss from 'postcss'
import { escape as escapeClassName } from 'weapp-tailwindcss/escape'

type StyleValue = Record<string, Record<string, string | number>>

const jsRE = /\.js$/
const appJsRE = /(?:^|[/\\])App\.js$/
const styleDeclRE = /const\s+_style_\d+\s*=\s*\{/g
const styleBlockRE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi
const classSelectorRE = /^\.((?:\\[^\n\r\f]|[\w-])+)(?=[.:#[\s]|$)/
const stringLiteralRE = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g

function normalizeCssValue(value: string) {
  const trimmed = value.trim()
  if (/^-?\d+(?:\.\d+)?px$/.test(trimmed)) {
    return Number(trimmed.slice(0, -2))
  }
  return trimmed.replace(/\s*,\s*/g, ',')
}

function normalizeCssProp(prop: string) {
  if (prop.startsWith('--')) {
    return prop
  }
  return prop.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())
}

function unescapeCssClassSelector(className: string) {
  return className.replace(/\\([^\n\r\f0-9a-f])/gi, '$1')
}

function mergeDeclarations(
  target: Record<string, string | number>,
  source: Record<string, string | number> | undefined,
) {
  if (!source) {
    return
  }
  Object.assign(target, source)
}

function setStyleValue(
  styles: StyleValue,
  className: string,
  declarations: Record<string, string | number>,
) {
  if (Object.keys(declarations).length === 0) {
    return
  }
  const unescaped = unescapeCssClassSelector(className)
  for (const key of new Set([className, unescaped, escapeClassName(unescaped)])) {
    styles[key] = { '': declarations }
  }
}

function normalizeRuleDeclarations(
  className: string,
  declarations: Record<string, string | number>,
) {
  if (className === 'text-white' && declarations.color === '#fff') {
    return {
      '--tw-text-opacity': '1',
      ...declarations,
    }
  }
  return declarations
}

function parseCssStyleValue(source: string) {
  let root: postcss.Root
  try {
    root = postcss.parse(source)
  }
  catch {
    return {}
  }

  const result: StyleValue = {}
  root.walkRules((rule) => {
    const selectors = rule.selectors ?? [rule.selector]
    for (const selector of selectors) {
      const className = selector.trim().match(classSelectorRE)?.[1]
      if (!className) {
        continue
      }
      const declarations: Record<string, string | number> = {}
      rule.walkDecls((decl) => {
        declarations[normalizeCssProp(decl.prop)] = normalizeCssValue(decl.value)
      })
      setStyleValue(result, className, normalizeRuleDeclarations(
        unescapeCssClassSelector(className),
        declarations,
      ))
    }
  })
  return result
}

function parseSourceMapSourcesContent(source: string) {
  try {
    const map = JSON.parse(source) as { sourcesContent?: unknown }
    return Array.isArray(map.sourcesContent)
      ? map.sourcesContent.filter((item): item is string => typeof item === 'string')
      : []
  }
  catch {
    return []
  }
}

function extractStyleSources(source: string) {
  if (!source.includes('<style')) {
    return source.includes('@apply') ? [source] : []
  }
  return [...source.matchAll(styleBlockRE)]
    .map(match => match[1]?.trim() ?? '')
    .filter(styleSource => styleSource.includes('@apply'))
}

function splitCandidateTokens(value: string) {
  return value.split(/\s+/).map(item => item.trim()).filter(Boolean)
}

function parseHexColor(value: string) {
  const hex = value.length === 3
    ? value.split('').map(char => `${char}${char}`).join('')
    : value
  if (!/^[0-9a-f]{6}$/i.test(hex)) {
    return
  }
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ] as const
}

function parseOpacity(value: string | undefined) {
  if (!value) {
    return 1
  }
  const bracket = value.match(/^\[(\d+(?:\.\d+)?|\.\d+)\]$/)?.[1]
  if (bracket) {
    return Number(bracket)
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric / 100 : 1
}

function createRgba(hex: string, opacity?: string) {
  const color = parseHexColor(hex)
  if (!color) {
    return
  }
  return `rgba(${color[0]},${color[1]},${color[2]},${parseOpacity(opacity)})`
}

function resolveArbitraryUtilityDeclarations(utility: string) {
  const bgMatch = utility.match(/^bg-\[#([0-9a-f]{3,6})\](?:\/(.+))?$/i)
  if (bgMatch?.[1]) {
    const color = createRgba(bgMatch[1], bgMatch[2])
    return color ? { backgroundColor: color } : undefined
  }

  const textColorMatch = utility.match(/^text-\[#([0-9a-f]{3,6})\](?:\/(.+))?$/i)
  if (textColorMatch?.[1]) {
    const color = createRgba(textColorMatch[1], textColorMatch[2])
    return color ? { color } : undefined
  }

  const sizeMatch = utility.match(/^(w|h|mt)-\[(-?\d+(?:\.\d+)?)px\]$/)
  if (sizeMatch?.[1] && sizeMatch[2]) {
    const prop = sizeMatch[1] === 'w'
      ? 'width'
      : sizeMatch[1] === 'h'
        ? 'height'
        : 'marginTop'
    return { [prop]: Number(sizeMatch[2]) }
  }
}

function resolveUtilityDeclarations(utility: string, utilityStyles: StyleValue) {
  return utilityStyles[utility]?.['']
    ?? utilityStyles[escapeClassName(utility)]?.['']
    ?? resolveArbitraryUtilityDeclarations(utility)
}

function createStyleValueFromApplySources(sources: string[], utilityStyles: StyleValue) {
  const result: StyleValue = {}
  for (const source of sources) {
    for (const styleSource of extractStyleSources(source)) {
      let root: postcss.Root
      try {
        root = postcss.parse(styleSource)
      }
      catch {
        continue
      }
      root.walkRules((rule) => {
        const applyRules = rule.nodes?.filter((node): node is postcss.AtRule => {
          return node.type === 'atrule' && node.name === 'apply'
        }) ?? []
        if (applyRules.length === 0) {
          return
        }
        const selectors = rule.selectors ?? [rule.selector]
        for (const selector of selectors) {
          const className = selector.trim().match(classSelectorRE)?.[1]
          if (!className) {
            continue
          }
          const declarations: Record<string, string | number> = {}
          for (const applyRule of applyRules) {
            for (const utility of splitCandidateTokens(applyRule.params)) {
              mergeDeclarations(declarations, resolveUtilityDeclarations(utility, utilityStyles))
            }
          }
          setStyleValue(result, className, declarations)
        }
      })
    }
  }
  return result
}

function collectUsedClassNames(code: string) {
  const used = new Set<string>()
  for (const match of code.matchAll(stringLiteralRE)) {
    for (const candidate of splitCandidateTokens(match[2] ?? '')) {
      used.add(candidate)
    }
  }
  return used
}

function findObjectEnd(source: string, start: number) {
  let depth = 0
  let quote: string | undefined
  let escaped = false
  for (let index = start; index < source.length; index++) {
    const char = source[index]
    if (quote) {
      if (escaped) {
        escaped = false
      }
      else if (char === '\\') {
        escaped = true
      }
      else if (char === quote) {
        quote = undefined
      }
      continue
    }
    if (char === '"' || char === '\'' || char === '`') {
      quote = char
      continue
    }
    if (char === '{') {
      depth++
      continue
    }
    if (char === '}') {
      depth--
      if (depth === 0) {
        return index + 1
      }
    }
  }
}

function findFirstStyleObject(source: string) {
  styleDeclRE.lastIndex = 0
  const match = styleDeclRE.exec(source)
  if (!match) {
    return
  }
  const objectStart = source.indexOf('{', match.index)
  if (objectStart < 0) {
    return
  }
  const objectEnd = findObjectEnd(source, objectStart)
  if (!objectEnd) {
    return
  }
  return { objectStart, objectEnd }
}

async function pathExists(file: string) {
  try {
    await fs.access(file)
    return true
  }
  catch {
    return false
  }
}

async function readExistingUtf8(file: string) {
  return await pathExists(file) ? fs.readFile(file, 'utf8') : undefined
}

async function walkFiles(dir: string) {
  if (!(await pathExists(dir))) {
    return []
  }
  const result: string[] = []
  const entries = await fs.readdir(dir, { withFileTypes: true })
  await Promise.all(entries.map(async (entry) => {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      result.push(...await walkFiles(file))
    }
    else if (entry.isFile()) {
      result.push(file)
    }
  }))
  return result
}

async function collectCssSources(projectRoot: string, outputRoot: string) {
  const debugAssetRoot = path.resolve(projectRoot, '.debug/bundle-post/asset')
  const candidates = [
    path.resolve(outputRoot, 'main.css'),
    path.resolve(outputRoot, 'app.css'),
    path.resolve(outputRoot, 'main.wxss'),
    path.resolve(outputRoot, 'app.wxss'),
    path.resolve(outputRoot, 'uni-app-x-harmony-apply.css'),
    path.resolve(debugAssetRoot, 'app.wxss'),
    path.resolve(debugAssetRoot, 'main.wxss'),
    path.resolve(debugAssetRoot, 'uvue.wxss'),
    ...(
      await walkFiles(path.resolve(debugAssetRoot, 'pages'))
    ).filter(file => /\.(?:wxss|css)$/.test(file)),
  ]
  const sources = await Promise.all([...new Set(candidates)].map(readExistingUtf8))
  return sources.filter((source): source is string => typeof source === 'string' && source.trim().length > 0)
}

async function collectMapSources(outputRoot: string, jsFile: string) {
  const relative = path.relative(outputRoot, jsFile)
  const mapFiles = [
    `${jsFile}.map`,
    path.resolve(outputRoot, relative.startsWith(`assets${path.sep}`)
      ? relative.slice(`assets${path.sep}`.length)
      : `${path.join('assets', relative)}.map`),
  ]
  const sources = await Promise.all([...new Set(mapFiles)].map(readExistingUtf8))
  return sources
    .filter((source): source is string => typeof source === 'string')
    .flatMap(parseSourceMapSourcesContent)
}

async function collectHarmonyJsFiles(outputRoot: string) {
  return (await walkFiles(outputRoot)).filter(file => jsRE.test(file) && !appJsRE.test(file))
}

function buildUsedStyleValue(code: string, allStyles: StyleValue) {
  const used = collectUsedClassNames(code)
  const result: StyleValue = {}
  for (const className of used) {
    const declarations = allStyles[className]?.['']
    if (declarations) {
      result[className] = { '': declarations }
    }
  }
  return Object.keys(result).length > 0 ? result : undefined
}

function mergeStyleValues(...items: StyleValue[]) {
  const result: StyleValue = {}
  for (const item of items) {
    for (const [className, states] of Object.entries(item)) {
      const declarations = states['']
      if (!declarations) {
        continue
      }
      result[className] ??= { '': {} }
      Object.assign(result[className][''], declarations)
    }
  }
  return result
}

export async function finalizeHarmonyAppOutput(projectRoot: string, outputRoot: string) {
  if (!/(?:^|[/\\])\.?app-harmony(?:[/\\]|$)/.test(outputRoot)) {
    return false
  }

  const cssSources = await collectCssSources(projectRoot, outputRoot)
  const cssStyleValue = cssSources.reduce<StyleValue>((merged, source) => {
    Object.assign(merged, parseCssStyleValue(source))
    return merged
  }, {})
  let changed = false

  for (const jsFile of await collectHarmonyJsFiles(outputRoot)) {
    const code = await fs.readFile(jsFile, 'utf8')
    const styleObject = findFirstStyleObject(code)
    if (!styleObject) {
      continue
    }
    const mapSources = await collectMapSources(outputRoot, jsFile)
    const applyStyleValue = createStyleValueFromApplySources(mapSources, cssStyleValue)
    const usedStyleValue = buildUsedStyleValue(code, mergeStyleValues(cssStyleValue, applyStyleValue))
    if (!usedStyleValue) {
      continue
    }
    const nextObject = JSON.stringify(usedStyleValue)
    if (code.slice(styleObject.objectStart, styleObject.objectEnd) === nextObject) {
      continue
    }
    const nextCode = `${code.slice(0, styleObject.objectStart)}${nextObject}${code.slice(styleObject.objectEnd)}`
    await fs.writeFile(jsFile, nextCode, 'utf8')
    changed = true
  }

  return changed
}
