import postcssCalc from '@weapp-tailwindcss/postcss-calc'
import postcss from 'postcss'

const tailwindSpacingVariable = /var\(--spacing\)/g

function resolveTailwindSpacingCalculations(root: postcss.Root) {
  let spacing: string | undefined
  root.walkDecls('--spacing', (decl) => {
    spacing = decl.value.trim()
  })
  if (!spacing || spacing.includes('var(--spacing)')) {
    return
  }
  const resolvedSpacing = spacing

  let changed = false
  root.walkDecls((decl) => {
    if (!decl.value.includes('var(--spacing)')) {
      return
    }
    decl.value = decl.value.replace(tailwindSpacingVariable, resolvedSpacing)
    changed = true
  })

  if (changed) {
    postcss([
      postcssCalc({
        preserve: false,
        warnWhenCannotResolve: false,
      }),
    ]).process(root, { from: undefined }).sync()
  }
}

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
    resolveTailwindSpacingCalculations(root)
    insertWebkitBackgroundClipText(root)
    return root.toString()
  }
  catch {
    return css
  }
}
