import postcss from 'postcss'

function insertWebkitBackgroundClipText(root: postcss.Root) {
  root.walkDecls('background-clip', (decl) => {
    if (decl.value.trim().toLowerCase() !== 'text') {
      return
    }
    const parent = decl.parent
    if (!parent || !('nodes' in parent)) {
      return
    }
    const hasWebkitFallback = parent.nodes.some((node) => {
      return node.type === 'decl'
        && node.prop.toLowerCase() === '-webkit-background-clip'
        && node.value.trim().toLowerCase() === 'text'
    })
    if (!hasWebkitFallback) {
      decl.cloneBefore({ prop: '-webkit-background-clip' })
    }
  })
}

/**
 * 为经典 uni-app Android/iOS WebView 产物补充最终 CSS 兼容转换。
 */
export function transformUniAppWebviewCssCompat(css: string) {
  try {
    const root = postcss.parse(css)
    insertWebkitBackgroundClipText(root)
    return root.toString()
  }
  catch {
    return css
  }
}
