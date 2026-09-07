import type { ElementNode } from '@vue/compiler-dom'
import type MagicString from 'magic-string'
import type { CssPreflightOptions } from '@/types'
import { NodeTypes } from '@vue/compiler-dom'
import { createInjectPreflight, postcss } from '@weapp-tailwindcss/postcss'

export const BORDER_PREFLIGHT_CLASS = 'weapp-tw-border'

/** 框架回放组件样式后恢复基础规则的顺序，确保作者 class 可以覆盖重置。 */
export function hoistUniAppXBorderPreflight(css: string) {
  if (!css.includes(BORDER_PREFLIGHT_CLASS)) {
    return css
  }
  const root = postcss.parse(css)
  const resets = root.nodes.filter(node => node.type === 'rule' && node.selector === `.${BORDER_PREFLIGHT_CLASS}`)
  const anchor = root.nodes.find(node => !resets.includes(node)
    && node.type !== 'comment'
    && !(node.type === 'atrule' && ['charset', 'import'].includes(node.name)))
  if (!anchor || resets.length === 0) {
    return css
  }
  for (const reset of resets) {
    reset.remove()
    root.insertBefore(anchor, reset)
  }
  return root.toString()
}

/** uni-app x 移除通配符 preflight 后，用独立基础类承载用户配置的边框默认值。 */
export function createUniAppXBorderPreflight(options?: CssPreflightOptions) {
  const declarations = createInjectPreflight(options)()
    .filter(({ prop }) => prop === 'border' || prop.startsWith('border-'))
  if (declarations.length === 0) {
    return undefined
  }
  const rule = postcss.rule({ selector: `.${BORDER_PREFLIGHT_CLASS}` })
  for (const declaration of declarations) {
    rule.append(postcss.decl(declaration))
  }
  return rule.toString()
}

export function shouldInjectBorderPreflight(node: ElementNode, range?: 'all') {
  return range === 'all'
    ? !['template', 'slot', 'block'].includes(node.tag)
    : node.tag === 'view' || node.tag === 'text'
}

/** 在既有 class 转换完成后插入基础类，保持 utility 与动态绑定的原始顺序。 */
export function injectBorderPreflightClass(ms: MagicString, node: ElementNode, offset: number) {
  const attribute = node.props.find(prop => prop.type === NodeTypes.ATTRIBUTE && prop.name === 'class')
  if (attribute?.type === NodeTypes.ATTRIBUTE) {
    if (attribute.value) {
      if (attribute.value.content.split(/\s+/).includes(BORDER_PREFLIGHT_CLASS)) {
        return
      }
      const start = offset + attribute.value.loc.start.offset
      const quoted = /^["']/.test(attribute.value.loc.source)
      if (quoted) {
        ms.prependRight(start + 1, `${BORDER_PREFLIGHT_CLASS} `)
      }
      else {
        ms.prependRight(start, `"${BORDER_PREFLIGHT_CLASS} `)
        ms.appendLeft(offset + attribute.value.loc.end.offset, '"')
      }
    }
    else {
      ms.appendLeft(offset + attribute.loc.end.offset, `="${BORDER_PREFLIGHT_CLASS}"`)
    }
    return
  }
  ms.appendLeft(offset + node.loc.start.offset + node.tag.length + 1, ` class="${BORDER_PREFLIGHT_CLASS}"`)
}
