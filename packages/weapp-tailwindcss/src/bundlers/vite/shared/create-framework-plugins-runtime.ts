/* eslint-disable style/max-statements-per-line, style/no-mixed-operators */
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { compileCssMacroConditionalComments, transformWebCssCompat, unwrapUnsupportedCascadeLayers } from '@weapp-tailwindcss/postcss'
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
import { createBundlerGeneratedCssMarker, hasBundlerGeneratedCssMarker } from '../../shared/generated-css-marker'
import { normalizeMiniProgramGeneratorCssSource } from '../../shared/generator-css/output-import-shell'
import { createHmrTimingRecorder } from '../../shared/hmr-timing'
import { normalizeOutputPathKey } from '../../shared/module-graph'
import { isSourceStyleRequest } from '../../shared/style-requests'
import { generateTailwindV4Css } from '../../shared/v4-generation-core'
import { createViteCssAssetIdentityResolver } from '../css-asset-identity'
import { createViteCssFinalizerOutputPlugin } from '../css-finalizer'
import { createViteCssMemory } from '../css-memory'
import { createGenerateBundleHook, resolveViteCssPipelineOutputFile } from '../generate-bundle'
import { createCssHandlerOptionsCache, resolveViteCssHandlerExtraOptions } from '../generate-bundle/css-handler-options'
import { createJsHandlerOptionsFactory } from '../generate-bundle/js-handler-options'
import { isSfcStyleSourceFile, resolveSfcStyleRequestFromKnownSource } from '../generate-bundle/sfc-style-source'
import { touchMapEntry } from '../map-cache'
import { isMissingInternalCssSource, normalizeVitePersistentCacheKey, summarizeStringCache } from '../plugin-cache'
import { removeScopedTailwindPreflightCss } from '../processed-css-assets'
import { createRewriteCssImportsPlugins, hasVitePipelineTailwindGenerationDirective } from '../rewrite-css-imports'
import { createViteRuntimeClassSet } from '../runtime-class-set'
import { createViteCssGenerationPlugins } from '../serve-css-generation'
import { createViteServeJsTransformPlugin } from '../serve-js-transform'
import { resolveViteServeRootMiniProgramImportShell } from '../serve-root-import-shell'
import { createSourceCandidateCollector, isSourceCandidateRequest } from '../source-candidates'
import { discoverTailwindV4CssEntries, resolveTailwindV4EntriesFromCssCached, resolveViteTailwindV4CssDependencies } from '../source-scan'
import { cleanUrl, isCSSRequest, isHTMLRequest, slash } from '../utils'
import { shouldAdaptFrameworkWatchCssBeforeCache, wrapViteCssPostTransform } from '../watch-css-post'
import { resolveWeappViteSourceRoot } from '../weapp-vite-config'
import { resolveViteWebCssCompatOptions, shouldApplyViteWebCssCompat } from '../web-css-compat'
import { createViteHmrCandidateState } from './framework-hmr-candidate-state'
import { createFrameworkPostPlugin } from './framework-post-plugin'
import { createFrameworkProcessedCssRegistry } from './framework-processed-css-registry'
import { createFrameworkSourceCandidatesPlugin } from './framework-source-candidates-plugin'
import { createFrameworkSourceScanSession } from './framework-source-scan-session'

const debug = createDebug()
const weappTailwindcssPackageDir = resolvePackageDir('weapp-tailwindcss')
const weappTailwindcssDirPosix = slash(weappTailwindcssPackageDir)
const generatorPlaceholderCssFile = path.join(weappTailwindcssPackageDir, 'generator-placeholder.css')
const ENV_PLATFORM_KEYS = ['UNI_PLATFORM', 'UNI_UTS_PLATFORM', 'TARO_ENV', 'MPX_CURRENT_TARGET_MODE', 'MPX_CLI_MODE']
function sameStringList(first, second) {
  if (first === second) {
    return true
  } if (!first || !second || first.length !== second.length) {
    return false
  } return first.every((item, index) => item === second[index])
}
function collectConfiguredCssEntries(options) { const runtimeCssEntries = options.tailwindcssRuntimeOptions?.tailwindcss?.v4?.cssEntries; const entries = [...Array.isArray(options.cssEntries) ? options.cssEntries : [], ...Array.isArray(options.tailwindcss?.v4?.cssEntries) ? options.tailwindcss.v4.cssEntries : [], ...Array.isArray(runtimeCssEntries) ? runtimeCssEntries : []].filter(item => typeof item === 'string' && item.length > 0); return entries.length > 0 ? [...new Set(entries)] : void 0 }
function normalizeViteStylePlatform(value, appType) { return normalizeFrameworkStylePlatform(value, appType) }
function inferPlatformFromOutDir(outDir) {
  const segment = outDir ? path.basename(path.normalize(outDir)) : void 0; if (!segment) {
    return void 0
  } const normalized = segment.trim().toLowerCase(); if (normalized === 'h5' || normalized === 'web' || normalized === 'app' || normalized === 'app-plus' || normalized.startsWith('app-') || normalized.startsWith('mp-') || normalized.startsWith('quickapp-webview')) {
    return normalized
  } return void 0
}
function isWebOrNativeAppPlatform(platform) { return platform === 'h5' || platform === 'web' || platform?.startsWith('web-') === true || platform === 'app' || platform === 'app-plus' || platform?.startsWith('app-') === true }
function isInternalUserDefinedOptions(options) { return typeof options.onLoad === 'function' && typeof options.mainCssChunkMatcher === 'function' && typeof options.tailwindRuntime === 'object' && typeof options.refreshTailwindcssRuntime === 'function' }
function createViteFrameworkPlugins(options = {}, frameworkBranch): any {
  debug('create vite framework plugins framework=%s', frameworkBranch.frameworkName)
  const rawOptions = options.__internalViteRawOptions ?? options
  const hasExplicitAppType = typeof options.__internalViteRawExplicitAppType === 'boolean' ? options.__internalViteRawExplicitAppType : typeof options.appType === 'string' && options.appType.trim().length > 0
  const hasExplicitTailwindcssBasedir = typeof options.__internalViteRawExplicitTailwindcssBasedir === 'boolean' ? options.__internalViteRawExplicitTailwindcssBasedir : typeof options.tailwindcssBasedir === 'string' && options.tailwindcssBasedir.trim().length > 0
  const rawCssEntries = collectConfiguredCssEntries(rawOptions)
  const opts = isInternalUserDefinedOptions(options) ? options : getCompilerContext({ ...options, __internalDeferMissingCssEntriesWarning: true })
  const syncCssEntriesFromAnchor = (anchor) => {
    const normalizedCssEntries = normalizeCssEntries(rawCssEntries, anchor ?? process.cwd()); if (!normalizedCssEntries) {
      return false
    } const changed = !sameStringList(opts.cssEntries, normalizedCssEntries); opts.cssEntries = normalizedCssEntries; opts.tailwindcss ??= {}; opts.tailwindcss.v4 ??= {}; opts.tailwindcss.v4.cssEntries = normalizedCssEntries; if (opts.tailwindcssRuntimeOptions?.tailwindcss?.v4) {
      ;
      opts.tailwindcssRuntimeOptions.tailwindcss.v4.cssEntries = normalizedCssEntries
    } if (opts.tailwindRuntime?.options?.tailwindcss?.v4) {
      ;
      opts.tailwindRuntime.options.tailwindcss.v4.cssEntries = normalizedCssEntries
    } return changed
  }
  syncCssEntriesFromAnchor(opts.tailwindcssBasedir)
  const { disabled, customAttributes, onLoad, mainCssChunkMatcher, styleHandler, jsHandler, tailwindRuntime, refreshTailwindcssRuntime, uniAppX, disabledDefaultTemplateHandler, styleInjector } = opts
  const initialTailwindRuntime = tailwindRuntime
  const refreshTailwindRuntime = refreshTailwindcssRuntime
  const frameworkCssPipelineStrategy = frameworkBranch.cssPipelineStrategy
  const uniAppXEnabled = frameworkBranch.isRuntimeClassSetFeatureEnabled?.({ uniAppX }) === true
  const shouldEnableFrameworkExtraPlugins = () => frameworkBranch.createExtraPlugins !== void 0
  const disabledOptions = resolvePluginDisabledState(disabled)
  const tailwindcssMajorVersion = initialTailwindRuntime.majorVersion ?? 0
  if (!disabledOptions.plugin && tailwindcssMajorVersion !== 4) {
    throw new Error('weapp-tailwindcss/vite \u65B0\u751F\u6210\u7BA1\u7EBF\u4EC5\u652F\u6301 Tailwind CSS v4\uFF0C\u8BF7\u5347\u7EA7 tailwindcss \u6216\u505C\u7559\u5728\u65E7\u7248 weapp-tailwindcss\u3002')
  }
  const shouldRewriteCssImports = opts.rewriteCssImports === true
  let resolvedConfig
  const resolveViteStylePlatform = () => {
    const explicit = normalizeViteStylePlatform(opts.cssOptions?.platform ?? opts.platform, opts.appType); if (explicit) {
      return explicit
    } for (const key of ENV_PLATFORM_KEYS) {
      const envPlatform = normalizeViteStylePlatform(process.env[key], opts.appType)
      if (envPlatform) {
        return envPlatform
      }
    } return inferPlatformFromOutDir(resolvedConfig?.build?.outDir)
  }
  const resolveGeneratorPlatform = () => opts.cssOptions?.platform ?? opts.platform ?? resolveViteStylePlatform()
  const resolveCurrentGeneratorOptions = () => normalizeWeappTailwindcssGeneratorOptions(opts.generator, { appType: opts.appType, platform: resolveGeneratorPlatform(), tailwindcssMajorVersion, uniAppX })
  const shouldOwnTailwindGeneration = !disabledOptions.plugin && resolveCurrentGeneratorOptions().enabled
  const resolveCurrentGeneratorBranch = () => resolveGeneratorRuntimeBranch(resolveCurrentGeneratorOptions(), { appType: opts.appType, platform: resolveGeneratorPlatform(), tailwindcssMajorVersion, uniAppX })
  const createCssPipelineContext = (overrides = {}) => ({ currentGeneratorBranch: resolveCurrentGeneratorBranch(), currentGeneratorOptions: resolveCurrentGeneratorOptions(), opts, resolvedConfig, resolveStylePlatform: resolveViteStylePlatform, ...overrides })
  const initialGeneratorBranch = resolveCurrentGeneratorBranch()
  const transformEarlyMiniProgramCss = (code) => {
    const platform = resolveViteStylePlatform(); if (!shouldOwnTailwindGeneration || (platform ? isWebOrNativeAppPlatform(platform) : resolveCurrentGeneratorBranch().isWeb)) {
      return code
    } let transformedCode = code; if (transformedCode.includes('#if')) {
      transformedCode = compileCssMacroConditionalComments(transformedCode, { platform: resolveViteStylePlatform() })
    } if (transformedCode.includes('@layer')) {
      transformedCode = unwrapUnsupportedCascadeLayers(transformedCode)
    } return transformedCode
  }
  const finalizeViteMiniProgramCss = (css) => {
    const platform = resolveViteStylePlatform(); if (!shouldOwnTailwindGeneration || (platform ? isWebOrNativeAppPlatform(platform) : resolveCurrentGeneratorBranch().isWeb)) {
      return css
    } return unwrapUnsupportedCascadeLayers(css)
  }
  const shouldInferAppType = !hasExplicitAppType && !initialGeneratorBranch.isWeb
  const hasInitialTailwindCssRoots = hasConfiguredTailwindV4CssRoots({ ...rawOptions, cssEntries: opts.cssEntries ?? rawOptions.cssEntries })
  const autoCssSourceContent = new Map()
  const frameworkRootImportShellTargetByFile = new Map()
  const transientAutoCssSources = new Map()
  let refreshRuntimeStateForAutoCssSources
  let autoCssSourcesRefresh
  let autoCssSourcesDiscovered = false
  const syncTailwindCssSourceCandidates = async (id, css) => {
    if (tailwindcssMajorVersion === 4 && isMissingInternalCssSource(cleanUrl(id), weappTailwindcssPackageDir)) {
      return
    } await sourceCandidateCollector.syncCss(id, css); sourceScanSession.cacheCurrent()
  }
  const registerAutoCssSource = async (id, css, options2 = {}) => {
    if (!shouldOwnTailwindGeneration) {
      return
    } const file = cleanUrl(id); if (!path.isAbsolute(file)) {
      return
    } if (!isTailwindV4CssEntry(file)) {
      return
    } if (isMissingInternalCssSource(file, weappTailwindcssPackageDir)) {
      return
    } const sourceFile = path.normalize(file); const sourceBase = path.dirname(sourceFile); const sourceCss = normalizeTailwindSourceForGenerator(normalizeTailwindConfigDirectives(css, sourceBase), { importFallback: true }); if (autoCssSourceContent.get(sourceFile) === sourceCss) {
      return
    } autoCssSourceContent.set(sourceFile, sourceCss); await syncTailwindCssSourceCandidates(sourceFile, sourceCss); cssMemory.refreshRememberedCssSourceBySourceFile(sourceFile, sourceCss); const transientSource = { file: sourceFile, base: sourceBase, css: sourceCss, dependencies: [] }; if (hasInitialTailwindCssRoots) {
      transientAutoCssSources.set(sourceFile, transientSource)
      return
    } const dependencies = await resolveViteTailwindV4CssDependencies(sourceCss, sourceBase); transientSource.dependencies = dependencies; transientAutoCssSources.set(sourceFile, transientSource); const changed = upsertTailwindV4CssSource(opts, { file: sourceFile, base: sourceBase, css: sourceCss, dependencies }); if (!changed) {
      return
    } sourceScanSession.invalidate(); debug('detected tailwindcss v4 css source from vite css module: %s', sourceFile); if (options2.refresh === false) {
      return
    } autoCssSourcesRefresh = (autoCssSourcesRefresh ?? Promise.resolve()).then(async () => { await refreshRuntimeStateForAutoCssSources?.(true); await sourceScanSession.sync({ force: true }) }); await autoCssSourcesRefresh
  }
  const discoverAndRegisterAutoCssSources = async () => {
    if (!shouldOwnTailwindGeneration || hasInitialTailwindCssRoots || !resolvedConfig?.root) {
      return
    } const cssEntries = await discoverTailwindV4CssEntries(resolvedConfig.root, resolvedConfig.build?.outDir); autoCssSourcesDiscovered = true; let changed = false; for (const cssEntry of cssEntries) {
      const sourceFile = path.resolve(cssEntry)
      const sourceBase = path.dirname(sourceFile)
      const sourceCss = normalizeTailwindSourceForGenerator(normalizeTailwindConfigDirectives(await readFile(sourceFile, 'utf8'), sourceBase), { importFallback: true })
      if (autoCssSourceContent.get(sourceFile) === sourceCss) {
        continue
      }
      autoCssSourceContent.set(sourceFile, sourceCss)
      await syncTailwindCssSourceCandidates(sourceFile, sourceCss)
      const resolved = await resolveTailwindV4EntriesFromCssCached(sourceCss, sourceBase)
      changed = upsertTailwindV4CssSource(opts, { file: sourceFile, base: sourceBase, css: sourceCss, dependencies: resolved?.dependencies ?? [] }) || changed
    } if (!changed) {
      return
    } sourceScanSession.invalidate(); await refreshRuntimeStateForAutoCssSources?.(true)
  }
  const customAttributesEntities = toCustomAttributesEntities(customAttributes)
  let recordedGeneratorCandidates
  const sourceCandidateCollector = createSourceCandidateCollector({ bareArbitraryValues: opts.arbitraryValues?.bareArbitraryValues, customAttributesEntities, disabledDefaultTemplateHandler })
  const originalCssLayerSourceByFile = new LRUCache({ max: 128 })
  const rememberOriginalCssLayerSource = (id, code) => {
    const file = cleanUrl(id); if (!isCSSRequest(file)) {
      return
    } if (!hasUserCssLayerBlocks(code)) {
      originalCssLayerSourceByFile.delete(file)
      return
    } originalCssLayerSourceByFile.set(file, splitUserCssLayerBlocks(code).layer)
  }
  const processedCssAssets = new WeakSet()
  const processedCssAssetSourceByFile = new Map()
  const cleanGeneratedCssByFile = new Map()
  const tracedGeneratedCssByFile = new Map()
  const generatedClassSetByFile = new Map()
  const processedCssRegistry = createFrameworkProcessedCssRegistry()
  const cssMemory = createViteCssMemory({ debug, getSourceCandidateSource: file => sourceCandidateCollector.source(file) })
  const tailwindRootCssModuleIds = new Set()
  const { runtimeState, refreshRuntimeState, ensureRuntimeClassSet, ensureBundleRuntimeClassSet } = createViteRuntimeClassSet({ opts, initialTailwindRuntime, refreshTailwindcssRuntime: refreshTailwindRuntime, uniAppXEnabled, customAttributesEntities, disabledDefaultTemplateHandler, debug })
  const hmrTimingRecorder = createHmrTimingRecorder('vite')
  refreshRuntimeStateForAutoCssSources = refreshRuntimeState
  onLoad()
  const getResolvedConfig = () => resolvedConfig
  const readCssAssetSource = (asset) => { return typeof asset.source === 'string' ? asset.source : asset.source instanceof Uint8Array ? Buffer.from(asset.source).toString() : String(asset.source ?? '') }
  const markCssAssetProcessed = (asset, file) => {
    processedCssAssets.add(asset); if (file) {
      processedCssAssetSourceByFile.set(normalizeOutputPathKey(file), readCssAssetSource(asset))
    }
  }
  const isCssAssetProcessed = (asset, file) => {
    if (processedCssAssets.has(asset)) {
      return true
    } if (!file) {
      return false
    } const source = readCssAssetSource(asset); if (processedCssAssetSourceByFile.get(normalizeOutputPathKey(file)) === source) {
      return true
    } const record = processedCssRegistry.get(file); if (!record) {
      return false
    } return source === record.css
  }
  const recordGeneratorCandidates = (candidates) => { recordedGeneratorCandidates = new Set(candidates) }
  const getRecordedGeneratorCandidates = () => recordedGeneratorCandidates
  const invalidateRecordedGeneratorCandidates = () => { recordedGeneratorCandidates = void 0 }
  const getSourceCandidates = () => sourceCandidateCollector.values()
  const getSourceCandidatesForEntries = (entries, options2) => sourceCandidateCollector.valuesForEntries(entries, options2)
  const getSourceCandidateSourcesForEntries = (entries, options2) => sourceCandidateCollector.sourcesForEntries(entries, options2)
  const isWatchBuild = () => resolvedConfig?.command === 'build' && resolvedConfig.build.watch != null
  const isWatchLikeBuild = () => isWatchBuild() || resolvedConfig?.command === 'serve' || process.env['WEAPP_TW_WATCH_REGRESSION'] === '1' || process.env['WEAPP_TW_HMR_TIMING'] === '1'
  const isCurrentWebLikeStylePlatform = () => { const platform = resolveViteStylePlatform(); return platform ? isWebOrNativeAppPlatform(platform) : resolveCurrentGeneratorBranch().isWeb }
  const isNuxtPageMacroHotModule = (id) => {
    if (typeof id !== 'string' || !/[?&]macro=true(?:&|$)/.test(id)) {
      return false
    } const cleanId = cleanUrl(id); return cleanId.includes('/pages/') && /\.(?:vue|tsx?|jsx?)$/.test(cleanId)
  }
  const normalizeGeneratedCssCacheFile = file => normalizeVitePersistentCacheKey(cleanUrl(file))
  const hmrCandidateState = createViteHmrCandidateState({
    cleanGeneratedCssByFile,
    generatedClassSetByFile,
    getCommand: () => resolvedConfig?.command,
    getGeneratorOptions: resolveCurrentGeneratorOptions,
    getSourceCandidate: file => sourceCandidateCollector.source(file),
  })
  const sourceScanSession = createFrameworkSourceScanSession({
    cssMemory,
    debug,
    getResolvedConfig: () => resolvedConfig,
    hmrCandidateState,
    isCandidateRequest: isSourceCandidateRequest,
    isWatchLikeBuild,
    opts,
    runtimeState,
    shouldOwnTailwindGeneration,
    sourceCandidateCollector,
  })
  const recordCssAssetResult = (file, css) => { touchMapEntry(cleanGeneratedCssByFile, normalizeVitePersistentCacheKey(file), css) }
  const recordViteProcessedCssAssetResult = processedCssRegistry.record
  const getViteProcessedCssAssetResults = processedCssRegistry.entries
  const getViteProcessedCssAssetResult = processedCssRegistry.get
  const getViteCssCacheStats = () => ({ cleanGeneratedCssByFile: cleanGeneratedCssByFile.size, cleanGeneratedCssByFileRaw: summarizeStringCache(cleanGeneratedCssByFile), tracedGeneratedCssByFile: tracedGeneratedCssByFile.size, tracedGeneratedCssByFileRaw: summarizeStringCache(tracedGeneratedCssByFile), generatedClassSetByFile: generatedClassSetByFile.size, ...processedCssRegistry.getStats(), ...cssMemory.getStats(), ...sourceScanSession.getStats() })
  const pruneViteCssCaches = (options2) => {
    const activeFiles = new Set([...options2.activeFiles].map(normalizeVitePersistentCacheKey)); for (const key of cleanGeneratedCssByFile.keys()) {
      if (!activeFiles.has(key)) {
        cleanGeneratedCssByFile.delete(key)
      }
    } for (const key of tracedGeneratedCssByFile.keys()) {
      if (!activeFiles.has(key)) {
        tracedGeneratedCssByFile.delete(key)
      }
    } for (const key of generatedClassSetByFile.keys()) {
      if (!activeFiles.has(key)) {
        generatedClassSetByFile.delete(key)
      }
    } processedCssRegistry.prune(activeFiles); cssMemory.prune(options2)
  }
  const normalizeViteProcessedCssFile = file => path.resolve(cleanUrl(file))
  const markViteProcessedCssSource = processedCssRegistry.markSource
  const rememberTailwindRootCssModule = (id) => {
    if (!shouldOwnTailwindGeneration) {
      return
    } tailwindRootCssModuleIds.add(id); const cleanId = cleanUrl(id); if (isSourceStyleRequest(cleanId)) {
      tailwindRootCssModuleIds.add(cleanId)
    }
  }
  const registerTailwindRootCss = async (id, code) => { rememberTailwindRootCssModule(id); await registerAutoCssSource(id, code) }
  const isUniViteProject = () => { return resolvedConfig?.plugins?.some(plugin => plugin.name.includes('uni')) ?? false }
  const resolveCssAssetIdentity = createViteCssAssetIdentityResolver({ generatorPlaceholderFile: generatorPlaceholderCssFile, isKnownProcessedSource: processedCssRegistry.matchesIdentity })
  const isViteProcessedCssAsset = (asset, file) => resolveCssAssetIdentity(asset, file).kind === 'bundler-generated'
  const transformCssHandlerOptions = createCssHandlerOptionsCache({ getAppType: () => opts.appType, mainCssChunkMatcher, getMajorVersion: () => runtimeState.tailwindRuntime.majorVersion, getOutputRoot: () => resolvedConfig?.build?.outDir ? path.resolve(resolvedConfig.root, resolvedConfig.build.outDir) : resolvedConfig?.root, getExtraOptions: file => ({ ...resolveViteCssHandlerExtraOptions(file), ...frameworkCssPipelineStrategy?.getCssHandlerExtraOptions?.({ ...createCssPipelineContext(), file }) ?? {} }), getDynamicCssOptions: () => ({ cssPreflight: opts.cssPreflight }) })
  const serveJsHandlerOptions = createJsHandlerOptionsFactory({ getMajorVersion: () => runtimeState.tailwindRuntime.majorVersion, moduleGraph: void 0 })
  const shouldAdaptFrameworkWatchCss = () => { const platform = resolveViteStylePlatform(); return shouldAdaptFrameworkWatchCssBeforeCache({ enabled: frameworkBranch.adaptWatchCssBeforeFrameworkCache === true, ownsTailwindGeneration: shouldOwnTailwindGeneration, isWatchBuild: isWatchBuild(), isWebGeneratorBranch: resolveCurrentGeneratorBranch().isWeb, platform }) }
  const generateTailwindCssForVitePipeline = async (id, code, hookContext) => {
    if (!shouldOwnTailwindGeneration) {
      return void 0
    }
    await runtimeState.readyPromise
    await sourceScanSession.waitForPendingSyncs()
    const file = cleanUrl(id)
    const inferredSfcStyleRequest = isSfcStyleSourceFile(file) ? resolveSfcStyleRequestFromKnownSource(file, cssMemory.getKnownSfcSource(file), code) : file
    const requestFile = isCSSRequest(id) ? inferredSfcStyleRequest === file ? id : inferredSfcStyleRequest : inferredSfcStyleRequest
    if (!isCSSRequest(requestFile) || opts.htmlMatcher(file) || isHTMLRequest(file)) {
      return void 0
    }
    const generatorCode = normalizeEmptyTailwindCustomVariants(code)
    const rootDir = resolvedConfig?.root ? path.resolve(resolvedConfig.root) : process.cwd()
    const currentGeneratorOptions = resolveCurrentGeneratorOptions()
    const currentGeneratorBranch = resolveCurrentGeneratorBranch()
    const cssPipelineContext = createCssPipelineContext({ currentGeneratorBranch, currentGeneratorOptions })
    const shouldPreserveStyleOutputExtension = frameworkCssPipelineStrategy?.shouldPreserveStyleOutputExtension?.(cssPipelineContext) ?? frameworkCssPipelineStrategy?.isNativeAppStyleTarget?.(cssPipelineContext) === true
    const sourceRoot = resolveWeappViteSourceRoot(resolvedConfig, opts.appType)
    const outputFile = resolveViteCssPipelineOutputFile(requestFile, opts, rootDir, currentGeneratorBranch.isWeb, shouldPreserveStyleOutputExtension, sourceRoot)
    const generatorTransformCode = currentGeneratorBranch.isWeb ? generatorCode : normalizeMiniProgramGeneratorCssSource(generatorCode, outputFile)
    const fileKey = normalizeGeneratedCssCacheFile(file)
    const fullRuntime = getSourceCandidates() ?? getRecordedGeneratorCandidates() ?? await ensureRuntimeClassSet()
    const pendingHmrChange = hmrCandidateState.resolve(generatorCode, file)
    const forceFullHmrCssRegeneration = hmrCandidateState.shouldForceFullRegeneration(pendingHmrChange !== undefined)
    const runtime = fullRuntime
    const importShellCss = resolveViteServeRootMiniProgramImportShell({ css: generatorTransformCode, cssPipelineContext, cssPipelineStrategy: frameworkCssPipelineStrategy, isWebGeneratorTarget: currentGeneratorBranch.isWeb, outputFile })
    if (importShellCss !== void 0) {
      cleanGeneratedCssByFile.set(fileKey, importShellCss)
      tracedGeneratedCssByFile.set(fileKey, importShellCss)
      generatedClassSetByFile.set(fileKey, new Set())
      recordViteProcessedCssAssetResult(file, importShellCss, { injectIntoMain: false, outputFile })
      markViteProcessedCssSource(file)
      rememberTailwindRootCssModule(id)
      recordGeneratorCandidates(fullRuntime)
      if (pendingHmrChange) {
        hmrCandidateState.finishTarget(file)
      }
      else if (!hmrCandidateState.hasPendingChange()) {
        hmrCandidateState.clear()
      }
      cssMemory.rememberCssSource({ outputFile, rawSource: code, sourceFile: requestFile })
      debug('css preserved root mini-program import shell for vite postcss pipeline: %s bytes=%d', requestFile, importShellCss.length)
      return importShellCss
    }
    if (pendingHmrChange && currentGeneratorOptions.target === 'weapp' && filterUnsupportedMiniProgramTailwindV4Candidates(pendingHmrChange.addedCandidates).size === 0) {
      const previousTracedCss = tracedGeneratedCssByFile.get(fileKey)
      if (previousTracedCss !== void 0) {
        hmrCandidateState.finishTarget(file)
        return `${createBundlerGeneratedCssMarker('vite', normalizeViteProcessedCssFile(file))}
${previousTracedCss}`
      }
    }
    const sourceCssHandlerOptions = transformCssHandlerOptions.getCssHandlerOptions(requestFile)
    const outputCssHandlerOptions = transformCssHandlerOptions.getCssHandlerOptions(outputFile)
    const cssHandlerOptions = { ...sourceCssHandlerOptions, isMainChunk: outputCssHandlerOptions.isMainChunk }
    const transientCssSource = transientAutoCssSources.get(file) ?? (hasTailwindRootDirectives(generatorTransformCode, { importFallback: currentGeneratorOptions.importFallback }) || hasTailwindSourceDirectives(generatorTransformCode, { importFallback: currentGeneratorOptions.importFallback }) || hasTailwindApplyDirective(generatorTransformCode) ? { base: path.dirname(path.resolve(file)), css: generatorTransformCode, file: path.resolve(file) } : void 0)
    const shouldDeferEmptyScopedCssSource = transientCssSource == null && (frameworkCssPipelineStrategy?.shouldDeferEmptyScopedCssSource?.({ ...cssPipelineContext, cssHandlerOptions, generatorCode: generatorTransformCode }) ?? true)
    const shouldBypassIncrementalCssAppend = pendingHmrChange !== void 0
      && !currentGeneratorBranch.isWeb
      && (opts.appType === 'taro' || opts.appType === 'uni-app-vite')
    const previousCss = pendingHmrChange && !forceFullHmrCssRegeneration && !shouldBypassIncrementalCssAppend
      ? cleanGeneratedCssByFile.get(fileKey)
      : void 0
    const previousGeneratorCss = previousCss && !currentGeneratorBranch.isWeb ? normalizeMiniProgramGeneratorCssSource(previousCss, outputFile) : previousCss
    const hmrDebugState = hmrCandidateState.snapshotDebugState()
    const generated = await hmrTimingRecorder.measure(`generateCss.${resolvedConfig?.command ?? 'unknown'}`, () => generateTailwindV4Css({ opts, runtimeState, runtime, rawSource: generatorTransformCode, file, outputFile, cssHandlerOptions, cssUserHandlerOptions: transformCssHandlerOptions.getCssUserHandlerOptions(requestFile), cssSources: transientCssSource ? [transientCssSource] : void 0, getSourceCandidatesForEntries, generatorPlatform: resolveGeneratorPlatform(), styleHandler, debug, previousCss: previousGeneratorCss, previousClassSet: pendingHmrChange && !forceFullHmrCssRegeneration && !shouldBypassIncrementalCssAppend ? generatedClassSetByFile.get(fileKey) : void 0, deferEmptyScopedCssSource: shouldDeferEmptyScopedCssSource, deferCssAdaptation: !currentGeneratorBranch.isWeb && !shouldAdaptFrameworkWatchCss(), disableSourceScan: false, cssStage: hookContext?.cssStage, restoreLocalCssImports: !currentGeneratorBranch.isWeb }), { file, memoryDebug: { cleanCacheHit: cleanGeneratedCssByFile.has(fileKey), forceFullHmrCssRegeneration, ...hmrDebugState, pendingResolved: pendingHmrChange !== void 0, runtimeCandidates: runtime.size, target: currentGeneratorOptions.target } })
    if (!generated) {
      if (pendingHmrChange) {
        hmrCandidateState.finishTarget(file)
      }
      else if (!hmrCandidateState.hasPendingChange()) {
        hmrCandidateState.clear()
      }
      return void 0
    }
    const finalizedCss = finalizeViteMiniProgramCss(generated.css)
    const shouldApplyWebCssCompat = shouldApplyViteWebCssCompat(cssPipelineContext, frameworkCssPipelineStrategy)
    const outputCss = frameworkCssPipelineStrategy?.transformGeneratedCss?.(finalizedCss, { ...cssPipelineContext, defaultWebCssCompat: css => transformWebCssCompat(css, resolveViteWebCssCompatOptions(cssPipelineContext)), removeScopedPreflight: removeScopedTailwindPreflightCss, shouldApplyWebCssCompat }) ?? removeScopedTailwindPreflightCss(shouldApplyWebCssCompat ? transformWebCssCompat(finalizedCss, resolveViteWebCssCompatOptions(cssPipelineContext)) : finalizedCss)
    const tracedCss = annotateCssSourceTrace(outputCss, { opts, tokenSources: createCssTokenSourceMap(getSourceCandidateSourcesForEntries(void 0), opts) })
    for (const dependency of generated.dependencies) {
      hookContext?.addWatchFile?.(dependency)
    }
    cleanGeneratedCssByFile.set(fileKey, outputCss)
    tracedGeneratedCssByFile.set(fileKey, tracedCss)
    generatedClassSetByFile.set(fileKey, new Set(generated.classSet))
    const shouldInjectGeneratedCssIntoMain = mainCssChunkMatcher(outputFile, opts.appType) || hasTailwindRootDirectives(generatorTransformCode, { importFallback: currentGeneratorOptions.importFallback }) && !normalizeOutputPathKey(outputFile).includes('/')
    recordViteProcessedCssAssetResult(file, tracedCss, { injectIntoMain: shouldInjectGeneratedCssIntoMain, outputFile })
    if (tracedCss.includes('weapp-tailwindcss layer components start')) {
      recordViteProcessedCssAssetResult(file, tracedCss, { injectIntoMain: shouldInjectGeneratedCssIntoMain, outputFile })
    }
    if (shouldPreserveStyleOutputExtension && outputFile.endsWith('.css')) {
      hookContext?.emitFile?.({ type: 'asset', fileName: outputFile, source: tracedCss })
    }
    markViteProcessedCssSource(file)
    rememberTailwindRootCssModule(id)
    recordGeneratorCandidates(fullRuntime)
    if (pendingHmrChange) {
      hmrCandidateState.finishTarget(file)
    }
    else if (!hmrCandidateState.hasPendingChange()) {
      hmrCandidateState.clear()
    }
    cssMemory.rememberCssSource({ outputFile, rawSource: code, sourceFile: requestFile })
    debug('css generated for vite postcss pipeline: %s bytes=%d', requestFile, tracedCss.length)
    return `${createBundlerGeneratedCssMarker('vite', normalizeViteProcessedCssFile(file))}
${tracedCss}`
  }
  const rewritePlugins = createRewriteCssImportsPlugins({ getAppType: () => opts.appType, generateTailwindCss: generateTailwindCssForVitePipeline, rootImport: shouldOwnTailwindGeneration ? `${weappTailwindcssDirPosix}/generator-placeholder.css` : void 0, onTailwindRootCss: registerTailwindRootCss, onCssSourceTransform: (id, code) => cssMemory.refreshRememberedCssSourceBySourceFile(id, code), shouldGenerateCss: (_id, code) => hasVitePipelineTailwindGenerationDirective(code), shouldDeferGeneration: (_id, code) => !shouldRewriteCssImports && hasTailwindRootDirectives(code, { importFallback: resolveCurrentGeneratorOptions().importFallback }), shouldOwnTailwindGeneration, shouldRewrite: shouldRewriteCssImports, weappTailwindcssDirPosix })
  if (disabledOptions.plugin) {
    return rewritePlugins.length ? rewritePlugins : void 0
  }
  const generateBundleContext = { opts, runtimeState, ensureRuntimeClassSet, ensureBundleRuntimeClassSet, debug, getResolvedConfig, markCssAssetProcessed, isCssAssetProcessed, isViteProcessedCssAsset, resolveCssAssetIdentity, recordCssAssetResult, recordViteProcessedCssAssetResult, getViteProcessedCssAssetResults, getViteProcessedCssAssetResult, getSourceCandidates, getSourceCandidateSource: file => sourceCandidateCollector.source(file), getSourceCandidateSources: () => sourceCandidateCollector.sources(), extractSourceCandidates: (file, source) => extractCandidatesFromSource(source, path.extname(cleanUrl(file)).slice(1) || 'html', { bareArbitraryValues: opts.arbitraryValues?.bareArbitraryValues, customAttributesEntities, disabledDefaultTemplateHandler }), getSourceCandidatesForEntries, getSourceCandidateSourcesForEntries, waitForSourceCandidateSyncs: sourceScanSession.waitForPendingSyncs, rememberCssSource: cssMemory.rememberCssSource, getRememberedCssSources: cssMemory.getRememberedCssSources, getRememberedCssSignature: cssMemory.getRememberedCssSignature, setRememberedCssSignature: cssMemory.setRememberedCssSignature, getKnownCssSource: cssMemory.getKnownCssSource, getKnownSfcSource: cssMemory.getKnownSfcSource, getOriginalCssLayerSource: file => originalCssLayerSourceByFile.get(cleanUrl(file)), recordGeneratorCandidates, pruneViteCssCaches, getViteCssCacheStats, hmrTimingRecorder, cssPipelineStrategy: frameworkCssPipelineStrategy, frameworkRootImportShellTargetByFile }
  const shouldSplitGenerateBundlePhases = () => opts.appType === 'weapp-vite' && getResolvedConfig()?.mode !== 'production'
  const preGenerateBundleHook = createGenerateBundleHook({ ...generateBundleContext, processMarkupAndScripts: false, shouldProcessBundle: shouldSplitGenerateBundlePhases })
  const generateBundleHook = createGenerateBundleHook({ ...generateBundleContext, shouldProcessStyles: () => !shouldSplitGenerateBundlePhases() })
  const cssFinalizerOutputPlugin = createViteCssFinalizerOutputPlugin({ opts, runtimeState, ensureRuntimeClassSet, cssPipelineStrategy: frameworkCssPipelineStrategy, debug, getResolvedConfig, markCssAssetProcessed, isCssAssetProcessed, isViteProcessedCssAsset, recordCssAssetResult, recordViteProcessedCssAssetResult, getViteProcessedCssAssetResults, getRecordedGeneratorCandidates, getSourceCandidates, getSourceCandidatesForEntries, getSourceCandidateSourcesForEntries, waitForSourceCandidateSyncs: sourceScanSession.waitForPendingSyncs, frameworkRootImportShellTargetByFile, rememberMainCssSource: (file, rawSource) => cssMemory.rememberCssSource({ outputFile: file, rawSource, sourceFile: file }), getRememberedMainCssSource: cssMemory.getRememberedCssSourceEntry })
  const extraPluginPlatform = frameworkBranch.getExtraPluginPlatform?.() ?? {}
  const prepareTailwindGeneration = async () => {
    if (sourceScanSession.shouldDiscoverAutoCssSources(autoCssSourcesDiscovered)) {
      await discoverAndRegisterAutoCssSources()
    } await sourceScanSession.sync()
  }
  const extraPlugins = frameworkBranch.createExtraPlugins?.({ customAttributesEntities, disabledDefaultTemplateHandler, ensureRuntimeClassSet, generateCss: generateTailwindCssForVitePipeline, getResolvedConfig, isEnabled: shouldEnableFrameworkExtraPlugins, isIosPlatform: extraPluginPlatform.isIosPlatform === true, jsHandler, mainCssChunkMatcher, runtimeState, styleHandler, uniAppX }) ?? []
  const installFrameworkWatchCssCacheAdapter = async (config) => {
    if (!shouldAdaptFrameworkWatchCss()) {
      return
    } const wrapped = wrapViteCssPostTransform(config, async (css, id) => {
      if (!isCSSRequest(id)) {
        return css
      } if (hasBundlerGeneratedCssMarker(css)) {
        debug('preserve adapted generated css before uni-app watch cache: %s', id)
        return css
      } const file = cleanUrl(id); const styleRequest = isSfcStyleSourceFile(file) ? resolveSfcStyleRequestFromKnownSource(file, cssMemory.getKnownSfcSource(file), css, id) : id; const transformedCss = (await styleHandler(css, transformCssHandlerOptions.getCssHandlerOptions(styleRequest))).css; debug('adapt css before uni-app watch cache: %s inputRaw=%s outputRaw=%s', id, css.includes('\\[') || css.includes('\\:'), transformedCss.includes('\\[') || transformedCss.includes('\\:')); return transformedCss
    }); if (wrapped) {
      debug('adapt uni-app watch css before vite:css-post cache')
    }
  }
  const sourceCandidatesPlugin = createFrameworkSourceCandidatesPlugin({
    cssMemory,
    hasUserCssLayerBlocks,
    hmrCandidateState,
    hmrTimingRecorder,
    invalidateRecordedGeneratorCandidates,
    isCurrentWebLikeStylePlatform,
    isNuxtPageMacroHotModule,
    isUniViteProject,
    isWebOrNativeAppPlatform,
    prepareTailwindGeneration,
    preGenerateBundleHook,
    refreshRuntimeStateForAutoCssSources,
    rememberOriginalCssLayerSource,
    rememberTailwindRootCssModule,
    resolveCurrentGeneratorBranch,
    resolveCurrentGeneratorOptions,
    resolveViteStylePlatform,
    runtimeState,
    shouldOwnTailwindGeneration,
    sourceCandidateCollector,
    sourceScanSession,
    tailwindRootCssModuleIds,
    transformEarlyMiniProgramCss,
    viteProcessedCssSourceFiles: processedCssRegistry.sourceFiles,
  })
  const postPlugin = createFrameworkPostPlugin({
    api: {
      registerProcessedCssAsset(entry: {
        css: string
        injectIntoMain?: boolean
        outputFile: string
        sourceFile: string
      }) {
        markViteProcessedCssSource(entry.sourceFile)
        recordViteProcessedCssAssetResult(entry.sourceFile, entry.css, {
          injectIntoMain: entry.injectIntoMain,
          outputFile: entry.outputFile,
        })
      },
    },
    debug,
    generateBundleHook,
    generatorPlaceholderCssFile,
    hasExplicitTailwindcssBasedir,
    hmrTimingRecorder,
    opts,
    refreshRuntimeState,
    setResolvedConfig: (config) => { resolvedConfig = config },
    shouldInferAppType,
    shouldOwnTailwindGeneration,
    syncCssEntriesFromAnchor,
  })
  const plugins = [...rewritePlugins, sourceCandidatesPlugin, ...createViteCssGenerationPlugins({ generateCss: generateTailwindCssForVitePipeline, getCommand: () => resolvedConfig?.command, onTailwindRootCss: registerTailwindRootCss, shouldGenerate: () => shouldOwnTailwindGeneration, shouldGenerateBuild: () => resolveCurrentGeneratorBranch().isWeb }), createViteServeJsTransformPlugin({ createHandlerOptions: file => serveJsHandlerOptions(file, frameworkCssPipelineStrategy?.getServeJsHandlerOptions?.({ ...createCssPipelineContext(), file })), getCommand: () => resolvedConfig?.command, jsHandler, shouldTransform: () => shouldOwnTailwindGeneration && (frameworkCssPipelineStrategy?.shouldTransformServeJs?.(createCssPipelineContext()) ?? !resolveCurrentGeneratorBranch().isWeb), transformRuntime: ensureRuntimeClassSet }), { name: `${vitePluginName}:watch-css-cache`, configResolved: { order: 'post', handler: installFrameworkWatchCssCacheAdapter } }, postPlugin]
  plugins.push(...extraPlugins)
  plugins.push(cssFinalizerOutputPlugin)
  plugins.push(...createBuiltinViteStyleInjectorPlugins(styleInjector, () => frameworkBranch.styleInjectorDelegate))
  return plugins
}
export { createViteFrameworkPlugins }
