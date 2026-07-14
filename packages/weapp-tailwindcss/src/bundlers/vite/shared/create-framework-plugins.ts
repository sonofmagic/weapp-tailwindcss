import type { ModuleNode, Plugin, ResolvedConfig } from 'vite'
import type { ViteFrameworkName } from '../../framework-selector'
import type { SourceCandidateScanRoot } from '../source-candidate-scan-signature'
import type { SourceCandidateChange, SourceCandidateCollectorSnapshot, SourceCandidateFilterOptions } from '../source-candidates'
import type { ViteFrameworkCssPipelineContext, ViteFrameworkCssPipelineStrategy, ViteFrameworkExtraPluginPlatform, ViteFrameworkRuntimeFeatureContext } from './framework-strategy'
import type { ViteStyleInjectorDelegateFactory } from '@/style-injector/internal'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import { compileCssMacroConditionalComments, removeTailwindPostcssPlugins, resolvePostcssConfig, transformWebCssCompat, unwrapUnsupportedCascadeLayers } from '@weapp-tailwindcss/postcss'
import { LRUCache } from 'lru-cache'
import { hasTailwindApplyDirective, hasTailwindRootDirectives, hasTailwindSourceDirectives, normalizeTailwindConfigDirectives, normalizeTailwindSourceForGenerator } from '@/bundlers/shared/generator-css/directives'
import { hasUserCssLayerBlocks, normalizeEmptyTailwindCustomVariants, splitUserCssLayerBlocks } from '@/bundlers/shared/generator-css/user-css'
import { vitePluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { toCustomAttributesEntities } from '@/context/custom-attributes'
import { createDebug } from '@/debug'
import { normalizeFrameworkStylePlatform } from '@/framework/platform'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { resolveGeneratorRuntimeBranch } from '@/runtime-branch'
import { createBuiltinViteStyleInjectorPlugins } from '@/style-injector/internal'
import { extractCandidatesFromSource } from '@/tailwindcss/candidates'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from '@/tailwindcss/v4-engine/candidates'
import { isTailwindV4CssEntry, normalizeCssEntries } from '@/tailwindcss/v4/css-entries'
import { hasConfiguredTailwindV4CssRoots, upsertTailwindV4CssSource } from '@/tailwindcss/v4/css-sources'
import { resolvePluginDisabledState } from '@/utils/disabled'
import { resolvePackageDir } from '@/utils/resolve-package'
import { annotateCssSourceTrace, createCssTokenSourceMap } from '../../shared/css-source-trace'
import { captureFrameworkPostcssOptions } from '../../shared/framework-postcss'
import { createBundlerGeneratedCssMarker, hasBundlerGeneratedCssMarker } from '../../shared/generated-css-marker'
import { normalizeMiniProgramGeneratorCssSource } from '../../shared/generator-css/output-import-shell'
import { createHmrTimingRecorder } from '../../shared/hmr-timing'
import { normalizeOutputPathKey } from '../../shared/module-graph'
import { isSourceStyleRequest } from '../../shared/style-requests'
import { generateTailwindV4Css } from '../../shared/v4-generation-core'
import { createViteCssFinalizerOutputPlugin } from '../css-finalizer'
import { createViteCssMemory, shouldCollectTransformedSourceCandidates } from '../css-memory'
import { createGenerateBundleHook, resolveViteCssPipelineOutputFile } from '../generate-bundle'
import { createCssHandlerOptionsCache, resolveViteCssHandlerExtraOptions } from '../generate-bundle/css-handler-options'
import { createJsHandlerOptionsFactory } from '../generate-bundle/js-handler-options'
import { isSfcStyleSourceFile, resolveSfcStyleRequestFromKnownSource } from '../generate-bundle/sfc-style-source'
import { hasSelfAcceptingNonStyleHotModule, resolveHotSourceModules, resolveHotTailwindCssModules, sendFullReloadForUnresolvedHotUpdate, sendSupplementalCssHotUpdates } from '../hot-css-modules'
import { touchMapEntry } from '../map-cache'
import { disableAndRemoveTailwindVitePlugins, removeTailwindVitePlugins } from '../official-tailwind-plugins'
import { isMissingInternalCssSource, normalizeVitePersistentCacheKey, summarizeStringCache, summarizeViteProcessedCssResults } from '../plugin-cache'
import { removeScopedTailwindPreflightCss } from '../processed-css-assets'
import { resolveImplicitAppTypeFromViteRoot } from '../resolve-app-type'
import { createRewriteCssImportsPlugins, hasVitePipelineTailwindGenerationDirective } from '../rewrite-css-imports'
import { createViteRuntimeClassSet } from '../runtime-class-set'
import { createViteCssGenerationPlugins } from '../serve-css-generation'
import { createViteServeJsTransformPlugin } from '../serve-js-transform'
import { resolveViteServeRootMiniProgramImportShell } from '../serve-root-import-shell'
import { createSourceCandidateScanSignature } from '../source-candidate-scan-signature'
import { createSourceCandidateCollector, isSourceCandidateRequest } from '../source-candidates'
import { createViteSourceScanMatcher, discoverTailwindV4CssEntries, resolveTailwindV4EntriesFromCssCached, resolveViteSourceScanEntries, resolveViteTailwindV4CssDependencies } from '../source-scan'
import { resolveImplicitTailwindcssBasedirFromViteRoot } from '../tailwind-basedir'
import { cleanUrl, isCSSRequest, isHTMLRequest, slash } from '../utils'
import { shouldAdaptFrameworkWatchCssBeforeCache, wrapViteCssPostTransform } from '../watch-css-post'
import { resolveWeappViteSourceRoot } from '../weapp-vite-config'
import { resolveViteWebCssCompatOptions, shouldApplyViteWebCssCompat } from '../web-css-compat'

const debug = createDebug()
const weappTailwindcssPackageDir = resolvePackageDir('weapp-tailwindcss')
const weappTailwindcssDirPosix = slash(weappTailwindcssPackageDir)
const SOURCE_CANDIDATE_SCAN_CACHE_MAX = 8
const WEB_HMR_RUNTIME_AFFECTING_DIRECTIVE_RE = /@(?:theme|source|config|plugin|apply)\b/
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

function isInternalUserDefinedOptions(options: UserDefinedOptions | InternalUserDefinedOptions): options is InternalUserDefinedOptions {
  return typeof (options as InternalUserDefinedOptions).onLoad === 'function'
    && typeof (options as InternalUserDefinedOptions).mainCssChunkMatcher === 'function'
    && typeof (options as InternalUserDefinedOptions).tailwindRuntime === 'object'
    && typeof (options as InternalUserDefinedOptions).refreshTailwindcssRuntime === 'function'
}

export interface WeappTailwindcssVitePlugin {
  name: string
  [hook: string]: any
}

export interface ViteFrameworkBranchContext {
  frameworkName: ViteFrameworkName
  adaptWatchCssBeforeFrameworkCache?: boolean
  createExtraPlugins?: (context: ViteFrameworkExtraPluginContext) => Plugin[]
  cssPipelineStrategy?: ViteFrameworkCssPipelineStrategy | undefined
  getExtraPluginPlatform?: () => ViteFrameworkExtraPluginPlatform
  styleInjectorDelegate: ViteStyleInjectorDelegateFactory
  isRuntimeClassSetFeatureEnabled?: (context: ViteFrameworkRuntimeFeatureContext) => boolean
}

export interface ViteFrameworkExtraPluginContext {
  customAttributesEntities: ReturnType<typeof toCustomAttributesEntities>
  disabledDefaultTemplateHandler: boolean | undefined
  ensureRuntimeClassSet: (...args: any[]) => Promise<Set<string>>
  generateCss: (...args: any[]) => Promise<string | undefined>
  getResolvedConfig: () => ResolvedConfig | undefined
  isEnabled: () => boolean
  isIosPlatform: boolean
  jsHandler: ReturnType<typeof getCompilerContext>['jsHandler']
  mainCssChunkMatcher: ReturnType<typeof getCompilerContext>['mainCssChunkMatcher']
  runtimeState: ReturnType<typeof createViteRuntimeClassSet>['runtimeState']
  styleHandler: ReturnType<typeof getCompilerContext>['styleHandler']
  uniAppX: ReturnType<typeof getCompilerContext>['uniAppX']
}

interface ViteSourceCandidateChange extends SourceCandidateChange {
  file: string
  runtimeAffecting: boolean
}

/**
 * Vite 各框架分支共享的组合工厂。框架分支只负责选择和拥有各自入口，公共稳定能力放在这里复用。
 */
export function createViteFrameworkPlugins(
  options: UserDefinedOptions | InternalUserDefinedOptions = {},
  frameworkBranch: ViteFrameworkBranchContext,
): WeappTailwindcssVitePlugin[] | undefined {
  debug('create vite framework plugins framework=%s', frameworkBranch.frameworkName)
  const rawOptions = ((options as any).__internalViteRawOptions ?? options) as UserDefinedOptions
  const hasExplicitAppType = typeof (options as any).__internalViteRawExplicitAppType === 'boolean'
    ? (options as any).__internalViteRawExplicitAppType
    : typeof options.appType === 'string' && options.appType.trim().length > 0
  const hasExplicitTailwindcssBasedir = typeof (options as any).__internalViteRawExplicitTailwindcssBasedir === 'boolean'
    ? (options as any).__internalViteRawExplicitTailwindcssBasedir
    : typeof options.tailwindcssBasedir === 'string' && options.tailwindcssBasedir.trim().length > 0
  const rawCssEntries = collectConfiguredCssEntries(rawOptions)
  const opts = isInternalUserDefinedOptions(options)
    ? options
    : getCompilerContext({
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
  const frameworkCssPipelineStrategy = frameworkBranch.cssPipelineStrategy
  const uniAppXEnabled = frameworkBranch.isRuntimeClassSetFeatureEnabled?.({ uniAppX }) === true
  const shouldEnableFrameworkExtraPlugins = () => frameworkBranch.createExtraPlugins !== undefined

  const disabledOptions = resolvePluginDisabledState(disabled)
  const tailwindcssMajorVersion = initialTailwindRuntime.majorVersion ?? 0
  if (!disabledOptions.plugin && tailwindcssMajorVersion !== 4) {
    throw new Error('weapp-tailwindcss/vite 新生成管线仅支持 Tailwind CSS v4，请升级 tailwindcss 或停留在旧版 weapp-tailwindcss。')
  }
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
  const shouldOwnTailwindGeneration = !disabledOptions.plugin && resolveCurrentGeneratorOptions().enabled
  const resolveCurrentGeneratorBranch = () => resolveGeneratorRuntimeBranch(resolveCurrentGeneratorOptions(), {
    appType: opts.appType,
    platform: resolveGeneratorPlatform(),
    tailwindcssMajorVersion,
    uniAppX,
  })
  const createCssPipelineContext = (overrides: Partial<ViteFrameworkCssPipelineContext> = {}): ViteFrameworkCssPipelineContext => ({
    currentGeneratorBranch: resolveCurrentGeneratorBranch(),
    currentGeneratorOptions: resolveCurrentGeneratorOptions(),
    opts,
    resolvedConfig,
    resolveStylePlatform: resolveViteStylePlatform,
    ...overrides,
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
    ...rawOptions,
    cssEntries: opts.cssEntries ?? rawOptions.cssEntries,
  })
  const autoCssSourceContent = new Map<string, string>()
  const frameworkRootImportShellTargetByFile = new Map<string, string>()
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
    customAttributesEntities,
    disabledDefaultTemplateHandler,
  })
  const originalCssLayerSourceByFile = new LRUCache<string, string>({ max: 128 })
  const rememberOriginalCssLayerSource = (id: string, code: string) => {
    const file = cleanUrl(id)
    if (!isCSSRequest(file)) {
      return
    }
    if (!hasUserCssLayerBlocks(code)) {
      originalCssLayerSourceByFile.delete(file)
      return
    }
    originalCssLayerSourceByFile.set(file, splitUserCssLayerBlocks(code).layer)
  }
  const sourceCandidateScanCache = new LRUCache<string, SourceCandidateCollectorSnapshot>({
    max: SOURCE_CANDIDATE_SCAN_CACHE_MAX,
  })
  let sourceScanEntries: TailwindSourceEntry[] | undefined
  let sourceScanMatcher: ((file: string) => boolean) | undefined
  let sourceScanDependencies = new Set<string>()
  let sourceScanExplicit = false
  let sourceCandidateScanSignature: string | undefined
  let sourceCandidateScanInvalidated = true
  const pendingSourceCandidateSyncs = new Set<Promise<unknown>>()
  const pendingSourceCandidateSyncByFile = new Map<string, Promise<ViteSourceCandidateChange | undefined>>()
  const processedCssAssets = new WeakSet<object>()
  const processedCssAssetSourceByFile = new Map<string, string>()
  const viteProcessedCssSourceFiles = new Set<string>()
  const cleanGeneratedCssByFile = new Map<string, string>()
  const tracedGeneratedCssByFile = new Map<string, string>()
  const generatedClassSetByFile = new Map<string, Set<string>>()
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
  const readCssAssetSource = (asset: { source: unknown }) => {
    return typeof asset.source === 'string'
      ? asset.source
      : asset.source instanceof Uint8Array
        ? Buffer.from(asset.source).toString()
        : String(asset.source ?? '')
  }
  const markCssAssetProcessed = (asset: { source: unknown }, file?: string) => {
    processedCssAssets.add(asset)
    if (file) {
      processedCssAssetSourceByFile.set(normalizeOutputPathKey(file), readCssAssetSource(asset))
    }
  }
  const isCssAssetProcessed = (asset: { source: unknown }, file?: string) => {
    if (processedCssAssets.has(asset)) {
      return true
    }
    if (!file) {
      return false
    }
    const source = readCssAssetSource(asset)
    if (processedCssAssetSourceByFile.get(normalizeOutputPathKey(file)) === source) {
      return true
    }
    const record = viteProcessedCssAssetResults.get(normalizeOutputPathKey(file))
    if (!record) {
      return false
    }
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
  const hasWebHmrRuntimeAffectingDirectives = (source: string | undefined) =>
    typeof source === 'string' && WEB_HMR_RUNTIME_AFFECTING_DIRECTIVE_RE.test(source)
  let pendingHmrCandidateChange: ViteSourceCandidateChange | undefined
  let pendingHmrCssTargetFiles: Set<string> | undefined
  let pendingFullHmrCssRegeneration = false
  const normalizeGeneratedCssCacheFile = (file: string) => normalizeVitePersistentCacheKey(cleanUrl(file))
  const normalizeHmrCssTargetFile = normalizeGeneratedCssCacheFile
  const collectPendingHmrCssTargetFiles = (cssModules: ModuleNode[], fallbackCssIds: Iterable<string>) => {
    const targets = new Set<string>()
    const addTarget = (file: string | null | undefined) => {
      if (typeof file !== 'string' || file.length === 0) {
        return
      }
      const key = normalizeHmrCssTargetFile(file)
      if (cleanGeneratedCssByFile.has(key)) {
        targets.add(key)
      }
    }
    for (const mod of cssModules) {
      addTarget(mod.id)
      addTarget(mod.file)
      addTarget(mod.url)
    }
    for (const id of fallbackCssIds) {
      addTarget(id)
    }
    return targets.size > 0 ? targets : undefined
  }
  const armPendingHmrCssTargetFiles = (cssModules: ModuleNode[], fallbackCssIds: Iterable<string>) => {
    if (!pendingHmrCandidateChange) {
      pendingHmrCssTargetFiles = undefined
      return
    }
    pendingHmrCssTargetFiles = collectPendingHmrCssTargetFiles(cssModules, fallbackCssIds)
  }
  const createViteSourceCandidateChange = (
    file: string,
    change: SourceCandidateChange,
    options: { runtimeAffecting?: boolean | undefined } = {},
  ): ViteSourceCandidateChange => ({
    ...change,
    file,
    runtimeAffecting: options.runtimeAffecting === true
      || isSourceStyleRequest(file)
      || hasWebHmrRuntimeAffectingDirectives(sourceCandidateCollector.source(file)),
  })
  const clearPendingHmrCandidateChange = () => {
    pendingHmrCandidateChange = undefined
    pendingHmrCssTargetFiles = undefined
    pendingFullHmrCssRegeneration = false
  }
  const queueHmrCandidateChange = (change: ViteSourceCandidateChange) => {
    pendingFullHmrCssRegeneration = false
    if (!pendingHmrCandidateChange) {
      pendingHmrCandidateChange = {
        file: change.file,
        runtimeAffecting: change.runtimeAffecting,
        addedCandidates: new Set(change.addedCandidates),
        removedCandidates: new Set(change.removedCandidates),
      }
      return
    }
    for (const candidate of change.addedCandidates) {
      pendingHmrCandidateChange.addedCandidates.add(candidate)
      pendingHmrCandidateChange.removedCandidates.delete(candidate)
    }
    for (const candidate of change.removedCandidates) {
      if (!pendingHmrCandidateChange.addedCandidates.delete(candidate)) {
        pendingHmrCandidateChange.removedCandidates.add(candidate)
      }
    }
    pendingHmrCandidateChange.runtimeAffecting = pendingHmrCandidateChange.runtimeAffecting || change.runtimeAffecting
    pendingHmrCandidateChange.file = change.file
  }
  const queueFullHmrCssRegeneration = () => {
    pendingHmrCandidateChange = undefined
    pendingHmrCssTargetFiles = undefined
    pendingFullHmrCssRegeneration = true
  }
  const applySourceCandidateHmrState = (change: ViteSourceCandidateChange) => {
    if (isSourceStyleRequest(change.file)) {
      clearPendingHmrCandidateChange()
      return change
    }
    const preserveDeletedCssInHmr = resolveCurrentGeneratorOptions().hmr.preserveDeletedCss
    if (preserveDeletedCssInHmr && !change.runtimeAffecting) {
      if (change.addedCandidates.size > 0) {
        queueHmrCandidateChange(change)
      }
      else if (!pendingHmrCandidateChange) {
        clearPendingHmrCandidateChange()
      }
      return change
    }
    clearPendingHmrCandidateChange()
    if (!preserveDeletedCssInHmr) {
      queueFullHmrCssRegeneration()
    }
    return change
  }
  const resolvePendingHmrCandidateChange = (
    generatorCode: string,
    file: string,
  ) => {
    const fileKey = normalizeGeneratedCssCacheFile(file)
    if (
      resolvedConfig?.command !== 'serve'
      || !pendingHmrCandidateChange
      || pendingHmrCandidateChange.runtimeAffecting
      || pendingHmrCandidateChange.addedCandidates.size === 0
      || (resolveCurrentGeneratorOptions().target === 'weapp' && hasUserCssLayerBlocks(generatorCode))
      || !cleanGeneratedCssByFile.has(fileKey)
      || !generatedClassSetByFile.has(fileKey)
      || (pendingHmrCssTargetFiles !== undefined && !pendingHmrCssTargetFiles.has(fileKey))
    ) {
      return undefined
    }
    return pendingHmrCandidateChange
  }
  const finishPendingHmrCssTargetFile = (file: string) => {
    if (!pendingHmrCandidateChange) {
      return
    }
    if (!pendingHmrCssTargetFiles) {
      clearPendingHmrCandidateChange()
      return
    }
    pendingHmrCssTargetFiles.delete(normalizeHmrCssTargetFile(file))
    if (pendingHmrCssTargetFiles.size === 0) {
      clearPendingHmrCandidateChange()
    }
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
      const snapshot = sourceCandidateCollector.snapshot()
      sourceCandidateScanCache.set(sourceCandidateScanSignature, snapshot)
      sourceCandidateScanSnapshotCache.set(sourceCandidateScanSignature, snapshot)
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
      const snapshot = sourceCandidateCollector.snapshot()
      sourceCandidateScanCache.set(nextScanSignature, snapshot)
      sourceCandidateScanSnapshotCache.set(nextScanSignature, snapshot)
    }
  }
  const waitForSourceCandidateSyncs = async () => {
    while (pendingSourceCandidateSyncs.size > 0) {
      await Promise.all(pendingSourceCandidateSyncs)
    }
  }
  const syncChangedSourceCandidateFile = (id: string, sourceOverride?: string | undefined) => {
    if (!shouldOwnTailwindGeneration || !isSourceCandidateRequest(id)) {
      return Promise.resolve(undefined)
    }
    const file = cleanUrl(id)
    const runtimeAffectingByDependency = isSourceScanDependency(file)
    if (runtimeAffectingByDependency) {
      invalidateSourceCandidateScan()
    }
    if (sourceScanMatcher && !sourceScanMatcher(file)) {
      const change = sourceCandidateCollector.remove(file)
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
          .then(() => applySourceCandidateHmrState(createViteSourceCandidateChange(file, change, { runtimeAffecting: true })))
      }
      return cssMemory.refreshRememberedCssSourceByCurrentFile(file)
        .then(() => applySourceCandidateHmrState(createViteSourceCandidateChange(file, change, { runtimeAffecting: true })))
    }
    const existingTask = sourceOverride === undefined
      ? pendingSourceCandidateSyncByFile.get(file)
      : undefined
    if (existingTask) {
      return existingTask
        .then(async () => {
          return await syncChangedSourceCandidateFile(id)
        })
    }
    const task = (
      sourceOverride === undefined
        ? sourceCandidateCollector.syncCurrentFile(id)
        : sourceCandidateCollector.syncCurrentSource(id, sourceOverride)
    )
      .catch((error) => {
        debug('source candidate watch sync failed: %s %O', id, error)
        return undefined
      })
      .then((change) => {
        cacheCurrentSourceCandidateScan()
        return change
          ? applySourceCandidateHmrState(createViteSourceCandidateChange(file, change, { runtimeAffecting: runtimeAffectingByDependency }))
          : undefined
      })
      .finally(() => {
        pendingSourceCandidateSyncs.delete(task)
        pendingSourceCandidateSyncByFile.delete(file)
      })
    pendingSourceCandidateSyncs.add(task)
    pendingSourceCandidateSyncByFile.set(file, task)
    return task
      .then(async (change) => {
        await cssMemory.refreshRememberedCssSourceByCurrentFile(file)
        return change
      })
  }
  const recordCssAssetResult = (file: string, css: string) => {
    touchMapEntry(cleanGeneratedCssByFile, normalizeVitePersistentCacheKey(file), css)
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
    cleanGeneratedCssByFile: cleanGeneratedCssByFile.size,
    cleanGeneratedCssByFileRaw: summarizeStringCache(cleanGeneratedCssByFile),
    tracedGeneratedCssByFile: tracedGeneratedCssByFile.size,
    tracedGeneratedCssByFileRaw: summarizeStringCache(tracedGeneratedCssByFile),
    generatedClassSetByFile: generatedClassSetByFile.size,
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
    for (const key of cleanGeneratedCssByFile.keys()) {
      if (!activeFiles.has(key)) {
        cleanGeneratedCssByFile.delete(key)
      }
    }
    for (const key of tracedGeneratedCssByFile.keys()) {
      if (!activeFiles.has(key)) {
        tracedGeneratedCssByFile.delete(key)
      }
    }
    for (const key of generatedClassSetByFile.keys()) {
      if (!activeFiles.has(key)) {
        generatedClassSetByFile.delete(key)
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
    const cleanId = cleanUrl(id)
    if (isSourceStyleRequest(cleanId)) {
      tailwindRootCssModuleIds.add(cleanId)
    }
  }
  const registerTailwindRootCss = async (id: string, code: string) => {
    rememberTailwindRootCssModule(id)
    await registerAutoCssSource(id, code)
  }
  const isUniViteProject = () => {
    return resolvedConfig?.plugins?.some(plugin => plugin.name.includes('uni')) ?? false
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
      ...(frameworkCssPipelineStrategy?.getCssHandlerExtraOptions?.({
        ...createCssPipelineContext(),
        file,
      }) ?? {}),
    }),
    getDynamicCssOptions: () => ({
      cssPreflight: opts.cssPreflight,
    }),
  })
  const serveJsHandlerOptions = createJsHandlerOptionsFactory({
    getMajorVersion: () => runtimeState.tailwindRuntime.majorVersion,
    moduleGraph: undefined,
  })
  const shouldAdaptFrameworkWatchCss = () => {
    const platform = resolveViteStylePlatform()
    return shouldAdaptFrameworkWatchCssBeforeCache({
      enabled: frameworkBranch.adaptWatchCssBeforeFrameworkCache === true,
      ownsTailwindGeneration: shouldOwnTailwindGeneration,
      isWatchBuild: isWatchBuild(),
      isWebGeneratorBranch: resolveCurrentGeneratorBranch().isWeb,
      platform,
    })
  }
  const generateTailwindCssForVitePipeline = async (
    id: string,
    code: string,
    hookContext?: {
      addWatchFile?: (id: string) => void
      emitFile?: (emittedFile: { type: 'asset', fileName: string, source: string }) => string
      frameworkPostcssStage?: 'complete' | 'pending' | undefined
    },
  ) => {
    if (!shouldOwnTailwindGeneration) {
      return undefined
    }
    await runtimeState.readyPromise
    await waitForSourceCandidateSyncs()
    const file = cleanUrl(id)
    const inferredSfcStyleRequest = isSfcStyleSourceFile(file)
      ? resolveSfcStyleRequestFromKnownSource(
          file,
          cssMemory.getKnownSfcSource(file),
          code,
        )
      : file
    const requestFile = isCSSRequest(id)
      ? inferredSfcStyleRequest === file ? id : inferredSfcStyleRequest
      : inferredSfcStyleRequest
    if (!isCSSRequest(requestFile) || opts.htmlMatcher(file) || isHTMLRequest(file)) {
      return undefined
    }
    const generatorCode = normalizeEmptyTailwindCustomVariants(code)
    const rootDir = resolvedConfig?.root ? path.resolve(resolvedConfig.root) : process.cwd()
    const currentGeneratorOptions = resolveCurrentGeneratorOptions()
    const currentGeneratorBranch = resolveCurrentGeneratorBranch()
    const cssPipelineContext = createCssPipelineContext({
      currentGeneratorBranch,
      currentGeneratorOptions,
    })
    const shouldPreserveStyleOutputExtension = frameworkCssPipelineStrategy?.shouldPreserveStyleOutputExtension?.(cssPipelineContext)
      ?? frameworkCssPipelineStrategy?.isNativeAppStyleTarget?.(cssPipelineContext) === true
    const sourceRoot = resolveWeappViteSourceRoot(resolvedConfig, opts.appType)
    const outputFile = resolveViteCssPipelineOutputFile(requestFile, opts, rootDir, currentGeneratorBranch.isWeb, shouldPreserveStyleOutputExtension, sourceRoot)
    const generatorTransformCode = currentGeneratorBranch.isWeb
      ? generatorCode
      : normalizeMiniProgramGeneratorCssSource(generatorCode, outputFile)
    const fileKey = normalizeGeneratedCssCacheFile(file)
    const fullRuntime = getSourceCandidates()
      ?? getRecordedGeneratorCandidates()
      ?? await ensureRuntimeClassSet()
    const pendingHmrChange = resolvePendingHmrCandidateChange(generatorCode, file)
    const forceFullHmrCssRegeneration = pendingFullHmrCssRegeneration
      || (
        resolvedConfig?.command === 'serve'
        && pendingHmrCandidateChange !== undefined
        && pendingHmrChange === undefined
      )
    const runtime = fullRuntime
    const importShellCss = resolveViteServeRootMiniProgramImportShell({
      css: generatorTransformCode,
      cssPipelineContext,
      cssPipelineStrategy: frameworkCssPipelineStrategy,
      isWebGeneratorTarget: currentGeneratorBranch.isWeb,
      outputFile,
    })
    if (importShellCss !== undefined) {
      cleanGeneratedCssByFile.set(fileKey, importShellCss)
      tracedGeneratedCssByFile.set(fileKey, importShellCss)
      generatedClassSetByFile.set(fileKey, new Set())
      recordViteProcessedCssAssetResult(file, importShellCss, {
        injectIntoMain: false,
        outputFile,
      })
      markViteProcessedCssSource(file)
      rememberTailwindRootCssModule(id)
      recordGeneratorCandidates(fullRuntime)
      if (pendingHmrChange) {
        finishPendingHmrCssTargetFile(file)
      }
      else if (!pendingHmrCandidateChange) {
        clearPendingHmrCandidateChange()
      }
      cssMemory.rememberCssSource({
        outputFile,
        rawSource: code,
        sourceFile: requestFile,
      })
      debug('css preserved root mini-program import shell for vite postcss pipeline: %s bytes=%d', requestFile, importShellCss.length)
      return importShellCss
    }
    if (
      pendingHmrChange
      && currentGeneratorOptions.target === 'weapp'
      && filterUnsupportedMiniProgramTailwindV4Candidates(pendingHmrChange.addedCandidates).size === 0
    ) {
      const previousTracedCss = tracedGeneratedCssByFile.get(fileKey)
      if (previousTracedCss !== undefined) {
        finishPendingHmrCssTargetFile(file)
        return `${createBundlerGeneratedCssMarker('vite', normalizeViteProcessedCssFile(file))}\n${previousTracedCss}`
      }
    }
    const sourceCssHandlerOptions = transformCssHandlerOptions.getCssHandlerOptions(requestFile)
    const outputCssHandlerOptions = transformCssHandlerOptions.getCssHandlerOptions(outputFile)
    const cssHandlerOptions = {
      ...sourceCssHandlerOptions,
      isMainChunk: outputCssHandlerOptions.isMainChunk,
    }
    const transientCssSource = transientAutoCssSources.get(file)
      ?? (
        hasTailwindRootDirectives(generatorTransformCode, { importFallback: currentGeneratorOptions.importFallback })
        || hasTailwindSourceDirectives(generatorTransformCode, { importFallback: currentGeneratorOptions.importFallback })
        || hasTailwindApplyDirective(generatorTransformCode)
          ? {
              base: path.dirname(path.resolve(file)),
              css: generatorTransformCode,
              file: path.resolve(file),
            }
          : undefined
      )
    const shouldDeferEmptyScopedCssSource = transientCssSource == null && (
      frameworkCssPipelineStrategy?.shouldDeferEmptyScopedCssSource?.({
        ...cssPipelineContext,
        cssHandlerOptions,
        generatorCode: generatorTransformCode,
      }) ?? true
    )
    const previousCss = pendingHmrChange && !forceFullHmrCssRegeneration
      ? cleanGeneratedCssByFile.get(fileKey)
      : undefined
    const previousGeneratorCss = previousCss && !currentGeneratorBranch.isWeb
      ? normalizeMiniProgramGeneratorCssSource(previousCss, outputFile)
      : previousCss
    const generated = await hmrTimingRecorder.measure(`generateCss.${resolvedConfig?.command ?? 'unknown'}`, () => generateTailwindV4Css({
      opts,
      runtimeState,
      runtime,
      rawSource: generatorTransformCode,
      file,
      outputFile,
      cssHandlerOptions,
      cssUserHandlerOptions: transformCssHandlerOptions.getCssUserHandlerOptions(requestFile),
      cssSources: transientCssSource
        ? [transientCssSource]
        : undefined,
      getSourceCandidatesForEntries,
      generatorPlatform: resolveGeneratorPlatform(),
      styleHandler,
      debug,
      previousCss: previousGeneratorCss,
      previousClassSet: pendingHmrChange && !forceFullHmrCssRegeneration
        ? generatedClassSetByFile.get(fileKey)
        : undefined,
      deferEmptyScopedCssSource: shouldDeferEmptyScopedCssSource,
      deferCssAdaptation: !currentGeneratorBranch.isWeb && !shouldAdaptFrameworkWatchCss(),
      disableSourceScan: false,
      frameworkPostcssStage: hookContext?.frameworkPostcssStage,
      restoreLocalCssImports: !currentGeneratorBranch.isWeb,
    }), {
      file,
      memoryDebug: {
        cleanCacheHit: cleanGeneratedCssByFile.has(fileKey),
        forceFullHmrCssRegeneration,
        pendingAddedCandidates: pendingHmrCandidateChange?.addedCandidates.size ?? 0,
        pendingCssTargets: pendingHmrCssTargetFiles?.size ?? 0,
        pendingResolved: pendingHmrChange !== undefined,
        runtimeCandidates: runtime.size,
        target: currentGeneratorOptions.target,
      },
    })
    if (!generated) {
      if (pendingHmrChange) {
        finishPendingHmrCssTargetFile(file)
      }
      else if (!pendingHmrCandidateChange) {
        clearPendingHmrCandidateChange()
      }
      return undefined
    }
    const finalizedCss = finalizeViteMiniProgramCss(generated.css)
    const shouldApplyWebCssCompat = shouldApplyViteWebCssCompat(cssPipelineContext, frameworkCssPipelineStrategy)
    const outputCss = frameworkCssPipelineStrategy?.transformGeneratedCss?.(finalizedCss, {
      ...cssPipelineContext,
      defaultWebCssCompat: css => transformWebCssCompat(css, resolveViteWebCssCompatOptions(cssPipelineContext)),
      removeScopedPreflight: removeScopedTailwindPreflightCss,
      shouldApplyWebCssCompat,
    }) ?? removeScopedTailwindPreflightCss(
      shouldApplyWebCssCompat
        ? transformWebCssCompat(finalizedCss, resolveViteWebCssCompatOptions(cssPipelineContext))
        : finalizedCss,
    )
    const tracedCss = annotateCssSourceTrace(outputCss, {
      opts,
      tokenSources: createCssTokenSourceMap(getSourceCandidateSourcesForEntries(undefined), opts),
    })
    for (const dependency of generated.dependencies) {
      hookContext?.addWatchFile?.(dependency)
    }
    cleanGeneratedCssByFile.set(fileKey, outputCss)
    tracedGeneratedCssByFile.set(fileKey, tracedCss)
    generatedClassSetByFile.set(fileKey, new Set(generated.classSet))
    const shouldInjectGeneratedCssIntoMain = mainCssChunkMatcher(outputFile, opts.appType)
      || (
        hasTailwindRootDirectives(generatorTransformCode, { importFallback: currentGeneratorOptions.importFallback })
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
    if (shouldPreserveStyleOutputExtension && outputFile.endsWith('.css')) {
      hookContext?.emitFile?.({
        type: 'asset',
        fileName: outputFile,
        source: tracedCss,
      })
    }
    markViteProcessedCssSource(file)
    rememberTailwindRootCssModule(id)
    recordGeneratorCandidates(fullRuntime)
    if (pendingHmrChange) {
      finishPendingHmrCssTargetFile(file)
    }
    else if (!pendingHmrCandidateChange) {
      clearPendingHmrCandidateChange()
    }
    cssMemory.rememberCssSource({
      outputFile,
      rawSource: code,
      sourceFile: requestFile,
    })
    debug('css generated for vite postcss pipeline: %s bytes=%d', requestFile, tracedCss.length)
    return `${createBundlerGeneratedCssMarker('vite', normalizeViteProcessedCssFile(file))}\n${tracedCss}`
  }
  const rewritePlugins = createRewriteCssImportsPlugins({
    getAppType: () => opts.appType,
    generateTailwindCss: generateTailwindCssForVitePipeline,
    rootImport: shouldOwnTailwindGeneration
      ? `${weappTailwindcssDirPosix}/generator-placeholder.css`
      : undefined,
    onTailwindRootCss: registerTailwindRootCss,
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
  const generateBundleContext = {
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
    extractSourceCandidates: (file, source) => extractCandidatesFromSource(
      source,
      path.extname(cleanUrl(file)).slice(1) || 'html',
      {
        bareArbitraryValues: opts.arbitraryValues?.bareArbitraryValues,
        customAttributesEntities,
        disabledDefaultTemplateHandler,
      },
    ),
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
    getOriginalCssLayerSource: file => originalCssLayerSourceByFile.get(cleanUrl(file)),
    recordGeneratorCandidates,
    pruneViteCssCaches,
    getViteCssCacheStats,
    hmrTimingRecorder,
    cssPipelineStrategy: frameworkCssPipelineStrategy,
    frameworkRootImportShellTargetByFile,
  }
  const shouldSplitGenerateBundlePhases = () =>
    opts.appType === 'weapp-vite' && getResolvedConfig()?.mode !== 'production'
  const preGenerateBundleHook = createGenerateBundleHook({
    ...generateBundleContext,
    processMarkupAndScripts: false,
    shouldProcessBundle: shouldSplitGenerateBundlePhases,
  })
  const generateBundleHook = createGenerateBundleHook({
    ...generateBundleContext,
    shouldProcessStyles: () => !shouldSplitGenerateBundlePhases(),
  })
  const cssFinalizerOutputPlugin = createViteCssFinalizerOutputPlugin({
    opts,
    runtimeState,
    ensureRuntimeClassSet,
    cssPipelineStrategy: frameworkCssPipelineStrategy,
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
    frameworkRootImportShellTargetByFile,
    rememberMainCssSource: (file, rawSource) => cssMemory.rememberCssSource({
      outputFile: file,
      rawSource,
      sourceFile: file,
    }),
    getRememberedMainCssSource: cssMemory.getRememberedCssSourceEntry,
  })
  const extraPluginPlatform = frameworkBranch.getExtraPluginPlatform?.() ?? {}
  const prepareTailwindGeneration = async () => {
    if (shouldDiscoverAutoCssSources()) {
      await discoverAndRegisterAutoCssSources()
    }
    await syncSourceCandidateScan()
  }
  const extraPlugins = frameworkBranch.createExtraPlugins?.({
    customAttributesEntities,
    disabledDefaultTemplateHandler,
    ensureRuntimeClassSet,
    generateCss: generateTailwindCssForVitePipeline,
    getResolvedConfig,
    isEnabled: shouldEnableFrameworkExtraPlugins,
    isIosPlatform: extraPluginPlatform.isIosPlatform === true,
    jsHandler,
    mainCssChunkMatcher,
    runtimeState,
    styleHandler,
    uniAppX,
  }) ?? []
  const installFrameworkWatchCssCacheAdapter = async (config: ResolvedConfig) => {
    if (!shouldAdaptFrameworkWatchCss()) {
      return
    }
    const wrapped = wrapViteCssPostTransform(config, async (css, id) => {
      if (!isCSSRequest(id)) {
        return css
      }
      if (hasBundlerGeneratedCssMarker(css)) {
        debug('preserve adapted generated css before uni-app watch cache: %s', id)
        return css
      }
      const file = cleanUrl(id)
      const styleRequest = isSfcStyleSourceFile(file)
        ? resolveSfcStyleRequestFromKnownSource(
            file,
            cssMemory.getKnownSfcSource(file),
            css,
            id,
          )
        : id
      const transformedCss = (await styleHandler(
        css,
        transformCssHandlerOptions.getCssHandlerOptions(styleRequest),
      )).css
      debug(
        'adapt css before uni-app watch cache: %s inputRaw=%s outputRaw=%s',
        id,
        css.includes('\\[') || css.includes('\\:'),
        transformedCss.includes('\\[') || transformedCss.includes('\\:'),
      )
      return transformedCss
    })
    if (wrapped) {
      debug('adapt uni-app watch css before vite:css-post cache')
    }
  }

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
        rememberOriginalCssLayerSource(id, rawCode)
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
          if (hasUserCssLayerBlocks(code)) {
            rememberOriginalCssLayerSource(id, code)
          }
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
            if (isCSSRequest(id) && hasTailwindRootDirectives(transformedCode, { importFallback: resolveCurrentGeneratorOptions().importFallback })) {
              rememberTailwindRootCssModule(id)
            }
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
            const file = cleanUrl(id)
            const sourceCandidateChange = sourceCandidateCollector.remove(file)
            cacheCurrentSourceCandidateScan()
            applySourceCandidateHmrState(createViteSourceCandidateChange(file, sourceCandidateChange, {
              runtimeAffecting: isSourceScanDependency(file),
            }))
            return
          }
          await syncChangedSourceCandidateFile(id)
        }, { emit: false })
      },
      async handleHotUpdate(ctx) {
        return hmrTimingRecorder.measure('sourceCandidates.handleHotUpdate', async () => {
          const isSourceCandidateHotUpdate = shouldOwnTailwindGeneration && isSourceCandidateRequest(ctx.file)
          if (isSourceCandidateHotUpdate && isSourceStyleRequest(ctx.file)) {
            for (const mod of ctx.modules) {
              if (mod.id) {
                rememberTailwindRootCssModule(mod.id)
              }
              if (mod.url) {
                rememberTailwindRootCssModule(mod.url)
              }
              if (mod.file) {
                rememberTailwindRootCssModule(mod.file)
              }
            }
          }
          const canReadHotSource = typeof ctx.read === 'function'
          const hotSource = isSourceCandidateHotUpdate && canReadHotSource
            ? await ctx.read().catch(() => undefined)
            : undefined
          if (typeof hotSource === 'string' && isCSSRequest(ctx.file)) {
            rememberOriginalCssLayerSource(ctx.file, hotSource)
          }
          const sourceCandidateChange = await syncChangedSourceCandidateFile(ctx.file, hotSource)
          const isWebLikeHotUpdate = isCurrentWebLikeStylePlatform()
          let canUseHmrCandidateAppend = false
          if (isSourceCandidateHotUpdate) {
            invalidateRecordedGeneratorCandidates()
            const preserveDeletedCssInHmr = resolveCurrentGeneratorOptions().hmr.preserveDeletedCss
            canUseHmrCandidateAppend = preserveDeletedCssInHmr
              && !isSourceStyleRequest(ctx.file)
              && sourceCandidateChange !== undefined
              && !sourceCandidateChange.runtimeAffecting
            if (!canUseHmrCandidateAppend) {
              if (sourceCandidateChange === undefined) {
                clearPendingHmrCandidateChange()
                if (!preserveDeletedCssInHmr && !isSourceStyleRequest(ctx.file)) {
                  queueFullHmrCssRegeneration()
                }
              }
              if (isWebLikeHotUpdate) {
                await refreshRuntimeStateForAutoCssSources?.(true)
                await syncSourceCandidateScan({ force: true })
              }
            }
          }
          if (isSourceCandidateHotUpdate) {
            await waitForSourceCandidateSyncs()
          }
          const cssModules = resolveHotTailwindCssModules(ctx, tailwindRootCssModuleIds)
          const sourceModules = isSourceCandidateHotUpdate && !isSourceStyleRequest(ctx.file)
            ? resolveHotSourceModules(ctx)
            : ctx.modules
          const hasQueuedHmrCandidateAppend = pendingHmrCandidateChange !== undefined
            && !pendingHmrCandidateChange.runtimeAffecting
            && pendingHmrCandidateChange.addedCandidates.size > 0
          const hasHmrCandidateAppend = hasQueuedHmrCandidateAppend || (canUseHmrCandidateAppend
            && sourceCandidateChange !== undefined
            && sourceCandidateChange.addedCandidates.size > 0)
          if (
            isSourceCandidateHotUpdate
            && !isSourceStyleRequest(ctx.file)
            && !hasHmrCandidateAppend
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
          const shouldSendSupplementalCssHotUpdates = !(
            isWebLikeHotUpdate
            && isSourceCandidateHotUpdate
            && !isSourceStyleRequest(ctx.file)
            && resolveCurrentGeneratorOptions().hmr.preserveDeletedCss
            && sourceCandidateChange !== undefined
            && !sourceCandidateChange.runtimeAffecting
            && sourceCandidateChange.addedCandidates.size === 0
            && sourceCandidateChange.removedCandidates.size > 0
          )
          const supplementalCssFallbackIds = new Set([
            ...tailwindRootCssModuleIds,
            ...viteProcessedCssSourceFiles,
          ])
          if (hasHmrCandidateAppend) {
            armPendingHmrCssTargetFiles(cssModules, supplementalCssFallbackIds)
          }
          if (shouldSendSupplementalCssHotUpdates) {
            sendSupplementalCssHotUpdates(ctx, cssModules, supplementalCssFallbackIds)
          }
          if (
            isWebLikeHotUpdate
            && isSourceCandidateHotUpdate
            && !isSourceStyleRequest(ctx.file)
          ) {
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
      generateBundle: preGenerateBundleHook,
    },
    ...createViteCssGenerationPlugins({
      generateCss: generateTailwindCssForVitePipeline,
      getCommand: () => resolvedConfig?.command,
      onTailwindRootCss: registerTailwindRootCss,
      shouldGenerate: () => shouldOwnTailwindGeneration,
      shouldGenerateBuild: () => resolveCurrentGeneratorBranch().isWeb,
    }),
    createViteServeJsTransformPlugin({
      createHandlerOptions: file => serveJsHandlerOptions(file, frameworkCssPipelineStrategy?.getServeJsHandlerOptions?.({
        ...createCssPipelineContext(),
        file,
      })),
      getCommand: () => resolvedConfig?.command,
      jsHandler,
      shouldTransform: () => shouldOwnTailwindGeneration && (
        frameworkCssPipelineStrategy?.shouldTransformServeJs?.(createCssPipelineContext()) ?? !resolveCurrentGeneratorBranch().isWeb
      ),
      transformRuntime: ensureRuntimeClassSet,
    }),
    {
      name: `${vitePluginName}:watch-css-cache`,
      configResolved: {
        order: 'post',
        handler: installFrameworkWatchCssCacheAdapter,
      },
    },
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
            logger.warn('检测到 @tailwindcss/vite，生成模式下已移除该插件以避免 Tailwind CSS 重复生成。')
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
        return resolvePostcssConfig(root).then((postcssConfig) => {
          if (!postcssConfig) {
            return baseConfig
          }
          const plugins = [...postcssConfig.plugins]
          const removed = removeTailwindPostcssPlugins(plugins)
          if (removed > 0) {
            debug('inline filtered postcss config without official tailwind plugins in generator mode: %d', removed)
          }
          return {
            ...baseConfig,
            css: {
              postcss: {
                ...postcssConfig.options,
                plugins,
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
          if (shouldRefreshRuntime) {
            await refreshRuntimeState(true)
          }
          if (typeof config.css.postcss === 'object' && Array.isArray(config.css.postcss.plugins)) {
            const postcssPlugins = config.css.postcss.plugins as unknown[]
            if (shouldOwnTailwindGeneration) {
              const removed = removeTailwindPostcssPlugins(postcssPlugins)
              if (removed > 0) {
                logger.warn('检测到 @tailwindcss/postcss，生成模式下已移除该插件以避免 Tailwind CSS 重复生成。')
                debug('remove official tailwind postcss plugins in generator mode: %d', removed)
              }
            }
          }
          captureFrameworkPostcssOptions(
            opts,
            config.css?.postcss && typeof config.css.postcss === 'object'
              ? config.css.postcss
              : undefined,
          )
        }, { emit: false })
      },
      generateBundle: {
        order: 'post',
        handler: generateBundleHook,
      },
    },
  ]
  plugins.push(...extraPlugins)
  plugins.push(cssFinalizerOutputPlugin)
  plugins.push(...createBuiltinViteStyleInjectorPlugins(styleInjector, () => frameworkBranch.styleInjectorDelegate))
  return plugins
}
