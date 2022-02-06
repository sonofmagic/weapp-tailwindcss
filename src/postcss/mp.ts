import type { Rule, AtRule } from 'postcss'
import { Declaration } from 'postcss'
import { cssSelectorReplacer } from './shared'
function isSupportedRule (selector: string) {
  return !selector.includes(':hover')
}

export function commonChunkPreflight (node: Rule) {
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
  //* , ::before, ::after
  if (node.selector.includes('*')) {
    // console.log('[hit]:*')
    node.selector = node.selector.replace('*', 'view')
  }

  if (node.selector.includes('*::before')) {
    // console.log('[hit]:*::before')
    node.selector = node.selector.replace('*::before', 'view::before')
  }

  if (node.selector.includes('*::after')) {
    // console.log('[hit]:*::after')
    node.selector = node.selector.replace('*::after', 'view::after')
  }
  // 变量注入和 preflight
  if (node.selector.includes('::before') && node.selector.includes('::after')) {
    node.selector = 'view,view::before,view::after'
    const decl1 = new Declaration({
      prop: 'box-sizing',
      value: 'border-box'
    })
    const decl2 = new Declaration({
      prop: 'border-width',
      value: '0'
    })
    const decl3 = new Declaration({
      prop: 'border-style',
      value: 'solid'
    })
    const decl4 = new Declaration({
      prop: 'border-color',
      value: 'currentColor'
    })
    node.append(decl1, decl2, decl3, decl4)
  }
}

export function mpRulePreflight (node: Rule) {
  // console.log(node.selector)
  if (!isSupportedRule(node.selector)) {
    node.remove()
    return
  }

  node.selector = cssSelectorReplacer(node.selector)

  // node.walkDecls((decl) => {
  //   if (decl.prop === 'visibility') {
  //     switch (decl.value) {
  //       case 'hidden':
  //         decl.replaceWith(decl.clone({ value: 'collapse' }))
  //         return
  //     }
  //   }

  //   if (decl.prop === 'vertical-align') {
  //     switch (decl.value) {
  //       case 'middle':
  //         decl.replaceWith(decl.clone({ value: 'center' }))
  //     }
  //   }
  // })
}

export function mpAtRulePreflight (node: AtRule) {
  // if (node.name === 'media') {
  // }
  // do nothing
}
