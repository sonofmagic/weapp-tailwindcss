import type { SourceCandidateStore } from '../../vite/source-candidates'
import type { SetupWebpackV5ProcessAssetsHookOptions, WebpackSourceLike } from './v5-assets/helpers'
import type { WebpackSourceCandidateScanMemoryStats } from './v5-assets/source-candidate-cache'
import type { LinkedJsModuleResult, TailwindcssRuntimeLike } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { MappingChars2String } from '@weapp-core/escape'
import { filterExistingCssRules, postcss } from '@weapp-tailwindcss/postcss'
import { pluginName } from '@/constants'
import { resolveStyleOptionsFromContext } from '@/context/style-options'
import { shouldSkipJsTransform } from '@/js/precheck'
import { ensureRuntimeClassSet } from '@/tailwindcss/runtime'
import { resolveTailwindcssOptions } from '@/tailwindcss/runtime-options'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { getTailwindV4IncrementalGenerateCacheStats } from '@/tailwindcss/v4-engine'
import { getGroupedEntries } from '@/utils'
import { processCachedTask } from '../../shared/cache'
import {
  finalizeMiniProgramCss,
  pruneMiniProgramGeneratedCss,
  stripMiniProgramCssSpecificityPlaceholders,
} from '../../shared/css-cleanup'
import { annotateCssSourceTrace, createCssSourceTraceCacheSignature, createCssTokenSourceMap, isCssSourceTraceEnabled } from '../../shared/css-source-trace'
import { hasBundlerGeneratedCssMarker, stripBundlerGeneratedCssMarkers } from '../../shared/generated-css-marker'
import { generateCssByGenerator, hasTailwindGeneratedCss, hasTailwindGeneratedCssMarkers, hasTailwindSourceDirectives, isPureLocalCssImportWrapper } from '../../shared/generator-css'
import { hasTailwindApplyDirective, hasTailwindRootDirectives, parseImportRequest, removeTailwindSourceDirectives } from '../../shared/generator-css/directives'
import { createCssSourceOrderAppend, hasMiniProgramTailwindV4PreflightReset } from '../../shared/generator-css/generation-helpers'
import { scoreTailwindV4CssSourceFileMatch } from '../../shared/generator-css/source-resolver/matching'
import { removeTailwindV4GeneratorAtRules, stripTailwindSourceMediaFragments, stripUnmatchedTailwindSourceMediaCloseFragments } from '../../shared/generator-css/user-css'
import { emitHmrTiming } from '../../shared/hmr-timing'
import { resolveOutputSpecifier, toAbsoluteOutputPath } from '../../shared/module-graph'
import { pushConcurrentTaskFactories, resolveTaskConcurrency } from '../../shared/run-tasks'
import { generateTailwindV4Css } from '../../shared/v4-generation-core'
import { createBundleBuildState, updateBundleBuildState } from '../../vite/bundle-state'
import { createCandidateSignature } from '../../vite/generate-bundle/signatures'
import { createBundleRuntimeClassSetManager } from '../../vite/incremental-runtime-class-set'
import { collectStrictEscapedRuntimeCandidates, createEscapeFragments } from '../../vite/incremental-runtime-class-set/escaped-candidates'
import { createSourceCandidateStore } from '../../vite/source-candidates'
import { resolveViteSourceScanEntries } from '../../vite/source-scan'
import { createAssetHashByChunkMap, createRuntimeAwareCssHash, createWebpackCssAssetResourceMap, getCacheKey, inferWebpackMainCssFiles, isCssLikeModuleResource, resolveSingleActiveWebpackCssResource, stripResourceQuery } from './shared'
import { buildWebpackBundleSnapshot, createWebpackAssetUpdater, releaseWebpackBundleSnapshotSources } from './v5-assets/helpers'
import { createWebpackSourceCandidateScanCache } from './v5-assets/source-candidate-cache'

interface WebpackCssHandlerOptions {
  isMainChunk: boolean
  postcssOptions: { options: { from: string } }
  majorVersion?: number | undefined
  sourceOptions?: {
    outputRoot?: string | undefined
    sourceCss?: string | undefined
    sourceFile?: string | undefined
  } | undefined
}

const WEBPACK_CSS_HANDLER_OPTIONS_CACHE_MAX = 128

function removeTailwindV4StandaloneHostPreflightRule(source: string) {
  if (!source.includes('--theme(')) {
    return source
  }
  try {
    const root = postcss.parse(source)
    let changed = false
    root.walkRules((rule) => {
      if (rule.selector.trim() !== ':host') {
        return
      }
      if (!rule.nodes?.some(node => node.type === 'decl' && node.value?.includes('--theme('))) {
        return
      }
      rule.remove()
      changed = true
    })
    return changed ? root.toString() : source
  }
  catch {
    return source
  }
}

interface WebpackSourceCandidateCache {
  getSourceCandidatesForEntries: SourceCandidateStore['valuesForEntries']
  signatureHash: string
  tokenSources: ReturnType<SourceCandidateStore['sourcesForEntries']>
}

function isRuntimeTransformCandidate(candidate: string) {
  return candidate.length > 0
    && !candidate.includes('=')
    && !candidate.includes('<')
    && !candidate.includes('>')
    && !candidate.includes('${')
}

function collectRuntimeTokenSignatureParts(source: string) {
  return source.match(/[\w-]+_[A-Z][\w-]*/gi) ?? []
}

function getRuntimeClassSetSync(tailwindRuntime: TailwindcssRuntimeLike) {
  if (typeof tailwindRuntime.getClassSetSync !== 'function') {
    return new Set<string>()
  }
  try {
    return new Set(tailwindRuntime.getClassSetSync() ?? [])
  }
  catch {
    return new Set<string>()
  }
}

function toMb(bytes: number) {
  return Math.round(bytes / 1024 / 1024)
}

function pruneMapToMaxSize<Key, Value>(map: Map<Key, Value>, maxSize: number) {
  while (map.size > maxSize) {
    const oldestKey = map.keys().next().value
    if (oldestKey === undefined) {
      break
    }
    map.delete(oldestKey)
  }
}

function stripTrailingLineWhitespace(source: string) {
  return source.replace(/[ \t]+$/gm, '')
}

function pruneWebpackCssHandlerOptionCaches(
  cssHandlerOptionsCache: Map<string, WebpackCssHandlerOptions>,
  cssUserHandlerOptionsCache: Map<string, WebpackCssHandlerOptions>,
  activeCssFiles: Set<string>,
) {
  const activeSuffixes = [...activeCssFiles].map(file => `:${file}`)
  for (const key of cssHandlerOptionsCache.keys()) {
    if (!activeSuffixes.some(suffix => key.endsWith(suffix))) {
      cssHandlerOptionsCache.delete(key)
    }
  }
  for (const key of cssUserHandlerOptionsCache.keys()) {
    if (!activeSuffixes.some(suffix => key.endsWith(suffix))) {
      cssUserHandlerOptionsCache.delete(key)
    }
  }
  pruneMapToMaxSize(cssHandlerOptionsCache, WEBPACK_CSS_HANDLER_OPTIONS_CACHE_MAX)
  pruneMapToMaxSize(cssUserHandlerOptionsCache, WEBPACK_CSS_HANDLER_OPTIONS_CACHE_MAX)
}

function resolveWebpackGeneratorRawSource(
  rawSource: string,
  cssHandlerOptions: WebpackCssHandlerOptions,
) {
  const sourceCss = cssHandlerOptions.sourceOptions?.sourceCss
  if (
    sourceCss
    && (
      hasTailwindRootDirectives(sourceCss, { importFallback: true })
      || hasTailwindSourceDirectives(sourceCss, { importFallback: true })
      || hasTailwindApplyDirective(sourceCss)
      || hasTailwindGeneratedCss(sourceCss)
      || hasTailwindGeneratedCssMarkers(sourceCss)
    )
  ) {
    return sourceCss
  }
  return rawSource
}

interface WebpackGeneratorUserCssSource {
  css: string
  processed: boolean
}

function shouldUseWebpackAssetAsGeneratorUserCss(
  rawSource: string,
  generatorRawSource: string,
  options: { processed?: boolean | undefined } = {},
) {
  return rawSource !== generatorRawSource
    && (options.processed === true || !rawSource.includes('data:'))
    && !hasTailwindRootDirectives(rawSource, { importFallback: true })
    && !hasTailwindSourceDirectives(rawSource, { importFallback: true })
    && !hasTailwindApplyDirective(rawSource)
    && /(?:^|[^\w-])\.[_a-z\u00A0-\uFFFF\\-]/i.test(rawSource)
    && (
      !hasTailwindGeneratedCssMarkers(rawSource)
      || hasAdditionalWebpackAssetUserCssMarkers(rawSource, generatorRawSource)
    )
}

function collectWebpackAssetUserCssMarkers(source: string) {
  const markers = new Set<string>()
  for (const match of source.matchAll(/\.((?:\\.|[_a-z\u00A0-\uFFFF-])(?:\\.|[\w\u00A0-\uFFFF-])*)/gi)) {
    markers.add(`class:${match[1]}`)
  }
  for (const match of source.matchAll(/@(?:-[\w-]+-)?keyframes\s+((?:\\.|[-\w\u00A0-\uFFFF])+)/gi)) {
    markers.add(`keyframes:${match[1]}`)
  }
  return markers
}

function collectWebpackCssRuleIdentityMarkers(source: string) {
  const markers = new Set<string>()
  try {
    const root = postcss.parse(source)
    root.walkRules((rule) => {
      for (const selector of rule.selectors ?? [rule.selector]) {
        for (const match of selector.matchAll(/\.((?:\\.|[_a-z\u00A0-\uFFFF-])(?:\\.|[\w\u00A0-\uFFFF-])*)/gi)) {
          markers.add(`class:${match[1]}`)
        }
      }
    })
    root.walkAtRules('keyframes', (rule) => {
      if (rule.params) {
        markers.add(`keyframes:${rule.params}`)
      }
    })
  }
  catch {
  }
  return markers
}

function unescapeCssIdentifier(value: string) {
  return value.replace(/\\([0-9a-f]{1,6}\s?|.)/gi, (_match, escaped: string) => {
    const hex = escaped.trim()
    if (/^[0-9a-f]+$/i.test(hex)) {
      const codePoint = Number.parseInt(hex, 16)
      if (Number.isFinite(codePoint)) {
        return String.fromCodePoint(codePoint)
      }
    }
    return escaped
  })
}

function collectGeneratedCssRuntimeCandidates(source: string) {
  const candidates = new Set<string>()
  if (
    hasBundlerGeneratedCssMarker(source)
    || (!hasTailwindGeneratedCss(source) && !hasTailwindGeneratedCssMarkers(source))
  ) {
    return candidates
  }
  try {
    const root = postcss.parse(source)
    root.walkRules((rule) => {
      for (const selector of rule.selectors ?? [rule.selector]) {
        for (const match of selector.matchAll(/\.((?:\\.|[\w\u00A0-\uFFFF-])(?:\\.|[\w\u00A0-\uFFFF-])*)/g)) {
          const candidate = unescapeCssIdentifier(match[1] ?? '')
          if (isRuntimeTransformCandidate(candidate)) {
            candidates.add(candidate)
          }
        }
      }
    })
  }
  catch {
  }
  return candidates
}

function hasAdditionalWebpackAssetUserCssMarkers(
  rawSource: string,
  generatorRawSource: string,
) {
  const rawMarkers = collectWebpackAssetUserCssMarkers(rawSource)
  if (rawMarkers.size === 0) {
    return false
  }
  const generatorMarkers = collectWebpackAssetUserCssMarkers(generatorRawSource)
  for (const marker of rawMarkers) {
    if (!generatorMarkers.has(marker)) {
      return true
    }
  }
  return false
}

function hasWebpackTailwindSourceDirectives(source: string | undefined) {
  return Boolean(source)
    && (
      hasTailwindRootDirectives(source!, { importFallback: true })
      || hasTailwindSourceDirectives(source!, { importFallback: true })
      || hasTailwindApplyDirective(source!)
      || hasTailwindGeneratedCss(source!)
      || hasTailwindGeneratedCssMarkers(source!)
    )
}

function isWebpackTailwindImportRequest(request: string | undefined) {
  return request === 'tailwindcss'
    || request === 'tailwindcss4'
    || request?.startsWith('tailwindcss/')
    || request?.startsWith('tailwindcss4/')
    || request === 'weapp-tailwindcss'
    || request?.startsWith('weapp-tailwindcss/')
}

function removeWebpackGeneratorNonTailwindImports(source: string | undefined) {
  if (!source?.includes('@import')) {
    return source
  }
  try {
    const root = postcss.parse(source)
    let changed = false
    root.walkAtRules('import', (rule) => {
      const request = parseImportRequest(rule.params)
      if (isWebpackTailwindImportRequest(request)) {
        return
      }
      rule.remove()
      changed = true
    })
    return changed ? root.toString() : source
  }
  catch {
    return source
  }
}

function isWebpackCssSourceRepresentedInAsset(
  rawSource: string,
  sourceCss: string | undefined,
) {
  if (!sourceCss || !hasWebpackTailwindSourceDirectives(sourceCss)) {
    return false
  }
  const sourceMarkers = collectWebpackCssRuleIdentityMarkers(sourceCss)
  if (sourceMarkers.size === 0) {
    return false
  }
  const rawMarkers = collectWebpackCssRuleIdentityMarkers(rawSource)
  for (const marker of sourceMarkers) {
    if (!rawMarkers.has(marker)) {
      return false
    }
  }
  return true
}

function createWebpackGeneratorCssSource(
  file: string | undefined,
  css: string | undefined,
) {
  if (!file || !css || !hasWebpackTailwindSourceDirectives(css)) {
    return undefined
  }
  return {
    file,
    base: path.dirname(file),
    css,
    dependencies: [file],
  }
}

function createWebpackUserCssSourceAppend(
  sources: Iterable<{ css: string | undefined, file: string, processed?: boolean | undefined }>,
  generatorRawSource: string,
  currentSourceFile?: string | undefined,
) {
  const matchedSources: Array<{ css: string, file: string, processed: boolean }> = []
  const seen = new Set<string>()
  for (const source of sources) {
    const css = source.css
    if (!css || seen.has(css)) {
      continue
    }
    seen.add(css)
    if (
      (source.processed === true || !css.includes('data:'))
      && hasAdditionalWebpackAssetUserCssMarkers(css, generatorRawSource)
    ) {
      matchedSources.push({
        css,
        file: source.file,
        processed: source.processed === true,
      })
    }
  }
  const currentFile = currentSourceFile ? path.resolve(currentSourceFile) : undefined
  const parts = matchedSources
    .sort((a, b) => {
      const aCurrent = currentFile !== undefined && path.resolve(a.file) === currentFile
      const bCurrent = currentFile !== undefined && path.resolve(b.file) === currentFile
      if (aCurrent !== bCurrent) {
        return aCurrent ? -1 : 1
      }
      return a.file.localeCompare(b.file)
    })
    .map(source => source.css)
  return parts.length > 0
    ? {
        css: parts.join('\n'),
        processed: matchedSources.every(source => source.processed),
      }
    : undefined
}

function createWebpackGeneratorUserCssSourceAppend(
  ...sources: Array<WebpackGeneratorUserCssSource | undefined>
): WebpackGeneratorUserCssSource | undefined {
  const parts = sources.filter((source): source is WebpackGeneratorUserCssSource =>
    source !== undefined && source.css.trim().length > 0)
  if (parts.length === 0) {
    return undefined
  }
  let css = ''
  const usedParts: WebpackGeneratorUserCssSource[] = []
  for (const source of parts) {
    const nextCss = css.trim().length > 0
      ? filterExistingCssRules(css, source.css)
      : source.css
    if (nextCss.trim().length === 0) {
      continue
    }
    css = createCssSourceOrderAppend(css, nextCss)
    usedParts.push(source)
  }
  if (css.trim().length === 0) {
    return undefined
  }
  return {
    css,
    processed: usedParts.every(source => source.processed),
  }
}

function resolveWebpackMemoryDebugStats(context: {
  activeAssetFiles: number
  activeCssFiles: number
  activeProcessCacheKeys: Set<string>
  activeProcessHashKeys: Set<string | number>
  cache: SetupWebpackV5ProcessAssetsHookOptions['options']['cache']
  cssHandlerOptionsCache: Map<string, WebpackCssHandlerOptions>
  cssUserHandlerOptionsCache: Map<string, WebpackCssHandlerOptions>
  phase: string
  sourceCandidateScan: WebpackSourceCandidateScanMemoryStats
}) {
  if (process.env['WEAPP_TW_HMR_MEMORY_DEBUG'] !== '1') {
    return undefined
  }

  const memory = process.memoryUsage()
  const processCacheInstanceSize = context.cache.instance.size
  const processCacheHashMapSize = context.cache.hashMap.size
  return {
    phase: context.phase,
    process: {
      rssMb: toMb(memory.rss),
      heapTotalMb: toMb(memory.heapTotal),
      heapUsedMb: toMb(memory.heapUsed),
      externalMb: toMb(memory.external),
      arrayBuffersMb: toMb(memory.arrayBuffers),
    },
    assets: {
      active: context.activeAssetFiles,
      activeCss: context.activeCssFiles,
    },
    processCache: {
      instance: processCacheInstanceSize,
      hashMap: processCacheHashMapSize,
      activeCacheKeys: context.activeProcessCacheKeys.size,
      activeHashKeys: context.activeProcessHashKeys.size,
      staleCacheKeys: Math.max(0, processCacheInstanceSize - context.activeProcessCacheKeys.size),
      staleHashKeys: Math.max(0, processCacheHashMapSize - context.activeProcessHashKeys.size),
      pruned: true,
      pruneSkipped: false,
    },
    webpackCss: {
      handlerOptions: context.cssHandlerOptionsCache.size,
      userHandlerOptions: context.cssUserHandlerOptionsCache.size,
      maxHandlerOptions: WEBPACK_CSS_HANDLER_OPTIONS_CACHE_MAX,
    },
    sourceCandidateScan: context.sourceCandidateScan,
    tailwind: {
      v4: getTailwindV4IncrementalGenerateCacheStats(),
    },
  }
}

export function setupWebpackV5ProcessAssetsHook(options: SetupWebpackV5ProcessAssetsHookOptions) {
  const {
    compiler,
    options: compilerOptions,
    appType,
    runtimeState,
    getRuntimeRefreshRequirement,
    refreshRuntimeMetadata,
    isKnownWebpackProcessedCssAsset,
    isWebpackProcessedCssAsset,
    consumeRuntimeRefreshRequirement,
    isWatchMode,
    getWatchChangedFiles,
    runtimeClassSetManager,
    getWebpackCssSources,
    getWebpackGeneratedCssSources,
    pruneWebpackCssSources,
    prepareWebpackCssSources,
    debug,
  } = options
  const { Compilation, sources } = compiler.webpack
  const { ConcatSource } = sources
  const generatorOptions = compilerOptions.generator
  const isWebGeneratorTarget = generatorOptions?.target === 'web'
  const cssHandlerOptionsCache = new Map<string, WebpackCssHandlerOptions>()
  const cssUserHandlerOptionsCache = new Map<string, WebpackCssHandlerOptions>()
  const webpackSourceCandidateScanCache = createWebpackSourceCandidateScanCache()
  const bundleBuildState = createBundleBuildState()
  const bundleRuntimeClassSetManager = runtimeClassSetManager ?? createBundleRuntimeClassSetManager()
  const escapeFragments = createEscapeFragments(MappingChars2String)
  const processedCssAssetSkipDecisionCache = new Map<string, boolean>()
  let webpackWatchRuntimeScanInitialized = false

  compiler.hooks.compilation.tap(pluginName, (compilation) => {
    compilation.hooks.processAssets.tapPromise(
      {
        name: pluginName,
        stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
      },
      async (assets) => {
        const entries = Object.entries(assets)
        if (entries.length === 0) {
          return
        }
        const groupedEntries = getGroupedEntries(entries, compilerOptions)
        if (isWebGeneratorTarget && !groupedEntries.css?.length) {
          return
        }
        compilerOptions.onStart()
        debug('start')
        await runtimeState.readyPromise
        const hmrTimingStartedAt = performance.now()

        // Initial pass marks cache state.
        for (const chunk of compilation.chunks) {
          if (chunk.id && chunk.hash) {
            compilerOptions.cache.calcHashValueChanged(chunk.id, chunk.hash)
          }
        }
        const assetHashByChunk = createAssetHashByChunkMap(compilation.chunks as any)
        const { updateAssetIfChanged } = createWebpackAssetUpdater({
          compilation,
          ConcatSource,
          onUpdate: compilerOptions.onUpdate,
          debug,
        })

        const compilerOutputPath = compilation.compiler?.outputPath ?? compiler.outputPath
        const outputDir = compilerOutputPath
          ? path.resolve(compilerOutputPath)
          : (compilation.outputOptions?.path ?? process.cwd())
        const jsAssets = new Map<string, string>()
        for (const [file] of entries) {
          if (compilerOptions.jsMatcher(file) || compilerOptions.wxsMatcher(file)) {
            const absolute = toAbsoluteOutputPath(file, outputDir)
            jsAssets.set(absolute, file)
          }
        }
        const moduleGraphOptions = {
          resolve(specifier: string, importer: string) {
            return resolveOutputSpecifier(specifier, importer, outputDir, candidate => jsAssets.has(candidate))
          },
          load: (id: string) => {
            const assetName = jsAssets.get(id)
            if (!assetName) {
              return undefined
            }
            const asset = compilation.getAsset(assetName)
            if (!asset) {
              return undefined
            }
            const source = asset.source.source()
            return typeof source === 'string' ? source : source.toString()
          },
          filter(id: string) {
            return jsAssets.has(id)
          },
        }
        const applyLinkedResults = (linked: Record<string, LinkedJsModuleResult> | undefined) => {
          if (!linked) {
            return
          }
          for (const [id, { code }] of Object.entries(linked)) {
            const assetName = jsAssets.get(id)
            if (!assetName) {
              continue
            }
            const asset = compilation.getAsset(assetName)
            if (!asset) {
              continue
            }
            const previousSource = asset.source.source()
            const previous = typeof previousSource === 'string' ? previousSource : previousSource.toString()
            if (previous === code) {
              continue
            }
            const source = new ConcatSource(code)
            if (updateAssetIfChanged(assetName, source)) {
              debug('js linked handle: %s', assetName)
            }
          }
        }
        const watchMode = isWatchMode?.() === true
        const cssAssetResources = createWebpackCssAssetResourceMap(
          compilation.chunks as Iterable<{ files?: Iterable<string> | string[] | undefined, hasRuntime?: () => boolean, name?: string | undefined }>,
          (compilation as { chunkGraph?: { getChunkModulesIterable?: (chunk: unknown) => Iterable<{ resource?: string }> | undefined } }).chunkGraph as any,
          compilerOptions.cssMatcher,
          (resource, issuer) => {
            if (!isCssLikeModuleResource(resource, compilerOptions.cssMatcher, appType)) {
              return undefined
            }
            const normalized = stripResourceQuery(resource)
            if (!normalized) {
              return undefined
            }
            if (path.isAbsolute(normalized)) {
              return path.resolve(normalized)
            }
            const issuerResource = issuer?.resource ? stripResourceQuery(issuer.resource) : undefined
            const issuerContext = issuerResource && path.isAbsolute(issuerResource)
              ? path.dirname(issuerResource)
              : issuer?.context
            return issuerContext
              ? path.resolve(issuerContext, normalized)
              : undefined
          },
        )
        const watchChangedFiles = new Set([...getWatchChangedFiles?.() ?? []].map(file => path.resolve(file)))
        const taskConcurrency = watchMode ? resolveTaskConcurrency(1) : undefined
        const activeProcessCacheKeys = new Set<string>()
        const activeProcessHashKeys = new Set<string | number>()
        const rememberProcessCacheKey = (cacheKey: string, hashKey: string | number = cacheKey) => {
          activeProcessCacheKeys.add(cacheKey)
          activeProcessHashKeys.add(hashKey)
        }
        const activeWebpackAssetResourceFiles = new Set(
          [...cssAssetResources.values()].flatMap(resources => [...resources].map(resource => path.resolve(resource))),
        )
        const registeredWebpackCssSourceFiles = prepareWebpackCssSources?.(activeWebpackAssetResourceFiles) ?? new Set<string>()
        for (const chunk of compilation.chunks) {
          if (chunk.id) {
            activeProcessHashKeys.add(chunk.id)
          }
        }
        const cssSources = new Map(
          [...(getWebpackCssSources?.() ?? [])]
            .map(([file, source]) => [path.resolve(file), source] as const),
        )
        const generatedCssSources = new Map(
          [...(getWebpackGeneratedCssSources?.() ?? [])]
            .map(([file, source]) => [path.resolve(file), source] as const),
        )
        const hasConfiguredTailwindV4SourceRoots = () => {
          const tailwindOptions = resolveTailwindcssOptions(runtimeState.tailwindRuntime.options)
          return (tailwindOptions?.v4?.cssEntries?.length ?? 0) > 0
            || (tailwindOptions?.v4?.cssSources?.length ?? 0) > 0
        }
        const configuredMainCssEntryFiles = (() => {
          const tailwindOptions = resolveTailwindcssOptions(runtimeState.tailwindRuntime.options)
          return [
            ...(tailwindOptions?.v4?.cssEntries ?? []),
          ]
            .filter((file): file is string => typeof file === 'string' && file.length > 0)
            .map(file => path.resolve(file))
        })()
        const inferredMainCssFiles = inferWebpackMainCssFiles(
          compilation.chunks as Iterable<{ files?: Iterable<string> | string[] | undefined, hasRuntime?: () => boolean, name?: string | undefined }>,
          compilerOptions.cssMatcher,
          {
            mainSourceFiles: new Set(configuredMainCssEntryFiles),
            resourcesByAsset: cssAssetResources,
          },
        )
        const singleConfiguredCssAsset = isWebGeneratorTarget
          && configuredMainCssEntryFiles.length > 0
          && (groupedEntries.css?.length ?? 0) === 1
          ? groupedEntries.css?.[0]?.[0]
          : undefined
        const isMainCssChunk = (file: string) =>
          compilerOptions.mainCssChunkMatcher(file, appType)
          || inferredMainCssFiles.has(file)
          || file === singleConfiguredCssAsset
        const activeWebpackCssSourceFiles = new Set<string>()
        const resolveConfiguredMainCssSourceFile = (file: string) => {
          if (!isMainCssChunk(file)) {
            return undefined
          }
          for (const sourceFile of configuredMainCssEntryFiles) {
            if (cssSources.has(sourceFile)) {
              activeWebpackCssSourceFiles.add(sourceFile)
              return sourceFile
            }
          }
          return undefined
        }
        const resolveWebpackCssSourceFile = (file: string, rawSource?: string | undefined) => {
          const assetResources = cssAssetResources.get(file)
          const activeAssetResource = resolveSingleActiveWebpackCssResource(assetResources, activeWebpackAssetResourceFiles)
          if (cssSources.size === 0) {
            if (activeAssetResource) {
              activeWebpackCssSourceFiles.add(activeAssetResource)
              return activeAssetResource
            }
            if (assetResources && assetResources.size > 0) {
              return undefined
            }
            return resolveConfiguredMainCssSourceFile(file)
          }
          const resourceMatches = [...(assetResources ?? [])]
            .filter(sourceFile => cssSources.has(sourceFile))
            .sort()
          if (resourceMatches.length === 1) {
            const sourceFile = resourceMatches[0]
            activeWebpackCssSourceFiles.add(sourceFile!)
            return sourceFile
          }
          const tailwindSourceMatches = resourceMatches.filter((sourceFile) => {
            const sourceCss = cssSources.get(sourceFile)?.css
            return sourceCss
              && (
                hasTailwindRootDirectives(sourceCss, { importFallback: true })
                || hasTailwindSourceDirectives(sourceCss, { importFallback: true })
                || hasTailwindApplyDirective(sourceCss)
                || hasTailwindGeneratedCss(sourceCss)
                || hasTailwindGeneratedCssMarkers(sourceCss)
              )
          })
          if (tailwindSourceMatches.length === 1) {
            const sourceFile = tailwindSourceMatches[0]
            activeWebpackCssSourceFiles.add(sourceFile!)
            return sourceFile
          }
          if (activeAssetResource) {
            activeWebpackCssSourceFiles.add(activeAssetResource)
            return activeAssetResource
          }
          if (rawSource) {
            const representedTailwindSourceMatches = [...cssSources.entries()]
              .filter(([, source]) => isWebpackCssSourceRepresentedInAsset(rawSource, source.css))
              .map(([sourceFile]) => ({
                sourceFile,
                score: scoreTailwindV4CssSourceFileMatch(file, sourceFile, {
                  outputRoot: outputDir,
                  projectRoot: compilerOptions.tailwindcssBasedir,
                  cwd: compilerOptions.tailwindcssBasedir,
                }),
              }))
              .filter(match => match.score > 0)
              .sort((a, b) => b.score - a.score || a.sourceFile.localeCompare(b.sourceFile))
            const bestScore = representedTailwindSourceMatches[0]?.score ?? 0
            const bestMatches = representedTailwindSourceMatches.filter(match => match.score === bestScore)
            if (bestMatches.length === 1) {
              const sourceFile = bestMatches[0]?.sourceFile
              activeWebpackCssSourceFiles.add(sourceFile!)
              return sourceFile
            }
          }
          const pathMatches = [...cssSources.keys()]
            .map(sourceFile => ({
              sourceFile,
              score: scoreTailwindV4CssSourceFileMatch(file, sourceFile, {
                outputRoot: outputDir,
                projectRoot: compilerOptions.tailwindcssBasedir,
                cwd: compilerOptions.tailwindcssBasedir,
              }),
            }))
            .filter(match => match.score >= 1000)
            .sort((a, b) => b.score - a.score || a.sourceFile.localeCompare(b.sourceFile))
          const bestPathScore = pathMatches[0]?.score ?? 0
          const bestPathMatches = pathMatches.filter(match => match.score === bestPathScore)
          if (bestPathMatches.length === 1) {
            const sourceFile = bestPathMatches[0]?.sourceFile
            activeWebpackCssSourceFiles.add(sourceFile!)
            return sourceFile
          }
          if (assetResources && assetResources.size > 0) {
            return undefined
          }
          return resolveConfiguredMainCssSourceFile(file)
        }
        const getCssHandlerOptions = (file: string, rawSource?: string | undefined) => {
          const majorVersion = runtimeState.tailwindRuntime.majorVersion
          const isMainChunk = isMainCssChunk(file)
          const sourceFile = resolveWebpackCssSourceFile(file, rawSource)
          const sourceCss = sourceFile ? cssSources.get(sourceFile)?.css : undefined
          const generatorSourceCss = removeWebpackGeneratorNonTailwindImports(sourceCss)
          const generatorCssSource = createWebpackGeneratorCssSource(sourceFile, generatorSourceCss)
          const cacheKey = [
            majorVersion ?? 'unknown',
            isMainChunk ? '1' : '0',
            sourceFile ?? 'asset',
            sourceCss === undefined ? 'source:0' : compilerOptions.cache.computeHash(sourceCss),
            generatorSourceCss === sourceCss || generatorSourceCss === undefined ? 'generator-source:0' : compilerOptions.cache.computeHash(generatorSourceCss),
            file,
          ].join(':')
          const cached = cssHandlerOptionsCache.get(cacheKey)
          if (cached) {
            return cached
          }

          const created = {
            isMainChunk,
            postcssOptions: {
              options: {
                from: sourceFile ?? file,
              },
            },
            sourceOptions: {
              outputRoot: outputDir,
              ...(generatorCssSource === undefined ? {} : { cssSources: [generatorCssSource] }),
              ...(generatorSourceCss === undefined ? {} : { sourceCss: generatorSourceCss }),
              ...(sourceFile === undefined ? {} : { sourceFile }),
            },
            ...(majorVersion === undefined ? {} : { majorVersion }),
          }
          cssHandlerOptionsCache.set(cacheKey, created)
          return created
        }
        const getCssUserHandlerOptions = (file: string) => {
          const majorVersion = runtimeState.tailwindRuntime.majorVersion
          const sourceFile = resolveWebpackCssSourceFile(file)
          const sourceCss = sourceFile ? cssSources.get(sourceFile)?.css : undefined
          const generatorSourceCss = removeWebpackGeneratorNonTailwindImports(sourceCss)
          const cacheKey = [
            majorVersion ?? 'unknown',
            sourceFile ?? 'asset',
            sourceCss === undefined ? 'source:0' : compilerOptions.cache.computeHash(sourceCss),
            generatorSourceCss === sourceCss || generatorSourceCss === undefined ? 'generator-source:0' : compilerOptions.cache.computeHash(generatorSourceCss),
            file,
          ].join(':')
          const cached = cssUserHandlerOptionsCache.get(cacheKey)
          if (cached) {
            return cached
          }

          const created = {
            ...getCssHandlerOptions(file),
            isMainChunk: false,
          }
          cssUserHandlerOptionsCache.set(cacheKey, created)
          return created
        }
        const refreshWebpackSourceCandidates = async (): Promise<WebpackSourceCandidateCache | undefined> => {
          const majorVersion = runtimeState.tailwindRuntime.majorVersion
          if (majorVersion !== 4) {
            return undefined
          }
          const root = compilerOptions.tailwindcssBasedir ?? process.cwd()
          let sourceScan: Awaited<ReturnType<typeof resolveViteSourceScanEntries>>
          try {
            sourceScan = await resolveViteSourceScanEntries(compilerOptions, runtimeState.tailwindRuntime, {
              root,
              outDir: outputDir,
            })
          }
          catch (error) {
            debug('webpack source candidate scan skipped: %O', error)
            return undefined
          }
          return webpackSourceCandidateScanCache.resolve({
            changedFiles: watchChangedFiles,
            collector: createSourceCandidateStore({
              bareArbitraryValues: compilerOptions.arbitraryValues?.bareArbitraryValues,
            }),
            outDir: outputDir,
            root,
            sourceScan,
            watchMode,
          })
        }
        const finalizeCssAssetSource = (source: string, options: { generatedCss?: boolean } = {}) => {
          const styleOptions = resolveStyleOptionsFromContext(compilerOptions)
          if (isWebGeneratorTarget && runtimeState.tailwindRuntime.majorVersion === 4) {
            if (options.generatedCss === true) {
              return stripTrailingLineWhitespace(
                stripUnmatchedTailwindSourceMediaCloseFragments(
                  stripTailwindSourceMediaFragments(
                    stripBundlerGeneratedCssMarkers(source),
                  ),
                ),
              )
            }
            const finalized = removeTailwindSourceDirectives(
              stripBundlerGeneratedCssMarkers(source),
              { importFallback: true },
            )
            return stripTrailingLineWhitespace(
              stripUnmatchedTailwindSourceMediaCloseFragments(
                stripTailwindSourceMediaFragments(
                  removeTailwindV4GeneratorAtRules(finalized),
                ),
              ),
            )
          }
          let finalized = removeTailwindSourceDirectives(
            stripBundlerGeneratedCssMarkers(source),
            { importFallback: true },
          )
          if (isWebGeneratorTarget || options.generatedCss !== true) {
            return isWebGeneratorTarget
              ? finalized
              : stripMiniProgramCssSpecificityPlaceholders(finalized)
          }
          try {
            finalized = pruneMiniProgramGeneratedCss(finalized, {
              preservePreflight: runtimeState.tailwindRuntime.majorVersion === 4,
            })
          }
          catch {
            finalized = finalizeMiniProgramCss(finalized, {
              cssPreflight: runtimeState.tailwindRuntime.majorVersion === 4 && !hasMiniProgramTailwindV4PreflightReset(finalized)
                ? compilerOptions.cssPreflight
                : undefined,
              isTailwindcssV4: runtimeState.tailwindRuntime.majorVersion === 4,
              tailwindcssV4GradientFallback: styleOptions.tailwindcssV4GradientFallback,
            })
          }
          return stripMiniProgramCssSpecificityPlaceholders(finalized)
        }
        const finalizeMiniProgramUserCssAssetSource = (source: string) => {
          const styleOptions = resolveStyleOptionsFromContext(compilerOptions)
          if (isWebGeneratorTarget) {
            return source
          }
          const finalized = finalizeMiniProgramCss(source, {
            cssPreflight: runtimeState.tailwindRuntime.majorVersion === 4 && !hasMiniProgramTailwindV4PreflightReset(source)
              ? compilerOptions.cssPreflight
              : undefined,
            isTailwindcssV4: runtimeState.tailwindRuntime.majorVersion === 4,
            tailwindcssV4GradientFallback: styleOptions.tailwindcssV4GradientFallback,
          })
          const output = runtimeState.tailwindRuntime.majorVersion === 4
            ? removeTailwindV4StandaloneHostPreflightRule(finalized)
            : finalized
          return stripMiniProgramCssSpecificityPlaceholders(output)
        }
        const shouldRefreshWebpackSourceCandidates = groupedEntries.css?.length
          || isCssSourceTraceEnabled(compilerOptions)
        const webpackSourceCandidates = shouldRefreshWebpackSourceCandidates
          ? await refreshWebpackSourceCandidates()
          : undefined
        const webpackSourceCandidateValueSignature = webpackSourceCandidates
          ? createCandidateSignature(webpackSourceCandidates.getSourceCandidatesForEntries(undefined))
          : 'source-candidates:0'
        const cssSourceTraceTokenSources = isCssSourceTraceEnabled(compilerOptions) && webpackSourceCandidates
          ? createCssTokenSourceMap(webpackSourceCandidates.tokenSources, compilerOptions)
          : undefined
        const cssSourceTraceSignature = createCssSourceTraceCacheSignature(cssSourceTraceTokenSources, compilerOptions)
        const annotateCss = (css: string) => annotateCssSourceTrace(css, {
          opts: compilerOptions,
          tokenSources: cssSourceTraceTokenSources,
        })
        const finalizeTracedCss = (css: string) => {
          const traced = annotateCss(css)
          if (isWebGeneratorTarget || !isCssSourceTraceEnabled(compilerOptions)) {
            return traced
          }
          return finalizeMiniProgramUserCssAssetSource(traced)
        }
        const forceRuntimeRefresh = getRuntimeRefreshRequirement()
        debug('processAssets ensure runtime set forceRefresh=%s major=%s', forceRuntimeRefresh, runtimeState.tailwindRuntime.majorVersion ?? 'unknown')
        let runtimeSet: Set<string>
        let runtimeAffectingSourceHash = 'runtime-affecting:0'
        if (watchMode && runtimeState.tailwindRuntime.majorVersion === 4 && !forceRuntimeRefresh) {
          const shouldSkipInitialRuntimeBundleScan = isWebGeneratorTarget && !webpackWatchRuntimeScanInitialized
          const baseRuntimeSet = shouldSkipInitialRuntimeBundleScan
            ? getRuntimeClassSetSync(runtimeState.tailwindRuntime)
            : await ensureRuntimeClassSet(runtimeState, {
                forceRefresh: false,
                forceCollect: false,
                clearCache: false,
                allowEmpty: false,
              })
          const snapshot = buildWebpackBundleSnapshot(assets as any, compilerOptions, bundleBuildState, compilation as any)
          if (!webpackWatchRuntimeScanInitialized && !shouldSkipInitialRuntimeBundleScan) {
            for (const entry of snapshot.entries) {
              if (entry.type === 'html' || entry.type === 'js') {
                snapshot.runtimeAffectingChangedByType[entry.type].add(entry.file)
              }
            }
          }
          runtimeAffectingSourceHash = compilerOptions.cache.computeHash([
            ...(groupedEntries.html ?? []).map(([file, source]) => `${file}:${compilerOptions.cache.computeHash(source.source().toString())}`),
            ...(groupedEntries.js ?? []).map(([file, source]) => `${file}:${compilerOptions.cache.computeHash(source.source().toString())}`),
          ].sort().join('\n\n'))
          if (shouldSkipInitialRuntimeBundleScan) {
            runtimeSet = baseRuntimeSet
          }
          else {
            try {
              runtimeSet = await bundleRuntimeClassSetManager.sync(runtimeState.tailwindRuntime, snapshot, {
                baseClassSet: baseRuntimeSet,
                skipInitialFullScanWithBase: false,
              })
            }
            catch (error) {
              debug('webpack incremental runtime set sync failed, fallback to full collect: %O', error)
              await bundleRuntimeClassSetManager.reset()
              runtimeSet = await ensureRuntimeClassSet(runtimeState, {
                forceRefresh: false,
                forceCollect: true,
                clearCache: false,
                allowEmpty: false,
              })
            }
          }
          releaseWebpackBundleSnapshotSources(snapshot)
          updateBundleBuildState(bundleBuildState, snapshot, new Map(), { incremental: true })
          webpackWatchRuntimeScanInitialized = true
        }
        else {
          if (forceRuntimeRefresh) {
            await bundleRuntimeClassSetManager.reset()
            webpackWatchRuntimeScanInitialized = false
          }
          runtimeSet = await ensureRuntimeClassSet(runtimeState, {
            forceRefresh: forceRuntimeRefresh,
            // In watch mode the runtime-classset loader may have already
            // refreshed the class set for this compilation. Reuse that cached
            // result unless webpack reported a runtime dependency change;
            // otherwise webpack can do a second full content scan in
            // processAssets for the same rebuild.
            forceCollect: !watchMode || forceRuntimeRefresh,
            clearCache: forceRuntimeRefresh,
            allowEmpty: false,
          })
        }
        await refreshRuntimeMetadata(forceRuntimeRefresh)
        consumeRuntimeRefreshRequirement()
        const webpackSourceCandidateSet = webpackSourceCandidates?.getSourceCandidatesForEntries(undefined)
        const generatorRuntimeSet = new Set(runtimeSet)
        if (webpackSourceCandidateSet?.size) {
          for (const candidate of webpackSourceCandidateSet) {
            if (isRuntimeTransformCandidate(candidate)) {
              generatorRuntimeSet.add(candidate)
            }
          }
        }
        const transformRuntimeSet = new Set(runtimeSet)
        const hasRuntimeTransformAssets = Boolean(
          !isWebGeneratorTarget
          && ((groupedEntries.html?.length ?? 0) > 0 || (groupedEntries.js?.length ?? 0) > 0),
        )
        if (hasRuntimeTransformAssets && Array.isArray(groupedEntries.css)) {
          for (const [, originalSource] of groupedEntries.css) {
            for (const candidate of collectGeneratedCssRuntimeCandidates(originalSource.source().toString())) {
              transformRuntimeSet.add(candidate)
            }
          }
        }
        const transformedJsRuntimeCandidates = new Set<string>()
        let currentJsRuntimeCandidates: Set<string> | undefined
        let currentJsRuntimeTokenSignature: string | undefined
        const getCurrentJsRuntimeCandidates = () => {
          if (isWebGeneratorTarget || runtimeState.tailwindRuntime.majorVersion !== 4) {
            return undefined
          }
          if (currentJsRuntimeCandidates) {
            return currentJsRuntimeCandidates
          }
          currentJsRuntimeCandidates = new Set<string>()
          for (const file of jsAssets.values()) {
            const asset = compilation.getAsset(file)
            if (!asset) {
              continue
            }
            const value = asset.source.source()
            const source = typeof value === 'string' ? value : value.toString()
            for (const candidate of collectStrictEscapedRuntimeCandidates(source, MappingChars2String, escapeFragments)) {
              if (isRuntimeTransformCandidate(candidate)) {
                currentJsRuntimeCandidates.add(candidate)
              }
            }
          }
          return currentJsRuntimeCandidates
        }
        const getCurrentJsRuntimeTokenSignature = () => {
          if (currentJsRuntimeTokenSignature !== undefined) {
            return currentJsRuntimeTokenSignature
          }
          if (isWebGeneratorTarget) {
            currentJsRuntimeTokenSignature = ''
            return currentJsRuntimeTokenSignature
          }
          const tokens: string[] = []
          for (const file of jsAssets.values()) {
            const asset = compilation.getAsset(file)
            if (!asset) {
              continue
            }
            const value = asset.source.source()
            const source = typeof value === 'string' ? value : value.toString()
            tokens.push(...collectRuntimeTokenSignatureParts(source))
          }
          currentJsRuntimeTokenSignature = tokens.sort().join('\n')
          return currentJsRuntimeTokenSignature
        }
        const rememberTransformedRuntimeCandidates = (source: WebpackSourceLike) => {
          currentJsRuntimeCandidates = undefined
          currentJsRuntimeTokenSignature = undefined
          const value = typeof source === 'string'
            ? source
            : source.source()
          const code = typeof value === 'string' ? value : value.toString()
          for (const candidate of collectStrictEscapedRuntimeCandidates(code, MappingChars2String, escapeFragments)) {
            if (isRuntimeTransformCandidate(candidate)) {
              transformedJsRuntimeCandidates.add(candidate)
            }
          }
        }
        const createRuntimeSetHash = (generatorRuntimeSet: Set<string>) => compilerOptions.cache.computeHash([
          getRuntimeClassSetSignature(runtimeState.tailwindRuntime),
          [...runtimeSet].sort().join('\n'),
          [...transformRuntimeSet].sort().join('\n'),
          [...generatorRuntimeSet].sort().join('\n'),
          getCurrentJsRuntimeTokenSignature(),
        ].join('\n\n'))
        const getGeneratorRuntimeSet = () => {
          const currentJsCandidates = getCurrentJsRuntimeCandidates()
          if (transformedJsRuntimeCandidates.size === 0 && (!currentJsCandidates || currentJsCandidates.size === 0)) {
            return generatorRuntimeSet
          }
          return new Set([
            ...generatorRuntimeSet,
            ...(currentJsCandidates ?? []),
            ...transformedJsRuntimeCandidates,
          ])
        }
        const defaultTemplateHandlerOptions = {
          runtimeSet: transformRuntimeSet,
        }
        debug('get runtimeSet, class count: %d, transform class count: %d', runtimeSet.size, transformRuntimeSet.size)
        const tasks: Promise<void>[] = []
        const htmlTaskFactories: Array<() => Promise<void>> = []
        const cssTaskFactories: Array<() => Promise<void>> = []
        const enqueueTask = async (
          factory: () => Promise<void>,
          target: Array<() => Promise<void>>,
        ) => {
          if (watchMode) {
            await factory()
            return
          }
          target.push(factory)
        }
        if (!isWebGeneratorTarget && Array.isArray(groupedEntries.html)) {
          for (const element of groupedEntries.html) {
            const [file, originalSource] = element
            let rawSource: string | undefined
            const readRawSource = () => {
              rawSource ??= originalSource.source().toString()
              return rawSource
            }

            const cacheKey = file
            const hashKey = `${file}:asset`
            rememberProcessCacheKey(cacheKey, hashKey)
            const chunkHash = assetHashByChunk.get(file)
            await enqueueTask(async () => {
              await processCachedTask({
                cache: compilerOptions.cache,
                cacheKey,
                hashKey,
                rawSource: chunkHash === undefined ? readRawSource() : undefined,
                hash: chunkHash,
                applyResult(source, { cacheHit }) {
                  updateAssetIfChanged(file, source, {
                    compare: !cacheHit,
                    notifyUpdate: !cacheHit,
                  })
                },
                onCacheHit() {
                  debug('html cache hit: %s', file)
                },
                transform: async () => {
                  const wxml = await compilerOptions.templateHandler(readRawSource(), defaultTemplateHandlerOptions)
                  const source = new ConcatSource(wxml)
                  debug('html handle: %s', file)

                  return {
                    result: source,
                  }
                },
              })
            }, htmlTaskFactories)
          }
        }

        const jsTaskFactories: Array<() => Promise<void>> = []
        const enqueueJsTask = async (factory: () => Promise<void>) => {
          await enqueueTask(factory, jsTaskFactories)
        }

        if (!isWebGeneratorTarget && Array.isArray(groupedEntries.js)) {
          for (const [file] of groupedEntries.js) {
            const cacheKey = getCacheKey(file)
            const asset = compilation.getAsset(file)
            if (!asset) {
              continue
            }
            const hashKey = `${file}:asset`
            rememberProcessCacheKey(cacheKey, hashKey)
            const absoluteFile = toAbsoluteOutputPath(file, outputDir)
            let initialRawSource: string | undefined
            const readInitialRawSource = () => {
              if (initialRawSource === undefined) {
                const initialSource = asset.source.source()
                initialRawSource = typeof initialSource === 'string' ? initialSource : initialSource.toString()
              }
              return initialRawSource
            }
            const chunkHash = assetHashByChunk.get(file)
            await enqueueJsTask(async () => {
              await processCachedTask({
                cache: compilerOptions.cache,
                cacheKey,
                hashKey,
                rawSource: chunkHash === undefined ? readInitialRawSource() : undefined,
                hash: chunkHash,
                applyResult(source, { cacheHit }) {
                  const updated = updateAssetIfChanged(file, source, {
                    compare: !cacheHit,
                    notifyUpdate: !cacheHit,
                  })
                  if (updated && runtimeState.tailwindRuntime.majorVersion === 4) {
                    rememberTransformedRuntimeCandidates(source)
                  }
                },
                onCacheHit() {
                  debug('js cache hit: %s', file)
                },
                transform: async () => {
                  const currentAsset = compilation.getAsset(file)
                  const currentSourceValue = currentAsset?.source.source()
                  const currentSource = typeof currentSourceValue === 'string'
                    ? currentSourceValue
                    : currentSourceValue?.toString() ?? ''
                  const handlerOptions = {
                    tailwindcssMajorVersion: runtimeState.tailwindRuntime.majorVersion,
                    generateMap: false,
                    filename: absoluteFile,
                    moduleGraph: moduleGraphOptions,
                    babelParserOptions: {
                      sourceFilename: absoluteFile,
                    },
                  }
                  if (shouldSkipJsTransform(currentSource, {
                    ...handlerOptions,
                    classNameSet: transformRuntimeSet,
                  })) {
                    return { result: new ConcatSource(currentSource) }
                  }
                  const { code, linked } = await compilerOptions.jsHandler(currentSource, transformRuntimeSet, handlerOptions)
                  const source = new ConcatSource(code)
                  debug('js handle: %s', file)
                  applyLinkedResults(linked)
                  return {
                    result: source,
                  }
                },
              })
            })
          }
        }

        if (Array.isArray(groupedEntries.css)) {
          for (const element of groupedEntries.css) {
            const [file, originalSource] = element

            let rawSource: string | undefined
            const readRawSource = () => {
              rawSource ??= originalSource.source().toString()
              return rawSource
            }
            const chunkHash = assetHashByChunk.get(file)
            const cssHandlerOptionsForProcessedAsset = getCssHandlerOptions(file)
            const processedCssAssetMetadata = {
              isMainCssChunk: cssHandlerOptionsForProcessedAsset.isMainChunk,
            }
            const processedCssAssetKnown = isKnownWebpackProcessedCssAsset?.(file, processedCssAssetMetadata) === true
            const processedCssHashKey = createRuntimeAwareCssHash(
              chunkHash,
              chunkHash === undefined ? undefined : 'webpack-css-asset:chunk',
              `${createRuntimeSetHash(getGeneratorRuntimeSet())}:${runtimeAffectingSourceHash}:${cssSourceTraceSignature}`,
            )
            const processedCssDecisionCacheKey = `${file}:${processedCssHashKey ?? 'hash:0'}`
            let currentProcessedRawSource: string | undefined
            let hasGeneratedCssMarker = false
            let hasTailwindGeneratedAssetCss = false
            const readCurrentProcessedRawSource = () => {
              currentProcessedRawSource ??= readRawSource()
              return currentProcessedRawSource
            }
            const cachedSkipProcessedCssAsset = processedCssAssetKnown
              ? processedCssAssetSkipDecisionCache.get(processedCssDecisionCacheKey)
              : undefined
            if (cachedSkipProcessedCssAsset !== undefined) {
              hasGeneratedCssMarker = cachedSkipProcessedCssAsset && cssHandlerOptionsForProcessedAsset.isMainChunk
              hasTailwindGeneratedAssetCss = hasGeneratedCssMarker
            }
            else {
              const source = readCurrentProcessedRawSource()
              hasGeneratedCssMarker = hasBundlerGeneratedCssMarker(source)
              hasTailwindGeneratedAssetCss = hasTailwindGeneratedCss(source)
                || hasTailwindGeneratedCssMarkers(source)
            }
            const shouldForceConfiguredMainCssGeneration = cssHandlerOptionsForProcessedAsset.isMainChunk
              && hasConfiguredTailwindV4SourceRoots()
              && !hasGeneratedCssMarker
            const hasProcessedMainAssetUserCss = cachedSkipProcessedCssAsset === undefined
              && cssHandlerOptionsForProcessedAsset.isMainChunk
              && (hasGeneratedCssMarker || hasTailwindGeneratedAssetCss)
              && createWebpackUserCssSourceAppend(
                [...cssSources.entries()].map(([sourceFile, source]) => ({
                  ...source,
                  file: sourceFile,
                })),
                readCurrentProcessedRawSource(),
              ) !== undefined
            const shouldSkipProcessedCssAsset = (
              cachedSkipProcessedCssAsset
              ?? (
                !shouldForceConfiguredMainCssGeneration
                && (
                  processedCssAssetKnown
                  || isWebpackProcessedCssAsset?.(file, readCurrentProcessedRawSource(), processedCssAssetMetadata)
                )
                && !hasProcessedMainAssetUserCss
                && (!cssHandlerOptionsForProcessedAsset.isMainChunk || hasGeneratedCssMarker || hasTailwindGeneratedAssetCss)
              )
            )
            if (processedCssAssetKnown && cachedSkipProcessedCssAsset === undefined) {
              processedCssAssetSkipDecisionCache.set(processedCssDecisionCacheKey, shouldSkipProcessedCssAsset)
            }
            if (shouldSkipProcessedCssAsset) {
              const hashKey = `${file}:asset`
              const sourceHash = chunkHash === undefined
                ? compilerOptions.cache.computeHash(readCurrentProcessedRawSource())
                : 'webpack-css-asset:chunk'
              rememberProcessCacheKey(file, hashKey)
              await enqueueTask(async () => {
                await processCachedTask({
                  cache: compilerOptions.cache,
                  cacheKey: file,
                  hashKey,
                  rawSource: chunkHash === undefined ? readCurrentProcessedRawSource() : undefined,
                  hash: createRuntimeAwareCssHash(
                    chunkHash,
                    sourceHash,
                    `${createRuntimeSetHash(getGeneratorRuntimeSet())}:${runtimeAffectingSourceHash}:${cssSourceTraceSignature}`,
                  ),
                  applyResult(source, { cacheHit }) {
                    updateAssetIfChanged(file, source, {
                      compare: !cacheHit,
                      notifyUpdate: !cacheHit,
                    })
                  },
                  onCacheHit() {
                    debug('css webpack-loader-pipeline cache hit: %s', file)
                  },
                  transform: async () => {
                    const source = readCurrentProcessedRawSource()
                    const shouldTransformGeneratedAssetCss = hasTailwindGeneratedAssetCss && !hasGeneratedCssMarker
                    const handledCss = shouldTransformGeneratedAssetCss
                      ? isWebGeneratorTarget
                        ? source
                        : (await compilerOptions.styleHandler(
                            source,
                            cssHandlerOptionsForProcessedAsset,
                          )).css
                      : source
                    const nextCss = stripTrailingLineWhitespace(finalizeCssAssetSource(handledCss, {
                      generatedCss: hasGeneratedCssMarker || hasTailwindGeneratedAssetCss,
                    }))
                    debug('css skip webpack-loader-pipeline asset: %s', file)
                    return {
                      result: new ConcatSource(finalizeTracedCss(nextCss)),
                    }
                  },
                })
              }, cssTaskFactories)
              continue
            }
            const currentRawSource = readRawSource()
            const cacheKey = file
            const hashKey = `${file}:asset`
            rememberProcessCacheKey(cacheKey, hashKey)
            const cssHandlerOptionsForHash = getCssHandlerOptions(file, currentRawSource)
            const cssChunkHash = watchMode
              && runtimeState.tailwindRuntime.majorVersion === 4
              && cssHandlerOptionsForHash.isMainChunk
              ? undefined
              : chunkHash
            const cssSourceHash = (() => {
              const sourceFile = resolveWebpackCssSourceFile(file, currentRawSource)
              const sourceCss = sourceFile ? cssSources.get(sourceFile)?.css : undefined
              const generatorSourceCss = removeWebpackGeneratorNonTailwindImports(sourceCss)
              if (sourceCss === undefined) {
                return sourceFile === undefined
                  ? 'webpack-css-source:0'
                  : `webpack-css-source:0:${sourceFile}`
              }
              return `webpack-css-source:1:${compilerOptions.cache.computeHash(sourceCss)}:${generatorSourceCss === sourceCss || generatorSourceCss === undefined ? 'generator-source:0' : compilerOptions.cache.computeHash(generatorSourceCss)}`
            })()
            const runtimeAwareHash = createRuntimeAwareCssHash(
              cssChunkHash,
              compilerOptions.cache.computeHash(currentRawSource),
              `${createRuntimeSetHash(getGeneratorRuntimeSet())}:${runtimeAffectingSourceHash}:${webpackSourceCandidates?.signatureHash ?? 'source-candidates:0'}:${webpackSourceCandidateValueSignature}:${cssSourceTraceSignature}:${cssSourceHash}`,
            )
            await enqueueTask(async () => {
              await processCachedTask({
                cache: compilerOptions.cache,
                cacheKey,
                hashKey,
                rawSource: currentRawSource,
                hash: runtimeAwareHash,
                applyResult(source, { cacheHit }) {
                  updateAssetIfChanged(file, source, {
                    compare: !cacheHit,
                    notifyUpdate: !cacheHit,
                  })
                },
                onCacheHit() {
                  debug('css cache hit: %s', file)
                },
                transform: async () => {
                  await runtimeState.readyPromise
                  const cssHandlerOptions = getCssHandlerOptions(file, currentRawSource)
                  const generatorRawSource = resolveWebpackGeneratorRawSource(currentRawSource, cssHandlerOptions)
                  const sourceFile = cssHandlerOptions.sourceOptions?.sourceFile
                  const loaderGeneratedCss = sourceFile
                    && !isWebGeneratorTarget
                    ? generatedCssSources.get(path.resolve(sourceFile))
                    : undefined
                  if (loaderGeneratedCss) {
                    for (const className of loaderGeneratedCss.classSet) {
                      generatorRuntimeSet.add(className)
                      transformRuntimeSet.add(className)
                    }
                    for (const dependency of loaderGeneratedCss.dependencies) {
                      compilation.fileDependencies?.add?.(dependency)
                    }
                    const css = finalizeTracedCss(finalizeCssAssetSource(loaderGeneratedCss.css, { generatedCss: true }))
                    debug('css consume webpack loader generation: %s <- %s', file, sourceFile)
                    return {
                      result: new ConcatSource(css),
                    }
                  }
                  const sourceCssProcessed = sourceFile ? cssSources.get(path.resolve(sourceFile))?.processed === true : false
                  const registeredUserRawSource = createWebpackUserCssSourceAppend(
                    [...cssSources.entries()].map(([registeredSourceFile, source]) => ({
                      ...source,
                      file: registeredSourceFile,
                    })),
                    generatorRawSource,
                    sourceFile,
                  )
                  const currentAssetLooksGenerated = hasTailwindGeneratedCss(currentRawSource)
                    || hasTailwindGeneratedCssMarkers(currentRawSource)
                  const shouldPreserveGeneratedWebAssetUserCss = isWebGeneratorTarget
                    && runtimeState.tailwindRuntime.majorVersion === 4
                    && currentAssetLooksGenerated
                  const currentAssetHasUserCss = sourceCssProcessed && currentAssetLooksGenerated && !shouldPreserveGeneratedWebAssetUserCss
                    ? false
                    : shouldUseWebpackAssetAsGeneratorUserCss(currentRawSource, generatorRawSource, {
                        processed: sourceCssProcessed || shouldPreserveGeneratedWebAssetUserCss,
                      })
                  const shouldAppendCurrentAssetUserCss = (!sourceCssProcessed || registeredUserRawSource === undefined || currentAssetHasUserCss)
                    && !(sourceCssProcessed && currentAssetLooksGenerated && !currentAssetHasUserCss)
                  const userRawSource = createWebpackGeneratorUserCssSourceAppend(
                    sourceCssProcessed && shouldAppendCurrentAssetUserCss
                      ? {
                          css: currentRawSource,
                          processed: true,
                        }
                      : shouldAppendCurrentAssetUserCss && currentAssetHasUserCss
                        ? {
                            css: currentRawSource,
                            processed: currentAssetLooksGenerated,
                          }
                        : undefined,
                    registeredUserRawSource,
                  )
                  if (isPureLocalCssImportWrapper(currentRawSource)) {
                    return {
                      result: new ConcatSource(removeTailwindSourceDirectives(
                        stripBundlerGeneratedCssMarkers(currentRawSource),
                        { importFallback: true },
                      )),
                    }
                  }
                  const generatorOptions = {
                    opts: compilerOptions,
                    runtimeState,
                    runtime: getGeneratorRuntimeSet(),
                    rawSource: generatorRawSource,
                    forceGenerator: cssHandlerOptions.isMainChunk && hasConfiguredTailwindV4SourceRoots(),
                    ...(userRawSource === undefined ? {} : { userRawSource: userRawSource.css }),
                    ...(userRawSource?.processed === true ? { userRawSourceProcessed: true } : {}),
                    file,
                    cssHandlerOptions,
                    cssUserHandlerOptions: getCssUserHandlerOptions(file),
                    getSourceCandidatesForEntries: webpackSourceCandidates?.getSourceCandidatesForEntries,
                    restoreLocalCssImports: false,
                    styleHandler: compilerOptions.styleHandler,
                    debug,
                  }
                  const generated = runtimeState.tailwindRuntime.majorVersion === 4
                    ? await generateTailwindV4Css({
                        ...generatorOptions,
                        outputFile: file,
                      })
                    : await generateCssByGenerator(generatorOptions)
                  const css = finalizeTracedCss(generated
                    ? finalizeCssAssetSource(generated.css, { generatedCss: true })
                    : isWebGeneratorTarget
                      ? finalizeCssAssetSource(generatorRawSource, { generatedCss: false })
                      : finalizeCssAssetSource(
                          (await compilerOptions.styleHandler(generatorRawSource, cssHandlerOptions)).css,
                          { generatedCss: false },
                        ))
                  const source = new ConcatSource(css)

                  if (generated) {
                    for (const className of generated.classSet) {
                      generatorRuntimeSet.add(className)
                    }
                    debug('css handle via tailwind v%s engine(%s): %s', runtimeState.tailwindRuntime.majorVersion, generated.target, file)
                  }
                  else {
                    debug('css handle: %s', file)
                  }

                  return {
                    result: source,
                  }
                },
              })
            }, cssTaskFactories)
          }
        }
        if (!watchMode) {
          pushConcurrentTaskFactories(tasks, htmlTaskFactories, taskConcurrency)
          await Promise.all(tasks)
          tasks.length = 0
          pushConcurrentTaskFactories(tasks, jsTaskFactories, taskConcurrency)
          await Promise.all(tasks)
          tasks.length = 0
          pushConcurrentTaskFactories(tasks, cssTaskFactories, taskConcurrency)
        }

        await Promise.all(tasks)
        compilerOptions.cache.prune?.({
          cacheKeys: activeProcessCacheKeys,
          hashKeys: activeProcessHashKeys,
        })
        const activeCssFiles = new Set(groupedEntries.css?.map(([file]) => file) ?? [])
        pruneWebpackCssHandlerOptionCaches(
          cssHandlerOptionsCache,
          cssUserHandlerOptionsCache,
          activeCssFiles,
        )
        if (activeCssFiles.size > 0) {
          pruneWebpackCssSources?.(new Set([
            ...registeredWebpackCssSourceFiles,
            ...activeWebpackCssSourceFiles,
            ...[...cssAssetResources.values()].flatMap(resources => [...resources]),
          ]), { watchMode })
        }
        debug('end')
        emitHmrTiming('webpack', 'processAssets', performance.now() - hmrTimingStartedAt, {
          memoryDebug: resolveWebpackMemoryDebugStats({
            activeAssetFiles: entries.length,
            activeCssFiles: activeCssFiles.size,
            activeProcessCacheKeys,
            activeProcessHashKeys,
            cache: compilerOptions.cache,
            cssHandlerOptionsCache,
            cssUserHandlerOptionsCache,
            phase: 'processAssets',
            sourceCandidateScan: webpackSourceCandidateScanCache.getMemoryStats(),
          }),
        })
        compilerOptions.onEnd()
      },
    )
  })
}
