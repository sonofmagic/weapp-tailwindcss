import postcss from 'postcss'

export function collectEmptyBlockAtRules(source: string) {
  try {
    const root = postcss.parse(source)
    const emptyAtRules: string[] = []
    root.walkAtRules((atRule) => {
      if (atRule.nodes !== undefined && atRule.nodes.every(node => node.type === 'comment')) {
        emptyAtRules.push(atRule.toString())
      }
    })
    return emptyAtRules
  }
  catch {
    return []
  }
}
