import type { BundleSnapshot, BundleStateEntry } from './bundle-state'
import type { TailwindV4DesignSystem, TailwindV4ResolvedSource } from '@/tailwindcss/v4-engine'
import type { TailwindcssPatcherLike } from '@/types'
import type { IArbitraryValues } from '@/types/shared'
import { MappingChars2String } from '@weapp-core/escape'
import { extractRawCandidatesWithPositions, extractValidCandidates, resolveValidTailwindV4Candidates } from 'tailwindcss-patch'
import { createDebug } from '@/debug'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { loadTailwindV4DesignSystem, resolveTailwindV4SourceFromPatcher } from '@/tailwindcss/v4-engine'
import { collectChangedRuntimeFiles, createRuntimeEntries, resolveEntryExtension } from './incremental-runtime-class-set/entries'
import { collectEscapedRuntimeCandidates, createEscapeFragments } from './incremental-runtime-class-set/escaped-candidates'
import { createHighConfidenceLiteralRanges, isRawCandidateAllowedForV3 } from './incremental-runtime-class-set/v3-candidates'

const debug = createDebug('[vite:runtime-set] ')

type ExtractValidCandidatesOptions = Parameters<typeof extractValidCandidates>[0]
type MemoryExtractValidCandidatesOptions = ExtractValidCandidatesOptions & {
  content?: string
  extension?: string
}
type ExtractValidCandidatesFn = (options?: MemoryExtractValidCandidatesOptions) => Promise<string[]>
type ExtractRawCandidateResult = Awaited<ReturnType<typeof extractRawCandidatesWithPositions>>
type ExtractRawCandidatesFn = (
  content: string,
  extension?: string,
  options?: { bareArbitraryValues?: IArbitraryValues['bareArbitraryValues'] | undefined },
) => Promise<ExtractRawCandidateResult>

export interface BundleRuntimeClassSetManager {
  sync: (patcher: TailwindcssPatcherLike, snapshot: BundleSnapshot, options?: BundleRuntimeClassSetSyncOptions) => Promise<Set<string>>
  reset: () => Promise<void>
}

export interface BundleRuntimeClassSetSyncOptions {
  baseClassSet?: Set<string> | undefined
  skipInitialFullScanWithBase?: boolean | undefined
}

interface CreateBundleRuntimeClassSetManagerOptions {
  bareArbitraryValues?: IArbitraryValues['bareArbitraryValues'] | undefined
  escapeMap?: Record<string, string> | undefined
  extractCandidates?: ExtractValidCandidatesFn
  extractRawCandidates?: ExtractRawCandidatesFn
}

function createExtractOptions(
  context: TailwindV4ResolvedSource,
  source: string,
  bareArbitraryValues: IArbitraryValues['bareArbitraryValues'] | undefined,
): MemoryExtractValidCandidatesOptions {
  return {
    cwd: context.projectRoot,
    base: context.base,
    baseFallbacks: context.baseFallbacks,
    css: context.css,
    content: source,
    extension: 'html',
    ...(bareArbitraryValues === undefined ? {} : { bareArbitraryValues }),
  }
}

function createCandidateValidationSource(candidates: Iterable<string>) {
  return [...new Set(candidates)].sort().join('\n')
}

function removeCandidateSet(
  candidateCountByClass: Map<string, number>,
  candidates: Set<string>,
) {
  for (const className of candidates) {
    const count = candidateCountByClass.get(className)
    if (count == null) {
      continue
    }
    if (count <= 1) {
      candidateCountByClass.delete(className)
      continue
    }
    candidateCountByClass.set(className, count - 1)
  }
}

function addCandidateSet(
  candidateCountByClass: Map<string, number>,
  candidates: Set<string>,
) {
  for (const className of candidates) {
    const nextCount = (candidateCountByClass.get(className) ?? 0) + 1
    candidateCountByClass.set(className, nextCount)
  }
}

function createRuntimeClassSet(
  baseClassSet: Set<string>,
  candidateCountByClass: Map<string, number>,
) {
  return new Set([
    ...baseClassSet,
    ...candidateCountByClass.keys(),
  ])
}

function createNonSourceBaseClassSet(
  baseClassSet: Set<string>,
  candidateCountByClass: Map<string, number>,
) {
  const nextBaseClassSet = new Set(baseClassSet)
  for (const candidate of candidateCountByClass.keys()) {
    nextBaseClassSet.delete(candidate)
  }
  return nextBaseClassSet
}

export function createBundleRuntimeClassSetManager(
  options: CreateBundleRuntimeClassSetManagerOptions = {},
): BundleRuntimeClassSetManager {
  const customExtractCandidates = options.extractCandidates
  const extractCandidates = customExtractCandidates ?? extractValidCandidates
  const extractRawCandidates = options.extractRawCandidates ?? extractRawCandidatesWithPositions
  const escapeMap = options.escapeMap ?? MappingChars2String
  const escapeFragments = createEscapeFragments(escapeMap)
  let baseClassSet = new Set<string>()
  const candidateCountByClass = new Map<string, number>()
  const candidatesByFile = new Map<string, Set<string>>()
  const candidateValidityCache = new Map<string, boolean>()
  let runtimeSignature: string | undefined
  let validationContext: TailwindV4ResolvedSource | undefined
  let designSystemPromise: Promise<TailwindV4DesignSystem> | undefined

  async function reset() {
    baseClassSet = new Set<string>()
    candidateCountByClass.clear()
    candidatesByFile.clear()
    candidateValidityCache.clear()
    runtimeSignature = undefined
    validationContext = undefined
    designSystemPromise = undefined
  }

  async function resolveValidationContextCached(patcher: TailwindcssPatcherLike) {
    if (!validationContext) {
      validationContext = await resolveTailwindV4SourceFromPatcher(patcher)
    }
    return validationContext
  }

  async function loadDesignSystem(context: TailwindV4ResolvedSource) {
    if (!designSystemPromise) {
      designSystemPromise = loadTailwindV4DesignSystem(context)
    }
    return designSystemPromise
  }

  function populateCandidateValidityCacheFromDesignSystem(
    designSystem: TailwindV4DesignSystem,
    unknownCandidates: Set<string>,
  ) {
    const validCandidates = resolveValidTailwindV4Candidates(designSystem, unknownCandidates, {
      ...(options.bareArbitraryValues === undefined ? {} : { bareArbitraryValues: options.bareArbitraryValues }),
    })

    for (const candidate of unknownCandidates) {
      candidateValidityCache.set(candidate, validCandidates.has(candidate))
    }
  }

  async function validateUnknownCandidates(
    patcher: TailwindcssPatcherLike,
    unknownCandidates: Set<string>,
  ) {
    if (unknownCandidates.size === 0) {
      return
    }

    if (patcher.majorVersion === 3 && !customExtractCandidates) {
      for (const candidate of unknownCandidates) {
        candidateValidityCache.set(candidate, true)
      }
      return
    }

    const context = await resolveValidationContextCached(patcher)
    if (!customExtractCandidates) {
      try {
        const designSystem = await loadDesignSystem(context)
        populateCandidateValidityCacheFromDesignSystem(designSystem, unknownCandidates)
        return
      }
      catch (error) {
        debug('incremental design-system validation failed: %O', error)
        designSystemPromise = undefined
        throw error
      }
    }

    const source = createCandidateValidationSource(unknownCandidates)
    const validCandidates = new Set(await extractCandidates(createExtractOptions(context, source, options.bareArbitraryValues)))

    for (const candidate of unknownCandidates) {
      candidateValidityCache.set(candidate, validCandidates.has(candidate))
    }
  }

  async function extractEntryRawCandidates(
    entry: BundleStateEntry,
    patcher: TailwindcssPatcherLike,
    knownSourceCandidates?: Set<string>,
  ) {
    const extension = resolveEntryExtension(entry)
    const matches = options.bareArbitraryValues === undefined || options.bareArbitraryValues === false
      ? await extractRawCandidates(entry.source, extension)
      : await extractRawCandidates(entry.source, extension, {
          bareArbitraryValues: options.bareArbitraryValues,
        })
    const highConfidenceLiteralRanges = patcher.majorVersion === 3 && !customExtractCandidates
      ? createHighConfidenceLiteralRanges(entry.source, matches)
      : []
    const candidates = new Set<string>()
    for (const match of matches) {
      const candidate = match?.rawCandidate
      if (typeof candidate === 'string' && candidate.length > 0) {
        if (
          patcher.majorVersion === 3
          && !customExtractCandidates
          && !isRawCandidateAllowedForV3(entry.source, candidate, match.start, extension, knownSourceCandidates, highConfidenceLiteralRanges)
        ) {
          continue
        }
        candidates.add(candidate)
      }
    }
    if (patcher.majorVersion === 4) {
      for (const candidate of collectEscapedRuntimeCandidates(entry.source, escapeMap, escapeFragments)) {
        candidates.add(candidate)
      }
    }
    return candidates
  }

  async function sync(
    patcher: TailwindcssPatcherLike,
    snapshot: BundleSnapshot,
    options: BundleRuntimeClassSetSyncOptions = {},
  ) {
    const nextSignature = getRuntimeClassSetSignature(patcher) ?? 'runtime:missing'
    const runtimeEntries = createRuntimeEntries(snapshot)
    const runtimeEntriesByFile = new Map(runtimeEntries.map(entry => [entry.file, entry]))
    const currentRuntimeFiles = new Set(runtimeEntriesByFile.keys())
    const hadTrackedRuntimeFiles = candidatesByFile.size > 0
    const fullRebuild = runtimeSignature !== nextSignature || candidatesByFile.size === 0

    if (runtimeSignature !== nextSignature) {
      debug('runtime signature changed, reset incremental runtime set: %s', nextSignature)
      await reset()
    }

    runtimeSignature = nextSignature
    const nextBaseClassSet = options.baseClassSet
    const canUseBaseWithoutInitialFullScan = Boolean(fullRebuild
      && !hadTrackedRuntimeFiles
      && options.skipInitialFullScanWithBase === true
      && nextBaseClassSet
      && nextBaseClassSet.size > 0)

    for (const [file, previousCandidates] of candidatesByFile) {
      if (currentRuntimeFiles.has(file) || snapshot.hasOmittedKnownFiles) {
        continue
      }
      removeCandidateSet(candidateCountByClass, previousCandidates)
      candidatesByFile.delete(file)
    }

    const changedRuntimeFiles = canUseBaseWithoutInitialFullScan
      ? [...collectChangedRuntimeFiles(snapshot)]
      : (
          fullRebuild
            ? [...runtimeEntriesByFile.keys()]
            : [...collectChangedRuntimeFiles(snapshot)]
        )

    if (changedRuntimeFiles.length === 0) {
      if (nextBaseClassSet) {
        baseClassSet = canUseBaseWithoutInitialFullScan
          ? new Set(nextBaseClassSet)
          : createNonSourceBaseClassSet(nextBaseClassSet, candidateCountByClass)
      }
      return createRuntimeClassSet(baseClassSet, candidateCountByClass)
    }

    const rawCandidatesByFile = new Map<string, Set<string>>()
    const unknownCandidates = new Set<string>()

    await Promise.all(changedRuntimeFiles.map(async (file) => {
      const entry = runtimeEntriesByFile.get(file)
      if (!entry) {
        return
      }
      const candidates = await extractEntryRawCandidates(entry, patcher, nextBaseClassSet)
      rawCandidatesByFile.set(file, candidates)
      for (const candidate of candidates) {
        if (!candidateValidityCache.has(candidate)) {
          unknownCandidates.add(candidate)
        }
      }
    }))

    await validateUnknownCandidates(patcher, unknownCandidates)

    let rawCandidateCount = 0

    for (const file of changedRuntimeFiles) {
      const nextRawCandidates = rawCandidatesByFile.get(file)
      const previousCandidates = candidatesByFile.get(file)
      if (previousCandidates) {
        removeCandidateSet(candidateCountByClass, previousCandidates)
      }

      if (!nextRawCandidates || nextRawCandidates.size === 0) {
        candidatesByFile.delete(file)
        continue
      }

      rawCandidateCount += nextRawCandidates.size
      const nextCandidates = new Set(
        [...nextRawCandidates].filter(candidate => candidateValidityCache.get(candidate) === true),
      )

      if (nextCandidates.size === 0) {
        candidatesByFile.delete(file)
        continue
      }

      addCandidateSet(candidateCountByClass, nextCandidates)
      candidatesByFile.set(file, nextCandidates)
    }

    if (nextBaseClassSet) {
      baseClassSet = canUseBaseWithoutInitialFullScan
        ? new Set(nextBaseClassSet)
        : createNonSourceBaseClassSet(nextBaseClassSet, candidateCountByClass)
    }
    const runtimeSet = createRuntimeClassSet(baseClassSet, candidateCountByClass)

    debug(
      'incremental runtime set synced, changedFiles=%d rawCandidates=%d validateMisses=%d runtimeSize=%d trackedFiles=%d',
      changedRuntimeFiles.length,
      rawCandidateCount,
      unknownCandidates.size,
      runtimeSet.size,
      candidatesByFile.size,
    )

    return new Set(runtimeSet)
  }

  return {
    sync,
    reset,
  }
}
