import type { OutputAsset, OutputChunk, SourceMap } from 'rollup'
import postcss from 'postcss'
import { splitCandidateTokens } from 'tailwindcss-patch'
import { replaceWxml } from '@/wxml'

const GEN_STYLES_PLACEHOLDER_RE = /\/\*(Gen[A-Za-z0-9]+Styles)\*\/|const\s+(Gen[A-Za-z0-9]+Styles)\s*=\s*\[\]/
const GEN_APP_STYLES_RE = /const\s+GenAppStyles\s*=\s*\[_uM\(\[([\s\S]*?)\]\)\]/
const STYLE_ENTRY_RE = /\[\s*("((?:\\.|[^"\\])+)")\s*,\s*(_pS\(_uM\(\[[\s\S]*?\]\)\))\s*\]/g
const STRING_LITERAL_RE = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g
const UVUE_TS_RE = /\.uvue\.ts$/
const JS_RE = /\.js$/
const APP_JS_RE = /(?:^|\/)App\.js$/
const COMPONENT_JS_RE = /(?:^|\/)components\/.+\.js$/
const HARMONY_BUNDLE_MARKER_FILES = new Set([
  'import/app-service.ets',
  'import/dynamic.ets',
  'uni_modules/oh-package.json5',
])
const STYLE_DECL_RE = /const\s+(_style_\d+)\s*=\s*\{/g
const EXPORT_SFC_RE = /_export_sfc\(_sfc_main\s*,\s*\[/
const SFC_STYLE_BLOCK_RE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi
const STYLE_EXPORT_PREFIX_RE = /^\s*export\s+default\s+/
const CLASS_SELECTOR_PREFIX_RE = /^\.((?:\\[^\n\r\f]|[\w-])+)(?=$|[.:#[])/

export const UNI_APP_X_STYLE_PLACEHOLDER_VERSION = 'uni-app-x-style-placeholder-v2'

type StyleValue = Record<string, Record<string, string | number>>
type BundleItem = { type: string } | OutputAsset | OutputChunk

interface HarmonyStyleInjectOptions {
  cssSources?: Iterable<string | undefined> | undefined
  excludeComponents?: boolean | undefined
  mapSources?: Iterable<string | undefined> | undefined
}

interface StyleObjectDecl {
  end: number
  objectEnd: number
  objectStart: number
  objectText: string
  start: number
  varName: string
}

export function createUniAppXHarmonyApplyGeneratorSource(
  applyStyleSources: string[],
  _applyUtilities: Iterable<string>,
) {
  return applyStyleSources.join('\n')
}

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

function parseStyleExport(source: string): StyleValue | undefined {
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

function parseStyleObject(source: string): StyleValue | undefined {
  try {
    return JSON.parse(source) as StyleValue
  }
  catch {

  }
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

function collectChunkMapSourcesContent(chunk: OutputChunk) {
  const map = chunk.map as SourceMap | null | undefined
  return Array.isArray(map?.sourcesContent)
    ? map.sourcesContent.filter((item): item is string => typeof item === 'string')
    : []
}

function styleExportToUtsMap(styleExport: StyleValue) {
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

function createUtsStyleArrayFromAppStyles(code: string, appSource?: string) {
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

function cssSourceToStyleValue(source: string) {
  return STYLE_EXPORT_PREFIX_RE.test(source)
    ? parseStyleExport(source)
    : cssToStyleExport(source)
}

function mergeStyleValues(...items: Array<StyleValue | undefined>) {
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

function createStyleValueFromApplySources(sources: string[], utilityStyles: StyleValue | undefined) {
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

export function collectUniAppXHarmonyApplyStyleSourcesFromSource(source: string) {
  const styleSources = source.includes('<style')
    ? [...source.matchAll(SFC_STYLE_BLOCK_RE)].map(styleBlock => styleBlock[1] ?? '')
    : [source]
  return styleSources
    .map(styleSource => styleSource.trim())
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

export function collectUniAppXHarmonyApplyUtilities(bundle: Record<string, BundleItem>) {
  const utilities = new Set<string>()
  const getBundleSource = createUniAppXBundleAssetSourceGetter(bundle)
  for (const [file, item] of Object.entries(bundle)) {
    if (item.type !== 'chunk' || !file.endsWith('.js') || APP_JS_RE.test(file)) {
      continue
    }
    const mapSources = collectChunkMapSourcesContent(item as OutputChunk).concat(
      resolveSourceMapFiles(file).flatMap((mapFile) => {
        const source = getBundleSource(mapFile)
        return source ? parseSourceMapSourcesContent(source) : []
      }),
    )
    for (const source of mapSources) {
      for (const utility of collectUniAppXHarmonyApplyUtilitiesFromSources([source])) {
        utilities.add(utility)
      }
    }
  }
  return utilities
}

export function collectUniAppXHarmonyApplyStyleSources(bundle: Record<string, BundleItem>) {
  const sources = new Set<string>()
  const getBundleSource = createUniAppXBundleAssetSourceGetter(bundle)
  const addSource = (source: string) => {
    for (const styleSource of collectUniAppXHarmonyApplyStyleSourcesFromSource(source)) {
      sources.add(styleSource)
    }
  }
  for (const [file, item] of Object.entries(bundle)) {
    if (item.type === 'asset' && file.endsWith('.uvue')) {
      addSource(String((item as OutputAsset).source))
      continue
    }
    if (item.type !== 'chunk' || !file.endsWith('.js') || APP_JS_RE.test(file)) {
      continue
    }
    for (const sourceContent of collectChunkMapSourcesContent(item as OutputChunk)) {
      addSource(sourceContent)
    }
    for (const mapFile of resolveSourceMapFiles(file)) {
      const source = getBundleSource(mapFile)
      if (!source) {
        continue
      }
      for (const sourceContent of parseSourceMapSourcesContent(source)) {
        addSource(sourceContent)
      }
    }
  }
  return [...sources]
}

function resolveStyleAssetFile(file: string) {
  if (!UVUE_TS_RE.test(file)) {
    return
  }
  return file.replace(/\.uvue\.ts$/, '.uvue')
}

function resolveStylePlaceholderFallbackFiles(file: string) {
  const styleAssetFile = resolveStyleAssetFile(file)
  if (!styleAssetFile) {
    return []
  }
  const base = styleAssetFile.replace(/\.uvue$/, '')
  return [
    styleAssetFile,
    `${base}.wxss`,
    `${base}.css`,
  ]
}

function findBalancedObjectEnd(source: string, start: number) {
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

function findFirstStyleObjectDecl(source: string): StyleObjectDecl | undefined {
  STYLE_DECL_RE.lastIndex = 0
  const match = STYLE_DECL_RE.exec(source)
  const varName = match?.[1]
  if (!match || !varName) {
    return
  }
  const objectStart = source.indexOf('{', match.index)
  if (objectStart < 0) {
    return
  }
  const objectEnd = findBalancedObjectEnd(source, objectStart)
  if (!objectEnd) {
    return
  }
  const semicolonEnd = source[objectEnd] === ';' ? objectEnd + 1 : objectEnd
  return {
    end: semicolonEnd,
    objectEnd,
    objectStart,
    objectText: source.slice(objectStart, objectEnd),
    start: match.index,
    varName,
  }
}

function createMergedStyleValue(code: string, localStyle: StyleValue | undefined, appStyle: StyleValue) {
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

function resolveCssFallbackFiles(file: string) {
  const files = ['main.wxss', 'main.css', 'app.wxss', 'app.css']
  const assetsPrefix = 'assets/'
  if (file.startsWith(assetsPrefix) && file.endsWith('.js')) {
    const withoutAssets = file.slice(assetsPrefix.length).replace(/\.js$/, '')
    files.push(`${withoutAssets}.wxss`, `${withoutAssets}.css`)
  }
  return files
}

function resolveSourceMapFiles(file: string) {
  return [
    `${file}.map`,
    file.startsWith('assets/') ? `${file.slice('assets/'.length)}.map` : undefined,
    file.startsWith('assets/') ? undefined : `assets/${file}.map`,
  ].filter((item): item is string => typeof item === 'string')
}

function createStyleValueFromBundleSources(
  file: string,
  _code: string,
  getBundleSource?: (file: string) => string | undefined,
  options: HarmonyStyleInjectOptions = {},
) {
  const cssStyles = mergeStyleValues(
    ...[...(options.cssSources ?? [])].map(source => source ? cssSourceToStyleValue(source) : undefined),
    ...resolveCssFallbackFiles(file).map((cssFile) => {
      const source = getBundleSource?.(cssFile)
      return source ? cssSourceToStyleValue(source) : undefined
    }),
  )
  const mapSources = [
    ...(options.mapSources ?? []),
    ...resolveSourceMapFiles(file).flatMap((mapFile) => {
      const source = getBundleSource?.(mapFile)
      return source ? parseSourceMapSourcesContent(source) : []
    }),
  ].filter((source): source is string => typeof source === 'string')
  return mergeStyleValues(cssStyles, createStyleValueFromApplySources(mapSources, cssStyles))
}

function injectStyleOption(code: string, styleVarName: string) {
  if (code.includes('["styles"')) {
    return code
  }
  const exportMatch = code.match(EXPORT_SFC_RE)
  if (!exportMatch || exportMatch.index === undefined) {
    return code
  }
  const fileOptionIndex = code.indexOf('["__file"', exportMatch.index)
  if (fileOptionIndex < 0) {
    return code
  }
  return `${code.slice(0, fileOptionIndex)}["styles", [${styleVarName}]], ${code.slice(fileOptionIndex)}`
}

export function injectUniAppXStylePlaceholder(
  file: string,
  code: string,
  getAssetSource?: (file: string) => string | undefined,
) {
  const match = code.match(GEN_STYLES_PLACEHOLDER_RE)
  const stylesName = match?.[1] ?? match?.[2]
  if (!stylesName) {
    return code
  }
  const styleAssetFile = resolveStyleAssetFile(file)
  if (!styleAssetFile) {
    return code
  }
  const appStyleArray = createUtsStyleArrayFromAppStyles(code, getAssetSource?.('App.uvue.ts'))
  if (appStyleArray) {
    return code.replace(GEN_STYLES_PLACEHOLDER_RE, `const ${stylesName} = ${appStyleArray}`)
  }
  const styleSource = resolveStylePlaceholderFallbackFiles(file)
    .map(candidate => getAssetSource?.(candidate))
    .find((source): source is string => typeof source === 'string' && source.length > 0)
  if (!styleSource) {
    return code
  }
  const styleExport = STYLE_EXPORT_PREFIX_RE.test(styleSource)
    ? parseStyleExport(styleSource)
    : cssToStyleExport(styleSource)
  if (!styleExport) {
    return code
  }
  return code.replace(GEN_STYLES_PLACEHOLDER_RE, `const ${stylesName} = ${styleExportToUtsMap(styleExport)}`)
}

export function injectUniAppXHarmonyGlobalStyles(
  file: string,
  code: string,
  getBundleSource?: (file: string) => string | undefined,
  options: HarmonyStyleInjectOptions = {},
) {
  if (!JS_RE.test(file) || APP_JS_RE.test(file)) {
    return code
  }
  if (options.excludeComponents && COMPONENT_JS_RE.test(file)) {
    return code
  }
  const appSource = getBundleSource?.('assets/App.js') ?? getBundleSource?.('App.js')
  const appStyleDecl = appSource ? findFirstStyleObjectDecl(appSource) : undefined
  const appStyle = appStyleDecl ? parseStyleObject(appStyleDecl.objectText) : undefined
  const localStyleDecl = findFirstStyleObjectDecl(code)
  const localStyle = localStyleDecl ? parseStyleObject(localStyleDecl.objectText) : undefined
  const bundleStyle = createStyleValueFromBundleSources(file, code, getBundleSource, options)
  const styleSource = mergeStyleValues(appStyle, bundleStyle)
  if (!styleSource) {
    return code
  }
  const mergedStyle = createMergedStyleValue(code, localStyle, styleSource)
  if (!mergedStyle) {
    return code
  }
  const nextStyleSource = JSON.stringify(mergedStyle)
  if (localStyleDecl) {
    return `${code.slice(0, localStyleDecl.objectStart)}${nextStyleSource}${code.slice(localStyleDecl.objectEnd)}`
  }
  const exportMatch = code.match(EXPORT_SFC_RE)
  if (!exportMatch || exportMatch.index === undefined) {
    return code
  }
  const styleVarName = '_style_wt'
  const withStyleDecl = `${code.slice(0, exportMatch.index)}const ${styleVarName} = ${nextStyleSource};\n${code.slice(exportMatch.index)}`
  return injectStyleOption(withStyleDecl, styleVarName)
}

export function injectUniAppXHarmonyBundleStyles(
  bundle: Record<string, BundleItem>,
  options: HarmonyStyleInjectOptions = {},
) {
  const getBundleSource = createUniAppXBundleAssetSourceGetter(bundle)
  let changed = false
  for (const [file, item] of Object.entries(bundle)) {
    if (item.type !== 'chunk' || !file.endsWith('.js')) {
      continue
    }
    const currentSource = (item as OutputChunk).code
    const nextSource = injectUniAppXHarmonyGlobalStyles(file, currentSource, getBundleSource, {
      ...options,
      mapSources: collectChunkMapSourcesContent(item as OutputChunk),
    })
    if (nextSource !== currentSource) {
      ;(item as OutputChunk).code = nextSource
      changed = true
    }
  }
  return changed
}

export function isUniAppXHarmonyBundle(bundle: Record<string, BundleItem>) {
  for (const file of Object.keys(bundle)) {
    if (HARMONY_BUNDLE_MARKER_FILES.has(file)) {
      return true
    }
  }
  return false
}

export function createUniAppXBundleAssetSourceGetter(bundle: Record<string, BundleItem>) {
  return (file: string) => {
    const item = bundle[file] ?? Object.entries(bundle).find(([key, value]) => {
      return (value.type === 'asset' || value.type === 'chunk') && (key === file || key.endsWith(`/${file}`))
    })?.[1]
    if (!item) {
      return
    }
    if (item.type === 'asset') {
      return String((item as OutputAsset).source)
    }
    if (item.type === 'chunk') {
      return String((item as OutputChunk).code)
    }
  }
}
