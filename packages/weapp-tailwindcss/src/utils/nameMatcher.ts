import { escapeStringRegexp } from '@weapp-core/regex'

export type NameMatcher = (value: string) => boolean
const NEVER_MATCH_NAME: NameMatcher = () => false
const GLOBAL_FLAG_REGEXP = /g/g

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
  return new RegExp(source, flags.replace(GLOBAL_FLAG_REGEXP, ''))
}

export function createNameMatcher(
  list: (string | RegExp)[] | undefined,
  { exact = false }: { exact?: boolean } = {},
): NameMatcher {
  if (!list || list.length === 0) {
    return NEVER_MATCH_NAME
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

  if (exact) {
    const exactStringCount = exactStrings?.size ?? 0
    if (exactStringCount === 1 && regexList.length === 0) {
      const [needle] = exactStrings!
      return value => value === needle
    }

    if (regexList.length === 0) {
      return value => exactStrings!.has(value)
    }

    if (exactStringCount === 0 && regexList.length === 1) {
      const [regex] = regexList
      return value => regex.test(value)
    }

    return (value: string) => {
      if (exactStrings?.has(value)) {
        return true
      }
      return regexList.some(regex => regex.test(value))
    }
  }

  const fuzzyMatcher = exact ? undefined : buildFuzzyMatcher(fuzzyStrings)
  const hasRegex = regexList.length > 0

  if (fuzzyMatcher && !hasRegex) {
    return fuzzyMatcher
  }

  if (!fuzzyMatcher && regexList.length === 1) {
    const [regex] = regexList
    return value => regex.test(value)
  }

  return (value: string) => {
    if (fuzzyMatcher?.(value)) {
      return true
    }
    if (!hasRegex) {
      return false
    }
    return regexList.some(regex => regex.test(value))
  }
}
