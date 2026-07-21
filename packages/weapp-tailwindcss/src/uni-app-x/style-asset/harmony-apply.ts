import { postcss } from '@weapp-tailwindcss/postcss'

const SFC_STYLE_BLOCK_RE = /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi

function createGeneratedRuleMap(css: string) {
  let root: postcss.Root
  try {
    root = postcss.parse(css)
  }
  catch {
    return
  }
  const rules = new Map<string, postcss.ChildNode[]>()
  root.walkRules((rule) => {
    if (rule.nodes && rule.nodes.length > 0) {
      rules.set(rule.selector.trim(), rule.nodes.map(node => node.clone()))
    }
  })
  return rules.size > 0 ? rules : undefined
}

export function expandUniAppXHarmonyApplyStyles(source: string, generatedCss: string) {
  if (!source.includes('@apply')) {
    return source
  }
  const generatedRules = createGeneratedRuleMap(generatedCss)
  if (!generatedRules) {
    return source
  }
  return source.replace(SFC_STYLE_BLOCK_RE, (block, open: string, styleSource: string, close: string) => {
    if (!styleSource.includes('@apply')) {
      return block
    }
    let root: postcss.Root
    try {
      root = postcss.parse(styleSource)
    }
    catch {
      return block
    }
    let changed = false
    root.walkRules((rule) => {
      const hasApply = rule.nodes?.some(node => node.type === 'atrule' && node.name === 'apply') === true
      if (!hasApply) {
        return
      }
      const generatedNodes = generatedRules.get(rule.selector.trim())
      if (!generatedNodes) {
        return
      }
      rule.removeAll()
      rule.append(generatedNodes.map(node => node.clone()))
      changed = true
    })
    if (!changed) {
      return block
    }
    if (!root.toString().includes('@apply')) {
      root.walkAtRules('reference', rule => rule.remove())
    }
    return `${open}${root.toString()}${close}`
  })
}
