import type { OutputAsset, OutputChunk } from 'rollup'
import type { StyleValue } from './style-asset/style-value'
import { postcss } from '@weapp-tailwindcss/postcss'
import {
  collectChunkMapSourcesContent,
  collectUniAppXHarmonyApplyStyleSourcesFromSource,
  collectUniAppXHarmonyApplyUtilitiesFromSources,
  createMergedStyleValue,
  createStyleValueFromApplySources,
  createUtsStyleArrayFromAppStyles,
  cssSourceToStyleValue,
  mergeStyleValues,
  parseSourceMapSourcesContent,
  parseStyleObject,
  styleExportToUtsMap,

} from './style-asset/style-value'

const GEN_STYLES_PLACEHOLDER_RE = /\/\*(Gen[A-Za-z0-9]+Styles)\*\/|const\s+(Gen[A-Za-z0-9]+Styles)\s*=\s*\[\]/
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

export const UNI_APP_X_STYLE_PLACEHOLDER_VERSION = 'uni-app-x-style-placeholder-v2'

type BundleItem = { type: string } | OutputAsset | OutputChunk
type OutputChunkWithViteMetadata = OutputChunk & {
  viteMetadata?: {
    importedCss?: Iterable<string>
  }
}

interface HarmonyStyleInjectOptions {
  cssSources?: Iterable<string | undefined> | undefined
  styleAssetFiles?: Iterable<string | undefined> | ((file: string) => Iterable<string | undefined>) | undefined
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

export {
  collectUniAppXHarmonyApplyStyleSourcesFromSource,
  collectUniAppXHarmonyApplyUtilitiesFromSources,
}

export function createUniAppXHarmonyApplyGeneratorSource(
  applyStyleSources: string[],
  _applyUtilities: Iterable<string>,
) {
  return applyStyleSources.map((source) => {
    let root: postcss.Root
    try {
      root = postcss.parse(source)
    }
    catch {
      return source
    }
    root.walkAtRules('reference', (rule) => {
      const match = rule.params.match(/^(['"])(.+?)\1/)
      if (match?.[2]?.startsWith('.')) {
        rule.remove()
      }
    })
    return root.toString()
  }).join('\n')
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

function resolveCssFallbackFiles(styleAssetFiles: Iterable<string | undefined> = []) {
  const files = new Set<string>()
  for (const assetFile of styleAssetFiles) {
    if (assetFile) {
      files.add(assetFile)
    }
  }
  return [...files]
}

function resolveStyleAssetFilesForChunk(file: string, styleAssetFiles: HarmonyStyleInjectOptions['styleAssetFiles']) {
  return typeof styleAssetFiles === 'function'
    ? styleAssetFiles(file)
    : styleAssetFiles
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
    ...resolveCssFallbackFiles(resolveStyleAssetFilesForChunk(file, options.styleAssetFiles)).map((cssFile) => {
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
  const styleExport = cssSourceToStyleValue(styleSource)
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
  const mergedStyle = createMergedStyleValue(code, localStyle, styleSource as StyleValue)
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
  const styleAssetFilesByChunk = collectUniAppXBundleStyleAssetFilesByChunk(bundle)
  const resolveStyleAssetFiles = typeof options.styleAssetFiles === 'function'
    ? options.styleAssetFiles
    : (file: string) => [
        ...((options.styleAssetFiles as Iterable<string | undefined> | undefined) ?? []),
        ...(styleAssetFilesByChunk.get(file) ?? []),
      ]
  let changed = false
  for (const [file, item] of Object.entries(bundle)) {
    if (item.type !== 'chunk' || !file.endsWith('.js')) {
      continue
    }
    const currentSource = (item as OutputChunk).code
    const nextSource = injectUniAppXHarmonyGlobalStyles(file, currentSource, getBundleSource, {
      ...options,
      styleAssetFiles: resolveStyleAssetFiles,
      mapSources: collectChunkMapSourcesContent(item as OutputChunk),
    })
    if (nextSource !== currentSource) {
      ;(item as OutputChunk).code = nextSource
      changed = true
    }
  }
  return changed
}

function collectUniAppXBundleStyleAssetFilesByChunk(bundle: Record<string, BundleItem>) {
  const styleAssetFilesByChunk = new Map<string, Set<string>>()
  const appStyleAssetFiles = new Set<string>()
  const assetFiles = new Set(
    Object.entries(bundle)
      .filter(([, item]) => item.type === 'asset')
      .map(([file]) => file)
      .filter(isStyleAssetFile),
  )

  for (const [chunkFile, item] of Object.entries(bundle)) {
    if (item.type !== 'chunk') {
      continue
    }
    const chunk = item as OutputChunkWithViteMetadata
    for (const cssFile of chunk.viteMetadata?.importedCss ?? []) {
      if (!assetFiles.has(cssFile)) {
        continue
      }
      if (APP_JS_RE.test(chunk.fileName ?? chunkFile) || APP_JS_RE.test(chunkFile)) {
        appStyleAssetFiles.add(cssFile)
        continue
      }
      let styleAssetFiles = styleAssetFilesByChunk.get(chunkFile)
      if (!styleAssetFiles) {
        styleAssetFiles = new Set<string>()
        styleAssetFilesByChunk.set(chunkFile, styleAssetFiles)
      }
      styleAssetFiles.add(cssFile)
    }
  }

  if (appStyleAssetFiles.size > 0) {
    for (const [file, item] of Object.entries(bundle)) {
      if (item.type !== 'chunk' || !file.endsWith('.js') || APP_JS_RE.test(file)) {
        continue
      }
      let styleAssetFiles = styleAssetFilesByChunk.get(file)
      if (!styleAssetFiles) {
        styleAssetFiles = new Set<string>()
        styleAssetFilesByChunk.set(file, styleAssetFiles)
      }
      for (const appStyleAssetFile of appStyleAssetFiles) {
        styleAssetFiles.add(appStyleAssetFile)
      }
    }
  }

  return styleAssetFilesByChunk
}

function isStyleAssetFile(file: string) {
  return /\.(?:acss|css|jxss|qss|ttss|wxss)$/i.test(file)
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
      if (value.type !== 'asset' && value.type !== 'chunk') {
        return false
      }
      const outputFile = (value as OutputAsset | OutputChunk).fileName || key
      return key === file
        || key.endsWith(`/${file}`)
        || outputFile === file
        || outputFile.endsWith(`/${file}`)
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
