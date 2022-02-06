import type { Rule, AtRule } from 'postcss'
import { cssSelectorReplacer } from './shared'
function isSupportedRule (selector: string) {
  return !selector.includes(':hover')
}

// Thanks to tailwind-one and postcss-uni-tailwind
// https://gitee.com/23323/tailwind-one
// https://gitee.com/hainc/postcss-uni-tailwind
export function mpRulePreflight (node: Rule) {
  if (node.selector.includes(':not(template) ~ :not(template)')) {
    node.selector = node.selector.replace(
      ':not(template) ~ :not(template)',
      'view + view'
    )
  }
  if (node.selector.includes(':not([hidden]) ~ :not([hidden])')) {
    node.selector = node.selector.replace(
      ':not([hidden]) ~ :not([hidden])',
      'view + view'
    )
  }

  if (node.selector.includes('*')) {
    node.selector = node.selector.replace('*', 'view')
  }

  if (node.selector.includes('*::before')) {
    node.selector = node.selector.replace('*::before', 'view::before')
  }

  if (node.selector.includes('*::after')) {
    node.selector = node.selector.replace('*::after', 'view:after')
  }

  if (!isSupportedRule(node.selector)) {
    node.remove()
    return
  }

  node.selector = cssSelectorReplacer(node.selector)

  node.walkDecls((decl) => {
    if (decl.prop === 'visibility') {
      switch (decl.value) {
        case 'hidden':
          decl.replaceWith(decl.clone({ value: 'collapse' }))
          return
      }
    }

    if (decl.prop === 'vertical-align') {
      switch (decl.value) {
        case 'middle':
          decl.replaceWith(decl.clone({ value: 'center' }))
      }
    }
  })
}

export function mpAtRulePreflight (node: AtRule) {
  // if (node.name === 'media') {
  // }
  // do nothing
}
