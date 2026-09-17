import selectorParser from 'postcss-selector-parser'

/** 保留作者选择器在变体展开后增加前缀、伪类或主题条件的规则。 */
export function createAuthorSelectorMatcher(selectors: Iterable<string>) {
  const exact = new Set<string>()
  const compounds: string[][] = []
  for (const selector of selectors) {
    exact.add(selector.trim())
    selectorParser().astSync(selector).each((entry) => {
      if (!entry.nodes.some(node => node.type === 'combinator')
        && entry.nodes.some(node => node.type === 'class' || node.type === 'id')) {
        compounds.push(entry.nodes.map(node => node.toString().trim()))
      }
    })
  }
  return (selector: string) => {
    if (exact.has(selector.trim())) {
      return true
    }
    const entries = selectorParser().astSync(selector).nodes
    return entries.length > 0 && entries.every((entry) => {
      const lastCombinator = entry.nodes.findLastIndex(node => node.type === 'combinator')
      const subject = new Set(entry.nodes.slice(lastCombinator + 1).map(node => node.toString().trim()))
      return compounds.some(nodes => nodes.every(node => subject.has(node)))
    })
  }
}
