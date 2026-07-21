import type { OutputChunk, SourceMap } from 'rollup'
import path from 'node:path'
import { splitCandidateTokens } from '@tailwindcss-mangle/engine'
import { postcss } from '@weapp-tailwindcss/postcss'
import { replaceWxml } from '@/wxml'

const GEN_APP_STYLES_RE = /const\s+GenAppStyles\s*=\s*\[_uM\(\[([\s\S]*?)\]\)\]/
const STYLE_ENTRY_RE = /\[\s*("((?:\\.|[^"\\])+)")\s*,\s*(_pS\(_uM\(\[[\s\S]*?\]\)\))\s*\]/g
const STRING_LITERAL_RE = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g
const SFC_STYLE_BLOCK_RE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi
const STYLE_EXPORT_PREFIX_RE = /^\s*export\s+default\s+/
const CLASS_SELECTOR_PREFIX_RE = /^\.((?:\\[^\n\r\f]|[\w-])+)(?=$|[.:#[])/

type StyleDeclarations = Record<string, string | number>
export type StyleValue = Record<string, Record<string, StyleDeclarations>>

function toCamelCase(prop: string) {
  return prop.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())
}

function normalizeValue(value: string) {
  const trimmed = value.trim()
  if (/^-?\d+(?:\.\d+)?px$/.test(trimmed)) {
    return Number(trimmed.slice(0, -2))
  }
  return trimmed.replace(/\s*,\s*/g, ',')
}

function normalizeStyleValue(value: string | number) {
  if (typeof value === 'number') {
    return value
  }
  return normalizeValue(value)
}

function unescapeCssClassSelector(className: string) {
  return className.replace(/\\([^\n\r\f0-9a-f])/gi, '$1')
}

export function parseStyleExport(source: string): StyleValue | undefined {
  const json = source.replace(STYLE_EXPORT_PREFIX_RE, '').trim()
  if (!json) {
    return
  }
  try {
    return JSON.parse(json) as StyleValue
  }
  catch {

  }
}

export function parseStyleObject(source: string): StyleValue | undefined {
  try {
    return JSON.parse(source) as StyleValue
  }
  catch {

  }
}

export function parseSourceMapSourcesContent(source: string) {
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

export function collectChunkMapSourcesContent(chunk: OutputChunk) {
  const map = chunk.map as SourceMap | null | undefined
  return Array.isArray(map?.sourcesContent)
    ? map.sourcesContent.filter((item): item is string => typeof item === 'string')
    : []
}

export function styleExportToUtsMap(styleExport: StyleValue) {
  const classEntries: string[] = []
  for (const [className, styleStates] of Object.entries(styleExport)) {
    const declarations = styleStates['']
    if (!declarations || Object.keys(declarations).length === 0) {
      continue
    }
    const declarationEntries = Object.entries(declarations).map(([prop, value]) => {
      return `[${JSON.stringify(toCamelCase(prop))}, ${JSON.stringify(normalizeStyleValue(value))}]`
    })
    if (declarationEntries.length === 0) {
      continue
    }
    classEntries.push(`[${JSON.stringify(className)}, _pS(_uM([${declarationEntries.join(', ')}]))]`)
  }
  if (classEntries.length === 0) {
    return '[]'
  }
  return `[_uM([${classEntries.join(', ')}])]`
}

function createUtsStyleArray(entries: string[]) {
  if (entries.length === 0) {
    return '[]'
  }
  return `[_uM([${entries.join(', ')}])]`
}

function extractAppStyleEntries(source: string) {
  const match = source.match(GEN_APP_STYLES_RE)
  if (!match?.[1]) {
    return
  }
  const entries = new Map<string, string>()
  for (const entry of match[1].matchAll(STYLE_ENTRY_RE)) {
    const rawClassName = entry[1]
    const className = entry[2]
    const styleValue = entry[3]
    if (!rawClassName || !className || !styleValue) {
      continue
    }
    entries.set(JSON.parse(rawClassName) as string, `[${rawClassName}, ${styleValue}]`)
  }
  return entries.size > 0 ? entries : undefined
}

function collectUsedClassNames(code: string, entries: Map<string, string>) {
  const used = new Set<string>()
  for (const literalMatch of code.matchAll(STRING_LITERAL_RE)) {
    const literal = literalMatch[2]
    if (!literal) {
      continue
    }
    for (const candidate of splitCandidateTokens(literal)) {
      if (entries.has(candidate)) {
        used.add(candidate)
      }
    }
  }
  return used
}

function collectUsedStyleKeys(code: string, styleValue: StyleValue) {
  const entries = new Map(Object.keys(styleValue).map(className => [className, className]))
  return collectUsedClassNames(code, entries)
}

export function createUtsStyleArrayFromAppStyles(code: string, appSource?: string) {
  if (!appSource) {
    return
  }
  const entries = extractAppStyleEntries(appSource)
  if (!entries) {
    return
  }
  const used = collectUsedClassNames(code, entries)
  if (used.size === 0) {
    return
  }
  return createUtsStyleArray([...used].map(className => entries.get(className)!).filter(Boolean))
}

function cssToStyleExport(source: string): StyleValue | undefined {
  let root: postcss.Root
  try {
    root = postcss.parse(source)
  }
  catch {
    return
  }
  const result: StyleValue = {}
  root.walkRules((rule) => {
    const selectors = rule.selectors ?? []
    for (const selector of selectors) {
      const match = selector.trim().match(CLASS_SELECTOR_PREFIX_RE)
      if (!match?.[1]) {
        continue
      }
      const declarations: Record<string, string | number> = {}
      rule.walkDecls((decl) => {
        declarations[toCamelCase(decl.prop)] = normalizeValue(decl.value)
      })
      if (Object.keys(declarations).length > 0) {
        result[match[1]] = { '': declarations }
        const className = unescapeCssClassSelector(match[1])
        result[className] = { '': declarations }
        result[replaceWxml(className)] = { '': declarations }
      }
    }
  })
  return Object.keys(result).length > 0 ? result : undefined
}

export function cssSourceToStyleValue(source: string) {
  return STYLE_EXPORT_PREFIX_RE.test(source)
    ? parseStyleExport(source)
    : cssToStyleExport(source)
}

export function mergeStyleValues(...items: Array<StyleValue | undefined>) {
  const result: StyleValue = {}
  for (const item of items) {
    if (!item) {
      continue
    }
    for (const [className, states] of Object.entries(item)) {
      if (!result[className]) {
        result[className] = states
      }
    }
  }
  return Object.keys(result).length > 0 ? result : undefined
}

export function createStyleValueFromApplySources(sources: string[], utilityStyles: StyleValue | undefined) {
  if (!utilityStyles) {
    return
  }
  const result: StyleValue = {}
  for (const source of sources) {
    const styleSources = source.includes('<style')
      ? [...source.matchAll(SFC_STYLE_BLOCK_RE)].map(styleBlock => styleBlock[1] ?? '')
      : [source]
    for (const styleSource of styleSources) {
      let root: postcss.Root
      try {
        root = postcss.parse(styleSource)
      }
      catch {
        continue
      }
      root.walkRules((rule) => {
        const applyRules = rule.nodes?.filter((node): node is postcss.AtRule => node.type === 'atrule' && node.name === 'apply') ?? []
        if (applyRules.length === 0) {
          return
        }
        const selectors = rule.selectors ?? [rule.selector]
        for (const selector of selectors) {
          const className = selector.trim().match(CLASS_SELECTOR_PREFIX_RE)?.[1]
          if (!className) {
            continue
          }
          const declarations: Record<string, string | number> = {}
          for (const applyRule of applyRules) {
            for (const utility of splitCandidateTokens(applyRule.params)) {
              const utilityDeclarations = utilityStyles[utility]?.[''] ?? utilityStyles[replaceWxml(utility)]?.['']
              if (utilityDeclarations) {
                Object.assign(declarations, utilityDeclarations)
              }
            }
          }
          if (Object.keys(declarations).length > 0) {
            const unescapedClassName = unescapeCssClassSelector(className)
            result[className] = { '': declarations }
            result[unescapedClassName] = { '': declarations }
            result[replaceWxml(unescapedClassName)] = { '': declarations }
          }
        }
      })
    }
  }
  return Object.keys(result).length > 0 ? result : undefined
}

function resolveReferencePaths(styleSource: string, sourceId?: string) {
  if (!sourceId || !styleSource.includes('@reference')) {
    return styleSource
  }
  let root: postcss.Root
  try {
    root = postcss.parse(styleSource)
  }
  catch {
    return styleSource
  }
  const cleanSourceId = sourceId.replace(/\?.*$/, '')
  root.walkAtRules('reference', (rule) => {
    const quote = rule.params[0]
    if (quote !== '"' && quote !== '\'') {
      return
    }
    const closingQuoteIndex = rule.params.indexOf(quote, 1)
    if (closingQuoteIndex <= 1) {
      return
    }
    const referencePath = rule.params.slice(1, closingQuoteIndex)
    if (!referencePath.startsWith('.')) {
      return
    }
    rule.params = `${quote}${path.resolve(path.dirname(cleanSourceId), referencePath)}${quote}${rule.params.slice(closingQuoteIndex + 1)}`
  })
  return root.toString()
}

export function collectUniAppXHarmonyApplyStyleSourcesFromSource(source: string, sourceId?: string) {
  const styleSources = source.includes('<style')
    ? [...source.matchAll(SFC_STYLE_BLOCK_RE)].map(styleBlock => styleBlock[1] ?? '')
    : [source]
  return styleSources
    .map(styleSource => resolveReferencePaths(styleSource.trim(), sourceId))
    .filter(styleSource => styleSource.length > 0 && styleSource.includes('@apply'))
}

export function collectUniAppXHarmonyApplyUtilitiesFromSources(sources: Iterable<string>) {
  const utilities = new Set<string>()
  for (const source of sources) {
    for (const styleSource of collectUniAppXHarmonyApplyStyleSourcesFromSource(source)) {
      let root: postcss.Root
      try {
        root = postcss.parse(styleSource)
      }
      catch {
        continue
      }
      root.walkAtRules('apply', (rule) => {
        for (const utility of splitCandidateTokens(rule.params)) {
          utilities.add(utility)
        }
      })
    }
  }
  return utilities
}

export function createMergedStyleValue(code: string, localStyle: StyleValue | undefined, appStyle: StyleValue) {
  const used = collectUsedStyleKeys(code, appStyle)
  if (used.size === 0) {
    return
  }
  const merged: StyleValue = {
    ...(localStyle ?? {}),
  }
  let changed = false
  for (const className of used) {
    if (merged[className] || !appStyle[className]) {
      continue
    }
    merged[className] = appStyle[className]
    changed = true
  }
  return changed ? merged : undefined
}

export function createMergedStyleValues(code: string, localStyles: StyleValue[], appStyle: StyleValue) {
  if (localStyles.length === 0) {
    return
  }
  const used = collectUsedStyleKeys(code, appStyle)
  if (used.size === 0) {
    return
  }
  const merged = localStyles.map(style => ({ ...style }))
  let changed = false
  for (const className of used) {
    const generatedStyle = appStyle[className]
    if (!generatedStyle) {
      continue
    }
    const indexes = merged.flatMap((style, index) => style[className] ? [index] : [])
    if (indexes.length === 0) {
      merged[0][className] = generatedStyle
      changed = true
      continue
    }
    for (const index of indexes) {
      if (JSON.stringify(merged[index][className]) === JSON.stringify(generatedStyle)) {
        continue
      }
      merged[index][className] = generatedStyle
      changed = true
    }
  }
  return changed ? merged : undefined
}
