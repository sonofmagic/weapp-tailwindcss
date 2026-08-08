import postcssCalc from '@weapp-tailwindcss/postcss-calc'
import postcss from 'postcss'
import valueParser from 'postcss-value-parser'

const tailwindThemePropertyPatterns = [
  /^--aspect-/,
  /^--animate-/,
  /^--blur-/,
  /^--breakpoint-/,
  /^--color-/,
  /^--container-/,
  /^--drop-shadow-/,
  /^--ease-/,
  /^--default-font-/,
  /^--font-/,
  /^--font-weight-/,
  /^--inset-shadow-/,
  /^--leading-/,
  /^--perspective-/,
  /^--radius-/,
  /^--shadow-/,
  /^--text-/,
  /^--tracking-/,
  /^--spacing$/,
]

function isTailwindThemeProperty(property: string) {
  return tailwindThemePropertyPatterns.some(pattern => pattern.test(property))
}

function isThemeScopeSelector(selector: string) {
  return selector.split(',').some((part) => {
    const normalized = part.trim()
    return normalized === ':root' || normalized === ':host'
  })
}

function collectTailwindThemeProperties(root: postcss.Root) {
  const values = new Map<string, string>()
  root.walkRules((rule) => {
    if (!isThemeScopeSelector(rule.selector)) {
      return
    }
    rule.walkDecls((decl) => {
      if (isTailwindThemeProperty(decl.prop)) {
        values.set(decl.prop, decl.value.trim())
      }
    })
  })
  return values
}

function resolveThemeValue(
  value: string,
  properties: ReadonlyMap<string, string>,
  resolving: ReadonlySet<string> = new Set(),
): string {
  if (!value.includes('var(')) {
    return value
  }

  const parsed = valueParser(value)
  parsed.walk((node) => {
    if (node.type !== 'function' || node.value.toLowerCase() !== 'var') {
      return
    }
    const propertyNode = node.nodes.find(child => child.type === 'word' && child.value.startsWith('--'))
    const property = propertyNode?.value
    if (!property || resolving.has(property)) {
      return
    }
    const propertyValue = properties.get(property)
    if (!propertyValue) {
      return
    }
    const nextResolving = new Set(resolving)
    nextResolving.add(property)
    const resolved = resolveThemeValue(propertyValue, properties, nextResolving)
    const mutableNode = node as any
    mutableNode.type = 'word'
    mutableNode.value = resolved
    delete mutableNode.nodes
  })
  return parsed.toString()
}

function removeConsumedThemeProperties(root: postcss.Root) {
  root.walkRules((rule) => {
    if (!isThemeScopeSelector(rule.selector)) {
      return
    }
    rule.walkDecls((decl) => {
      if (isTailwindThemeProperty(decl.prop)) {
        decl.remove()
      }
    })
    if (rule.nodes.length === 0) {
      rule.remove()
    }
  })
}

/** 将 Lynx 原生无法继承的 Tailwind theme 变量静态化。 */
export function transformLynxCssCompat(css: string) {
  try {
    const root = postcss.parse(css)
    const properties = collectTailwindThemeProperties(root)
    if (properties.size === 0) {
      return css
    }

    root.walkDecls((decl) => {
      decl.value = resolveThemeValue(decl.value, properties)
    })
    removeConsumedThemeProperties(root)
    postcss([postcssCalc()]).process(root, { from: undefined }).sync()
    return root.toString()
  }
  catch {
    return css
  }
}
