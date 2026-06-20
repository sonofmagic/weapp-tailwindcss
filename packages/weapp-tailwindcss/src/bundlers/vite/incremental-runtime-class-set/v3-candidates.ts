type ExtractRawCandidateResult = Array<{
  rawCandidate?: string | undefined
  start?: number | undefined
} | null | undefined>

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

function isUrlLikeCandidate(candidate: string) {
  return candidate.startsWith('//')
    || candidate.startsWith('http://')
    || candidate.startsWith('https://')
}

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

export function isHighConfidenceV3Candidate(candidate: string) {
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

export function createHighConfidenceLiteralRanges(source: string, matches: ExtractRawCandidateResult) {
  const ranges: Array<{ start: number, end: number }> = []
  for (const match of matches) {
    const candidate = match?.rawCandidate
    if (typeof candidate !== 'string' || !isHighConfidenceV3Candidate(candidate)) {
      continue
    }
    const fallbackStart = match?.start ?? source.indexOf(candidate)
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

export function isRawCandidateAllowedForV3(
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
