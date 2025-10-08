export type NameMatcher = (value: string) => boolean

export function createNameMatcher(
  list: (string | RegExp)[] | undefined,
  { exact = false }: { exact?: boolean } = {},
): NameMatcher {
  if (!list || list.length === 0) {
    return () => false
  }

  const exactStrings = new Set<string>()
  const fuzzyStrings: string[] = []
  const regexList: RegExp[] = []

  for (const item of list) {
    if (typeof item === 'string') {
      if (exact) {
        exactStrings.add(item)
      }
      else {
        fuzzyStrings.push(item)
      }
    }
    else {
      regexList.push(item)
    }
  }

  return (value: string) => {
    if (exact && exactStrings.has(value)) {
      return true
    }
    if (!exact) {
      for (const candidate of fuzzyStrings) {
        if (value.includes(candidate)) {
          return true
        }
      }
    }
    for (const regex of regexList) {
      regex.lastIndex = 0
      if (regex.test(value)) {
        return true
      }
    }
    return false
  }
}
