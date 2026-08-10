import type { HmrContext } from 'vite'
import type { createViteCssMemory } from '../css-memory'
import type { createViteRuntimeClassSet } from '../runtime-class-set'
import type { createSourceCandidateCollector } from '../source-candidates'
import type { createViteHmrCandidateState, ViteSourceCandidateChange } from './framework-hmr-candidate-state'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { LRUCache } from 'lru-cache'
import { resolveSourceScanPath } from '@/tailwindcss/source-scan'
import { isTailwindV4CssEntry } from '@/tailwindcss/v4/css-entries'
import { createSourceCandidateEligibilityMatcher } from '../../shared/source-candidates/scan-root'
import { isSourceStyleRequest } from '../../shared/style-requests'
import { createSourceCandidateScanSignature } from '../source-candidate-scan-signature'
import { resolveViteSourceScanEntries } from '../source-scan'
import { cleanUrl } from '../utils'
import { hasFrameworkHmrRuntimeSourceChange } from './framework-hmr-runtime-signature'

const SOURCE_CANDIDATE_SCAN_CACHE_MAX = 8

type SourceCandidateCollector = ReturnType<typeof createSourceCandidateCollector>
type CssMemory = ReturnType<typeof createViteCssMemory>
type RuntimeState = ReturnType<typeof createViteRuntimeClassSet>['runtimeState']
type HmrCandidateState = ReturnType<typeof createViteHmrCandidateState>
type SourceCandidateScanSnapshot = ReturnType<SourceCandidateCollector['snapshot']>
interface SourceCandidateScanCacheEntry {
  eligibleFiles: string[]
  snapshot: SourceCandidateScanSnapshot
}
type SourceScanResult = NonNullable<Awaited<ReturnType<typeof resolveViteSourceScanEntries>>>

const sourceCandidateScanSnapshotCache = new LRUCache<string, SourceCandidateScanCacheEntry>({
  max: SOURCE_CANDIDATE_SCAN_CACHE_MAX,
})

interface FrameworkSourceScanSessionOptions {
  cssMemory: CssMemory
  debug: (...args: any[]) => void
  getResolvedConfig: () => any
  hmrCandidateState: HmrCandidateState
  isCandidateRequest: (id: string) => boolean
  isWatchLikeBuild: () => boolean
  opts: any
  runtimeState: RuntimeState
  shouldOwnTailwindGeneration: boolean
  sourceCandidateCollector: SourceCandidateCollector
}

export async function syncFrameworkSourceCandidatesForHotUpdate(
  sourceScanSession: Pick<ReturnType<typeof createFrameworkSourceScanSession>, 'syncChangedFile' | 'waitForPendingSyncs'>,
  ctx: HmrContext,
) {
  const source = typeof ctx.read === 'function'
    ? await ctx.read().catch(() => undefined)
    : undefined
  await sourceScanSession.syncChangedFile(ctx.file, source)
  await sourceScanSession.waitForPendingSyncs()
}

export function createFrameworkSourceScanSession(options: FrameworkSourceScanSessionOptions) {
  const sourceCandidateScanCache = new LRUCache<string, SourceCandidateScanCacheEntry>({
    max: SOURCE_CANDIDATE_SCAN_CACHE_MAX,
  })
  let sourceScanEntries: SourceScanResult['entries']
  let sourceScanMatcher: ReturnType<typeof createSourceCandidateEligibilityMatcher>
  let sourceScanBoundaryMatcher: ReturnType<typeof createSourceCandidateEligibilityMatcher>
  let sourceScanRoots: ReturnType<typeof collectRoots> = []
  let sourceScanOutDir: string | undefined
  let sourceScanEligibleFiles = new Set<string>()
  let sourceScanEligibleFilesRefresh: Promise<void> | undefined
  const sourceScanIneligibleFiles = new Set<string>()
  let sourceScanDependencies = new Set<string>()
  let sourceScanExplicit = false
  let sourceCandidateScanSignature: string | undefined
  let sourceCandidateScanInvalidated = true
  const pendingSourceCandidateSyncs = new Set<Promise<unknown>>()
  const pendingSourceCandidateSyncByFile = new Map<string, Promise<any>>()
  const pendingHotUpdateChangeByFile = new Map<string, ViteSourceCandidateChange>()

  const normalizeDependency = (file: string) => path.normalize(path.resolve(cleanUrl(file)))
  const isDependency = (file: string) => sourceScanDependencies.has(normalizeDependency(file))
  const invalidate = () => {
    sourceCandidateScanInvalidated = true
    sourceScanIneligibleFiles.clear()
  }
  const hasState = () => sourceCandidateScanSignature !== undefined

  const collectRoots = (root: string, entries: SourceScanResult['entries']) => {
    if (entries?.length) {
      return [{ entries, explicit: sourceScanExplicit, root }]
    }
    if (sourceScanExplicit && entries !== undefined) {
      return []
    }
    const roots: Array<{ entries?: SourceScanResult['entries'], explicit?: boolean, root: string }> = [{ entries, root }]
    const seenRoots = new Set([path.resolve(root)])
    const basedir = options.opts.tailwindcssBasedir
      ? path.resolve(options.opts.tailwindcssBasedir)
      : undefined
    if (basedir && !seenRoots.has(basedir)) {
      roots.push({ root: basedir })
      seenRoots.add(basedir)
    }
    for (const cssEntry of options.opts.tailwindcss?.v4?.cssEntries ?? []) {
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

  const cacheCurrent = () => {
    if (!sourceCandidateScanSignature) {
      return
    }
    const entry = {
      eligibleFiles: [...sourceScanEligibleFiles],
      snapshot: options.sourceCandidateCollector.snapshot(),
    }
    sourceCandidateScanCache.set(sourceCandidateScanSignature, entry)
    sourceCandidateScanSnapshotCache.set(sourceCandidateScanSignature, entry)
  }

  const updateSourceScanMatchers = (eligibleFiles: Iterable<string>) => {
    sourceScanEligibleFiles = new Set(eligibleFiles)
    const matcherRoots = sourceScanRoots.map(scanRoot => ({
      ...scanRoot,
      outDir: sourceScanOutDir,
    }))
    sourceScanBoundaryMatcher = createSourceCandidateEligibilityMatcher(matcherRoots)
    sourceScanMatcher = createSourceCandidateEligibilityMatcher(matcherRoots, sourceScanEligibleFiles)
  }

  const refreshSourceScanEligibleFiles = async () => {
    sourceScanEligibleFilesRefresh ??= Promise.all(sourceScanRoots.map(scanRoot => options.sourceCandidateCollector.resolveScanFiles({
      entries: scanRoot.entries,
      explicit: scanRoot.explicit,
      root: scanRoot.root,
      outDir: sourceScanOutDir,
    })))
      .then(files => updateSourceScanMatchers(files.flat()))
      .finally(() => {
        sourceScanEligibleFilesRefresh = undefined
      })
    await sourceScanEligibleFilesRefresh
  }

  const shouldDiscoverAutoCssSources = (autoCssSourcesDiscovered: boolean) => {
    if (!autoCssSourcesDiscovered || !options.isWatchLikeBuild()) {
      return true
    }
    return sourceCandidateScanInvalidated
  }

  const sync = async (syncOptions: { force?: boolean } = {}) => {
    if (!options.shouldOwnTailwindGeneration) {
      return
    }
    if (!syncOptions.force && options.isWatchLikeBuild() && hasState() && !sourceCandidateScanInvalidated) {
      options.debug('reuse vite source candidate scan definition for watch rebuild')
      return
    }
    const resolvedConfig = options.getResolvedConfig()
    const root = resolvedConfig?.root ?? process.cwd()
    const outDir = resolvedConfig?.build?.outDir
    const sourceScan = await resolveViteSourceScanEntries(options.opts, options.runtimeState.tailwindRuntime, { outDir, root })
    sourceScanEntries = sourceScan?.entries
    sourceScanExplicit = sourceScan?.explicit ?? false
    sourceScanDependencies = new Set((sourceScan?.dependencies ?? []).map(normalizeDependency))
    const roots = collectRoots(root, sourceScanEntries)
    sourceScanRoots = roots
    sourceScanOutDir = outDir
    const nextScanSignature = createSourceCandidateScanSignature({
      inlineCandidates: sourceScan?.inlineCandidates,
      outDir,
      roots,
      scanAllSources: !sourceScanExplicit,
    })
    if (hasState() && sourceCandidateScanSignature === nextScanSignature) {
      options.sourceCandidateCollector.syncInline(sourceScan?.inlineCandidates)
      cacheCurrent()
      options.debug('reuse vite source candidate scan for watch rebuild')
      sourceCandidateScanInvalidated = false
      return
    }
    const cachedScan = options.isWatchLikeBuild()
      ? sourceCandidateScanCache.get(nextScanSignature) ?? sourceCandidateScanSnapshotCache.get(nextScanSignature)
      : undefined
    if (cachedScan) {
      options.sourceCandidateCollector.restore(cachedScan.snapshot)
      sourceScanIneligibleFiles.clear()
      updateSourceScanMatchers(cachedScan.eligibleFiles)
      sourceCandidateScanSignature = nextScanSignature
      options.debug('reuse cached vite source candidate scan for watch rebuild')
      sourceCandidateScanInvalidated = false
      return
    }
    if (options.isWatchLikeBuild()) {
      options.sourceCandidateCollector.resetScan()
    }
    else {
      options.sourceCandidateCollector.clearScan()
    }
    options.sourceCandidateCollector.syncInline(sourceScan?.inlineCandidates)
    const eligibleFiles = new Set<string>()
    sourceScanIneligibleFiles.clear()
    await Promise.all(roots.map(scanRoot => options.sourceCandidateCollector.scanRoot({
      entries: scanRoot.entries,
      explicit: scanRoot.explicit,
      root: scanRoot.root,
      outDir,
      onFilesResolved: files => files.forEach(file => eligibleFiles.add(file)),
    })))
    updateSourceScanMatchers(eligibleFiles)
    sourceCandidateScanSignature = nextScanSignature
    sourceCandidateScanInvalidated = false
    if (options.isWatchLikeBuild()) {
      cacheCurrent()
    }
  }

  const waitForPendingSyncs = async () => {
    while (pendingSourceCandidateSyncs.size > 0) {
      await Promise.all(pendingSourceCandidateSyncs)
    }
  }

  const rememberHotUpdateChange = (change: ViteSourceCandidateChange | undefined) => {
    if (!change) {
      return undefined
    }
    const previous = pendingHotUpdateChangeByFile.get(change.file)
    if (!previous) {
      const remembered = {
        ...change,
        addedCandidates: new Set(change.addedCandidates),
        removedCandidates: new Set(change.removedCandidates),
      }
      pendingHotUpdateChangeByFile.set(change.file, remembered)
      return remembered
    }
    for (const candidate of change.addedCandidates) {
      previous.addedCandidates.add(candidate)
      previous.removedCandidates.delete(candidate)
    }
    for (const candidate of change.removedCandidates) {
      if (!previous.addedCandidates.delete(candidate)) {
        previous.removedCandidates.add(candidate)
      }
    }
    previous.runtimeAffecting ||= change.runtimeAffecting
    return previous
  }

  const syncChangedFile = async (id: string, sourceOverride?: string) => {
    if (!options.shouldOwnTailwindGeneration || !options.isCandidateRequest(id)) {
      return undefined
    }
    const file = cleanUrl(id)
    const runtimeAffectingByDependency = isDependency(file)
    if (runtimeAffectingByDependency) {
      invalidate()
    }
    const resolvedFile = resolveSourceScanPath(file)
    if (sourceScanMatcher
      && !sourceScanMatcher(file)
      && sourceScanBoundaryMatcher?.(file)
      && !sourceScanIneligibleFiles.has(resolvedFile)) {
      await refreshSourceScanEligibleFiles()
      if (!sourceScanMatcher(file)) {
        sourceScanIneligibleFiles.add(resolvedFile)
      }
    }
    if (sourceScanMatcher && !sourceScanMatcher(file)) {
      const change = options.sourceCandidateCollector.remove(file)
      cacheCurrent()
      const refresh = isSourceStyleRequest(file)
        ? readFile(file, 'utf8').then(source => options.cssMemory.refreshRememberedCssSourceBySourceFile(file, source)).catch((error) => {
            const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined
            if (code !== 'ENOENT') {
              options.debug('remembered css source watch refresh failed: %s %O', file, error)
            }
          })
        : Promise.resolve()
      return refresh
        .then(() => options.cssMemory.refreshRememberedCssSourceByCurrentFile(file))
        .then(() => rememberHotUpdateChange(options.hmrCandidateState.apply(options.hmrCandidateState.createChange(file, change, { runtimeAffecting: true }))))
    }
    const existingTask = pendingSourceCandidateSyncByFile.get(file)
    if (existingTask) {
      await existingTask
      return syncChangedFile(id, sourceOverride)
    }
    const previousSource = options.sourceCandidateCollector.source(file)
    const task = (sourceOverride === undefined
      ? options.sourceCandidateCollector.syncCurrentFile(id)
      : options.sourceCandidateCollector.syncCurrentSource(id, sourceOverride))
      .catch((error) => {
        options.debug('source candidate watch sync failed: %s %O', id, error)
        return undefined
      })
      .then((change) => {
        cacheCurrent()
        const runtimeAffectingBySource = hasFrameworkHmrRuntimeSourceChange(
          file,
          previousSource,
          options.sourceCandidateCollector.source(file),
        )
        const appliedChange = change
          ? options.hmrCandidateState.apply(options.hmrCandidateState.createChange(file, change, {
              runtimeAffecting: runtimeAffectingByDependency || runtimeAffectingBySource,
            }))
          : undefined
        return rememberHotUpdateChange(appliedChange)
          ?? pendingHotUpdateChangeByFile.get(file)
      })
      .finally(() => {
        pendingSourceCandidateSyncs.delete(task)
        pendingSourceCandidateSyncByFile.delete(file)
      })
    pendingSourceCandidateSyncs.add(task)
    pendingSourceCandidateSyncByFile.set(file, task)
    return task.then(async (change) => {
      await options.cssMemory.refreshRememberedCssSourceByCurrentFile(file)
      return change
    })
  }

  return {
    cacheCurrent,
    consumeHotUpdateChange: (id: string) => pendingHotUpdateChangeByFile.delete(cleanUrl(id)),
    getStats: () => ({
      pendingSourceCandidateSyncByFile: pendingSourceCandidateSyncByFile.size,
      pendingSourceCandidateSyncs: pendingSourceCandidateSyncs.size,
      pendingHotUpdateChangeByFile: pendingHotUpdateChangeByFile.size,
      sourceCandidateScanCache: sourceCandidateScanCache.size,
    }),
    invalidate,
    isDependency,
    // 首次 source scan 完成前保留 Vite 原有的 transform 行为；sync() 完成后由统一 matcher 负责边界判断。
    matches: (file: string) => sourceScanMatcher?.(file) ?? true,
    shouldDiscoverAutoCssSources,
    sync,
    syncChangedFile,
    waitForPendingSyncs,
  }
}
