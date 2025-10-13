import { escapeStringRegexp } from '@weapp-core/regex'

export type NameMatcher = (value: string) => boolean

function buildFuzzyMatcher(fuzzyStrings: string[]): ((value: string) => boolean) | undefined {
  if (fuzzyStrings.length === 0) {
    return undefined
  }
  if (fuzzyStrings.length === 1) {
    const [needle] = fuzzyStrings
    return value => value.includes(needle)
  }
  const unique = [...new Set(fuzzyStrings)]
  const pattern = new RegExp(unique.map(escapeStringRegexp).join('|'))
  return value => pattern.test(value)
}

function normaliseRegex(regex: RegExp) {
  const { source, flags } = regex
  if (!flags.includes('g')) {
    return regex
  }
  return new RegExp(source, flags.replace(/g/g, ''))
}

export function createNameMatcher(
  list: (string | RegExp)[] | undefined,
  { exact = false }: { exact?: boolean } = {},
): NameMatcher {
  if (!list || list.length === 0) {
    return () => false
  }

  const exactStrings = exact ? new Set<string>() : undefined
  const fuzzyStrings: string[] = []
  const regexList: RegExp[] = []

  for (const item of list) {
    if (typeof item === 'string') {
      if (exact) {
        exactStrings!.add(item)
      }
      else {
        fuzzyStrings.push(item)
      }
    }
    else {
      regexList.push(normaliseRegex(item))
    }
  }

  const fuzzyMatcher = exact ? undefined : buildFuzzyMatcher(fuzzyStrings)
  const hasRegex = regexList.length > 0

  return (value: string) => {
    if (exact && exactStrings?.has(value)) {
      return true
    }
    if (fuzzyMatcher?.(value)) {
      return true
    }
    if (!hasRegex) {
      return false
    }
    return regexList.some(regex => regex.test(value))
  }
}
