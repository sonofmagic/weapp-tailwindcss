import type { createViteCssMemory } from '../css-memory'
import type { createViteRuntimeClassSet } from '../runtime-class-set'
import type { createSourceCandidateCollector } from '../source-candidates'
import type { createViteHmrCandidateState } from './framework-hmr-candidate-state'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { LRUCache } from 'lru-cache'
import { isTailwindV4CssEntry } from '@/tailwindcss/v4/css-entries'
import { isSourceStyleRequest } from '../../shared/style-requests'
import { createSourceCandidateScanSignature } from '../source-candidate-scan-signature'
import { createViteSourceScanMatcher, resolveViteSourceScanEntries } from '../source-scan'
import { cleanUrl } from '../utils'

const SOURCE_CANDIDATE_SCAN_CACHE_MAX = 8

type SourceCandidateCollector = ReturnType<typeof createSourceCandidateCollector>
type CssMemory = ReturnType<typeof createViteCssMemory>
type RuntimeState = ReturnType<typeof createViteRuntimeClassSet>['runtimeState']
type HmrCandidateState = ReturnType<typeof createViteHmrCandidateState>
type SourceCandidateScanSnapshot = ReturnType<SourceCandidateCollector['snapshot']>
type SourceScanResult = NonNullable<Awaited<ReturnType<typeof resolveViteSourceScanEntries>>>

const sourceCandidateScanSnapshotCache = new LRUCache<string, SourceCandidateScanSnapshot>({
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

export function createFrameworkSourceScanSession(options: FrameworkSourceScanSessionOptions) {
  const sourceCandidateScanCache = new LRUCache<string, SourceCandidateScanSnapshot>({
    max: SOURCE_CANDIDATE_SCAN_CACHE_MAX,
  })
  let sourceScanEntries: SourceScanResult['entries']
  let sourceScanMatcher: ReturnType<typeof createViteSourceScanMatcher>
  let sourceScanDependencies = new Set<string>()
  let sourceScanExplicit = false
  let sourceCandidateScanSignature: string | undefined
  let sourceCandidateScanInvalidated = true
  const pendingSourceCandidateSyncs = new Set<Promise<unknown>>()
  const pendingSourceCandidateSyncByFile = new Map<string, Promise<any>>()

  const normalizeDependency = (file: string) => path.normalize(path.resolve(cleanUrl(file)))
  const isDependency = (file: string) => sourceScanDependencies.has(normalizeDependency(file))
  const invalidate = () => {
    sourceCandidateScanInvalidated = true
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
    const snapshot = options.sourceCandidateCollector.snapshot()
    sourceCandidateScanCache.set(sourceCandidateScanSignature, snapshot)
    sourceCandidateScanSnapshotCache.set(sourceCandidateScanSignature, snapshot)
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
    sourceScanMatcher = createViteSourceScanMatcher(sourceScanEntries)
    sourceScanDependencies = new Set((sourceScan?.dependencies ?? []).map(normalizeDependency))
    const roots = collectRoots(root, sourceScanEntries)
    const nextScanSignature = createSourceCandidateScanSignature({
      inlineCandidates: sourceScan?.inlineCandidates,
      outDir,
      roots,
      scanAllSources: !sourceScanExplicit,
    })
    if (hasState() && sourceCandidateScanSignature === nextScanSignature) {
      options.sourceCandidateCollector.syncInline(sourceScan?.inlineCandidates)
      sourceCandidateScanCache.set(nextScanSignature, options.sourceCandidateCollector.snapshot())
      options.debug('reuse vite source candidate scan for watch rebuild')
      sourceCandidateScanInvalidated = false
      return
    }
    const cachedScan = options.isWatchLikeBuild()
      ? sourceCandidateScanCache.get(nextScanSignature) ?? sourceCandidateScanSnapshotCache.get(nextScanSignature)
      : undefined
    if (cachedScan) {
      options.sourceCandidateCollector.restore(cachedScan)
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
    await Promise.all(roots.map(scanRoot => options.sourceCandidateCollector.scanRoot({
      entries: scanRoot.entries,
      explicit: scanRoot.explicit,
      root: scanRoot.root,
      outDir,
    })))
    sourceCandidateScanSignature = nextScanSignature
    sourceCandidateScanInvalidated = false
    if (options.isWatchLikeBuild()) {
      const snapshot = options.sourceCandidateCollector.snapshot()
      sourceCandidateScanCache.set(nextScanSignature, snapshot)
      sourceCandidateScanSnapshotCache.set(nextScanSignature, snapshot)
    }
  }

  const waitForPendingSyncs = async () => {
    while (pendingSourceCandidateSyncs.size > 0) {
      await Promise.all(pendingSourceCandidateSyncs)
    }
  }

  const syncChangedFile = (id: string, sourceOverride?: string) => {
    if (!options.shouldOwnTailwindGeneration || !options.isCandidateRequest(id)) {
      return Promise.resolve(undefined)
    }
    const file = cleanUrl(id)
    const runtimeAffectingByDependency = isDependency(file)
    if (runtimeAffectingByDependency) {
      invalidate()
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
        .then(() => options.hmrCandidateState.apply(options.hmrCandidateState.createChange(file, change, { runtimeAffecting: true })))
    }
    const existingTask = pendingSourceCandidateSyncByFile.get(file)
    if (existingTask) {
      return existingTask.then(() => syncChangedFile(id, sourceOverride))
    }
    const task = (sourceOverride === undefined
      ? options.sourceCandidateCollector.syncCurrentFile(id)
      : options.sourceCandidateCollector.syncCurrentSource(id, sourceOverride))
      .catch((error) => {
        options.debug('source candidate watch sync failed: %s %O', id, error)
        return undefined
      })
      .then((change) => {
        cacheCurrent()
        return change
          ? options.hmrCandidateState.apply(options.hmrCandidateState.createChange(file, change, { runtimeAffecting: runtimeAffectingByDependency }))
          : undefined
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
    getStats: () => ({
      pendingSourceCandidateSyncByFile: pendingSourceCandidateSyncByFile.size,
      pendingSourceCandidateSyncs: pendingSourceCandidateSyncs.size,
      sourceCandidateScanCache: sourceCandidateScanCache.size,
    }),
    invalidate,
    isDependency,
    matches: (file: string) => sourceScanMatcher?.(file) ?? true,
    shouldDiscoverAutoCssSources,
    sync,
    syncChangedFile,
    waitForPendingSyncs,
  }
}
