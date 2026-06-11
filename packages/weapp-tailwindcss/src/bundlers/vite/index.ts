import type { HmrContext, ModuleNode, Plugin, ResolvedConfig } from 'vite'
import type { RememberedCssSource } from './generate-bundle'
import type { SourceCandidateCollectorSnapshot } from './source-candidates'
import type { TailwindInlineSourceCandidates, TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { UserDefinedOptions } from '@/types'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import postcssHtmlTransform from '@weapp-tailwindcss/postcss/html-transform'
import { hasTailwindApplyDirective, normalizeTailwindConfigDirectives, normalizeTailwindSourceForGenerator } from '@/bundlers/shared/generator-css/directives'
import { vitePluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { toCustomAttributesEntities } from '@/context/custom-attributes'
import { createDebug } from '@/debug'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { normalizeCssEntries } from '@/tailwindcss/v4/css-entries'
import { hasConfiguredTailwindV4CssRoots, upsertTailwindV4CssSource } from '@/tailwindcss/v4/css-sources'
import { isUniAppXHarmonyOutDir } from '@/uni-app-x/harmony'
import { isUniAppXEnabled } from '@/uni-app-x/options'
import { createUniAppXPlugins } from '@/uni-app-x/vite'
import { resolveUniUtsPlatform } from '@/utils'
import { resolvePluginDisabledState } from '@/utils/disabled'
import { resolvePackageDir } from '@/utils/resolve-package'
import { createBundlerGeneratedCssMarker, hasBundlerGeneratedCssMarker } from '../shared/generated-css-marker'
import { generateCssByGenerator } from '../shared/generator-css'
import { createHmrTimingRecorder } from '../shared/hmr-timing'
import { normalizeOutputPathKey } from '../shared/module-graph'
import { isSourceStyleRequest, stripRequestQuery } from '../shared/style-requests'
import { createViteCssFinalizerOutputPlugin } from './css-finalizer'
import { createGenerateBundleHook, resolveViteCssPipelineOutputFile } from './generate-bundle'
import { createCssHandlerOptionsCache } from './generate-bundle/css-handler-options'
import { disableAndRemoveTailwindVitePlugins, getPostcssPluginName, removeTailwindPostcssPlugins, removeTailwindVitePlugins } from './official-tailwind-plugins'
import { resolveFilteredPostcssConfig } from './postcss-config'
import { parseVueRequest } from './query'
import { resolveImplicitAppTypeFromViteRoot } from './resolve-app-type'
import { createRewriteCssImportsPlugins, hasVitePipelineTailwindGenerationDirective } from './rewrite-css-imports'
import { createViteRuntimeClassSet } from './runtime-class-set'
import { createViteServeCssGenerationPlugins } from './serve-css-generation'
import { createSourceCandidateCollector, createTailwindV3DefaultExtractor, isSourceCandidateRequest } from './source-candidates'
import { createViteSourceScanMatcher, discoverTailwindV4CssEntries, resolveTailwindV4EntriesFromCssCached, resolveViteSourceScanEntries, resolveViteTailwindV4CssDependencies } from './source-scan'
import { resolveImplicitTailwindcssBasedirFromViteRoot } from './tailwind-basedir'
import { resolveUniAppXNativeCssHandlerOptions } from './uni-app-x-css-options'
import { cleanUrl, slash } from './utils'

const debug = createDebug()
const weappTailwindcssPackageDir = resolvePackageDir('weapp-tailwindcss')
const weappTailwindcssDirPosix = slash(weappTailwindcssPackageDir)
const sourceCandidateScanSnapshotCache = new Map<string, SourceCandidateCollectorSnapshot>()
const SFC_STYLE_BLOCK_RE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi
const SFC_COMPONENT_FILE_RE = /\.(?:vue|uvue|nvue|svelte|mpx)$/i

interface SourceCandidateScanRoot {
  root: string
  entries?: TailwindSourceEntry[] | undefined
  explicit?: boolean | undefined
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

function stripSourceHash(sourceFile: string) {
  const hashIndex = sourceFile.indexOf('#')
  return hashIndex === -1 ? sourceFile : sourceFile.slice(0, hashIndex)
}

function isMainStyleEntryFile(file: string) {
  const name = path.basename(stripRequestQuery(cleanUrl(file))).replace(/\.[^.]+$/, '')
  return name === 'app' || name === 'main'
}

function normalizeCssSourceIdentity(sourceFile: string) {
  const cleanSourceFile = stripSourceHash(sourceFile)
  const { filename, query } = parseVueRequest(cleanSourceFile)
  const normalizedFile = normalizeOutputPathKey(filename)
  if (query.type === 'style') {
    return `${normalizedFile}?type=style&index=${query.index ?? 0}`
  }
  return normalizeOutputPathKey(stripRequestQuery(cleanSourceFile))
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
  const normalizedCssEntries = normalizeCssEntries(options.cssEntries, opts.tailwindcssBasedir ?? process.cwd())
  if (normalizedCssEntries) {
    opts.cssEntries ??= normalizedCssEntries
  }
  if (opts.cssEntries?.length) {
    opts.tailwindcss ??= {}
    opts.tailwindcss.v4 ??= {}
    opts.tailwindcss.v4.cssEntries ??= opts.cssEntries
  }
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
  const syncTailwindCssSourceCandidates = async (id: string, css: string) => {
    await sourceCandidateCollector.syncCss(id, css)
    cacheCurrentSourceCandidateScan()
  }
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
    const dependencies = await resolveViteTailwindV4CssDependencies(sourceCss, sourceBase)
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
  let resolvedConfig: ResolvedConfig | undefined
  let recordedGeneratorCandidates: Set<string> | undefined
  const sourceCandidateExtractor = tailwindcssMajorVersion === 3
    ? createTailwindV3DefaultExtractor()
    : undefined
  const sourceCandidateCollector = createSourceCandidateCollector({
    bareArbitraryValues: opts.arbitraryValues?.bareArbitraryValues,
    extractor: sourceCandidateExtractor,
  })
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
  const viteProcessedCssSourceFiles = new Set<string>()
  const viteGeneratedCssByFile = new Map<string, string>()
  const viteProcessedCssAssetResults = new Map<string, { css: string, injectIntoMain?: boolean | undefined }>()
  const rememberedCssSources = new Map<string, RememberedCssSource>()
  const rememberedCssSignatureByFile = new Map<string, string>()
  const knownSfcSources = new Map<string, string>()
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
        explicit: sourceScanExplicit,
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
      return refreshRememberedCssSourceByCurrentFile(file)
    }
    if (sourceScanExplicit && sourceScanEntries?.length === 0) {
      cacheCurrentSourceCandidateScan()
      return refreshRememberedCssSourceByCurrentFile(file)
    }
    const existingTask = pendingSourceCandidateSyncByFile.get(file)
    if (existingTask) {
      return existingTask
        .then(() => refreshRememberedCssSourceByCurrentFile(file))
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
      .then(() => refreshRememberedCssSourceByCurrentFile(file))
      .then(() => undefined)
  }
  const shouldCollectTransformedSourceCandidates = (id: string) => {
    const queryIndex = id.search(/[?#]/)
    if (queryIndex < 0) {
      return true
    }
    const file = cleanUrl(id)
    return !SFC_COMPONENT_FILE_RE.test(file)
  }
  const hasSfcStyleBlocks = (source: string) => {
    SFC_STYLE_BLOCK_RE.lastIndex = 0
    return SFC_STYLE_BLOCK_RE.test(source)
  }
  const normalizeKnownSfcSourceKey = (file: string) => normalizeOutputPathKey(path.resolve(cleanUrl(file)))
  const rememberKnownSfcSource = (id: string, code: string) => {
    if (id.search(/[?#]/) >= 0) {
      return
    }
    const file = cleanUrl(id)
    if (!SFC_COMPONENT_FILE_RE.test(file)) {
      return
    }
    if (!hasSfcStyleBlocks(code)) {
      return
    }
    knownSfcSources.set(normalizeKnownSfcSourceKey(file), code)
  }
  const getKnownSfcSource = (file: string) => {
    const scanSource = sourceCandidateCollector.source(file)
    if (scanSource && hasSfcStyleBlocks(scanSource)) {
      return scanSource
    }
    return knownSfcSources.get(normalizeKnownSfcSourceKey(file))
  }
  const rememberCssSource = (entry: RememberedCssSource, cssRuntimeSignature?: string) => {
    const outputKey = normalizeOutputPathKey(entry.outputFile)
    const normalizedSourceFile = normalizeCssSourceIdentity(entry.sourceFile)
    const previousOutputEntry = rememberedCssSources.get(outputKey)
    const key = previousOutputEntry != null && normalizeCssSourceIdentity(previousOutputEntry.sourceFile) !== normalizedSourceFile
      ? `${outputKey}\0${normalizedSourceFile}`
      : outputKey
    const previous = rememberedCssSources.get(key)
    rememberedCssSources.set(key, entry)
    for (const [rememberedKey, remembered] of rememberedCssSources) {
      if (rememberedKey === key || normalizeCssSourceIdentity(remembered.sourceFile) !== normalizedSourceFile) {
        continue
      }
      rememberedCssSources.set(rememberedKey, {
        ...remembered,
        rawSource: entry.rawSource,
        sourceFile: entry.sourceFile,
      })
      rememberedCssSignatureByFile.delete(rememberedKey)
    }
    if (cssRuntimeSignature) {
      rememberedCssSignatureByFile.set(key, cssRuntimeSignature)
    }
    else if (previous?.rawSource !== entry.rawSource || previous?.sourceFile !== entry.sourceFile) {
      rememberedCssSignatureByFile.delete(key)
    }
  }
  const refreshRememberedCssSourceEntry = (
    rememberedKey: string,
    remembered: RememberedCssSource,
    sourceFile: string,
    rawSource: string,
  ) => {
    if (remembered.rawSource === rawSource && remembered.sourceFile === sourceFile) {
      return remembered
    }
    const nextRemembered = {
      ...remembered,
      rawSource,
      sourceFile,
    }
    rememberedCssSources.set(rememberedKey, nextRemembered)
    rememberedCssSignatureByFile.delete(rememberedKey)
    return nextRemembered
  }
  const refreshRememberedCssSourceBySourceFile = (sourceFile: string, rawSource: string) => {
    const normalizedSourceFile = normalizeCssSourceIdentity(sourceFile)
    for (const [rememberedKey, remembered] of rememberedCssSources) {
      if (normalizeCssSourceIdentity(remembered.sourceFile) !== normalizedSourceFile) {
        continue
      }
      refreshRememberedCssSourceEntry(rememberedKey, remembered, sourceFile, rawSource)
    }
  }
  const extractSfcStyleBlock = (source: string, index: number | undefined) => {
    const targetIndex = index ?? 0
    SFC_STYLE_BLOCK_RE.lastIndex = 0
    let currentIndex = 0
    let match = SFC_STYLE_BLOCK_RE.exec(source)
    while (match !== null) {
      if (currentIndex === targetIndex) {
        return match[1] ?? ''
      }
      currentIndex++
      match = SFC_STYLE_BLOCK_RE.exec(source)
    }
    return undefined
  }
  const extractSfcStyleSource = (source: string, index: number | undefined) => {
    if (index !== undefined) {
      return extractSfcStyleBlock(source, index)
    }
    const styleSources: string[] = []
    SFC_STYLE_BLOCK_RE.lastIndex = 0
    let match = SFC_STYLE_BLOCK_RE.exec(source)
    while (match !== null) {
      styleSources.push(match[1] ?? '')
      match = SFC_STYLE_BLOCK_RE.exec(source)
    }
    return styleSources.length > 0 ? styleSources.join('\n') : undefined
  }
  const resolveCachedStyleSource = (sourceFile: string) => {
    const file = cleanUrl(stripRequestQuery(sourceFile))
    if (SFC_COMPONENT_FILE_RE.test(file)) {
      return getKnownSfcSource(file)
    }
    if (isSourceStyleRequest(file)) {
      return sourceCandidateCollector.source(file)
    }
    return undefined
  }
  const refreshRememberedCssSourceByCurrentFile = async (sourceFile: string) => {
    const file = cleanUrl(sourceFile)
    const normalizedSourceFile = normalizeOutputPathKey(file)
    const matchedRememberedSources = [...rememberedCssSources.values()].filter(remembered =>
      normalizeOutputPathKey(stripRequestQuery(cleanUrl(remembered.sourceFile))) === normalizedSourceFile,
    )
    if (matchedRememberedSources.length === 0) {
      return
    }
    const source = resolveCachedStyleSource(file)
    if (source == null) {
      debug('refresh remembered css source skipped: missing cached source for %s', file)
      return
    }
    if (SFC_COMPONENT_FILE_RE.test(file)) {
      for (const remembered of matchedRememberedSources) {
        const { query } = parseVueRequest(remembered.sourceFile)
        const styleSource = extractSfcStyleSource(source, query.type === 'style' ? query.index : undefined)
        if (styleSource !== undefined) {
          refreshRememberedCssSourceBySourceFile(remembered.sourceFile, styleSource)
        }
      }
      return
    }
    if (isSourceStyleRequest(file)) {
      refreshRememberedCssSourceBySourceFile(file, source)
    }
  }
  const refreshRememberedCssSource = async (remembered: RememberedCssSource) => {
    const file = cleanUrl(stripRequestQuery(remembered.sourceFile))
    const rememberedKey = [...rememberedCssSources.entries()]
      .find(([, entry]) => entry === remembered)?.[0]
    if (!rememberedKey || !path.isAbsolute(file)) {
      return undefined
    }
    const source = resolveCachedStyleSource(file)
    if (source == null) {
      debug('refresh remembered css source before bundle replay skipped: missing cached source for %s', file)
      return undefined
    }
    if (SFC_COMPONENT_FILE_RE.test(file)) {
      const { query } = parseVueRequest(remembered.sourceFile)
      const styleSource = extractSfcStyleSource(source, query.type === 'style' ? query.index : undefined)
      return styleSource === undefined
        ? undefined
        : refreshRememberedCssSourceEntry(rememberedKey, remembered, remembered.sourceFile, styleSource)
    }
    if (isSourceStyleRequest(file)) {
      return refreshRememberedCssSourceEntry(rememberedKey, remembered, remembered.sourceFile, source)
    }
    return undefined
  }
  const getRememberedCssSources = () => rememberedCssSources
  const getRememberedCssSourceEntry = (file: string) => rememberedCssSources.get(normalizeOutputPathKey(file))
  const getRememberedCssSignature = (file: string) => rememberedCssSignatureByFile.get(normalizeOutputPathKey(file))
  const setRememberedCssSignature = (file: string, cssRuntimeSignature: string) => {
    rememberedCssSignatureByFile.set(normalizeOutputPathKey(file), cssRuntimeSignature)
  }
  const recordCssAssetResult = (file: string, css: string) => {
    viteGeneratedCssByFile.set(file, css)
  }
  const recordViteProcessedCssAssetResult = (
    file: string,
    css: string,
    options: { injectIntoMain?: boolean | undefined } = {},
  ) => {
    const key = normalizeOutputPathKey(file)
    const previous = viteProcessedCssAssetResults.get(key)
    viteProcessedCssAssetResults.set(key, {
      css,
      injectIntoMain: options.injectIntoMain ?? previous?.injectIntoMain,
    })
  }
  const getViteProcessedCssAssetResults = () => viteProcessedCssAssetResults.entries()
  const getViteProcessedCssAssetResult = (file: string) => viteProcessedCssAssetResults.get(normalizeOutputPathKey(file))
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
  const isHarmonyAppBuildTarget = () => {
    if (resolveUniUtsPlatform().isAppHarmony) {
      return true
    }
    return isUniAppXHarmonyOutDir(resolvedConfig?.build?.outDir)
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
    getExtraOptions: () => resolveUniAppXNativeCssHandlerOptions(opts),
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
    const rootDir = resolvedConfig?.root ? path.resolve(resolvedConfig.root) : process.cwd()
    const isHarmonyAppStyleTarget = isHarmonyAppBuildTarget()
    const isNativeAppStyleTarget = resolveUniUtsPlatform().isApp || isHarmonyAppStyleTarget
    const outputFile = resolveViteCssPipelineOutputFile(file, opts, rootDir, generatorOptions.target === 'web', isNativeAppStyleTarget)
    const runtime = getRecordedGeneratorCandidates()
      ?? getSourceCandidates()
      ?? await ensureRuntimeClassSet()
    const outputCssHandlerOptions = transformCssHandlerOptions.getCssHandlerOptions(outputFile)
    const cssHandlerOptions = {
      ...transformCssHandlerOptions.getCssHandlerOptions(file),
      isMainChunk: outputCssHandlerOptions.isMainChunk || isMainStyleEntryFile(file),
    }
    const shouldDeferEmptyScopedCssSource = !(
      opts.appType === 'uni-app-x'
      && !cssHandlerOptions.isMainChunk
      && hasTailwindApplyDirective(code)
    )
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
      deferEmptyScopedCssSource: shouldDeferEmptyScopedCssSource,
    })
    if (!generated) {
      return undefined
    }
    for (const dependency of generated.dependencies) {
      hookContext?.addWatchFile?.(dependency)
    }
    viteGeneratedCssByFile.set(file, generated.css)
    const shouldInjectGeneratedCssIntoMain = isMainStyleEntryFile(file)
      || mainCssChunkMatcher(outputFile, opts.appType)
    // 这里保留 undefined，让 app/main 入口走主样式注入判断；Tailwind 入口样式在 uni-app dev 中需要同步回 app.wxss。
    recordViteProcessedCssAssetResult(file, generated.css, {
      injectIntoMain: shouldInjectGeneratedCssIntoMain,
    })
    if (generated.css.includes('weapp-tailwindcss layer components start')) {
      recordViteProcessedCssAssetResult(file, generated.css, {
        injectIntoMain: shouldInjectGeneratedCssIntoMain,
      })
    }
    if (isNativeAppStyleTarget && outputFile.endsWith('.css')) {
      hookContext?.emitFile?.({
        type: 'asset',
        fileName: outputFile,
        source: generated.css,
      })
    }
    markViteProcessedCssSource(file)
    rememberTailwindRootCssModule(id)
    recordGeneratorCandidates(runtime)
    rememberCssSource({
      outputFile,
      rawSource: code,
      sourceFile: id,
    })
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
    onCssSourceTransform: (id, code) => refreshRememberedCssSourceBySourceFile(id, code),
    shouldGenerateCss: (_id, code) => hasVitePipelineTailwindGenerationDirective(code),
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
    getSourceCandidatesForEntries,
    waitForSourceCandidateSyncs,
    rememberCssSource,
    refreshRememberedCssSource,
    getRememberedCssSources,
    getRememberedCssSignature,
    setRememberedCssSignature,
    getKnownSfcSource,
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
    rememberMainCssSource: (file, rawSource) => rememberCssSource({
      outputFile: file,
      rawSource,
      sourceFile: file,
    }),
    getRememberedMainCssSource: getRememberedCssSourceEntry,
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
        generateCss: generateTailwindCssForVitePipeline,
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
        if (shouldOwnTailwindGeneration) {
          rememberKnownSfcSource(id, code)
        }
        if (!shouldOwnTailwindGeneration || !isSourceCandidateRequest(id) || !shouldCollectTransformedSourceCandidates(id)) {
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
          if (isSourceCandidateHotUpdate) {
            invalidateRecordedGeneratorCandidates()
          }
          const cssModules = resolveHotTailwindCssModules(ctx)
          if (
            isSourceCandidateHotUpdate
            && !isSourceStyleRequest(ctx.file)
            && (
              (!hasSelfAcceptingNonStyleHotModule(ctx.modules) && cssModules.length === 0)
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
      generateBundle: {
        order: 'post',
        handler: generateBundleHook,
      },
    },
  ]
  if (uniAppXPlugins) {
    plugins.push(...uniAppXPlugins)
  }
  plugins.push(cssFinalizerOutputPlugin)
  return plugins
}
