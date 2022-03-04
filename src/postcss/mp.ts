import type { Rule, AtRule } from 'postcss'
import { Declaration } from 'postcss'
import { cssSelectorReplacer } from './shared'
function isSupportedRule (selector: string) {
  return !selector.includes(':hover')
}
// ':not(template) ~ :not(template)'
// ':not(template)~:not(template)'
const regexp1 = /:not\(template\)\s*~\s*:not\(template\)/g
// :not([hidden])~:not([hidden])
// :not([hidden]) ~ :not([hidden])
const regexp2 = /:not\(\[hidden\]\)\s*~\s*:not\(\[hidden\]\)/g

export function getViewElementPreflight () {
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
  return [decl1, decl2, decl3, decl4]
}

export function commonChunkPreflight (node: Rule) {
  if (regexp1.test(node.selector)) {
    node.selector = node.selector.replace(regexp1, 'view + view')
  }

  if (regexp2.test(node.selector)) {
    node.selector = node.selector.replace(regexp2, 'view + view')
  }
  //* , ::before, ::after
  if (node.selector.includes('*')) {
    // console.log('[hit]:*')
    node.selector = node.selector.replace('*', 'view')
  }

  if (node.selector.includes('*::before')) {
    node.selector = node.selector.replace('*::before', 'view::before')
  }

  if (node.selector.includes('*::after')) {
    node.selector = node.selector.replace('*::after', 'view::after')
  }
  // 变量注入和 preflight
  if (node.selector.includes('::before') && node.selector.includes('::after')) {
    node.selector = 'view,view::before,view::after'
    // node.walkDecls((decl) => {
    //   // remove empty var 来避免压缩css报错
    //   if (/^\s*$/.test(decl.value)) {
    //     decl.remove()
    //   }
    //   // console.log(decl.prop, decl.value)
    // })
    node.append(...getViewElementPreflight())
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
