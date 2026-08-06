import selectorParser from 'postcss-selector-parser'

const selectorPseudoClassCache = new Map<string, ReadonlySet<string>>()
const SELECTOR_PSEUDO_CLASS_CACHE_LIMIT = 50000

function getSelectorPseudoClasses(selector: string) {
  const cached = selectorPseudoClassCache.get(selector)
  if (cached) {
    return cached
  }

  const pseudoClasses = new Set<string>()
  selectorParser().astSync(selector).walkPseudos(node => pseudoClasses.add(node.value))
  if (selectorPseudoClassCache.size >= SELECTOR_PSEUDO_CLASS_CACHE_LIMIT) {
    selectorPseudoClassCache.clear()
  }
  selectorPseudoClassCache.set(selector, pseudoClasses)
  return pseudoClasses
}

export function selectorContainsPseudoClass(selector: string, pseudoClasses: readonly string[]) {
  try {
    const selectorPseudoClasses = getSelectorPseudoClasses(selector)
    return pseudoClasses.some(pseudoClass => selectorPseudoClasses.has(pseudoClass))
  }
  catch {
    return false
  }
}
