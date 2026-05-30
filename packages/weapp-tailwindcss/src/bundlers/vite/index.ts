import type { HmrContext, ModuleNode, Plugin, ResolvedConfig } from 'vite'
import type { SourceCandidateCollectorSnapshot } from './source-candidates'
import type { TailwindInlineSourceCandidates, TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { UserDefinedOptions } from '@/types'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import postcssHtmlTransform from '@weapp-tailwindcss/postcss/html-transform'
import { normalizeTailwindSourceForGenerator } from '@/bundlers/shared/generator-css/directives'
import { vitePluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { toCustomAttributesEntities } from '@/context/custom-attributes'
import { createDebug } from '@/debug'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { hasConfiguredTailwindV4CssRoots, upsertTailwindV4CssSource } from '@/tailwindcss/v4/css-sources'
import { createUniAppXPlugins } from '@/uni-app-x'
import { isUniAppXEnabled } from '@/uni-app-x/options'
import { resolveUniUtsPlatform } from '@/utils'
import { resolvePluginDisabledState } from '@/utils/disabled'
import { resolvePackageDir } from '@/utils/resolve-package'
import { createBundlerGeneratedCssMarker, hasBundlerGeneratedCssMarker } from '../shared/generated-css-marker'
import { generateCssByGenerator } from '../shared/generator-css'
import { createHmrTimingRecorder } from '../shared/hmr-timing'
import { normalizeOutputPathKey } from '../shared/module-graph'
import { isSourceStyleRequest } from '../shared/style-requests'
import { createViteCssFinalizerOutputPlugin } from './css-finalizer'
import { createGenerateBundleHook } from './generate-bundle'
import { createCssHandlerOptionsCache } from './generate-bundle/css-handler-options'
import { disableAndRemoveTailwindVitePlugins, getPostcssPluginName, removeTailwindPostcssPlugins, removeTailwindVitePlugins } from './official-tailwind-plugins'
import { resolveFilteredPostcssConfig } from './postcss-config'
import { resolveImplicitAppTypeFromViteRoot } from './resolve-app-type'
import { createRewriteCssImportsPlugins } from './rewrite-css-imports'
import { createViteRuntimeClassSet } from './runtime-class-set'
import { createViteServeCssGenerationPlugins } from './serve-css-generation'
import { createSourceCandidateCollector, isSourceCandidateRequest } from './source-candidates'
import { createViteSourceScanMatcher, discoverTailwindV4CssEntries, resolveTailwindV4EntriesFromCssCached, resolveViteSourceScanEntries, resolveViteTailwindV4CssDependencies } from './source-scan'
import { resolveImplicitTailwindcssBasedirFromViteRoot } from './tailwind-basedir'
import { cleanUrl, slash } from './utils'

const debug = createDebug()
const weappTailwindcssPackageDir = resolvePackageDir('weapp-tailwindcss')
const weappTailwindcssDirPosix = slash(weappTailwindcssPackageDir)
const sourceCandidateScanSnapshotCache = new Map<string, SourceCandidateCollectorSnapshot>()

interface SourceCandidateScanRoot {
  root: string
  entries?: TailwindSourceEntry[] | undefined
}

interface SourceCandidateScanSignatureInput {
  inlineCandidates?: TailwindInlineSourceCandidates | undefined
  outDir?: string | undefined
  roots: SourceCandidateScanRoot[]
  scanAllSources?: boolean | undefined
}

export interface WeappTailwindcssVitePlugin {
  name: string
  [hook: string]: any
}

function normalizeSignaturePath(value: string) {
  return slash(path.resolve(value))
}

function serializeInlineCandidates(inlineCandidates: TailwindInlineSourceCandidates | undefined) {
  return {
    excluded: [...(inlineCandidates?.excluded ?? [])].sort(),
    included: [...(inlineCandidates?.included ?? [])].sort(),
  }
}

function serializeSourceEntries(entries: TailwindSourceEntry[] | undefined) {
  return (entries ?? [])
    .map(entry => ({
      base: normalizeSignaturePath(entry.base),
      negated: entry.negated,
      pattern: entry.pattern,
    }))
    .sort((a, b) => `${a.base}\0${a.pattern}\0${a.negated}`.localeCompare(`${b.base}\0${b.pattern}\0${b.negated}`))
}

function createSourceCandidateScanSignature(input: SourceCandidateScanSignatureInput) {
  return JSON.stringify({
    inlineCandidates: serializeInlineCandidates(input.inlineCandidates),
    outDir: input.outDir ? normalizeSignaturePath(input.outDir) : undefined,
    roots: input.roots.map(root => ({
      entries: serializeSourceEntries(root.entries),
      root: normalizeSignaturePath(root.root),
    })),
    scanAllSources: input.scanAllSources ?? false,
  })
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
  const opts = getCompilerContext({
    ...options,
    __internalDeferMissingCssEntriesWarning: true,
  } as UserDefinedOptions)
  const {
    disabled,
    customAttributes,
    onLoad,
    mainCssChunkMatcher,
    styleHandler,
    jsHandler,
    twPatcher: initialTwPatcher,
    refreshTailwindcssPatcher,
    uniAppX,
    disabledDefaultTemplateHandler,
  } = opts
  const uniAppXEnabled = isUniAppXEnabled(uniAppX)

  const disabledOptions = resolvePluginDisabledState(disabled)
  const tailwindcssMajorVersion = initialTwPatcher.majorVersion ?? 0
  const shouldOwnTailwindGeneration = !disabledOptions.plugin
  const shouldRewriteCssImports = tailwindcssMajorVersion >= 4
  const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(opts.generator)
  const shouldInferAppType = !hasExplicitAppType && generatorOptions.target !== 'web'
  const hasInitialTailwindCssRoots = hasConfiguredTailwindV4CssRoots({
    ...options,
    cssEntries: opts.cssEntries ?? options.cssEntries,
  })
  const autoCssSourceContent = new Map<string, string>()
  let refreshRuntimeStateForAutoCssSources: ((force: boolean) => Promise<void>) | undefined
  let autoCssSourcesRefresh: Promise<void> | undefined
  let autoCssSourcesDiscovered = false
  const registerAutoCssSource = async (id: string, css: string, options: { refresh?: boolean } = {}) => {
    if (
      tailwindcssMajorVersion < 4
      || !shouldOwnTailwindGeneration
      || hasInitialTailwindCssRoots
    ) {
      return
    }
    const file = cleanUrl(id)
    if (!path.isAbsolute(file)) {
      return
    }
    const sourceFile = path.normalize(file)
    const sourceCss = normalizeTailwindSourceForGenerator(css, { importFallback: true })
    if (autoCssSourceContent.get(sourceFile) === sourceCss) {
      return
    }
    autoCssSourceContent.set(sourceFile, sourceCss)
    const dependencies = await resolveViteTailwindV4CssDependencies(sourceCss, path.dirname(sourceFile))
    const changed = upsertTailwindV4CssSource(opts, {
      file: sourceFile,
      base: path.dirname(sourceFile),
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
      tailwindcssMajorVersion < 4
      || !shouldOwnTailwindGeneration
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
      const sourceCss = normalizeTailwindSourceForGenerator(
        await readFile(sourceFile, 'utf8'),
        { importFallback: true },
      )
      if (autoCssSourceContent.get(sourceFile) === sourceCss) {
        continue
      }
      autoCssSourceContent.set(sourceFile, sourceCss)
      const resolved = await resolveTailwindV4EntriesFromCssCached(sourceCss, path.dirname(sourceFile))
      changed = upsertTailwindV4CssSource(opts, {
        file: sourceFile,
        base: path.dirname(sourceFile),
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
  let resolvedConfig: ResolvedConfig | undefined
  let recordedGeneratorCandidates: Set<string> | undefined
  const sourceCandidateCollector = createSourceCandidateCollector()
  const sourceCandidateScanCache = new Map<string, SourceCandidateCollectorSnapshot>()
  let sourceScanEntries: TailwindSourceEntry[] | undefined
  let sourceScanMatcher: ((file: string) => boolean) | undefined
  let sourceScanDependencies = new Set<string>()
  let sourceScanExplicit = false
  let sourceCandidateScanSignature: string | undefined
  let sourceCandidateScanInvalidated = true
  const pendingSourceCandidateSyncs = new Set<Promise<void>>()
  const pendingSourceCandidateSyncByFile = new Map<string, Promise<void>>()
  const processedCssAssets = new WeakSet<object>()
  const processedCssAssetFiles = new Set<string>()
  const viteProcessedCssSourceFiles = new Set<string>()
  const viteGeneratedCssByFile = new Map<string, string>()
  const viteProcessedCssAssetResults = new Map<string, string>()
  const rememberedMainCssSources = new Map<string, string>()
  const rememberedMainCssSignatureByFile = new Map<string, string>()
  const tailwindRootCssModuleIds = new Set<string>()
  const {
    runtimeState,
    refreshRuntimeState,
    ensureRuntimeClassSet,
    ensureBundleRuntimeClassSet,
  } = createViteRuntimeClassSet({
    opts,
    initialTwPatcher,
    refreshTailwindcssPatcher,
    uniAppXEnabled,
    customAttributesEntities,
    disabledDefaultTemplateHandler,
    debug,
  })
  const hmrTimingRecorder = createHmrTimingRecorder('vite')
  refreshRuntimeStateForAutoCssSources = refreshRuntimeState
  onLoad()
  const getResolvedConfig = () => resolvedConfig
  const markCssAssetProcessed = (asset: { source: unknown }, file?: string) => {
    processedCssAssets.add(asset)
    if (file) {
      processedCssAssetFiles.add(normalizeOutputPathKey(file))
    }
  }
  const isCssAssetProcessed = (asset: { source: unknown }, file?: string) => {
    return processedCssAssets.has(asset)
      || (file ? processedCssAssetFiles.has(normalizeOutputPathKey(file)) : false)
  }
  const recordGeneratorCandidates = (candidates: Set<string>) => {
    recordedGeneratorCandidates = new Set(candidates)
  }
  const getRecordedGeneratorCandidates = () => recordedGeneratorCandidates
  const invalidateRecordedGeneratorCandidates = () => {
    recordedGeneratorCandidates = undefined
  }
  const getSourceCandidates = () => sourceCandidateCollector.values()
  const getSourceCandidatesForEntries = (entries: TailwindSourceEntry[] | undefined) => sourceCandidateCollector.valuesForEntries(entries)
  const isWatchBuild = () => resolvedConfig?.command === 'build' && resolvedConfig.build.watch != null
  const isWatchLikeBuild = () => isWatchBuild()
    || resolvedConfig?.command === 'serve'
    || process.env['WEAPP_TW_WATCH_REGRESSION'] === '1'
    || process.env['WEAPP_TW_HMR_TIMING'] === '1'
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
        root,
      }]
    }
    if (sourceScanExplicit) {
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
    const sourceScan = await resolveViteSourceScanEntries(opts, runtimeState.twPatcher, {
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
    sourceCandidateCollector.clear()
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
      return Promise.resolve()
    }
    if (sourceScanExplicit && sourceScanEntries?.length === 0) {
      cacheCurrentSourceCandidateScan()
      return Promise.resolve()
    }
    const existingTask = pendingSourceCandidateSyncByFile.get(file)
    if (existingTask) {
      return existingTask
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
  }
  const shouldCollectTransformedSourceCandidates = (id: string) => {
    const queryIndex = id.search(/[?#]/)
    if (queryIndex < 0) {
      return true
    }
    const file = cleanUrl(id)
    return !/\.(?:vue|uvue|nvue|svelte|mpx)$/i.test(file)
  }
  const rememberMainCssSource = (file: string, rawSource: string, cssRuntimeSignature?: string) => {
    rememberedMainCssSources.set(file, rawSource)
    if (cssRuntimeSignature) {
      rememberedMainCssSignatureByFile.set(file, cssRuntimeSignature)
    }
  }
  const getRememberedMainCssSources = () => rememberedMainCssSources
  const getRememberedMainCssSource = (file: string) => rememberedMainCssSources.get(file)
  const getRememberedMainCssSignature = (file: string) => rememberedMainCssSignatureByFile.get(file)
  const setRememberedMainCssSignature = (file: string, cssRuntimeSignature: string) => {
    rememberedMainCssSignatureByFile.set(file, cssRuntimeSignature)
  }
  const recordCssAssetResult = (file: string, css: string) => {
    viteGeneratedCssByFile.set(file, css)
  }
  const recordViteProcessedCssAssetResult = (file: string, css: string) => {
    viteProcessedCssAssetResults.set(normalizeOutputPathKey(file), css)
  }
  const getViteProcessedCssAssetResults = () => viteProcessedCssAssetResults.entries()
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
  const resolveHotTailwindCssModules = (ctx: HmrContext) => {
    const modules: ModuleNode[] = []
    const seenModules = new Set<ModuleNode>()
    const collectModule = (mod: ModuleNode | undefined) => {
      if (mod == null || seenModules.has(mod)) {
        return
      }
      const modId = mod.id ?? mod.url
      if (!isSourceStyleRequest(modId)) {
        return
      }
      seenModules.add(mod)
      ctx.server.moduleGraph.invalidateModule(mod)
      modules.push(mod)
    }
    for (const id of tailwindRootCssModuleIds) {
      const candidates = [
        ctx.server.moduleGraph.getModuleById(id),
        ctx.server.moduleGraph.getModuleById(cleanUrl(id)),
        ...(ctx.server.moduleGraph.getModulesByFile(id) ?? []),
        ...(ctx.server.moduleGraph.getModulesByFile(cleanUrl(id)) ?? []),
      ]
      for (const mod of candidates) {
        collectModule(mod)
      }
    }
    return modules
  }
  const resolveModuleHotUrl = (mod: ModuleNode) => {
    if (typeof mod.url === 'string' && mod.url.length > 0) {
      return mod.url
    }
    if (typeof mod.id === 'string' && mod.id.startsWith('/')) {
      return mod.id
    }
    return undefined
  }
  const includesHotModule = (modules: ModuleNode[], target: ModuleNode) => {
    const targetUrl = resolveModuleHotUrl(target)
    const targetId = target.id
    return modules.some((mod) => {
      if (mod === target) {
        return true
      }
      return (
        targetUrl !== undefined
        && resolveModuleHotUrl(mod) === targetUrl
      ) || (
        typeof targetId === 'string'
        && targetId.length > 0
        && mod.id === targetId
      )
    })
  }
  const hasSelfAcceptingNonStyleHotModule = (modules: ModuleNode[]) => {
    return modules.some((mod) => {
      const modId = mod.id ?? mod.url
      return !isSourceStyleRequest(modId) && mod.isSelfAccepting === true
    })
  }
  const isUniViteProject = () => {
    return resolvedConfig?.plugins?.some(plugin => plugin.name.includes('uni')) ?? false
  }
  const sendSupplementalCssHotUpdates = (ctx: HmrContext, cssModules: ModuleNode[]) => {
    const updates = cssModules
      .filter(mod => !includesHotModule(ctx.modules, mod))
      .map((mod) => {
        const hotUrl = resolveModuleHotUrl(mod)
        if (!hotUrl) {
          return undefined
        }
        return {
          type: 'js-update' as const,
          timestamp: ctx.timestamp,
          path: hotUrl,
          acceptedPath: hotUrl,
          explicitImportRequired: false,
          isWithinCircularImport: false,
        }
      })
      .filter((update): update is NonNullable<typeof update> => update !== undefined)
    if (updates.length === 0) {
      return
    }
    queueMicrotask(() => {
      ctx.server.ws?.send?.({
        type: 'update',
        updates,
      })
    })
  }
  const sendFullReloadForUnresolvedHotUpdate = (ctx: HmrContext) => {
    ctx.server.ws?.send?.({
      type: 'full-reload',
      path: '*',
      triggeredBy: ctx.file,
    })
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
    getMajorVersion: () => runtimeState.twPatcher.majorVersion,
    getOutputRoot: () => resolvedConfig?.build?.outDir
      ? path.resolve(resolvedConfig.root, resolvedConfig.build.outDir)
      : resolvedConfig?.root,
  })
  const generateTailwindCssForVitePipeline = async (
    id: string,
    code: string,
    hookContext?: { addWatchFile?: (id: string) => void },
  ) => {
    if (!shouldOwnTailwindGeneration) {
      return undefined
    }
    await runtimeState.readyPromise
    await waitForSourceCandidateSyncs()
    const file = cleanUrl(id)
    const runtime = getRecordedGeneratorCandidates()
      ?? getSourceCandidates()
      ?? await ensureRuntimeClassSet()
    const cssHandlerOptions = transformCssHandlerOptions.getCssHandlerOptions(file)
    const generated = await generateCssByGenerator({
      opts,
      runtimeState,
      runtime,
      rawSource: code,
      file,
      cssHandlerOptions,
      cssUserHandlerOptions: transformCssHandlerOptions.getCssUserHandlerOptions(file),
      getSourceCandidatesForEntries,
      styleHandler,
      debug,
      previousCss: viteGeneratedCssByFile.get(file),
    })
    if (!generated) {
      return undefined
    }
    for (const dependency of generated.dependencies) {
      hookContext?.addWatchFile?.(dependency)
    }
    viteGeneratedCssByFile.set(file, generated.css)
    markViteProcessedCssSource(file)
    rememberTailwindRootCssModule(id)
    recordGeneratorCandidates(runtime)
    rememberMainCssSource(file, code)
    debug('css generated for vite postcss pipeline: %s bytes=%d', file, generated.css.length)
    return `${createBundlerGeneratedCssMarker('vite', normalizeViteProcessedCssFile(file))}\n${generated.css}`
  }
  const rewritePlugins = createRewriteCssImportsPlugins({
    getAppType: () => opts.appType,
    generateTailwindCss: generateTailwindCssForVitePipeline,
    rootImport: shouldOwnTailwindGeneration
      ? `${weappTailwindcssDirPosix}/generator-placeholder.css`
      : undefined,
    onTailwindRootCss: (id, code) => registerAutoCssSource(id, code),
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
    isViteProcessedCssAsset,
    recordCssAssetResult,
    recordViteProcessedCssAssetResult,
    getViteProcessedCssAssetResults,
    getSourceCandidates,
    getSourceCandidatesForEntries,
    waitForSourceCandidateSyncs,
    rememberMainCssSource,
    getRememberedMainCssSources,
    getRememberedMainCssSignature,
    setRememberedMainCssSignature,
    recordGeneratorCandidates,
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
    waitForSourceCandidateSyncs,
    rememberMainCssSource,
    getRememberedMainCssSource,
  })
  const utsPlatform = resolveUniUtsPlatform()
  const isIosPlatform = utsPlatform.isAppIos
  const prepareTailwindGeneration = async () => {
    if (shouldDiscoverAutoCssSources()) {
      await discoverAndRegisterAutoCssSources()
    }
    await syncSourceCandidateScan()
  }
  const uniAppXPlugins = uniAppXEnabled
    ? createUniAppXPlugins({
        appType: opts.appType ?? 'uni-app-x',
        customAttributesEntities,
        disabledDefaultTemplateHandler,
        isIosPlatform,
        mainCssChunkMatcher,
        runtimeState,
        styleHandler,
        jsHandler,
        ensureRuntimeClassSet,
        getResolvedConfig,
        uniAppX,
      })
    : undefined

  const plugins: Plugin[] = [
    ...rewritePlugins,
    {
      name: `${vitePluginName}:source-candidates`,
      enforce: 'pre',
      async transform(code, id) {
        if (!shouldOwnTailwindGeneration || !isSourceCandidateRequest(id) || !shouldCollectTransformedSourceCandidates(id)) {
          return
        }
        return hmrTimingRecorder.measure('sourceCandidates.transform', async () => {
          const file = cleanUrl(id)
          if (sourceScanMatcher && !sourceScanMatcher(file)) {
            sourceCandidateCollector.remove(file)
            cacheCurrentSourceCandidateScan()
            return
          }
          if (sourceScanExplicit && sourceScanEntries?.length === 0) {
            cacheCurrentSourceCandidateScan()
            return
          }
          await sourceCandidateCollector.merge(id, code)
          cacheCurrentSourceCandidateScan()
        }, { emit: false })
      },
      async watchChange(id, change) {
        await hmrTimingRecorder.measure('sourceCandidates.watchChange', async () => {
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
          invalidateRecordedGeneratorCandidates()
          const cssModules = resolveHotTailwindCssModules(ctx)
          if (
            isSourceCandidateHotUpdate
            && !isSourceStyleRequest(ctx.file)
            && (
              !hasSelfAcceptingNonStyleHotModule(ctx.modules)
              || (cssModules.length > 0 && isUniViteProject())
            )
          ) {
            sendFullReloadForUnresolvedHotUpdate(ctx)
            return []
          }
          sendSupplementalCssHotUpdates(ctx, cssModules)
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
                debug('remove official tailwind postcss plugins in generator mode: %d', removed)
              }
            }
            const idx = postcssPlugins.findIndex(x =>
              getPostcssPluginName(x) === 'postcss-html-transform')
            if (idx > -1) {
              postcssPlugins.splice(idx, 1, postcssHtmlTransform())
              debug('remove postcss-html-transform plugin from vite config')
            }
          }
        }, { emit: false })
      },
      generateBundle: generateBundleHook,
    },
    cssFinalizerOutputPlugin,
  ]
  if (uniAppXPlugins) {
    plugins.push(...uniAppXPlugins)
  }
  return plugins
}
