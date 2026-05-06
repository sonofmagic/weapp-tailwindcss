import type { BundleSnapshot, BundleStateEntry } from './bundle-state'
import type { TailwindV4DesignSystem, TailwindV4ResolvedSource } from '@/tailwindcss/v4-engine'
import type { TailwindcssPatcherLike } from '@/types'
import { extractRawCandidatesWithPositions, extractValidCandidates } from 'tailwindcss-patch'
import { createDebug } from '@/debug'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { loadTailwindV4DesignSystem, resolveTailwindV4SourceFromPatcher } from '@/tailwindcss/v4-engine'

const debug = createDebug('[vite:runtime-set] ')

type ExtractValidCandidatesOptions = Parameters<typeof extractValidCandidates>[0]
type MemoryExtractValidCandidatesOptions = ExtractValidCandidatesOptions & {
  content?: string
  extension?: string
}
type ExtractValidCandidatesFn = (options?: MemoryExtractValidCandidatesOptions) => Promise<string[]>
type ExtractRawCandidateResult = Awaited<ReturnType<typeof extractRawCandidatesWithPositions>>
type ExtractRawCandidatesFn = (content: string, extension?: string) => Promise<ExtractRawCandidateResult>

export interface BundleRuntimeClassSetManager {
  sync: (patcher: TailwindcssPatcherLike, snapshot: BundleSnapshot) => Promise<Set<string>>
  reset: () => Promise<void>
}

interface CreateBundleRuntimeClassSetManagerOptions {
  extractCandidates?: ExtractValidCandidatesFn
  extractRawCandidates?: ExtractRawCandidatesFn
}

const EXTENSION_DOT_PREFIX_RE = /^\./

function createExtractOptions(
  context: TailwindV4ResolvedSource,
  source: string,
): MemoryExtractValidCandidatesOptions {
  return {
    cwd: context.projectRoot,
    base: context.base,
    baseFallbacks: context.baseFallbacks,
    css: context.css,
    content: source,
    extension: 'html',
  }
}

function createRuntimeEntries(snapshot: BundleSnapshot) {
  return snapshot.entries.filter(entry => entry.type === 'html' || entry.type === 'js')
}

function collectChangedRuntimeFiles(snapshot: BundleSnapshot) {
  return new Set<string>([
    ...snapshot.runtimeAffectingChangedByType.html,
    ...snapshot.runtimeAffectingChangedByType.js,
  ])
}

function resolveEntryExtension(entry: BundleStateEntry) {
  const ext = entry.file.split(/[?#]/, 1)[0]?.split('.').pop()?.replace(EXTENSION_DOT_PREFIX_RE, '') ?? ''
  if (ext.length > 0) {
    return ext
  }
  return entry.type === 'html' ? 'html' : 'js'
}

function createCandidateValidationSource(candidates: Iterable<string>) {
  return [...new Set(candidates)].sort().join('\n')
}

function removeCandidateSet(
  candidateCountByClass: Map<string, number>,
  runtimeSet: Set<string>,
  candidates: Set<string>,
) {
  for (const className of candidates) {
    const count = candidateCountByClass.get(className)
    if (count == null) {
      continue
    }
    if (count <= 1) {
      candidateCountByClass.delete(className)
      runtimeSet.delete(className)
      continue
    }
    candidateCountByClass.set(className, count - 1)
  }
}

function addCandidateSet(
  candidateCountByClass: Map<string, number>,
  runtimeSet: Set<string>,
  candidates: Set<string>,
) {
  for (const className of candidates) {
    const nextCount = (candidateCountByClass.get(className) ?? 0) + 1
    candidateCountByClass.set(className, nextCount)
    runtimeSet.add(className)
  }
}

export function createBundleRuntimeClassSetManager(
  options: CreateBundleRuntimeClassSetManagerOptions = {},
): BundleRuntimeClassSetManager {
  const customExtractCandidates = options.extractCandidates
  const extractCandidates = customExtractCandidates ?? extractValidCandidates
  const extractRawCandidates = options.extractRawCandidates ?? extractRawCandidatesWithPositions
  const runtimeSet = new Set<string>()
  const candidateCountByClass = new Map<string, number>()
  const candidatesByFile = new Map<string, Set<string>>()
  const candidateValidityCache = new Map<string, boolean>()
  let runtimeSignature: string | undefined
  let validationContext: TailwindV4ResolvedSource | undefined
  let designSystemPromise: Promise<TailwindV4DesignSystem> | undefined

  async function reset() {
    runtimeSet.clear()
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
    const parsedCandidates = [...unknownCandidates].filter(candidate => designSystem.parseCandidate(candidate).length > 0)
    const cssByCandidate = parsedCandidates.length > 0
      ? designSystem.candidatesToCss(parsedCandidates)
      : []
    const validCandidates = new Set<string>()

    for (let index = 0; index < parsedCandidates.length; index += 1) {
      const candidate = parsedCandidates[index]
      const css = cssByCandidate[index]
      if (candidate && typeof css === 'string' && css.trim().length > 0) {
        validCandidates.add(candidate)
      }
    }

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
    const validCandidates = new Set(await extractCandidates(createExtractOptions(context, source)))

    for (const candidate of unknownCandidates) {
      candidateValidityCache.set(candidate, validCandidates.has(candidate))
    }
  }

  async function extractEntryRawCandidates(entry: BundleStateEntry) {
    const matches = await extractRawCandidates(entry.source, resolveEntryExtension(entry))
    const candidates = new Set<string>()
    for (const match of matches) {
      const candidate = match?.rawCandidate
      if (typeof candidate === 'string' && candidate.length > 0) {
        candidates.add(candidate)
      }
    }
    return candidates
  }

  async function sync(
    patcher: TailwindcssPatcherLike,
    snapshot: BundleSnapshot,
  ) {
    const nextSignature = getRuntimeClassSetSignature(patcher) ?? 'runtime:missing'
    const runtimeEntries = createRuntimeEntries(snapshot)
    const runtimeEntriesByFile = new Map(runtimeEntries.map(entry => [entry.file, entry]))
    const currentRuntimeFiles = new Set(runtimeEntriesByFile.keys())
    const fullRebuild = runtimeSignature !== nextSignature || candidatesByFile.size === 0

    if (runtimeSignature !== nextSignature) {
      debug('runtime signature changed, reset incremental runtime set: %s', nextSignature)
      await reset()
    }

    runtimeSignature = nextSignature

    for (const [file, previousCandidates] of candidatesByFile) {
      if (currentRuntimeFiles.has(file)) {
        continue
      }
      removeCandidateSet(candidateCountByClass, runtimeSet, previousCandidates)
      candidatesByFile.delete(file)
    }

    const changedRuntimeFiles = fullRebuild
      ? [...runtimeEntriesByFile.keys()]
      : [...collectChangedRuntimeFiles(snapshot)]

    if (changedRuntimeFiles.length === 0) {
      return new Set(runtimeSet)
    }

    const rawCandidatesByFile = new Map<string, Set<string>>()
    const unknownCandidates = new Set<string>()

    await Promise.all(changedRuntimeFiles.map(async (file) => {
      const entry = runtimeEntriesByFile.get(file)
      if (!entry) {
        return
      }
      const candidates = await extractEntryRawCandidates(entry)
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
        removeCandidateSet(candidateCountByClass, runtimeSet, previousCandidates)
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

      addCandidateSet(candidateCountByClass, runtimeSet, nextCandidates)
      candidatesByFile.set(file, nextCandidates)
    }

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
