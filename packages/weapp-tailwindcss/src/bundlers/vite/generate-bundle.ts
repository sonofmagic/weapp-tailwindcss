import type { OutputAsset, OutputChunk } from 'rollup'
import type { ResolvedConfig } from 'vite'
import type { HmrTimingRecorder } from '../shared/hmr-timing'
import type { BundleSnapshot } from './bundle-state'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { InternalUserDefinedOptions, LinkedJsModuleResult } from '@/types'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import postcss from 'postcss'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { resolveTailwindV4CssSourceBase } from '@/tailwindcss/source-scan'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from '@/tailwindcss/v4-engine/candidates'
import { createUniAppXAssetTask } from '@/uni-app-x/vite'
import { resolveUniUtsPlatform } from '@/utils'
import { processCachedTask } from '../shared/cache'
import { stripBundlerGeneratedCssMarkers } from '../shared/generated-css-marker'
import { generateCssByGenerator, validateCandidatesByGenerator } from '../shared/generator-css'
import { hasTailwindApplyDirective, hasTailwindRootDirectives } from '../shared/generator-css/directives'
import { normalizeOutputPathKey } from '../shared/module-graph'
import { pushConcurrentTaskFactories } from '../shared/run-tasks'
import { createBundleModuleGraphOptions } from './bundle-entries'
import { buildBundleSnapshot, createBundleBuildState, updateBundleBuildState } from './bundle-state'
import { collectLegacyContainerCompatCandidates, collectUnescapedDynamicCandidates } from './generate-bundle/candidates'
import { createCssHandlerOptionsCache } from './generate-bundle/css-handler-options'
import { createCssRuntimeSignature, createCssTransformShareScopeKey } from './generate-bundle/css-share-scope'
import { hasOmittedKnownBundleFiles } from './generate-bundle/dirty-state'
import { createJsEntryResolver } from './generate-bundle/js-entries'
import { createJsHandlerOptionsFactory, resolveUniAppXJsTransformEnabled } from './generate-bundle/js-handler-options'
import { collectLinkedFileNames, createLinkedUpdateHelpers } from './generate-bundle/js-linking'
import { createEmptyMetrics, formatCacheHitRate, formatMs, measureElapsed } from './generate-bundle/metrics'
import { logBundleProcessPlan } from './generate-bundle/process-plan'
import { createReplayCssAsset, registerGeneratorDependencies } from './generate-bundle/rollup-assets'
import { createCandidateSignature, createJsHashSalt, createLinkedImpactSignature, getSnapshotHash, hasRuntimeAffectingSourceChanges, summarizeStringDiff } from './generate-bundle/signatures'
import { shouldSkipViteJsTransform } from './js-precheck'
import { collectViteProcessedCssAssetResults, injectViteProcessedCssIntoMainCssAssets } from './processed-css-assets'
import { createRuntimeAffectingSourceSignature } from './runtime-affecting-signature'
import { resolveTailwindV4EntriesFromCssCached } from './source-scan'
import { resolveUniAppXNativeCssHandlerOptions } from './uni-app-x-css-options'
import { isCSSRequest, slash } from './utils'

interface GenerateBundleContext {
  opts: InternalUserDefinedOptions
  runtimeState: {
    twPatcher: InternalUserDefinedOptions['twPatcher']
    readyPromise: Promise<void>
  }
  ensureRuntimeClassSet: (force?: boolean) => Promise<Set<string>>
  ensureBundleRuntimeClassSet: (
    snapshot: BundleSnapshot,
    forceRefresh?: boolean,
    options?: {
      allowBaselineOnlyInitialSync?: boolean | undefined
      baseClassSet?: Set<string> | undefined
      transformOnly?: boolean | undefined
    },
  ) => Promise<Set<string>>
  debug: (format: string, ...args: unknown[]) => void
  getResolvedConfig: () => ResolvedConfig | undefined
  markCssAssetProcessed?: (asset: OutputAsset, file?: string) => void
  isCssAssetProcessed?: (asset: OutputAsset, file?: string) => boolean
  isViteProcessedCssAsset?: (asset: OutputAsset, file?: string) => boolean
  recordCssAssetResult?: (file: string, css: string) => void
  recordViteProcessedCssAssetResult?: (file: string, css: string, options?: { injectIntoMain?: boolean | undefined }) => void
  getViteProcessedCssAssetResults?: () => Iterable<[string, string | { css: string, injectIntoMain?: boolean | undefined }]>
  getViteProcessedCssAssetResult?: (file: string) => { css: string, injectIntoMain?: boolean | undefined } | undefined
  getSourceCandidates?: () => Set<string>
  getSourceCandidatesForEntries?: ((entries: TailwindSourceEntry[] | undefined) => Set<string>) | undefined
  waitForSourceCandidateSyncs?: () => Promise<void>
  rememberCssSource?: (entry: RememberedCssSource, cssRuntimeSignature?: string) => void
  refreshRememberedCssSource?: (entry: RememberedCssSource) => Promise<RememberedCssSource | undefined> | RememberedCssSource | undefined
  getRememberedCssSources?: () => Iterable<[string, RememberedCssSource]>
  getRememberedCssSignature?: (file: string) => string | undefined
  setRememberedCssSignature?: (file: string, cssRuntimeSignature: string) => void
  recordGeneratorCandidates?: (candidates: Set<string>) => void
  hmrTimingRecorder?: HmrTimingRecorder
}

export interface RememberedCssSource {
  outputFile: string
  rawSource: string
  sourceFile: string
}

interface GenerateBundleThis {
  addWatchFile?: (id: string) => void
  emitFile?: (emittedFile: {
    type: 'asset'
    fileName: string
    source: string
  }) => string
}

function addSiblingCssFile(files: Set<string>, file: string) {
  if (file.endsWith('.wxml')) {
    files.add(file.replace(/\.wxml$/, '.wxss'))
  }
  else if (file.endsWith('.js')) {
    files.add(file.replace(/\.js$/, '.wxss'))
  }
}

function collectRuntimeLinkedCssFiles(snapshot: BundleSnapshot) {
  const files = new Set<string>()
  for (const file of snapshot.runtimeAffectingChangedByType.html) {
    addSiblingCssFile(files, file)
  }
  for (const file of snapshot.runtimeAffectingChangedByType.js) {
    addSiblingCssFile(files, file)
  }
  return files
}

export function resolveReplayCssOutputFile(rootDir: string, file: string) {
  const nextFile = path.isAbsolute(file) ? path.relative(rootDir, file) : file
  const normalizedFile = normalizeOutputPathKey(nextFile)
  if (
    normalizedFile.length === 0
    || normalizedFile === '.'
    || normalizedFile === '..'
    || normalizedFile.startsWith('../')
  ) {
    return normalizeOutputPathKey(path.basename(file))
  }
  return normalizedFile
}

const SOURCE_STYLE_OUTPUT_EXT_RE = /\.(?:less|sass|scss|styl|stylus|pcss|postcss)$/i
const CSS_SOURCE_OUTPUT_EXT_RE = /\.(?:css|less|sass|scss|styl|stylus|pcss|postcss)$/i
const MINI_PROGRAM_STYLE_OUTPUT_EXT_RE = /\.(?:wx|ac|jx|tt|q|ty)ss$/i
const SOURCE_STYLE_NON_CSS_SYNTAX_RE = /(?:^|\n)\s*(?:\/\/|\$[\w-]+\s*:|@(?:use|forward|mixin|include|function)\b)/

function resolveViteCssOutputFile(
  file: string,
  opts: InternalUserDefinedOptions,
  isWebGeneratorTarget: boolean,
) {
  if (
    isWebGeneratorTarget
    || opts.cssMatcher(file)
    || !SOURCE_STYLE_OUTPUT_EXT_RE.test(file)
    || !isCSSRequest(file)
  ) {
    return file
  }
  return file.replace(SOURCE_STYLE_OUTPUT_EXT_RE, '.wxss')
}

export function resolveViteCssPipelineOutputFile(
  file: string,
  _opts: Pick<InternalUserDefinedOptions, 'cssMatcher'>,
  rootDir: string,
  isWebGeneratorTarget = false,
  preserveCssExtension = false,
) {
  const normalizedFile = resolveReplayCssOutputFile(rootDir, file)
  if (
    isWebGeneratorTarget
    || preserveCssExtension
    || MINI_PROGRAM_STYLE_OUTPUT_EXT_RE.test(normalizedFile)
    || !CSS_SOURCE_OUTPUT_EXT_RE.test(normalizedFile)
    || !isCSSRequest(normalizedFile)
  ) {
    return normalizedFile
  }
  return normalizedFile.replace(CSS_SOURCE_OUTPUT_EXT_RE, '.wxss')
}

function canProcessViteSourceStyleAsCss(source: string, file: string) {
  if (SOURCE_STYLE_NON_CSS_SYNTAX_RE.test(source)) {
    return false
  }
  try {
    postcss.parse(source, { from: file })
    return true
  }
  catch {
    return false
  }
}

function isPackageJsonImportRequest(request: string) {
  return request.startsWith('#')
}

function normalizeMatchedCssSourcePath(file: string | undefined) {
  if (!file || !path.isAbsolute(file)) {
    return undefined
  }
  return path.resolve(file.replace(/[?#].*$/, ''))
}

function stripStyleFileExtension(file: string) {
  const normalized = file.replace(/[?#].*$/, '')
  const ext = path.extname(normalized)
  return ext ? normalized.slice(0, -ext.length) : normalized
}

function isAppOriginCssFile(file: string) {
  return path.basename(stripStyleFileExtension(file)) === 'app-origin'
}

function isMainAppCssFile(file: string) {
  return path.basename(stripStyleFileExtension(file)) === 'app'
}

function normalizeCssSourceForCompare(css: string) {
  return css.trim()
}

function createRememberedCssRuntimeSignature(cssRuntimeSignature: string, cssRuntimeAffectingHash: string) {
  return `${cssRuntimeSignature}:${cssRuntimeAffectingHash}`
}

async function createScopedGeneratorCandidateSignature(
  rawSource: string,
  sourceFile: string,
  fallbackSignature: string,
  getSourceCandidatesForEntries: ((entries: TailwindSourceEntry[] | undefined) => Set<string>) | undefined,
  options: { includeFallbackSignature?: boolean | undefined } = {},
) {
  if (!getSourceCandidatesForEntries || !rawSource.includes('@source')) {
    return fallbackSignature
  }
  const resolved = await resolveTailwindV4EntriesFromCssCached(
    rawSource,
    path.dirname(path.resolve(sourceFile.replace(/[?#].*$/, ''))),
  )
  if (resolved?.entries === undefined) {
    return fallbackSignature
  }
  const scopedSignature = createCandidateSignature(getSourceCandidatesForEntries(resolved.entries))
  return options.includeFallbackSignature === true
    ? `${scopedSignature}:${fallbackSignature}`
    : scopedSignature
}

function isMatchingCssSourceFile(
  outputFile: string,
  cssSourceFile: string,
  outputRoot: string,
) {
  const normalizedOutput = stripStyleFileExtension(path.resolve(outputRoot, outputFile))
  const normalizedSource = stripStyleFileExtension(path.resolve(cssSourceFile))
  return normalizedOutput === normalizedSource
}

function collectStyleFileMatchBases(file: string, roots: Array<string | undefined>) {
  const normalizedFile = file.replace(/[?#].*$/, '')
  const bases = new Set<string>()
  const addBase = (candidate: string) => {
    const base = slash(stripStyleFileExtension(candidate))
    if (base.length > 0) {
      bases.add(base)
    }
  }
  addBase(normalizedFile)

  const resolvedRoots = roots
    .filter((root): root is string => typeof root === 'string' && root.length > 0)
    .map(root => path.resolve(root))
  if (path.isAbsolute(normalizedFile)) {
    for (const root of resolvedRoots) {
      const relative = path.relative(root, normalizedFile)
      if (relative && !relative.startsWith('..') && !path.isAbsolute(relative)) {
        addBase(relative)
      }
    }
  }
  else {
    for (const root of resolvedRoots) {
      addBase(path.resolve(root, normalizedFile))
    }
  }
  return bases
}

function collectParentDirectories(file: string) {
  const directories: string[] = []
  let current = path.dirname(path.resolve(file.replace(/[?#].*$/, '')))
  while (true) {
    directories.push(current)
    const parent = path.dirname(current)
    if (parent === current) {
      break
    }
    current = parent
  }
  return directories
}

function hasMatchingStyleFileBase(outputFile: string, sourceFile: string, outputRoot: string, sourceRoot: string | undefined) {
  return scoreMatchingStyleFileBase(outputFile, sourceFile, outputRoot, sourceRoot) > 0
}

function scoreMatchingStyleFileBase(outputFile: string, sourceFile: string, outputRoot: string, sourceRoot: string | undefined) {
  const outputBases = collectStyleFileMatchBases(outputFile, [outputRoot])
  const sourceBases = collectStyleFileMatchBases(sourceFile, [
    sourceRoot,
    ...collectParentDirectories(sourceFile),
  ])
  let bestScore = 0
  for (const outputBase of outputBases) {
    for (const sourceBase of sourceBases) {
      if (outputBase === sourceBase) {
        bestScore = Math.max(bestScore, 100000 + outputBase.length)
      }
      else if (outputBase.endsWith(`/${sourceBase}`)) {
        bestScore = Math.max(bestScore, 50000 + sourceBase.length)
      }
      else if (sourceBase.endsWith(`/${outputBase}`)) {
        bestScore = Math.max(bestScore, 1000 + outputBase.length)
      }
    }
  }
  return bestScore
}

export function resolveRememberedCssSourceForTest(
  sources: Iterable<[string, RememberedCssSource]> | undefined,
  outputFile: string,
  file: string,
  originalSource: OutputAsset,
  outputRoot: string,
  sourceRoot: string | undefined,
) {
  return findRememberedCssSource(sources, outputFile, file, originalSource, outputRoot, sourceRoot)
}

function findRememberedCssSource(
  sources: Iterable<[string, RememberedCssSource]> | undefined,
  outputFile: string,
  file: string,
  originalSource: OutputAsset,
  outputRoot: string,
  sourceRoot: string | undefined,
) {
  if (!sources) {
    return undefined
  }
  const rememberedSources = [...sources].map(([, remembered]) => remembered)
  const originalFiles = [
    file,
    originalSource.originalFileName,
    ...(originalSource.originalFileNames ?? []),
  ].filter((item): item is string => typeof item === 'string' && item.length > 0)

  const sourceMatched = rememberedSources.find(remembered =>
    originalFiles.some(originalFile => normalizeOutputPathKey(remembered.sourceFile) === normalizeOutputPathKey(originalFile)),
  )
  if (sourceMatched) {
    return sourceMatched
  }

  const outputMatched = rememberedSources.find(remembered =>
    normalizeOutputPathKey(remembered.outputFile) === normalizeOutputPathKey(outputFile),
  )
  if (outputMatched) {
    return outputMatched
  }

  const scoredMatches = rememberedSources
    .filter(remembered => !(isMainAppCssFile(outputFile) && isAppOriginCssFile(remembered.outputFile)))
    .map(remembered => ({
      remembered,
      score: Math.max(
        scoreMatchingStyleFileBase(outputFile, remembered.sourceFile, outputRoot, sourceRoot),
        scoreMatchingStyleFileBase(outputFile, remembered.outputFile, outputRoot, sourceRoot),
      ),
    }))
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score)
  const bestScore = scoredMatches[0]?.score
  return bestScore && scoredMatches.filter(match => match.score === bestScore).length === 1
    ? scoredMatches[0]?.remembered
    : undefined
}

function collectConfiguredTailwindV4CssSources(opts: InternalUserDefinedOptions) {
  const patcherCssSources = ((opts.tailwindcssPatcherOptions as any)?.tailwindcss?.v4?.cssSources ?? []) as NonNullable<NonNullable<InternalUserDefinedOptions['tailwindcss']>['v4']>['cssSources'] | undefined
  return [
    ...(opts.tailwindcss?.v4?.cssSources ?? []),
    ...(patcherCssSources ?? []),
  ]
}

function collectConfiguredCssEntries(opts: InternalUserDefinedOptions) {
  const patcherCssEntries = ((opts.tailwindcssPatcherOptions as any)?.tailwindcss?.v4?.cssEntries ?? []) as string[] | undefined
  return [
    ...(opts.cssEntries ?? []),
    ...(opts.tailwindcss?.v4?.cssEntries ?? []),
    ...(patcherCssEntries ?? []),
  ].filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
}

function collectCssConfigBaseCandidates(
  source: string,
  file: string,
  outputRoot: string,
  opts: InternalUserDefinedOptions,
) {
  const candidates: string[] = []
  const seen = new Set<string>()
  const addCandidate = (candidate: string | undefined) => {
    if (!candidate) {
      return
    }
    const normalized = path.resolve(candidate)
    if (seen.has(normalized)) {
      return
    }
    seen.add(normalized)
    candidates.push(normalized)
  }

  addCandidate(path.dirname(path.resolve(outputRoot, file.replace(/[?#].*$/, ''))))

  const normalizedSource = normalizeCssSourceForCompare(source)
  const patcherProjectRoot = typeof opts.tailwindcssPatcherOptions?.projectRoot === 'string'
    ? opts.tailwindcssPatcherOptions.projectRoot
    : undefined
  const sourceBaseFallback = opts.tailwindcss?.v4?.base
    ?? patcherProjectRoot
    ?? opts.tailwindcssBasedir
    ?? outputRoot
  const sourceRoot = opts.tailwindcssBasedir ?? patcherProjectRoot
  const configuredCssEntries = collectConfiguredCssEntries(opts)
  for (const cssEntry of configuredCssEntries) {
    const resolvedCssEntry = path.resolve(cssEntry)
    if (
      configuredCssEntries.length === 1
      || isMatchingCssSourceFile(file, resolvedCssEntry, outputRoot)
      || hasMatchingStyleFileBase(file, resolvedCssEntry, outputRoot, sourceRoot)
    ) {
      addCandidate(path.dirname(resolvedCssEntry))
    }
  }
  for (const cssSource of collectConfiguredTailwindV4CssSources(opts)) {
    const cssSourceFile = normalizeMatchedCssSourcePath(cssSource.file)
    const cssSourceCss = typeof cssSource.css === 'string'
      ? normalizeCssSourceForCompare(cssSource.css)
      : undefined
    if (
      cssSourceFile
      && !isMatchingCssSourceFile(file, cssSourceFile, outputRoot)
      && cssSourceCss !== normalizedSource
    ) {
      continue
    }
    addCandidate(cssSourceFile ? path.dirname(cssSourceFile) : undefined)
    addCandidate(resolveTailwindV4CssSourceBase(cssSource, sourceBaseFallback))
  }

  return candidates
}

function normalizeRelativeCssConfigDirectives(
  source: string,
  file: string,
  outputRoot: string,
  opts: InternalUserDefinedOptions,
) {
  if (!source.includes('@config')) {
    return source
  }

  const baseCandidates = collectCssConfigBaseCandidates(source, file, outputRoot, opts)

  return source.replace(/@config\s+(["'])(.+?)\1\s*;?/g, (full, quote: string, request: string) => {
    if (path.isAbsolute(request) || isPackageJsonImportRequest(request)) {
      return full
    }

    for (const base of baseCandidates) {
      const configFile = path.resolve(base, request)
      if (existsSync(configFile)) {
        return `@config ${quote}${slash(configFile)}${quote};`
      }
    }

    return full
  })
}

export function createGenerateBundleHook(context: GenerateBundleContext) {
  const state = createBundleBuildState()
  const lastCssResultByFile = new Map<string, string>()
  let currentOutDir: string | undefined
  const cssHandlerOptions = createCssHandlerOptionsCache({
    getAppType: () => context.opts.appType,
    mainCssChunkMatcher: context.opts.mainCssChunkMatcher,
    getMajorVersion: () => context.runtimeState.twPatcher.majorVersion,
    getOutputRoot: () => currentOutDir,
    getExtraOptions: () => resolveUniAppXNativeCssHandlerOptions(context.opts),
  })
  return async function generateBundle(this: GenerateBundleThis, _opt: unknown, bundle: Record<string, OutputAsset | OutputChunk>) {
    const addWatchFile = (id: string) => this.addWatchFile?.(id)
    const {
      opts,
      runtimeState,
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
      recordGeneratorCandidates,
      hmrTimingRecorder,
    } = context
    const {
      cache,
      onEnd,
      onStart,
      onUpdate,
      styleHandler,
      templateHandler,
      jsHandler,
      uniAppX,
    } = opts
    const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(opts.generator)
    const isWebGeneratorTarget = generatorOptions.target === 'web'
    const isNativeAppStyleTarget = resolveUniUtsPlatform().isApp
    const shouldGenerateWebCssByGenerator = isWebGeneratorTarget && runtimeState.twPatcher.majorVersion === 3
    const { getCssHandlerOptions, getCssUserHandlerOptions } = cssHandlerOptions
    const resolvedConfig = getResolvedConfig()
    const rootDir = resolvedConfig?.root ? path.resolve(resolvedConfig.root) : process.cwd()
    const outDir = resolvedConfig?.build?.outDir
      ? path.resolve(rootDir, resolvedConfig.build.outDir)
      : rootDir

    await runtimeState.readyPromise
    debug('start')
    onStart()
    collectViteProcessedCssAssetResults(bundle, {
      opts,
      isViteProcessedCssAsset,
      markCssAssetProcessed,
      recordCssAssetResult,
      recordViteProcessedCssAssetResult,
      resolveViteProcessedCssOutputFile: file => resolveViteCssPipelineOutputFile(file, opts, rootDir, isWebGeneratorTarget, isNativeAppStyleTarget),
      debug,
    })
    const hmrTimingStartedAt = performance.now()
    const timingDetails: Record<string, number> = {}
    const recordTimingDetail = (name: string, startedAt: number) => {
      timingDetails[name] = (timingDetails[name] ?? 0) + Math.max(0, performance.now() - startedAt)
    }
    const timeTask = async (name: string, task: () => Promise<void>) => {
      const start = performance.now()
      try {
        await task()
      }
      finally {
        recordTimingDetail(`tasks.${name}`, start)
      }
    }

    const metrics = createEmptyMetrics()
    const forceRuntimeRefreshByEnv = process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH'] === '1'
    const disableDirtyOptimization = process.env['WEAPP_TW_VITE_DISABLE_DIRTY'] === '1'
    const disableJsPrecheck = process.env['WEAPP_TW_VITE_DISABLE_JS_PRECHECK'] === '1'
    const debugCssDiff = process.env['WEAPP_TW_VITE_DEBUG_CSS_DIFF'] === '1'
    const disableV3OxideSourceRuntime = process.env['WEAPP_TW_VITE_DISABLE_V3_OXIDE_RUNTIME'] === '1'
    const bundleFiles = Object.keys(bundle)
    const buildCommand = resolvedConfig?.command === 'build'
    const hasPreviousBundleState = state.iteration > 0 || state.sourceHashByFile.size > 0
    const hasOmittedKnownFiles = hasOmittedKnownBundleFiles(bundleFiles, state.sourceHashByFile.keys())
    // uni-app vite 的 dev 流程可能以 command=build 驱动 generateBundle，
    // 后续轮次可能回传完整 bundle 或脏文件子集；只要同一插件实例已有状态，
    // 就按增量处理，避免候选变化时把未改动的分包 CSS 全量重生成。
    const useIncrementalMode = !buildCommand
      || hasPreviousBundleState
      || hasOmittedKnownFiles
    currentOutDir = outDir
    const snapshotStart = performance.now()
    const snapshot = buildBundleSnapshot(bundle, opts, outDir, state, disableDirtyOptimization || !useIncrementalMode, {
      hasOmittedKnownFiles,
    })
    recordTimingDetail('snapshot', snapshotStart)
    const useBundleRuntimeClassSet = !isWebGeneratorTarget && (useIncrementalMode || runtimeState.twPatcher.majorVersion === 4)
    const forceRuntimeRefreshBySource = useIncrementalMode
      && hasRuntimeAffectingSourceChanges(snapshot.runtimeAffectingChangedByType)
    const processFiles = snapshot.processFiles
    logBundleProcessPlan({
      debug,
      snapshot,
      useIncrementalMode,
      iteration: state.iteration + 1,
    })
    const sourceCandidateWaitStart = performance.now()
    await waitForSourceCandidateSyncs?.()
    recordTimingDetail('sourceCandidates.wait', sourceCandidateWaitStart)
    const sourceCandidates = getSourceCandidates?.() ?? new Set<string>()
    const jsEntries = snapshot.jsEntries
    const getJsEntry = createJsEntryResolver(jsEntries)
    const moduleGraphOptions = createBundleModuleGraphOptions(outDir, jsEntries)
    const hasCssAssetEntry = snapshot.entries.some(entry => entry.type === 'css' && entry.output.type === 'asset')
    const hasRuntimeAffectingChanges = hasRuntimeAffectingSourceChanges(snapshot.runtimeAffectingChangedByType)
    const useV3OxideSourceRuntime = runtimeState.twPatcher.majorVersion === 3
      && sourceCandidates.size > 0
      && hasCssAssetEntry
      && !forceRuntimeRefreshByEnv
      && !disableV3OxideSourceRuntime
    const runtimeStart = performance.now()
    const transformBaseRuntime = useV3OxideSourceRuntime
      ? await ensureBundleRuntimeClassSet(snapshot, forceRuntimeRefreshByEnv, {
          transformOnly: true,
        })
      : undefined
    const runtime = isWebGeneratorTarget && !shouldGenerateWebCssByGenerator
      ? new Set<string>()
      : useV3OxideSourceRuntime
        ? await ensureBundleRuntimeClassSet(snapshot, forceRuntimeRefreshByEnv, {
            allowBaselineOnlyInitialSync: true,
            baseClassSet: sourceCandidates,
          })
        : useBundleRuntimeClassSet
          ? await ensureBundleRuntimeClassSet(snapshot, forceRuntimeRefreshByEnv, {
              allowBaselineOnlyInitialSync: buildCommand,
            })
          : await context.ensureRuntimeClassSet(forceRuntimeRefreshByEnv)
    if (useV3OxideSourceRuntime) {
      debug(
        '[tailwindcss:v3] use oxide source candidates as runtime input, candidates=%d',
        sourceCandidates.size,
      )
    }
    const shouldFilterTailwindV4MiniProgramCandidates = runtimeState.twPatcher.majorVersion === 4 && generatorOptions.target === 'weapp'
    const collectedGeneratorCandidates = new Set([...runtime, ...sourceCandidates])
    const filteredGeneratorCandidates = shouldFilterTailwindV4MiniProgramCandidates
      ? filterUnsupportedMiniProgramTailwindV4Candidates(collectedGeneratorCandidates)
      : collectedGeneratorCandidates
    let transformRuntime = transformBaseRuntime ?? runtime
    let generatorRuntime = collectLegacyContainerCompatCandidates(
      sourceCandidates,
      runtimeState.twPatcher.majorVersion === 3 && hasRuntimeAffectingChanges && transformBaseRuntime
        ? new Set([
            ...filteredGeneratorCandidates,
            ...transformBaseRuntime,
          ])
        : filteredGeneratorCandidates,
    )
    const cssEntries = snapshot.entries.filter(entry =>
      entry.type === 'css' && entry.output.type === 'asset')
    const shouldValidateV3GeneratorRuntime = runtimeState.twPatcher.majorVersion === 3
      && useV3OxideSourceRuntime
      && generatorRuntime.size > 0
      && (state.iteration === 0 || !hasRuntimeAffectingChanges)
      && cssEntries.length <= 1
    if (shouldValidateV3GeneratorRuntime) {
      const mainCssEntry = cssEntries.find(entry => getCssHandlerOptions(entry.file).isMainChunk) ?? cssEntries[0]
      if (mainCssEntry) {
        const validatedRuntime = await validateCandidatesByGenerator({
          opts,
          runtimeState,
          candidates: generatorRuntime,
          rawSource: mainCssEntry.source,
          file: mainCssEntry.file,
          cssHandlerOptions: getCssHandlerOptions(mainCssEntry.file),
          cssUserHandlerOptions: getCssUserHandlerOptions(mainCssEntry.file),
          styleHandler,
          debug,
        })
        if (validatedRuntime.size > 0) {
          generatorRuntime = collectLegacyContainerCompatCandidates(
            sourceCandidates,
            validatedRuntime,
          )
          transformRuntime = generatorRuntime
        }
        else {
          generatorRuntime = validatedRuntime
          transformRuntime = validatedRuntime
        }
      }
    }
    const generatorCandidateSignature = createCandidateSignature(generatorRuntime)
    const generatorCandidatesChanged = state.generatorCandidateSignature !== generatorCandidateSignature
    const runtimeLinkedCssFiles = collectRuntimeLinkedCssFiles(snapshot)
    recordGeneratorCandidates?.(generatorRuntime)
    const dynamicRetryCandidates = new Set([
      ...sourceCandidates,
      ...generatorRuntime,
      ...transformRuntime,
    ])
    const defaultTemplateHandlerOptions = {
      runtimeSet: transformRuntime,
    }
    metrics.runtimeSet = measureElapsed(runtimeStart)
    timingDetails['runtime'] = metrics.runtimeSet
    if (forceRuntimeRefreshBySource) {
      debug(
        'runtimeSet forced refresh due to source changes: html=%d js=%d',
        snapshot.runtimeAffectingChangedByType.html.size,
        snapshot.runtimeAffectingChangedByType.js.size,
      )
    }
    debug('get runtimeSet, class count: %d, transform class count: %d', runtime.size, transformRuntime.size)
    const runtimeSignature = getRuntimeClassSetSignature(runtimeState.twPatcher) ?? 'runtime:missing'
    const shouldProcessTailwindGeneration = !useIncrementalMode
      || hasRuntimeAffectingChanges
      || generatorCandidatesChanged
      || snapshot.processFiles.css.size > 0
    const { applyLinkedUpdates, pendingLinkedUpdates } = createLinkedUpdateHelpers({
      jsEntries,
      onUpdate,
      debug,
    })
    const createHandlerOptions = createJsHandlerOptionsFactory({
      getMajorVersion: () => runtimeState.twPatcher.majorVersion,
      moduleGraph: moduleGraphOptions,
    })

    const linkedByEntry = useIncrementalMode ? new Map<string, Set<string>>() : undefined
    const sharedCssResultCache = new Map<string, Promise<string>>()
    const tasks: Promise<void>[] = []
    const jsTaskFactories: Array<() => Promise<void>> = []

    for (const entry of snapshot.entries) {
      const { file, output: originalSource, source: originalEntrySource, type } = entry

      if (type === 'html' && originalSource.type === 'asset') {
        metrics.html.total++
        if (isWebGeneratorTarget) {
          debug('html skip web target: %s', file)
          continue
        }
        if (!processFiles.html.has(file)) {
          continue
        }
        const rawSource = originalEntrySource
        tasks.push(timeTask('html', () =>
          processCachedTask<string>({
            cache,
            cacheKey: file,
            hashKey: `${file}:html:${runtimeSignature}`,
            hash: getSnapshotHash(snapshot.sourceHashByFile, file, rawSource),
            applyResult(source) {
              originalSource.source = source
            },
            onCacheHit() {
              metrics.html.cacheHits++
              debug('html cache hit: %s', file)
            },
            async transform() {
              const start = performance.now()
              let transformed = await templateHandler(rawSource, defaultTemplateHandlerOptions)
              let unresolvedDynamicCandidates = collectUnescapedDynamicCandidates(transformed)
              let retryRuntimeSet: Set<string> | undefined

              if (unresolvedDynamicCandidates.length > 0) {
                const fullRuntimeSet = await context.ensureRuntimeClassSet(true)
                const allowedRetryCandidates = fullRuntimeSet.size === 0
                  ? unresolvedDynamicCandidates
                  : unresolvedDynamicCandidates.filter(candidate => dynamicRetryCandidates.has(candidate) || fullRuntimeSet.has(candidate))
                retryRuntimeSet = new Set([
                  ...fullRuntimeSet,
                  ...allowedRetryCandidates,
                ])
                unresolvedDynamicCandidates = unresolvedDynamicCandidates.filter(candidate => retryRuntimeSet?.has(candidate) === true)
              }

              if (retryRuntimeSet && unresolvedDynamicCandidates.length > 0) {
                logger.warn(
                  '检测到已提取 WXML 动态类名未完成转译，已回退到完整 runtimeSet 重试: %s -> %O',
                  file,
                  unresolvedDynamicCandidates,
                )
                transformed = await templateHandler(rawSource, {
                  runtimeSet: retryRuntimeSet,
                })
                unresolvedDynamicCandidates = collectUnescapedDynamicCandidates(transformed, retryRuntimeSet)
                if (unresolvedDynamicCandidates.length > 0) {
                  logger.warn(
                    '已提取 WXML 动态类名在完整 runtimeSet 重试后仍未完成转译: %s -> %O',
                    file,
                    unresolvedDynamicCandidates,
                  )
                }
              }
              metrics.html.elapsed += measureElapsed(start)
              metrics.html.transformed++
              onUpdate(file, rawSource, transformed)
              debug('html handle: %s', file)
              return {
                result: transformed,
              }
            },
          })))
        continue
      }

      if (type === 'css' && originalSource.type === 'asset') {
        metrics.css.total++
        // uni-app dev/watch 会在每轮产物阶段重写 app.wxss。
        // 即便本轮 CSS 原文 hash 未变化，也必须回填缓存中的转译结果，
        // 否则会退回未转译内容并与同轮 JS/WXML 的 class 改写失配。
        const rawSource = normalizeRelativeCssConfigDirectives(originalEntrySource, file, outDir, opts)
        const outputFile = resolveViteCssOutputFile(file, opts, isWebGeneratorTarget)
        if (outputFile !== file && !canProcessViteSourceStyleAsCss(rawSource, file)) {
          delete bundle[file]
          debug('css skip raw source style asset: %s -> %s', file, outputFile)
          continue
        }
        const applyCssResult = (source: string) => {
          if (outputFile !== file) {
            delete bundle[file]
            if (typeof this.emitFile === 'function') {
              this.emitFile({
                type: 'asset',
                fileName: outputFile,
                source,
              })
            }
            else {
              bundle[outputFile] = createReplayCssAsset(outputFile, source)
            }
            originalSource.fileName = outputFile
          }
          originalSource.source = source
        }
        if (isWebGeneratorTarget && !shouldGenerateWebCssByGenerator) {
          applyCssResult(rawSource)
          markCssAssetProcessed?.(originalSource, outputFile)
          onUpdate(outputFile, rawSource, rawSource)
          debug('css skip web target: %s', outputFile)
          continue
        }
        const hasViteProcessedCssRecord = getViteProcessedCssAssetResult?.(file) != null
        const viteProcessedCssAsset = isViteProcessedCssAsset?.(originalSource, file) === true || hasViteProcessedCssRecord
        const cssAssetProcessed = isCssAssetProcessed?.(originalSource, file) === true
        const alreadyProcessedCssAsset = viteProcessedCssAsset || cssAssetProcessed
        let rememberedCssSource = findRememberedCssSource(
          getRememberedCssSources?.(),
          outputFile,
          file,
          originalSource,
          outDir,
          opts.tailwindcssBasedir,
        )
        if (rememberedCssSource != null) {
          rememberedCssSource = await refreshRememberedCssSource?.(rememberedCssSource) ?? rememberedCssSource
        }
        const useRememberedCssSource = rememberedCssSource != null
          && normalizeOutputPathKey(rememberedCssSource.sourceFile) !== normalizeOutputPathKey(file)
        const vitePipelineCssAsset = viteProcessedCssAsset || useRememberedCssSource
        const generatorRawSource = vitePipelineCssAsset
          ? rememberedCssSource?.rawSource ?? rawSource
          : rawSource
        const hasRememberedApplySource = vitePipelineCssAsset
          && rememberedCssSource != null
          && hasTailwindApplyDirective(generatorRawSource)
        const hasDifferentRememberedCssSource = rememberedCssSource != null
          && normalizeCssSourceForCompare(rememberedCssSource.rawSource) !== normalizeCssSourceForCompare(rawSource)
        const hasCurrentTailwindGenerationDirective = hasTailwindRootDirectives(rawSource, { importFallback: true })
          || hasTailwindApplyDirective(rawSource)
        const hasRememberedApplyDirective = rememberedCssSource != null
          && hasTailwindApplyDirective(rememberedCssSource.rawSource)
        const hasStaleViteProcessedCssSource = vitePipelineCssAsset
          && hasDifferentRememberedCssSource
          && (hasCurrentTailwindGenerationDirective || hasRememberedApplyDirective)
        const generatorSourceFile = vitePipelineCssAsset
          ? rememberedCssSource?.sourceFile ?? file
          : file
        const outputCssHandlerOptions = getCssHandlerOptions(outputFile)
        const cssHandlerOptions = vitePipelineCssAsset
          ? {
              ...getCssHandlerOptions(generatorSourceFile),
              isMainChunk: outputCssHandlerOptions.isMainChunk || isAppOriginCssFile(file),
            }
          : getCssHandlerOptions(file)
        const generatorCssUserHandlerOptions = getCssUserHandlerOptions(generatorSourceFile)
        const cssRuntimeAffectingSignature = vitePipelineCssAsset
          ? createRuntimeAffectingSourceSignature(generatorRawSource, 'css')
          : snapshot.runtimeAffectingSignatureByFile.get(file)
            ?? createRuntimeAffectingSourceSignature(generatorRawSource, 'css')
        const cssRuntimeAffectingHash = vitePipelineCssAsset
          ? cache.computeHash(cssRuntimeAffectingSignature)
          : snapshot.runtimeAffectingHashByFile.get(file)
            ?? cache.computeHash(cssRuntimeAffectingSignature)
        const cssShareScope = createCssTransformShareScopeKey(opts, generatorSourceFile, generatorRawSource)
        const shouldRegenerateAppOriginCss = viteProcessedCssAsset && isAppOriginCssFile(file)
        const shouldTrackGeneratorRuntime = hasStaleViteProcessedCssSource
          || (shouldProcessTailwindGeneration && (
            !useIncrementalMode
            || cssHandlerOptions.isMainChunk
            || processFiles.css.has(file)
            || runtimeLinkedCssFiles.has(file)
            || shouldRegenerateAppOriginCss
          ))
        const canRegenerateProcessedMainCss = cssHandlerOptions.isMainChunk
          && (
            getViteProcessedCssAssetResult?.(file)?.injectIntoMain === true
            || shouldRegenerateAppOriginCss
          )
        if (alreadyProcessedCssAsset && !hasStaleViteProcessedCssSource && !hasRememberedApplySource && (!shouldTrackGeneratorRuntime || !canRegenerateProcessedMainCss)) {
          const nextCss = stripBundlerGeneratedCssMarkers(rawSource)
          applyCssResult(nextCss)
          markCssAssetProcessed?.(originalSource, outputFile)
          recordCssAssetResult?.(outputFile, nextCss)
          onUpdate(outputFile, rawSource, nextCss)
          debug('css skip vite-processed asset: %s', outputFile)
          continue
        }
        const trackedGeneratorCandidateSignature = shouldTrackGeneratorRuntime
          ? generatorCandidateSignature
          : 'generator:stable'
        const scopedGeneratorCandidateSignature = shouldTrackGeneratorRuntime
          ? await createScopedGeneratorCandidateSignature(
              generatorRawSource,
              generatorSourceFile,
              trackedGeneratorCandidateSignature,
              getSourceCandidatesForEntries,
              {
                includeFallbackSignature: cssHandlerOptions.isMainChunk,
              },
            )
          : trackedGeneratorCandidateSignature
        const cssRuntimeSignature = createCssRuntimeSignature(runtimeSignature, scopedGeneratorCandidateSignature)
        const rememberedCssRuntimeSignature = createRememberedCssRuntimeSignature(cssRuntimeSignature, cssRuntimeAffectingHash)
        const cssSharedCacheKey = `${cssShareScope}:${cssRuntimeSignature}:${runtimeState.twPatcher.majorVersion ?? 'unknown'}:${cssHandlerOptions.isMainChunk ? '1' : '0'}:${cssRuntimeAffectingSignature}`
        if (!shouldTrackGeneratorRuntime) {
          const lastCss = lastCssResultByFile.get(outputFile) ?? lastCssResultByFile.get(file)
          if (lastCss != null) {
            applyCssResult(lastCss)
            markCssAssetProcessed?.(originalSource, outputFile)
            metrics.css.cacheHits++
            debug('css replay last result: %s', outputFile)
            continue
          }
        }
        tasks.push(timeTask('css', () =>
          processCachedTask<string>({
            cache,
            cacheKey: file,
            hashKey: `${file}:css:${cssRuntimeSignature}:${runtimeState.twPatcher.majorVersion ?? 'unknown'}`,
            hash: `${cssRuntimeAffectingHash}:${scopedGeneratorCandidateSignature}`,
            applyResult(source) {
              applyCssResult(source)
              lastCssResultByFile.set(outputFile, source)
              markCssAssetProcessed?.(originalSource, outputFile)
              rememberCssSource?.({
                outputFile,
                rawSource: generatorRawSource,
                sourceFile: generatorSourceFile,
              }, rememberedCssRuntimeSignature)
            },
            onCacheHit() {
              metrics.css.cacheHits++
              debug('css cache hit: %s', file)
            },
            async transform() {
              if (cssSharedCacheKey) {
                const sharedCssTask = sharedCssResultCache.get(cssSharedCacheKey)
                if (sharedCssTask != null) {
                  metrics.css.cacheHits++
                  debug('css shared hit: %s', file)
                  const sharedCss = await sharedCssTask
                  onUpdate(file, rawSource, sharedCss)
                  return {
                    result: sharedCss,
                  }
                }
              }
              const runTransform = async () => {
                const start = performance.now()
                await runtimeState.readyPromise
                const previousCss = !vitePipelineCssAsset && useIncrementalMode && !hasRuntimeAffectingChanges && !snapshot.changedByType.css.has(file)
                  ? lastCssResultByFile.get(outputFile) ?? lastCssResultByFile.get(file)
                  : undefined
                const generated = await generateCssByGenerator({
                  opts,
                  runtimeState,
                  runtime: generatorRuntime,
                  rawSource: generatorRawSource,
                  file: generatorSourceFile,
                  cssHandlerOptions,
                  cssUserHandlerOptions: generatorCssUserHandlerOptions,
                  getSourceCandidatesForEntries,
                  styleHandler,
                  debug,
                  previousCss,
                })
                if (generated) {
                  registerGeneratorDependencies({ addWatchFile }, generated.dependencies)
                  if (debugCssDiff) {
                    debug('css diff %s: %s', generatorSourceFile, summarizeStringDiff(generatorRawSource, generated.css))
                  }
                  debug('css generated result: %s bytes=%d', file, generated.css.length)
                  recordCssAssetResult?.(outputFile, generated.css)
                  if (vitePipelineCssAsset && cssHandlerOptions.isMainChunk) {
                    recordViteProcessedCssAssetResult?.(file, generated.css, {
                      injectIntoMain: !isAppOriginCssFile(file),
                    })
                  }
                  if (vitePipelineCssAsset) {
                    recordViteProcessedCssAssetResult?.(outputFile, generated.css, {
                      injectIntoMain: false,
                    })
                  }
                  metrics.css.elapsed += measureElapsed(start)
                  metrics.css.transformed++
                  debug('css handle via tailwind v%s engine(%s): %s', runtimeState.twPatcher.majorVersion, generated.target, outputFile)
                  return generated.css
                }
                if (isWebGeneratorTarget) {
                  metrics.css.elapsed += measureElapsed(start)
                  metrics.css.transformed++
                  debug('css preserve web target: %s', outputFile)
                  return rawSource
                }
                const { css } = await styleHandler(generatorRawSource, cssHandlerOptions)
                if (debugCssDiff) {
                  debug('css diff %s: %s', generatorSourceFile, summarizeStringDiff(generatorRawSource, css))
                }
                metrics.css.elapsed += measureElapsed(start)
                metrics.css.transformed++
                return css
              }

              const cssTask = cssSharedCacheKey
                ? sharedCssResultCache.get(cssSharedCacheKey) ?? runTransform()
                : runTransform()

              if (cssSharedCacheKey && !sharedCssResultCache.has(cssSharedCacheKey)) {
                sharedCssResultCache.set(cssSharedCacheKey, cssTask)
              }

              const css = await cssTask
              onUpdate(outputFile, rawSource, css)
              debug('css handle: %s', outputFile)
              return {
                result: css,
              }
            },
          })))
        continue
      }

      if (type !== 'js') {
        continue
      }

      metrics.js.total++
      if (isWebGeneratorTarget) {
        debug('js skip web target: %s', file)
        continue
      }
      const shouldTransformJs = !useIncrementalMode || processFiles.js.has(file)
      if (!shouldTransformJs) {
        // 增量轮次上游可能重写相同源码的原始 JS 产物，这里仍要走缓存回填以保持转译结果稳定。
        debug('js skip transform (clean), replay cache: %s', file)
      }

      if (originalSource.type === 'chunk') {
        const absoluteFile = path.resolve(outDir, file)
        const initialRawSource = originalEntrySource
        const linkedSet = useIncrementalMode ? new Set<string>() : undefined
        if (linkedByEntry && linkedSet) {
          linkedByEntry.set(file, linkedSet)
        }

        jsTaskFactories.push(async () => {
          await timeTask('js', async () => {
            const linkedImpactSignature = useIncrementalMode
              ? createLinkedImpactSignature(
                  file,
                  snapshot.linkedImpactsByEntry,
                  snapshot.sourceHashByFile,
                )
              : undefined
            const hashSalt = createJsHashSalt(runtimeSignature, linkedImpactSignature)
            await processCachedTask<string>({
              cache,
              cacheKey: file,
              hashKey: `${file}:js`,
              hash: `${getSnapshotHash(snapshot.sourceHashByFile, file, initialRawSource)}:${hashSalt}`,
              applyResult(source) {
                originalSource.code = source
              },
              onCacheHit() {
                metrics.js.cacheHits++
                debug('js cache hit: %s', file)
              },
              async transform() {
                const start = performance.now()
                const rawSource = originalSource.code
                if (!shouldTransformJs) {
                  debug('js cache replay miss, fallback transform: %s', file)
                }
                const handlerOptions = createHandlerOptions(absoluteFile)
                if (!disableJsPrecheck && shouldSkipViteJsTransform(rawSource, handlerOptions)) {
                  metrics.js.elapsed += measureElapsed(start)
                  metrics.js.transformed++
                  return {
                    result: rawSource,
                  }
                }

                const { code, linked } = await jsHandler(rawSource, transformRuntime, handlerOptions)
                metrics.js.elapsed += measureElapsed(start)
                metrics.js.transformed++
                onUpdate(file, rawSource, code)
                debug('js handle: %s', file)
                collectLinkedFileNames(linked, getJsEntry, linkedSet)
                applyLinkedUpdates(linked)
                return {
                  result: code,
                }
              },
            })
          })
        })
      }
      else if (uniAppX && originalSource.type === 'asset') {
        const linkedSet = useIncrementalMode ? new Set<string>() : undefined
        if (linkedByEntry && linkedSet) {
          linkedByEntry.set(file, linkedSet)
        }

        const baseApplyLinkedUpdates = applyLinkedUpdates
        const wrappedApplyLinkedUpdates = (linked?: Record<string, LinkedJsModuleResult>) => {
          collectLinkedFileNames(linked, getJsEntry, linkedSet)
          baseApplyLinkedUpdates(linked)
        }

        const factory = createUniAppXAssetTask(
          file,
          originalSource,
          outDir,
          {
            cache,
            hashKey: `${file}:js`,
            hashSalt: createJsHashSalt(
              runtimeSignature,
              useIncrementalMode
                ? createLinkedImpactSignature(
                    file,
                    snapshot.linkedImpactsByEntry,
                    snapshot.sourceHashByFile,
                  )
                : undefined,
            ),
            createHandlerOptions,
            debug,
            jsHandler,
            onUpdate,
            runtimeSet: transformRuntime,
            applyLinkedResults: wrappedApplyLinkedUpdates,
            uniAppX,
          },
        )

        jsTaskFactories.push(async () => {
          await timeTask('js', async () => {
            const start = performance.now()
            if (!shouldTransformJs) {
              debug('js skip transform (clean, uni-app-x), replay cache: %s', file)
              await factory()
              metrics.js.elapsed += measureElapsed(start)
              metrics.js.transformed++
              return
            }
            const currentSource = originalEntrySource
            const absoluteFile = path.resolve(outDir, file)
            const precheckOptions = createHandlerOptions(absoluteFile, {
              uniAppX: resolveUniAppXJsTransformEnabled(uniAppX),
              babelParserOptions: {
                plugins: ['typescript'],
                sourceType: 'unambiguous',
              },
            })
            if (!disableJsPrecheck && shouldSkipViteJsTransform(currentSource, precheckOptions)) {
              metrics.js.elapsed += measureElapsed(start)
              metrics.js.transformed++
              return
            }
            await factory()
            metrics.js.elapsed += measureElapsed(start)
            metrics.js.transformed++
          })
        })
      }
    }

    if (useIncrementalMode || isNativeAppStyleTarget) {
      for (const [key, rememberedEntry] of getRememberedCssSources?.() ?? []) {
        const remembered = await refreshRememberedCssSource?.(rememberedEntry) ?? rememberedEntry
        const { outputFile: rememberedOutputFile, rawSource, sourceFile } = remembered
        const outputFile = resolveViteCssPipelineOutputFile(rememberedOutputFile, opts, rootDir, isWebGeneratorTarget, isNativeAppStyleTarget)
        const cssHandlerOptions = getCssHandlerOptions(outputFile)
        const cssRuntimeSignature = createCssRuntimeSignature(
          runtimeSignature,
          await createScopedGeneratorCandidateSignature(
            rawSource,
            sourceFile,
            generatorCandidateSignature,
            getSourceCandidatesForEntries,
            {
              includeFallbackSignature: cssHandlerOptions.isMainChunk,
            },
          ),
        )
        const cssRuntimeAffectingHash = cache.computeHash(createRuntimeAffectingSourceSignature(rawSource, 'css'))
        const rememberedCssRuntimeSignature = createRememberedCssRuntimeSignature(cssRuntimeSignature, cssRuntimeAffectingHash)
        if (bundleFiles.includes(outputFile) || bundleFiles.includes(sourceFile) || getRememberedCssSignature?.(key) === rememberedCssRuntimeSignature) {
          continue
        }
        tasks.push(timeTask('css.replay', async () => {
          const start = performance.now()
          const generated = await generateCssByGenerator({
            opts,
            runtimeState,
            runtime: generatorRuntime,
            rawSource,
            file: sourceFile,
            cssHandlerOptions,
            cssUserHandlerOptions: getCssUserHandlerOptions(outputFile),
            getSourceCandidatesForEntries,
            styleHandler,
            debug,
          })
          const css = generated?.css ?? (await styleHandler(rawSource, cssHandlerOptions)).css
          setRememberedCssSignature?.(key, rememberedCssRuntimeSignature)
          if (generated) {
            registerGeneratorDependencies({ addWatchFile }, generated.dependencies)
            recordCssAssetResult?.(outputFile, generated.css)
            recordViteProcessedCssAssetResult?.(sourceFile, generated.css, {
              injectIntoMain: cssHandlerOptions.isMainChunk,
            })
            debug('css replay generated result: %s bytes=%d', outputFile, css.length)
          }
          const replayAsset = createReplayCssAsset(outputFile, css)
          if (typeof this.emitFile === 'function') {
            this.emitFile({
              type: 'asset',
              fileName: outputFile,
              source: css,
            })
          }
          else {
            bundle[outputFile] = replayAsset
          }
          markCssAssetProcessed?.(replayAsset, outputFile)
          metrics.css.elapsed += measureElapsed(start)
          metrics.css.transformed++
          onUpdate(outputFile, rawSource, css)
          debug('css replay handle: %s', outputFile)
        }))
      }
    }

    pushConcurrentTaskFactories(tasks, jsTaskFactories)

    const tasksStart = performance.now()
    await Promise.all(tasks)
    recordTimingDetail('tasks', tasksStart)
    for (const apply of pendingLinkedUpdates) {
      apply()
    }
    injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts,
      getViteProcessedCssAssetResults,
      markCssAssetProcessed,
      recordCssAssetResult,
      debug,
      onUpdate,
    })

    const stateUpdateStart = performance.now()
    updateBundleBuildState(
      state,
      snapshot,
      useIncrementalMode ? (linkedByEntry ?? new Map<string, Set<string>>()) : new Map<string, Set<string>>(),
      { incremental: useIncrementalMode },
    )
    state.generatorCandidateSignature = generatorCandidateSignature
    recordTimingDetail('state.update', stateUpdateStart)

    debug(
      'metrics iteration=%d runtime=%sms html(total=%d transform=%d hit=%d rate=%s elapsed=%sms) js(total=%d transform=%d hit=%d rate=%s elapsed=%sms) css(total=%d transform=%d hit=%d rate=%s elapsed=%sms)',
      useIncrementalMode ? state.iteration : 0,
      formatMs(metrics.runtimeSet),
      metrics.html.total,
      metrics.html.transformed,
      metrics.html.cacheHits,
      formatCacheHitRate(metrics.html),
      formatMs(metrics.html.elapsed),
      metrics.js.total,
      metrics.js.transformed,
      metrics.js.cacheHits,
      formatCacheHitRate(metrics.js),
      formatMs(metrics.js.elapsed),
      metrics.css.total,
      metrics.css.transformed,
      metrics.css.cacheHits,
      formatCacheHitRate(metrics.css),
      formatMs(metrics.css.elapsed),
    )

    if (hmrTimingRecorder) {
      hmrTimingRecorder.record('generateBundle', performance.now() - hmrTimingStartedAt, timingDetails)
      hmrTimingRecorder.emitTotal()
    }
    onEnd()
    debug('end')
  }
}
