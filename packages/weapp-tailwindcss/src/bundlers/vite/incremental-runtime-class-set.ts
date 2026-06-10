import type { BundleSnapshot, BundleStateEntry } from './bundle-state'
import type { TailwindV4DesignSystem, TailwindV4ResolvedSource } from '@/tailwindcss/v4-engine'
import type { TailwindcssPatcherLike } from '@/types'
import type { IArbitraryValues } from '@/types/shared'
import { MappingChars2String, unescape as unescapeClassName } from '@weapp-core/escape'
import { extractRawCandidatesWithPositions, extractValidCandidates, resolveValidTailwindV4Candidates } from 'tailwindcss-patch'
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

const EXTENSION_DOT_PREFIX_RE = /^\./
const ESCAPED_CLASS_TOKEN_RE = /[\w-]+_[A-Z][\w-]*/gi
const TAILWIND_RESTORED_CANDIDATE_SIGNAL_RE = /[[\]:/#!.]/
const MAX_RESTORED_CANDIDATE_VARIANTS = 512
const VENDOR_CHUNK_BASENAME_RE = /^(?:vendor|vendors|chunk-vendors|common_vendor)(?:[.-]|$)/i
const COMMON_VENDOR_CHUNK_RE = /^(?:common|static|assets|chunks?)\/(?:vendor|vendors|chunk-vendors|common_vendor|runtime)(?:[.-]|$)/i

function toPosixPath(value: string) {
  return value.split('\\').join('/')
}

function isDependencyModuleId(id: string) {
  const normalized = toPosixPath(id)
  return normalized.includes('/node_modules/')
    || normalized.includes('/.pnpm/')
    || normalized.includes('/node_modules_')
}

function collectChunkModuleIds(entry: BundleStateEntry) {
  if (entry.output.type !== 'chunk') {
    return []
  }
  return [
    ...entry.output.moduleIds,
    ...Object.keys(entry.output.modules ?? {}),
  ].filter((id, index, ids) => ids.indexOf(id) === index)
}

function isKnownVendorChunkFile(file: string) {
  const normalized = toPosixPath(file).replace(/^\.\//, '')
  const basename = normalized.slice(normalized.lastIndexOf('/') + 1)
  return VENDOR_CHUNK_BASENAME_RE.test(basename)
    || COMMON_VENDOR_CHUNK_RE.test(normalized)
    || normalized.includes('/node_modules/')
    || normalized.includes('/node_modules_')
}

function isDependencyOnlyChunk(entry: BundleStateEntry) {
  if (entry.output.type !== 'chunk') {
    return false
  }
  if (entry.output.isEntry || entry.output.isDynamicEntry || entry.output.isImplicitEntry) {
    return false
  }
  const moduleIds = collectChunkModuleIds(entry)
  return moduleIds.length > 0 && moduleIds.every(isDependencyModuleId)
}

function isRuntimeCandidateEntry(entry: BundleStateEntry) {
  if (entry.type === 'html') {
    return true
  }
  if (entry.type !== 'js') {
    return false
  }
  if (isDependencyOnlyChunk(entry)) {
    return false
  }
  if (!isKnownVendorChunkFile(entry.file)) {
    return true
  }
  if (entry.output.type !== 'chunk') {
    return false
  }
  if (entry.output.facadeModuleId && !isDependencyModuleId(entry.output.facadeModuleId)) {
    return true
  }
  return collectChunkModuleIds(entry).some(id => !isDependencyModuleId(id))
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
    bareArbitraryValues,
  }
}

function createRuntimeEntries(snapshot: BundleSnapshot) {
  return snapshot.entries.filter(isRuntimeCandidateEntry)
}

function collectChangedRuntimeFiles(snapshot: BundleSnapshot) {
  return new Set<string>([
    ...snapshot.runtimeAffectingChangedByType.html,
    ...snapshot.runtimeAffectingChangedByType.js,
  ])
}

function resolveEntryExtension(entry: BundleStateEntry) {
  if (entry.type === 'html') {
    return 'html'
  }
  const ext = entry.file.split(/[?#]/, 1)[0]?.split('.').pop()?.replace(EXTENSION_DOT_PREFIX_RE, '') ?? ''
  if (ext.length > 0) {
    return ext
  }
  return 'js'
}

function createCandidateValidationSource(candidates: Iterable<string>) {
  return [...new Set(candidates)].sort().join('\n')
}

function createEscapeFragments(escapeMap: Record<string, string>) {
  return [...new Set(Object.values(escapeMap).filter(Boolean))]
    .sort((a, b) => b.length - a.length)
}

function hasEscapeFragment(token: string, escapeFragments: string[]) {
  return escapeFragments.some(fragment => token.includes(fragment))
}

function createAmbiguousRestoredRuntimeCandidates(
  token: string,
  escapeMap: Record<string, string>,
  escapeFragments: string[],
) {
  if (!hasEscapeFragment(token, escapeFragments)) {
    return []
  }

  const unescapedByFragment = new Map(
    Object.entries(escapeMap).map(([char, fragment]) => [fragment, char]),
  )
  let variants = ['']
  let index = 0

  while (index < token.length) {
    const fragment = escapeFragments.find(item => token.startsWith(item, index))
    if (!fragment) {
      variants = variants.map(item => item + token[index])
      index += 1
      continue
    }

    const nextVariants: string[] = []
    const unescaped = unescapedByFragment.get(fragment)
    for (const variant of variants) {
      nextVariants.push(variant + fragment)
      if (unescaped) {
        nextVariants.push(variant + unescaped)
      }
      if (nextVariants.length >= MAX_RESTORED_CANDIDATE_VARIANTS) {
        break
      }
    }
    variants = nextVariants
    index += fragment.length
  }

  variants.push(unescapeClassName(token, { map: escapeMap }))

  return [...new Set(variants)].filter(restored => restored !== token
    && TAILWIND_RESTORED_CANDIDATE_SIGNAL_RE.test(restored)
    && !/\s/.test(restored))
}

function collectEscapedRuntimeCandidates(
  source: string,
  escapeMap: Record<string, string>,
  escapeFragments: string[],
) {
  const candidates = new Set<string>()
  ESCAPED_CLASS_TOKEN_RE.lastIndex = 0
  let match = ESCAPED_CLASS_TOKEN_RE.exec(source)
  while (match) {
    for (const restored of createAmbiguousRestoredRuntimeCandidates(match[0], escapeMap, escapeFragments)) {
      candidates.add(restored)
    }
    match = ESCAPED_CLASS_TOKEN_RE.exec(source)
  }
  return candidates
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

function isUrlLikeCandidate(candidate: string) {
  return candidate.startsWith('//')
    || candidate.startsWith('http://')
    || candidate.startsWith('https://')
}

const TAILWIND_V3_ARBITRARY_UTILITY_PREFIXES = new Set([
  'accent',
  'animate',
  'basis',
  'bg',
  'blur',
  'border',
  'bottom',
  'brightness',
  'caret',
  'col',
  'columns',
  'content',
  'contrast',
  'decoration',
  'delay',
  'divide',
  'drop-shadow',
  'duration',
  'ease',
  'fill',
  'font',
  'gap',
  'gradient',
  'grid',
  'grayscale',
  'grow',
  'h',
  'hue-rotate',
  'indent',
  'inset',
  'invert',
  'leading',
  'left',
  'list',
  'm',
  'max',
  'mb',
  'min',
  'ml',
  'mr',
  'mt',
  'mx',
  'my',
  'object',
  'opacity',
  'order',
  'outline',
  'overflow',
  'p',
  'pb',
  'pl',
  'pr',
  'pt',
  'px',
  'py',
  'right',
  'ring',
  'rotate',
  'rounded',
  'row',
  'saturate',
  'scale',
  'scroll',
  'sepia',
  'shadow',
  'shrink',
  'skew',
  'space',
  'stroke',
  'text',
  'top',
  'tracking',
  'translate',
  'underline',
  'w',
  'z',
])

function getBaseUtilityCandidate(candidate: string) {
  let bracketDepth = 0
  let lastVariantSeparator = -1
  for (let index = 0; index < candidate.length; index++) {
    const char = candidate[index]
    if (char === '[') {
      bracketDepth += 1
    }
    else if (char === ']') {
      bracketDepth = Math.max(0, bracketDepth - 1)
    }
    else if (char === ':' && bracketDepth === 0) {
      lastVariantSeparator = index
    }
  }

  let utility = lastVariantSeparator >= 0
    ? candidate.slice(lastVariantSeparator + 1)
    : candidate
  if (utility.startsWith('!')) {
    utility = utility.slice(1)
  }
  if (utility.startsWith('-')) {
    utility = utility.slice(1)
  }
  return utility
}

function getArbitraryUtilityPrefix(utility: string) {
  const bracketIndex = utility.indexOf('[')
  if (bracketIndex <= 0 || !utility.endsWith(']')) {
    return undefined
  }

  const prefix = utility.slice(0, bracketIndex).replace(/-$/, '')
  const firstDash = prefix.indexOf('-')
  return firstDash >= 0 ? prefix.slice(0, firstDash) : prefix
}

function isLikelyTailwindV3ArbitraryUtility(candidate: string) {
  const utility = getBaseUtilityCandidate(candidate)
  if (utility.startsWith('[') && utility.endsWith(']') && utility.includes(':')) {
    return true
  }

  const prefix = getArbitraryUtilityPrefix(utility)
  return Boolean(prefix && TAILWIND_V3_ARBITRARY_UTILITY_PREFIXES.has(prefix))
}

function isLikelyTailwindV3VariantUtility(candidate: string) {
  if (!candidate.includes(':') || isUrlLikeCandidate(candidate)) {
    return false
  }

  const utility = getBaseUtilityCandidate(candidate)
  return /^[!-]?[a-z@[]/.test(utility)
}

function isLikelyTailwindV3OpacityModifier(candidate: string) {
  if (!candidate.includes('/') || isUrlLikeCandidate(candidate)) {
    return false
  }

  const utility = getBaseUtilityCandidate(candidate)
  return /^[!-]?[a-z][\w-]*-\w[\w-]*\/(?:\d+|\[[^\]]+\])$/.test(utility)
}

function isHighConfidenceV3Candidate(candidate: string) {
  return isLikelyTailwindV3ArbitraryUtility(candidate)
    || isLikelyTailwindV3VariantUtility(candidate)
    || isLikelyTailwindV3OpacityModifier(candidate)
}

function isRawCandidateInClassContext(source: string, start: number | undefined, extension: string) {
  if (typeof start !== 'number' || start <= 0) {
    return false
  }

  const before = source.slice(Math.max(0, start - 200), start)
  if (extension === 'html') {
    return /\bclass\s*=\s*["'][^"']*$/i.test(before)
  }

  return /\bclass(?:Name)?\s*[:=]\s*["'][^"']*$/i.test(before)
    || /\.classList\.(?:add|remove|toggle|contains)\([^)]*$/i.test(before)
}

function resolveQuotedLiteralRange(source: string, start: number | undefined) {
  if (typeof start !== 'number' || start <= 0) {
    return undefined
  }

  let quote: string | undefined
  let literalStart = -1
  for (let index = start - 1; index >= 0; index--) {
    const char = source[index]
    if (char !== '"' && char !== '\'' && char !== '`') {
      continue
    }
    quote = char
    literalStart = index
    break
  }

  if (!quote) {
    return undefined
  }

  let escaped = false
  for (let index = literalStart + 1; index < source.length; index++) {
    const char = source[index]
    if (escaped) {
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (char === quote) {
      if (start < index) {
        return {
          start: literalStart,
          end: index,
        }
      }
      return undefined
    }
  }

  return undefined
}

function createHighConfidenceLiteralRanges(source: string, matches: ExtractRawCandidateResult) {
  const ranges: Array<{ start: number, end: number }> = []
  for (const match of matches) {
    const candidate = match?.rawCandidate
    if (typeof candidate !== 'string' || !isHighConfidenceV3Candidate(candidate)) {
      continue
    }
    const fallbackStart = match.start ?? source.indexOf(candidate)
    const range = resolveQuotedLiteralRange(source, fallbackStart)
    if (range) {
      ranges.push(range)
    }
  }
  return ranges
}

function isRawCandidateInRanges(start: number | undefined, ranges: Array<{ start: number, end: number }>) {
  return typeof start === 'number'
    && ranges.some(range => start > range.start && start < range.end)
}

function isRawCandidateAllowedForV3(
  source: string,
  candidate: string,
  start: number | undefined,
  extension: string,
  knownSourceCandidates?: Set<string>,
  highConfidenceLiteralRanges: Array<{ start: number, end: number }> = [],
) {
  return isHighConfidenceV3Candidate(candidate)
    || knownSourceCandidates?.has(candidate) === true
    || isRawCandidateInClassContext(source, start, extension)
    || isRawCandidateInRanges(start, highConfidenceLiteralRanges)
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
      bareArbitraryValues: options.bareArbitraryValues,
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
