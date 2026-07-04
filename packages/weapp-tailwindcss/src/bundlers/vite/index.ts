import type { Plugin, ResolvedConfig } from 'vite'
import type { SourceCandidateScanRoot } from './source-candidate-scan-signature'
import type { SourceCandidateCollectorSnapshot, SourceCandidateFilterOptions } from './source-candidates'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { UserDefinedOptions } from '@/types'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import { compileCssMacroConditionalComments, removeTailwindPostcssPlugins, resolveFilteredPostcssConfig, transformWebCssCompat, transformWebCssSafeSelectors, unwrapUnsupportedCascadeLayers } from '@weapp-tailwindcss/postcss'
import { LRUCache } from 'lru-cache'
import { hasTailwindApplyDirective, hasTailwindRootDirectives, hasTailwindSourceDirectives, normalizeTailwindConfigDirectives, normalizeTailwindSourceForGenerator } from '@/bundlers/shared/generator-css/directives'
import { normalizeEmptyTailwindCustomVariants } from '@/bundlers/shared/generator-css/user-css'
import { vitePluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { toCustomAttributesEntities } from '@/context/custom-attributes'
import { createDebug } from '@/debug'
import { normalizeFrameworkStylePlatform } from '@/framework/platform'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { resolveGeneratorRuntimeBranch } from '@/runtime-branch'
import { createBuiltinViteStyleInjectorPlugins } from '@/style-injector/internal'
import { isTailwindV4CssEntry, normalizeCssEntries } from '@/tailwindcss/v4/css-entries'
import { hasConfiguredTailwindV4CssRoots, upsertTailwindV4CssSource } from '@/tailwindcss/v4/css-sources'
import { isUniAppXHarmonyOutDir } from '@/uni-app-x/harmony'
import { isUniAppXEnabled } from '@/uni-app-x/options'
import { createUniAppXPlugins } from '@/uni-app-x/vite'
import { withUniAppXWebPreflightReset } from '@/uni-app-x/web-preflight-reset'
import { resolveUniUtsPlatform } from '@/utils'
import { resolvePluginDisabledState } from '@/utils/disabled'
import { resolvePackageDir } from '@/utils/resolve-package'
import { createBundlerAppBranchState } from '../branches'
import { annotateCssSourceTrace, createCssTokenSourceMap } from '../shared/css-source-trace'
import { createBundlerGeneratedCssMarker, hasBundlerGeneratedCssMarker } from '../shared/generated-css-marker'
import { createHmrTimingRecorder } from '../shared/hmr-timing'
import { normalizeOutputPathKey } from '../shared/module-graph'
import { isSourceStyleRequest } from '../shared/style-requests'
import { generateTailwindV4Css } from '../shared/v4-generation-core'
import { createViteCssFinalizerOutputPlugin } from './css-finalizer'
import { createViteCssMemory, shouldCollectTransformedSourceCandidates } from './css-memory'
import { createGenerateBundleHook, resolveViteCssPipelineOutputFile } from './generate-bundle'
import { createCssHandlerOptionsCache, resolveViteCssHandlerExtraOptions } from './generate-bundle/css-handler-options'
import { createJsHandlerOptionsFactory } from './generate-bundle/js-handler-options'
import { hasSelfAcceptingNonStyleHotModule, resolveHotSourceModules, resolveHotTailwindCssModules, sendFullReloadForUnresolvedHotUpdate, sendSupplementalCssHotUpdates } from './hot-css-modules'
import { touchMapEntry } from './map-cache'
import { disableAndRemoveTailwindVitePlugins, removeTailwindVitePlugins } from './official-tailwind-plugins'
import { isMissingInternalCssSource, normalizeVitePersistentCacheKey, summarizeStringCache, summarizeViteProcessedCssResults } from './plugin-cache'
import { removeScopedTailwindPreflightCss } from './processed-css-assets'
import { resolveImplicitAppTypeFromViteRoot } from './resolve-app-type'
import { createRewriteCssImportsPlugins, hasVitePipelineTailwindGenerationDirective } from './rewrite-css-imports'
import { createViteRuntimeClassSet } from './runtime-class-set'
import { createViteServeCssGenerationPlugins } from './serve-css-generation'
import { createViteServeJsTransformPlugin } from './serve-js-transform'
import { createSourceCandidateScanSignature } from './source-candidate-scan-signature'
import { createSourceCandidateCollector, isSourceCandidateRequest } from './source-candidates'
import { createViteSourceScanMatcher, discoverTailwindV4CssEntries, resolveTailwindV4EntriesFromCssCached, resolveViteSourceScanEntries, resolveViteTailwindV4CssDependencies } from './source-scan'
import { resolveImplicitTailwindcssBasedirFromViteRoot } from './tailwind-basedir'
import { resolveUniAppXNativeCssHandlerOptions } from './uni-app-x-css-options'
import { cleanUrl, isCSSRequest, isHTMLRequest, slash } from './utils'
import { resolveWeappViteSourceRoot } from './weapp-vite-config'

const debug = createDebug()
const weappTailwindcssPackageDir = resolvePackageDir('weapp-tailwindcss')
const weappTailwindcssDirPosix = slash(weappTailwindcssPackageDir)
const SOURCE_CANDIDATE_SCAN_CACHE_MAX = 8
const sourceCandidateScanSnapshotCache = new LRUCache<string, SourceCandidateCollectorSnapshot>({
  max: SOURCE_CANDIDATE_SCAN_CACHE_MAX,
})
const ENV_PLATFORM_KEYS = [
  'UNI_PLATFORM',
  'UNI_UTS_PLATFORM',
  'TARO_ENV',
  'MPX_CURRENT_TARGET_MODE',
  'MPX_CLI_MODE',
] as const

function sameStringList(first: string[] | undefined, second: string[] | undefined) {
  if (first === second) {
    return true
  }
  if (!first || !second || first.length !== second.length) {
    return false
  }
  return first.every((item, index) => item === second[index])
}

function collectConfiguredCssEntries(options: UserDefinedOptions) {
  const runtimeCssEntries = (options.tailwindcssRuntimeOptions as any)?.tailwindcss?.v4?.cssEntries
  const entries = [
    ...(Array.isArray(options.cssEntries) ? options.cssEntries : []),
    ...(Array.isArray(options.tailwindcss?.v4?.cssEntries) ? options.tailwindcss.v4.cssEntries : []),
    ...(Array.isArray(runtimeCssEntries) ? runtimeCssEntries : []),
  ].filter((item): item is string => typeof item === 'string' && item.length > 0)
  return entries.length > 0 ? [...new Set(entries)] : undefined
}

function normalizeViteStylePlatform(value: string | undefined, appType: UserDefinedOptions['appType']) {
  return normalizeFrameworkStylePlatform(value, appType)
}

function inferPlatformFromOutDir(outDir: string | undefined) {
  const segment = outDir ? path.basename(path.normalize(outDir)) : undefined
  if (!segment) {
    return undefined
  }
  const normalized = segment.trim().toLowerCase()
  if (
    normalized === 'h5'
    || normalized === 'web'
    || normalized === 'app'
    || normalized === 'app-plus'
    || normalized.startsWith('app-')
    || normalized.startsWith('mp-')
    || normalized.startsWith('quickapp-webview')
  ) {
    return normalized
  }
  return undefined
}

function isWebOrNativeAppPlatform(platform: string | undefined) {
  return platform === 'h5'
    || platform === 'web'
    || platform?.startsWith('web-') === true
    || platform === 'app'
    || platform === 'app-plus'
    || platform?.startsWith('app-') === true
}

function isUniAppViteWebviewStylePlatform(platform: string | undefined) {
  return platform === 'app' || platform === 'app-plus'
}

function applyUniAppViteWebviewCssCompat(css: string, options: {
  compat: Parameters<typeof transformWebCssCompat>[1]
  escapeMap?: Record<string, string> | undefined
  safeSelectors: boolean
}) {
  const compatCss = transformWebCssCompat(css, options.compat)
  return options.safeSelectors
    ? transformWebCssSafeSelectors(compatCss, { escapeMap: options.escapeMap })
    : compatCss
}

export interface WeappTailwindcssVitePlugin {
  name: string
  [hook: string]: any
}

/**
 * @name WeappTailwindcss
 * @description uni-app vite / uni-app-x 版本插件
 * @link https://tw.icebreaker.top/docs/quick-start/frameworks/uni-app-vite
 */
export function WeappTailwindcss(options: UserDefinedOptions = {}): WeappTailwindcssVitePlugin[] | undefined {
  const hasExplicitAppType = typeof options.appType === 'string' && options.appType.trim().length > 0
  const hasExplicitTailwindcssBasedir = typeof options.tailwindcssBasedir === 'string'
    && options.tailwindcssBasedir.trim().length > 0
  const rawCssEntries = collectConfiguredCssEntries(options)
  const opts = getCompilerContext({
    ...options,
    __internalDeferMissingCssEntriesWarning: true,
  } as UserDefinedOptions)
  const syncCssEntriesFromAnchor = (anchor: string | undefined) => {
    const normalizedCssEntries = normalizeCssEntries(rawCssEntries, anchor ?? process.cwd())
    if (!normalizedCssEntries) {
      return false
    }
    const changed = !sameStringList(opts.cssEntries, normalizedCssEntries)
    opts.cssEntries = normalizedCssEntries
    opts.tailwindcss ??= {}
    opts.tailwindcss.v4 ??= {}
    opts.tailwindcss.v4.cssEntries = normalizedCssEntries
    if ((opts.tailwindcssRuntimeOptions as any)?.tailwindcss?.v4) {
      ;(opts.tailwindcssRuntimeOptions as any).tailwindcss.v4.cssEntries = normalizedCssEntries
    }
    if ((opts.tailwindRuntime as any)?.options?.tailwindcss?.v4) {
      ;(opts.tailwindRuntime as any).options.tailwindcss.v4.cssEntries = normalizedCssEntries
    }
    return changed
  }
  syncCssEntriesFromAnchor(opts.tailwindcssBasedir)
  const {
    disabled,
    customAttributes,
    onLoad,
    mainCssChunkMatcher,
    styleHandler,
    jsHandler,
    tailwindRuntime,
    refreshTailwindcssRuntime,
    uniAppX,
    disabledDefaultTemplateHandler,
    styleInjector,
  } = opts
  const initialTailwindRuntime = tailwindRuntime
  const refreshTailwindRuntime = refreshTailwindcssRuntime
  const bundlerAppBranchState = createBundlerAppBranchState({
    appType: opts.appType,
    bundler: 'vite',
    detectEnv: true,
    env: process.env,
    root: opts.tailwindcssBasedir,
    uniAppX,
  })
  const resolveCurrentBundlerBranch = () => bundlerAppBranchState.current()
  const uniAppXEnabled = isUniAppXEnabled(uniAppX) || resolveCurrentBundlerBranch().isUniAppX
  const shouldEnableUniAppXPlugins = () => resolveCurrentBundlerBranch().isUniAppX

  const disabledOptions = resolvePluginDisabledState(disabled)
  const tailwindcssMajorVersion = initialTailwindRuntime.majorVersion ?? 0
  if (!disabledOptions.plugin && tailwindcssMajorVersion !== 4) {
    throw new Error('weapp-tailwindcss/vite 新生成管线仅支持 Tailwind CSS v4，请升级 tailwindcss 或停留在旧版 weapp-tailwindcss。')
  }
  const shouldOwnTailwindGeneration = !disabledOptions.plugin
  const shouldRewriteCssImports = opts.rewriteCssImports === true
  let resolvedConfig: ResolvedConfig | undefined
  const resolveViteStylePlatform = () => {
    const explicit = normalizeViteStylePlatform(opts.cssOptions?.platform ?? opts.platform, opts.appType)
    if (explicit) {
      return explicit
    }
    for (const key of ENV_PLATFORM_KEYS) {
      const envPlatform = normalizeViteStylePlatform(process.env[key], opts.appType)
      if (envPlatform) {
        return envPlatform
      }
    }
    return inferPlatformFromOutDir(resolvedConfig?.build?.outDir)
  }
  const resolveGeneratorPlatform = () => opts.cssOptions?.platform
    ?? opts.platform
    ?? resolveViteStylePlatform()
  const resolveCurrentGeneratorOptions = () => normalizeWeappTailwindcssGeneratorOptions(opts.generator, {
    appType: opts.appType,
    platform: resolveGeneratorPlatform(),
    tailwindcssMajorVersion,
    uniAppX,
  })
  const resolveCurrentGeneratorBranch = () => resolveGeneratorRuntimeBranch(resolveCurrentGeneratorOptions(), {
    appType: opts.appType,
    platform: resolveGeneratorPlatform(),
    tailwindcssMajorVersion,
    uniAppX,
  })
  const initialGeneratorBranch = resolveCurrentGeneratorBranch()
  const transformEarlyMiniProgramCss = (code: string) => {
    const platform = resolveViteStylePlatform()
    if (!shouldOwnTailwindGeneration || (platform ? isWebOrNativeAppPlatform(platform) : resolveCurrentGeneratorBranch().isWeb)) {
      return code
    }
    let transformedCode = code
    if (transformedCode.includes('#if')) {
      transformedCode = compileCssMacroConditionalComments(transformedCode, {
        platform: resolveViteStylePlatform(),
      })
    }
    if (transformedCode.includes('@layer')) {
      transformedCode = unwrapUnsupportedCascadeLayers(transformedCode)
    }
    return transformedCode
  }
  const finalizeViteMiniProgramCss = (css: string) => {
    const platform = resolveViteStylePlatform()
    if (!shouldOwnTailwindGeneration || (platform ? isWebOrNativeAppPlatform(platform) : resolveCurrentGeneratorBranch().isWeb)) {
      return css
    }
    return unwrapUnsupportedCascadeLayers(css)
  }
  const shouldInferAppType = !hasExplicitAppType && !initialGeneratorBranch.isWeb
  const hasInitialTailwindCssRoots = hasConfiguredTailwindV4CssRoots({
    ...options,
    cssEntries: opts.cssEntries ?? options.cssEntries,
  })
  const autoCssSourceContent = new Map<string, string>()
  const transientAutoCssSources = new Map<string, { file: string, base: string, css: string, dependencies: string[] }>()
  let refreshRuntimeStateForAutoCssSources: ((force: boolean) => Promise<void>) | undefined
  let autoCssSourcesRefresh: Promise<void> | undefined
  let autoCssSourcesDiscovered = false
  const syncTailwindCssSourceCandidates = async (id: string, css: string) => {
    if (tailwindcssMajorVersion === 4 && isMissingInternalCssSource(cleanUrl(id), weappTailwindcssPackageDir)) {
      return
    }
    await sourceCandidateCollector.syncCss(id, css)
    cacheCurrentSourceCandidateScan()
  }
  const registerAutoCssSource = async (id: string, css: string, options: { refresh?: boolean } = {}) => {
    if (
      !shouldOwnTailwindGeneration
    ) {
      return
    }
    const file = cleanUrl(id)
    if (!path.isAbsolute(file)) {
      return
    }
    if (!isTailwindV4CssEntry(file)) {
      return
    }
    if (isMissingInternalCssSource(file, weappTailwindcssPackageDir)) {
      return
    }
    const sourceFile = path.normalize(file)
    const sourceBase = path.dirname(sourceFile)
    const sourceCss = normalizeTailwindSourceForGenerator(
      normalizeTailwindConfigDirectives(css, sourceBase),
      { importFallback: true },
    )
    if (autoCssSourceContent.get(sourceFile) === sourceCss) {
      return
    }
    autoCssSourceContent.set(sourceFile, sourceCss)
    await syncTailwindCssSourceCandidates(sourceFile, sourceCss)
    cssMemory.refreshRememberedCssSourceBySourceFile(sourceFile, sourceCss)
    const transientSource = {
      file: sourceFile,
      base: sourceBase,
      css: sourceCss,
      dependencies: [] as string[],
    }
    if (hasInitialTailwindCssRoots) {
      transientAutoCssSources.set(sourceFile, transientSource)
      return
    }
    const dependencies = await resolveViteTailwindV4CssDependencies(sourceCss, sourceBase)
    transientSource.dependencies = dependencies
    transientAutoCssSources.set(sourceFile, transientSource)
    const changed = upsertTailwindV4CssSource(opts, {
      file: sourceFile,
      base: sourceBase,
      css: sourceCss,
      dependencies,
    })
    if (!changed) {
      return
    }
    invalidateSourceCandidateScan()
    debug('detected tailwindcss v4 css source from vite css module: %s', sourceFile)
    if (options.refresh === false) {
      return
    }
    autoCssSourcesRefresh = (autoCssSourcesRefresh ?? Promise.resolve()).then(async () => {
      await refreshRuntimeStateForAutoCssSources?.(true)
      await syncSourceCandidateScan({ force: true })
    })
    await autoCssSourcesRefresh
  }
  const discoverAndRegisterAutoCssSources = async () => {
    if (
      !shouldOwnTailwindGeneration
      || hasInitialTailwindCssRoots
      || !resolvedConfig?.root
    ) {
      return
    }
    const cssEntries = await discoverTailwindV4CssEntries(
      resolvedConfig.root,
      resolvedConfig.build?.outDir,
    )
    autoCssSourcesDiscovered = true
    let changed = false
    for (const cssEntry of cssEntries) {
      const sourceFile = path.resolve(cssEntry)
      const sourceBase = path.dirname(sourceFile)
      const sourceCss = normalizeTailwindSourceForGenerator(
        normalizeTailwindConfigDirectives(await readFile(sourceFile, 'utf8'), sourceBase),
        { importFallback: true },
      )
      if (autoCssSourceContent.get(sourceFile) === sourceCss) {
        continue
      }
      autoCssSourceContent.set(sourceFile, sourceCss)
      await syncTailwindCssSourceCandidates(sourceFile, sourceCss)
      const resolved = await resolveTailwindV4EntriesFromCssCached(sourceCss, sourceBase)
      changed = upsertTailwindV4CssSource(opts, {
        file: sourceFile,
        base: sourceBase,
        css: sourceCss,
        dependencies: resolved?.dependencies ?? [],
      }) || changed
    }
    if (!changed) {
      return
    }
    invalidateSourceCandidateScan()
    await refreshRuntimeStateForAutoCssSources?.(true)
  }
  const customAttributesEntities = toCustomAttributesEntities(customAttributes)
  let recordedGeneratorCandidates: Set<string> | undefined
  const sourceCandidateCollector = createSourceCandidateCollector({
    bareArbitraryValues: opts.arbitraryValues?.bareArbitraryValues,
  })
  const sourceCandidateScanCache = new LRUCache<string, SourceCandidateCollectorSnapshot>({
    max: SOURCE_CANDIDATE_SCAN_CACHE_MAX,
  })
  let sourceScanEntries: TailwindSourceEntry[] | undefined
  let sourceScanMatcher: ((file: string) => boolean) | undefined
  let sourceScanDependencies = new Set<string>()
  let sourceScanExplicit = false
  let sourceCandidateScanSignature: string | undefined
  let sourceCandidateScanInvalidated = true
  const pendingSourceCandidateSyncs = new Set<Promise<void>>()
  const pendingSourceCandidateSyncByFile = new Map<string, Promise<void>>()
  const processedCssAssets = new WeakSet<object>()
  const viteProcessedCssSourceFiles = new Set<string>()
  const viteGeneratedCssByFile = new Map<string, string>()
  const viteProcessedCssAssetResults = new Map<string, { css: string, injectIntoMain?: boolean | undefined, outputFile?: string | undefined }>()
  const cssMemory = createViteCssMemory({
    debug,
    getSourceCandidateSource: file => sourceCandidateCollector.source(file),
  })
  const tailwindRootCssModuleIds = new Set<string>()
  const {
    runtimeState,
    refreshRuntimeState,
    ensureRuntimeClassSet,
    ensureBundleRuntimeClassSet,
  } = createViteRuntimeClassSet({
    opts,
    initialTailwindRuntime,
    refreshTailwindcssRuntime: refreshTailwindRuntime,
    uniAppXEnabled,
    customAttributesEntities,
    disabledDefaultTemplateHandler,
    debug,
  })
  const hmrTimingRecorder = createHmrTimingRecorder('vite')
  refreshRuntimeStateForAutoCssSources = refreshRuntimeState
  onLoad()
  const getResolvedConfig = () => resolvedConfig
  const markCssAssetProcessed = (asset: { source: unknown }, _file?: string) => {
    processedCssAssets.add(asset)
  }
  const isCssAssetProcessed = (asset: { source: unknown }, file?: string) => {
    if (processedCssAssets.has(asset)) {
      return true
    }
    if (!file) {
      return false
    }
    const record = viteProcessedCssAssetResults.get(normalizeOutputPathKey(file))
    if (!record) {
      return false
    }
    const source = typeof asset.source === 'string'
      ? asset.source
      : asset.source instanceof Uint8Array
        ? Buffer.from(asset.source).toString()
        : String(asset.source ?? '')
    return source === record.css
  }
  const recordGeneratorCandidates = (candidates: Set<string>) => {
    recordedGeneratorCandidates = new Set(candidates)
  }
  const getRecordedGeneratorCandidates = () => recordedGeneratorCandidates
  const invalidateRecordedGeneratorCandidates = () => {
    recordedGeneratorCandidates = undefined
  }
  const getSourceCandidates = () => sourceCandidateCollector.values()
  const getSourceCandidatesForEntries = (entries: TailwindSourceEntry[] | undefined, options?: SourceCandidateFilterOptions) =>
    sourceCandidateCollector.valuesForEntries(entries, options)
  const getSourceCandidateSourcesForEntries = (entries: TailwindSourceEntry[] | undefined, options?: SourceCandidateFilterOptions) =>
    sourceCandidateCollector.sourcesForEntries(entries, options)
  const isWatchBuild = () => resolvedConfig?.command === 'build' && resolvedConfig.build.watch != null
  const isWatchLikeBuild = () => isWatchBuild()
    || resolvedConfig?.command === 'serve'
    || process.env['WEAPP_TW_WATCH_REGRESSION'] === '1'
    || process.env['WEAPP_TW_HMR_TIMING'] === '1'
  const isCurrentWebLikeStylePlatform = () => {
    const platform = resolveViteStylePlatform()
    return platform ? isWebOrNativeAppPlatform(platform) : resolveCurrentGeneratorBranch().isWeb
  }
  const isNuxtPageMacroHotModule = (id: string | null | undefined) => {
    if (typeof id !== 'string' || !/[?&]macro=true(?:&|$)/.test(id)) {
      return false
    }
    const cleanId = cleanUrl(id)
    return cleanId.includes('/pages/') && /\.(?:vue|tsx?|jsx?)$/.test(cleanId)
  }
  const hasSourceCandidateScanState = () => sourceCandidateScanSignature !== undefined
  const normalizeSourceScanDependency = (file: string) => path.normalize(path.resolve(cleanUrl(file)))
  const isSourceScanDependency = (file: string) => sourceScanDependencies.has(normalizeSourceScanDependency(file))
  const invalidateSourceCandidateScan = () => {
    sourceCandidateScanInvalidated = true
  }
  const collectSourceCandidateScanRoots = (root: string, entries: TailwindSourceEntry[] | undefined) => {
    if (entries?.length) {
      return [{
        entries,
        explicit: sourceScanExplicit,
        root,
      }]
    }
    if (sourceScanExplicit && entries !== undefined) {
      return []
    }
    const roots: SourceCandidateScanRoot[] = [
      {
        entries,
        root,
      },
    ]
    const normalizedRoot = path.resolve(root)
    const seenRoots = new Set([normalizedRoot])
    const basedir = opts.tailwindcssBasedir ? path.resolve(opts.tailwindcssBasedir) : undefined
    if (basedir && !seenRoots.has(basedir)) {
      roots.push({ root: basedir })
      seenRoots.add(basedir)
    }
    for (const cssEntry of opts.tailwindcss?.v4?.cssEntries ?? []) {
      if (!isTailwindV4CssEntry(cssEntry)) {
        continue
      }
      const cssEntryRoot = path.dirname(path.resolve(cssEntry))
      if (seenRoots.has(cssEntryRoot)) {
        continue
      }
      roots.push({ root: cssEntryRoot })
      seenRoots.add(cssEntryRoot)
    }
    return roots
  }
  const scanSourceCandidateRoots = async (
    roots: SourceCandidateScanRoot[],
    outDir: string | undefined,
  ) => {
    await Promise.all(
      roots.map(root => sourceCandidateCollector.scanRoot({
        entries: root.entries,
        explicit: root.explicit,
        root: root.root,
        outDir,
      })),
    )
  }
  const cacheCurrentSourceCandidateScan = () => {
    if (sourceCandidateScanSignature) {
      sourceCandidateScanCache.set(sourceCandidateScanSignature, sourceCandidateCollector.snapshot())
      sourceCandidateScanSnapshotCache.set(sourceCandidateScanSignature, sourceCandidateCollector.snapshot())
    }
  }
  const shouldDiscoverAutoCssSources = () => {
    if (!autoCssSourcesDiscovered) {
      return true
    }
    if (!isWatchLikeBuild()) {
      return true
    }
    return sourceCandidateScanInvalidated
  }
  async function syncSourceCandidateScan(options: { force?: boolean } = {}) {
    if (!shouldOwnTailwindGeneration) {
      return
    }
    if (
      !options.force
      && isWatchLikeBuild()
      && hasSourceCandidateScanState()
      && !sourceCandidateScanInvalidated
    ) {
      debug('reuse vite source candidate scan definition for watch rebuild')
      return
    }
    const root = resolvedConfig?.root ?? process.cwd()
    const outDir = resolvedConfig?.build?.outDir
    const sourceScan = await resolveViteSourceScanEntries(opts, runtimeState.tailwindRuntime, {
      outDir,
      root,
    })
    sourceScanEntries = sourceScan?.entries
    sourceScanExplicit = sourceScan?.explicit ?? false
    sourceScanMatcher = createViteSourceScanMatcher(sourceScanEntries)
    sourceScanDependencies = new Set((sourceScan?.dependencies ?? []).map(normalizeSourceScanDependency))
    const roots = collectSourceCandidateScanRoots(root, sourceScanEntries)
    const nextScanSignature = createSourceCandidateScanSignature({
      inlineCandidates: sourceScan?.inlineCandidates,
      outDir,
      roots,
      scanAllSources: !sourceScanExplicit,
    })
    const shouldReuseCurrentScan = hasSourceCandidateScanState() && sourceCandidateScanSignature === nextScanSignature
    if (shouldReuseCurrentScan) {
      sourceCandidateCollector.syncInline(sourceScan?.inlineCandidates)
      sourceCandidateScanCache.set(nextScanSignature, sourceCandidateCollector.snapshot())
      debug('reuse vite source candidate scan for watch rebuild')
      sourceCandidateScanInvalidated = false
      return
    }
    const cachedScan = isWatchLikeBuild()
      ? sourceCandidateScanCache.get(nextScanSignature) ?? sourceCandidateScanSnapshotCache.get(nextScanSignature)
      : undefined
    if (cachedScan) {
      sourceCandidateCollector.restore(cachedScan)
      sourceCandidateScanSignature = nextScanSignature
      debug('reuse cached vite source candidate scan for watch rebuild')
      sourceCandidateScanInvalidated = false
      return
    }
    if (isWatchLikeBuild()) {
      sourceCandidateCollector.resetScan()
    }
    else {
      sourceCandidateCollector.clearScan()
    }
    sourceCandidateCollector.syncInline(sourceScan?.inlineCandidates)
    await scanSourceCandidateRoots(roots, outDir)
    sourceCandidateScanSignature = nextScanSignature
    sourceCandidateScanInvalidated = false
    if (isWatchLikeBuild()) {
      sourceCandidateScanCache.set(nextScanSignature, sourceCandidateCollector.snapshot())
      sourceCandidateScanSnapshotCache.set(nextScanSignature, sourceCandidateCollector.snapshot())
    }
  }
  const waitForSourceCandidateSyncs = async () => {
    while (pendingSourceCandidateSyncs.size > 0) {
      await Promise.all(pendingSourceCandidateSyncs)
    }
  }
  const syncChangedSourceCandidateFile = (id: string) => {
    if (!shouldOwnTailwindGeneration || !isSourceCandidateRequest(id)) {
      return Promise.resolve()
    }
    const file = cleanUrl(id)
    if (isSourceScanDependency(file)) {
      invalidateSourceCandidateScan()
    }
    if (sourceScanMatcher && !sourceScanMatcher(file)) {
      sourceCandidateCollector.remove(file)
      cacheCurrentSourceCandidateScan()
      if (isSourceStyleRequest(file)) {
        return readFile(file, 'utf8')
          .then(source => cssMemory.refreshRememberedCssSourceBySourceFile(file, source))
          .catch((error) => {
            const code = typeof error === 'object' && error !== null && 'code' in error
              ? (error as { code?: unknown }).code
              : undefined
            if (code !== 'ENOENT') {
              debug('remembered css source watch refresh failed: %s %O', file, error)
            }
          })
          .then(() => cssMemory.refreshRememberedCssSourceByCurrentFile(file))
          .then(() => undefined)
      }
      return cssMemory.refreshRememberedCssSourceByCurrentFile(file)
    }
    const existingTask = pendingSourceCandidateSyncByFile.get(file)
    if (existingTask) {
      return existingTask
        .then(() => cssMemory.refreshRememberedCssSourceByCurrentFile(file))
        .then(() => undefined)
    }
    const task = sourceCandidateCollector.syncCurrentFile(id)
      .catch((error) => {
        debug('source candidate watch sync failed: %s %O', id, error)
      })
      .then(() => {
        cacheCurrentSourceCandidateScan()
      })
      .finally(() => {
        pendingSourceCandidateSyncs.delete(task)
        pendingSourceCandidateSyncByFile.delete(file)
      })
    pendingSourceCandidateSyncs.add(task)
    pendingSourceCandidateSyncByFile.set(file, task)
    return task
      .then(() => cssMemory.refreshRememberedCssSourceByCurrentFile(file))
      .then(() => undefined)
  }
  const recordCssAssetResult = (file: string, css: string) => {
    touchMapEntry(viteGeneratedCssByFile, normalizeVitePersistentCacheKey(file), css)
  }
  const recordViteProcessedCssAssetResult = (
    file: string,
    css: string,
    options: { injectIntoMain?: boolean | undefined, outputFile?: string | undefined } = {},
  ) => {
    const key = normalizeVitePersistentCacheKey(file)
    const previous = viteProcessedCssAssetResults.get(key)
    const injectIntoMain = previous?.injectIntoMain === true
      ? true
      : options.injectIntoMain ?? previous?.injectIntoMain
    touchMapEntry(viteProcessedCssAssetResults, key, {
      css,
      injectIntoMain,
      outputFile: options.outputFile ?? previous?.outputFile,
    })
  }
  const getViteProcessedCssAssetResults = () => viteProcessedCssAssetResults.entries()
  const getViteProcessedCssAssetResult = (file: string) => viteProcessedCssAssetResults.get(normalizeVitePersistentCacheKey(file))
  const getViteCssCacheStats = () => ({
    viteGeneratedCssByFile: viteGeneratedCssByFile.size,
    viteGeneratedCssByFileRaw: summarizeStringCache(viteGeneratedCssByFile),
    viteProcessedCssAssetResults: viteProcessedCssAssetResults.size,
    viteProcessedCssAssetResultsRaw: summarizeViteProcessedCssResults(viteProcessedCssAssetResults),
    ...cssMemory.getStats(),
    sourceCandidateScanCache: sourceCandidateScanCache.size,
    pendingSourceCandidateSyncs: pendingSourceCandidateSyncs.size,
    pendingSourceCandidateSyncByFile: pendingSourceCandidateSyncByFile.size,
  })
  const pruneViteCssCaches = (options: {
    activeFiles: Set<string>
    activeKnownSfcFiles?: Set<string> | undefined
  }) => {
    const activeFiles = new Set([...options.activeFiles].map(normalizeVitePersistentCacheKey))
    for (const key of viteGeneratedCssByFile.keys()) {
      if (!activeFiles.has(key)) {
        viteGeneratedCssByFile.delete(key)
      }
    }
    for (const [key, record] of viteProcessedCssAssetResults) {
      const outputKey = typeof record.outputFile === 'string'
        ? normalizeVitePersistentCacheKey(record.outputFile)
        : undefined
      if (!activeFiles.has(key) && (outputKey == null || !activeFiles.has(outputKey))) {
        viteProcessedCssAssetResults.delete(key)
      }
    }
    cssMemory.prune(options)
  }
  const normalizeViteProcessedCssFile = (file: string) => path.resolve(cleanUrl(file))
  const markViteProcessedCssSource = (file: string) => {
    viteProcessedCssSourceFiles.add(normalizeViteProcessedCssFile(file))
  }
  const rememberTailwindRootCssModule = (id: string) => {
    if (!shouldOwnTailwindGeneration) {
      return
    }
    tailwindRootCssModuleIds.add(id)
    tailwindRootCssModuleIds.add(cleanUrl(id))
  }
  const isUniViteProject = () => {
    return resolvedConfig?.plugins?.some(plugin => plugin.name.includes('uni')) ?? false
  }
  const isHarmonyAppBuildTarget = () => {
    if (resolveUniUtsPlatform().isAppHarmony) {
      return true
    }
    return isUniAppXHarmonyOutDir(resolvedConfig?.build?.outDir)
  }
  const matchesViteProcessedCssSource = (candidate: string) => {
    const normalized = normalizeViteProcessedCssFile(candidate)
    return viteProcessedCssSourceFiles.has(normalized)
  }
  const isViteProcessedCssAsset = (asset: { source?: unknown, originalFileName?: string | null, originalFileNames?: string[] | undefined }, file?: string) => {
    if (hasBundlerGeneratedCssMarker(asset.source)) {
      return true
    }
    const candidates = [
      file,
      asset.originalFileName,
      ...(asset.originalFileNames ?? []),
    ].filter((item): item is string => typeof item === 'string' && item.length > 0)
    return candidates.some(candidate => matchesViteProcessedCssSource(cleanUrl(candidate)))
  }
  const transformCssHandlerOptions = createCssHandlerOptionsCache({
    getAppType: () => opts.appType,
    mainCssChunkMatcher,
    getMajorVersion: () => runtimeState.tailwindRuntime.majorVersion,
    getOutputRoot: () => resolvedConfig?.build?.outDir
      ? path.resolve(resolvedConfig.root, resolvedConfig.build.outDir)
      : resolvedConfig?.root,
    getExtraOptions: file => ({
      ...resolveViteCssHandlerExtraOptions(file),
      ...resolveUniAppXNativeCssHandlerOptions(opts),
    }),
    getDynamicCssOptions: () => ({
      cssPreflight: opts.cssPreflight,
    }),
  })
  const serveJsHandlerOptions = createJsHandlerOptionsFactory({
    getMajorVersion: () => runtimeState.tailwindRuntime.majorVersion,
    moduleGraph: undefined,
  })
  const generateTailwindCssForVitePipeline = async (
    id: string,
    code: string,
    hookContext?: {
      addWatchFile?: (id: string) => void
      emitFile?: (emittedFile: { type: 'asset', fileName: string, source: string }) => string
    },
  ) => {
    if (!shouldOwnTailwindGeneration) {
      return undefined
    }
    await runtimeState.readyPromise
    await waitForSourceCandidateSyncs()
    const file = cleanUrl(id)
    const requestFile = isCSSRequest(id) ? id : file
    if (!isCSSRequest(requestFile) || opts.htmlMatcher(file) || isHTMLRequest(file)) {
      return undefined
    }
    const generatorCode = normalizeEmptyTailwindCustomVariants(code)
    const rootDir = resolvedConfig?.root ? path.resolve(resolvedConfig.root) : process.cwd()
    const isHarmonyAppStyleTarget = isHarmonyAppBuildTarget()
    const isNativeAppStyleTarget = opts.appType === 'uni-app-x'
      && (resolveUniUtsPlatform().isApp || isHarmonyAppStyleTarget)
    const sourceRoot = resolveWeappViteSourceRoot(resolvedConfig, opts.appType)
    const currentGeneratorOptions = resolveCurrentGeneratorOptions()
    const currentGeneratorBranch = resolveCurrentGeneratorBranch()
    const outputFile = resolveViteCssPipelineOutputFile(requestFile, opts, rootDir, currentGeneratorBranch.isWeb, isNativeAppStyleTarget, sourceRoot)
    const runtime = getRecordedGeneratorCandidates()
      ?? getSourceCandidates()
      ?? await ensureRuntimeClassSet()
    const outputCssHandlerOptions = transformCssHandlerOptions.getCssHandlerOptions(outputFile)
    const cssHandlerOptions = {
      ...transformCssHandlerOptions.getCssHandlerOptions(file),
      isMainChunk: outputCssHandlerOptions.isMainChunk,
    }
    const transientCssSource = transientAutoCssSources.get(file)
      ?? (
        hasTailwindRootDirectives(generatorCode, { importFallback: currentGeneratorOptions.importFallback })
        || hasTailwindSourceDirectives(generatorCode, { importFallback: currentGeneratorOptions.importFallback })
        || hasTailwindApplyDirective(generatorCode)
          ? {
              base: path.dirname(path.resolve(file)),
              css: generatorCode,
              file: path.resolve(file),
            }
          : undefined
      )
    const shouldDeferEmptyScopedCssSource = transientCssSource == null && !(
      opts.appType === 'uni-app-x'
      && !cssHandlerOptions.isMainChunk
      && hasTailwindApplyDirective(generatorCode)
    )
    const generated = await generateTailwindV4Css({
      opts,
      runtimeState,
      runtime,
      rawSource: generatorCode,
      file,
      outputFile,
      cssHandlerOptions,
      cssUserHandlerOptions: transformCssHandlerOptions.getCssUserHandlerOptions(file),
      cssSources: transientCssSource
        ? [transientCssSource]
        : undefined,
      getSourceCandidatesForEntries,
      generatorPlatform: resolveGeneratorPlatform(),
      styleHandler,
      debug,
      previousCss: viteGeneratedCssByFile.get(file),
      deferEmptyScopedCssSource: shouldDeferEmptyScopedCssSource,
      restoreLocalCssImports: !currentGeneratorBranch.isWeb,
    })
    if (!generated) {
      return undefined
    }
    const finalizedCss = finalizeViteMiniProgramCss(generated.css)
    const isUniAppViteWebviewPlatform = opts.appType === 'uni-app-vite'
      && isUniAppViteWebviewStylePlatform(resolveViteStylePlatform())
    const shouldApplyWebviewCssCompat = currentGeneratorBranch.isWeb || isUniAppViteWebviewPlatform
    const outputCss = withUniAppXWebPreflightReset(removeScopedTailwindPreflightCss(
      shouldApplyWebviewCssCompat
        ? applyUniAppViteWebviewCssCompat(finalizedCss, {
            compat: currentGeneratorOptions.webCompat ?? true,
            escapeMap: opts.escapeMap,
            safeSelectors: isUniAppViteWebviewPlatform,
          })
        : finalizedCss,
    ), opts.appType === 'uni-app-x' && currentGeneratorBranch.isWeb)
    const tracedCss = annotateCssSourceTrace(outputCss, {
      opts,
      tokenSources: createCssTokenSourceMap(getSourceCandidateSourcesForEntries(undefined), opts),
    })
    for (const dependency of generated.dependencies) {
      hookContext?.addWatchFile?.(dependency)
    }
    viteGeneratedCssByFile.set(file, tracedCss)
    const shouldInjectGeneratedCssIntoMain = mainCssChunkMatcher(outputFile, opts.appType)
      || (
        hasTailwindRootDirectives(generatorCode, { importFallback: currentGeneratorOptions.importFallback })
        && !normalizeOutputPathKey(outputFile).includes('/')
      )
    // 这里保留 undefined，让主样式入口走注入判断；Tailwind 入口样式在 uni-app dev 中需要同步回主样式产物。
    recordViteProcessedCssAssetResult(file, tracedCss, {
      injectIntoMain: shouldInjectGeneratedCssIntoMain,
      outputFile,
    })
    if (tracedCss.includes('weapp-tailwindcss layer components start')) {
      recordViteProcessedCssAssetResult(file, tracedCss, {
        injectIntoMain: shouldInjectGeneratedCssIntoMain,
        outputFile,
      })
    }
    if (isNativeAppStyleTarget && outputFile.endsWith('.css')) {
      hookContext?.emitFile?.({
        type: 'asset',
        fileName: outputFile,
        source: tracedCss,
      })
    }
    markViteProcessedCssSource(file)
    rememberTailwindRootCssModule(id)
    recordGeneratorCandidates(runtime)
    cssMemory.rememberCssSource({
      outputFile,
      rawSource: code,
      sourceFile: id,
    })
    debug('css generated for vite postcss pipeline: %s bytes=%d', file, tracedCss.length)
    return `${createBundlerGeneratedCssMarker('vite', normalizeViteProcessedCssFile(file))}\n${tracedCss}`
  }
  const rewritePlugins = createRewriteCssImportsPlugins({
    getAppType: () => opts.appType,
    generateTailwindCss: generateTailwindCssForVitePipeline,
    rootImport: shouldOwnTailwindGeneration
      ? `${weappTailwindcssDirPosix}/generator-placeholder.css`
      : undefined,
    onTailwindRootCss: (id, code) => registerAutoCssSource(id, code),
    onCssSourceTransform: (id, code) => cssMemory.refreshRememberedCssSourceBySourceFile(id, code),
    shouldGenerateCss: (_id, code) => hasVitePipelineTailwindGenerationDirective(code),
    shouldDeferGeneration: (_id, code) => !shouldRewriteCssImports
      && hasTailwindRootDirectives(code, { importFallback: resolveCurrentGeneratorOptions().importFallback }),
    shouldOwnTailwindGeneration,
    shouldRewrite: shouldRewriteCssImports,
    weappTailwindcssDirPosix,
  })

  if (disabledOptions.plugin) {
    return rewritePlugins.length ? rewritePlugins : undefined
  }
  const generateBundleHook = createGenerateBundleHook({
    opts,
    runtimeState,
    ensureRuntimeClassSet,
    ensureBundleRuntimeClassSet,
    debug,
    getResolvedConfig,
    markCssAssetProcessed,
    isCssAssetProcessed,
    isViteProcessedCssAsset,
    recordCssAssetResult,
    recordViteProcessedCssAssetResult,
    getViteProcessedCssAssetResults,
    getViteProcessedCssAssetResult,
    getSourceCandidates,
    getSourceCandidateSource: file => sourceCandidateCollector.source(file),
    getSourceCandidateSources: () => sourceCandidateCollector.sources(),
    getSourceCandidatesForEntries,
    getSourceCandidateSourcesForEntries,
    waitForSourceCandidateSyncs,
    rememberCssSource: cssMemory.rememberCssSource,
    refreshRememberedCssSource: cssMemory.refreshRememberedCssSource,
    getRememberedCssSources: cssMemory.getRememberedCssSources,
    getRememberedCssSignature: cssMemory.getRememberedCssSignature,
    setRememberedCssSignature: cssMemory.setRememberedCssSignature,
    getKnownCssSource: cssMemory.getKnownCssSource,
    getKnownSfcSource: cssMemory.getKnownSfcSource,
    recordGeneratorCandidates,
    pruneViteCssCaches,
    getViteCssCacheStats,
    hmrTimingRecorder,
  })
  const cssFinalizerOutputPlugin = createViteCssFinalizerOutputPlugin({
    opts,
    runtimeState,
    ensureRuntimeClassSet,
    debug,
    getResolvedConfig,
    markCssAssetProcessed,
    isCssAssetProcessed,
    isViteProcessedCssAsset,
    recordCssAssetResult,
    recordViteProcessedCssAssetResult,
    getViteProcessedCssAssetResults,
    getRecordedGeneratorCandidates,
    getSourceCandidates,
    getSourceCandidatesForEntries,
    getSourceCandidateSourcesForEntries,
    waitForSourceCandidateSyncs,
    rememberMainCssSource: (file, rawSource) => cssMemory.rememberCssSource({
      outputFile: file,
      rawSource,
      sourceFile: file,
    }),
    getRememberedMainCssSource: cssMemory.getRememberedCssSourceEntry,
  })
  const utsPlatform = resolveUniUtsPlatform()
  const isIosPlatform = utsPlatform.isAppIos
  const prepareTailwindGeneration = async () => {
    if (shouldDiscoverAutoCssSources()) {
      await discoverAndRegisterAutoCssSources()
    }
    await syncSourceCandidateScan()
  }
  const uniAppXPlugins = createUniAppXPlugins({
    appType: opts.appType ?? 'uni-app-x',
    customAttributesEntities,
    disabledDefaultTemplateHandler,
    isIosPlatform,
    mainCssChunkMatcher,
    runtimeState,
    styleHandler,
    generateCss: generateTailwindCssForVitePipeline,
    jsHandler,
    ensureRuntimeClassSet,
    getResolvedConfig,
    isEnabled: shouldEnableUniAppXPlugins,
    uniAppX,
  })

  const plugins: Plugin[] = [
    ...rewritePlugins,
    {
      name: `${vitePluginName}:source-candidates`,
      enforce: 'pre',
      async load(id) {
        if (
          !shouldOwnTailwindGeneration
          || isWebOrNativeAppPlatform(resolveViteStylePlatform())
          || !isCSSRequest(id)
          || !shouldCollectTransformedSourceCandidates(id)
        ) {
          return
        }
        const file = cleanUrl(id)
        const rawCode = await readFile(file, 'utf8').catch(() => undefined)
        if (typeof rawCode !== 'string') {
          return
        }
        const transformedCode = transformEarlyMiniProgramCss(rawCode)
        if (transformedCode === rawCode) {
          return
        }
        cssMemory.rememberKnownSfcSource(id, transformedCode)
        return transformedCode
      },
      transform: {
        order: 'pre',
        async handler(code, id) {
          let transformedCode = code
          if (
            shouldOwnTailwindGeneration
            && !resolveCurrentGeneratorBranch().isWeb
            && isCSSRequest(id)
          ) {
            transformedCode = transformEarlyMiniProgramCss(code)
          }
          const shouldReturnTransformedCode = transformedCode !== code
          if (shouldOwnTailwindGeneration) {
            cssMemory.rememberKnownSfcSource(id, transformedCode)
          }
          if (!shouldOwnTailwindGeneration || !isSourceCandidateRequest(id) || !shouldCollectTransformedSourceCandidates(id)) {
            if (shouldReturnTransformedCode) {
              return {
                code: transformedCode,
                map: null,
              }
            }
            return
          }
          return hmrTimingRecorder.measure('sourceCandidates.transform', async () => {
            invalidateRecordedGeneratorCandidates()
            const file = cleanUrl(id)
            if (sourceScanMatcher && !sourceScanMatcher(file)) {
              sourceCandidateCollector.remove(file)
              cacheCurrentSourceCandidateScan()
              return
            }
            await sourceCandidateCollector.merge(id, transformedCode)
            cacheCurrentSourceCandidateScan()
            if (shouldReturnTransformedCode) {
              return {
                code: transformedCode,
                map: null,
              }
            }
          }, { emit: false })
        },
      },
      async watchChange(id, change) {
        await hmrTimingRecorder.measure('sourceCandidates.watchChange', async () => {
          if (shouldOwnTailwindGeneration && isSourceCandidateRequest(id)) {
            invalidateRecordedGeneratorCandidates()
          }
          if (isSourceScanDependency(id)) {
            invalidateSourceCandidateScan()
          }
          if (change.event === 'delete') {
            sourceCandidateCollector.remove(id)
            cacheCurrentSourceCandidateScan()
            return
          }
          await syncChangedSourceCandidateFile(id)
        }, { emit: false })
      },
      async handleHotUpdate(ctx) {
        return hmrTimingRecorder.measure('sourceCandidates.handleHotUpdate', async () => {
          const isSourceCandidateHotUpdate = shouldOwnTailwindGeneration && isSourceCandidateRequest(ctx.file)
          await syncChangedSourceCandidateFile(ctx.file)
          const isWebLikeHotUpdate = isCurrentWebLikeStylePlatform()
          if (isSourceCandidateHotUpdate) {
            invalidateRecordedGeneratorCandidates()
            if (isWebLikeHotUpdate) {
              await refreshRuntimeStateForAutoCssSources?.(true)
              await syncSourceCandidateScan({ force: true })
            }
          }
          const cssModules = resolveHotTailwindCssModules(ctx, tailwindRootCssModuleIds)
          const sourceModules = isSourceCandidateHotUpdate && !isSourceStyleRequest(ctx.file)
            ? resolveHotSourceModules(ctx)
            : ctx.modules
          if (
            isSourceCandidateHotUpdate
            && !isSourceStyleRequest(ctx.file)
            && !isWebLikeHotUpdate
            && (
              (!hasSelfAcceptingNonStyleHotModule(sourceModules) && cssModules.length === 0)
              || (cssModules.length > 0 && isUniViteProject())
            )
          ) {
            sendFullReloadForUnresolvedHotUpdate(ctx)
            return []
          }
          if (
            isWebLikeHotUpdate
            && isSourceCandidateHotUpdate
            && !isSourceStyleRequest(ctx.file)
            && ctx.modules.some(mod => isNuxtPageMacroHotModule(mod.id ?? mod.url))
          ) {
            sendFullReloadForUnresolvedHotUpdate(ctx)
            return []
          }
          sendSupplementalCssHotUpdates(ctx, cssModules)
          if (isWebLikeHotUpdate && isSourceCandidateHotUpdate && !isSourceStyleRequest(ctx.file)) {
            return undefined
          }
          if (isSourceCandidateHotUpdate && !isSourceStyleRequest(ctx.file) && cssModules.length > 0) {
            return [...sourceModules, ...cssModules]
          }
          return cssModules.length > 0
            ? [...ctx.modules, ...cssModules]
            : undefined
        }, { emit: false })
      },
      async buildStart() {
        await hmrTimingRecorder.measure('sourceCandidates.buildStart', async () => {
          await prepareTailwindGeneration()
        }, { emit: false })
      },
    },
    ...createViteServeCssGenerationPlugins({
      generateCss: generateTailwindCssForVitePipeline,
      getCommand: () => resolvedConfig?.command,
      onTailwindRootCss: (id, code) => registerAutoCssSource(id, code),
      shouldGenerate: () => shouldOwnTailwindGeneration,
    }),
    createViteServeJsTransformPlugin({
      createHandlerOptions: file => serveJsHandlerOptions(file, (opts.appType === 'uni-app-vite' && isUniAppViteWebviewStylePlatform(resolveViteStylePlatform())
        ? { needEscaped: true }
        : undefined)),
      getCommand: () => resolvedConfig?.command,
      jsHandler,
      shouldTransform: () => shouldOwnTailwindGeneration && (
        !resolveCurrentGeneratorBranch().isWeb
        || (opts.appType === 'uni-app-vite' && isUniAppViteWebviewStylePlatform(resolveViteStylePlatform()))
      ),
      transformRuntime: ensureRuntimeClassSet,
    }),
    {
      name: `${vitePluginName}:post`,
      enforce: 'post',
      config(config) {
        if (!shouldOwnTailwindGeneration) {
          return
        }
        if (Array.isArray(config.plugins)) {
          const removed = disableAndRemoveTailwindVitePlugins(config.plugins)
          if (removed > 0) {
            debug('disable official tailwind vite plugins in generator mode: %d', removed)
          }
        }
        const root = config.root ? path.resolve(config.root) : process.cwd()
        const baseConfig = {
          resolve: {
            alias: [
              {
                find: /^tailwindcss$/,
                replacement: path.join(weappTailwindcssPackageDir, 'generator-placeholder.css'),
              },
            ],
          },
        }
        if (config.css?.postcss !== undefined) {
          return baseConfig
        }
        return resolveFilteredPostcssConfig(root).then((postcssConfig) => {
          if (!postcssConfig) {
            return baseConfig
          }
          debug('inline filtered postcss config without official tailwind plugins in generator mode: %d', postcssConfig.removed)
          return {
            ...baseConfig,
            css: {
              postcss: {
                ...postcssConfig.options,
                plugins: postcssConfig.plugins,
              },
            },
          }
        })
      },
      async configResolved(config) {
        await hmrTimingRecorder.measure('configResolved', async () => {
          resolvedConfig = config
          if (shouldOwnTailwindGeneration) {
            const removed = Array.isArray(config.plugins)
              ? removeTailwindVitePlugins(config.plugins)
              : 0
            if (removed > 0) {
              debug('remove official tailwind vite plugins in generator mode: %d', removed)
            }
          }
          const resolvedRoot = config.root ? path.resolve(config.root) : undefined
          let shouldRefreshRuntime = false
          if (
            !hasExplicitTailwindcssBasedir
            && resolvedRoot
          ) {
            const nextTailwindcssBasedir = resolveImplicitTailwindcssBasedirFromViteRoot(resolvedRoot)
            if (opts.tailwindcssBasedir !== nextTailwindcssBasedir) {
              const previousBasedir = opts.tailwindcssBasedir
              opts.tailwindcssBasedir = nextTailwindcssBasedir
              shouldRefreshRuntime = syncCssEntriesFromAnchor(nextTailwindcssBasedir) || shouldRefreshRuntime
              debug(
                'align tailwindcss basedir with vite root: %s -> %s',
                previousBasedir ?? 'undefined',
                nextTailwindcssBasedir,
              )
              shouldRefreshRuntime = true
            }
          }
          if (
            shouldInferAppType
            && resolvedRoot
          ) {
            const nextAppType = resolveImplicitAppTypeFromViteRoot(resolvedRoot)
            if (nextAppType && opts.appType !== nextAppType) {
              const previousAppType = opts.appType
              opts.appType = nextAppType
              logger.info('根据 Vite 项目根目录自动推断 appType -> %s', nextAppType)
              debug(
                'align appType with vite root: %s -> %s',
                previousAppType ?? 'undefined',
                nextAppType,
              )
              shouldRefreshRuntime = true
            }
          }
          bundlerAppBranchState.refresh({
            appType: opts.appType,
            root: resolvedRoot,
            uniAppX,
          })
          if (shouldRefreshRuntime) {
            await refreshRuntimeState(true)
          }
          if (typeof config.css.postcss === 'object' && Array.isArray(config.css.postcss.plugins)) {
            const postcssPlugins = config.css.postcss.plugins as unknown[]
            if (shouldOwnTailwindGeneration) {
              const removed = removeTailwindPostcssPlugins(postcssPlugins)
              if (removed > 0) {
                debug('remove official tailwind postcss plugins in generator mode: %d', removed)
              }
            }
          }
        }, { emit: false })
      },
      generateBundle: {
        order: 'post',
        handler: generateBundleHook,
      },
    },
  ]
  plugins.push(...uniAppXPlugins)
  plugins.push(cssFinalizerOutputPlugin)
  plugins.push(...createBuiltinViteStyleInjectorPlugins(styleInjector, () => opts.appType))
  return plugins
}
