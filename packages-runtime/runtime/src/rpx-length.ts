const DEFAULT_PREFIXES = [
  'text',
  'border',
  'bg',
  'outline',
  'ring',
] as const

type ReplacementCounters = Record<string, number>

interface RpxTransformMetadata {
  replacements: ReplacementCounters
}

function escapeRegexp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function createRpxLengthTransform(prefixes = DEFAULT_PREFIXES) {
  const arbitraryRegexps = prefixes.map(prefix => new RegExp(`${prefix}-\\[(\\d+(?:\\.\\d+)?)rpx\\]`, 'g'))

  function prepareValue(value: string) {
    // Skip the regex pass entirely when we know there is nothing to normalize.
    if (!value || !value.includes('rpx')) {
      return value
    }

    let hasReplacements = false
    const replacements: ReplacementCounters = {}
    const transformed = arbitraryRegexps.reduce((acc, regex, index) => {
      const prefix = prefixes[index]
      return acc.replace(regex, (_match, amount) => {
        const placeholder = `${prefix}-[length:${amount}rpx]`
        replacements[placeholder] = (replacements[placeholder] ?? 0) + 1
        hasReplacements = true
        return placeholder
      })
    }, value)

    if (!hasReplacements) {
      return value
    }

    return {
      value: transformed,
      metadata: {
        replacements,
      } satisfies RpxTransformMetadata,
    }
  }

  function restoreValue(value: string, metadata?: unknown) {
    if (!metadata || typeof metadata !== 'object' || !('replacements' in metadata)) {
      return value
    }

    const { replacements } = metadata as RpxTransformMetadata
    if (!replacements || typeof replacements !== 'object') {
      return value
    }

    let restored = value
    for (const [placeholder, occurrences] of Object.entries(replacements)) {
      let remaining = occurrences
      if (!remaining) {
        continue
      }

      const original = placeholder.replace('[length:', '[')
      const regex = new RegExp(escapeRegexp(placeholder))
      while (remaining > 0 && regex.test(restored)) {
        restored = restored.replace(regex, original)
        remaining--
      }
    }

    return restored
  }

  return {
    prepareValue,
    restoreValue,
  }
}
