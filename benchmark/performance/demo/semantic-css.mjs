import postcss from 'postcss'

// 探针要求目标支持标准 flex；仅去掉在同一规则内必然被后续标准声明覆盖的旧前缀。
// 返回值只用于语义比较，不写回源码或构建产物。
export function comparableCss(css) {
  const root = postcss.parse(css)
  root.walkDecls('display', (declaration) => {
    const standard = { '-webkit-flex': 'flex', '-webkit-inline-flex': 'inline-flex' }[declaration.value]
    if (!standard) return
    const siblings = declaration.parent.nodes
    const overridden = siblings.slice(siblings.indexOf(declaration) + 1).some(node => node.type === 'decl'
      && node.prop === 'display' && node.value === standard && Boolean(node.important) === Boolean(declaration.important))
    if (overridden) declaration.remove()
  })
  return root.toString()
}
