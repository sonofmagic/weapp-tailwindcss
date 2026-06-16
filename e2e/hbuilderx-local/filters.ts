export function parseCaseNameFilters(value: string | undefined) {
  return value
    ?.split(',')
    .map(item => item.trim())
    .filter(Boolean) ?? []
}

const caseVariantSuffixRE = /\s+(?:android|ios|harmony|mp-alipay|mp-baidu|mp-toutiao|mp-weixin)$/

function normalizeHBuilderXCaseName(name: string) {
  return name.replace(caseVariantSuffixRE, '')
}

export function matchesHBuilderXCaseFilter(name: string, filters: string[]) {
  if (filters.length === 0) {
    return true
  }

  const normalizedName = normalizeHBuilderXCaseName(name)
  return filters.some((filter) => {
    const normalizedFilter = normalizeHBuilderXCaseName(filter)
    if (filter === name) {
      return true
    }
    if (caseVariantSuffixRE.test(filter)) {
      return false
    }
    return filter === normalizedName || normalizedFilter === normalizedName
  })
}

export function filterHBuilderXCases<T extends { name: string }>(cases: T[], filters: string[]) {
  return cases.filter(item => matchesHBuilderXCaseFilter(item.name, filters))
}
