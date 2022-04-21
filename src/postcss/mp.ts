import type { Rule, AtRule } from 'postcss'
import { cssSelectorReplacer } from './shared'

import type { InjectPreflight } from './preflight'
function isSupportedRule (selector: string) {
  return !selector.includes(':hover')
}
const PATTERNS = [/:not\(template\)\s*~\s*:not\(template\)/.source, /:not\(\[hidden\]\)\s*~\s*:not\(\[hidden\]\)/.source].join('|')
const BROAD_MATCH_GLOBAL_REGEXP = new RegExp(PATTERNS, 'g')
// ':not(template) ~ :not(template)'
// ':not(template)~:not(template)'
// const regexp1 = /:not\(template\)\s*~\s*:not\(template\)/g
// :not([hidden])~:not([hidden])
// :not([hidden]) ~ :not([hidden])
// const regexp2 = /:not\(\[hidden\]\)\s*~\s*:not\(\[hidden\]\)/g

export function commonChunkPreflight (node: Rule, cssInjectPreflight: InjectPreflight) {
  node.selector = node.selector.replace(BROAD_MATCH_GLOBAL_REGEXP, 'view + view').replace(/\*/g, 'view')

  // 变量注入和 preflight
  if (/::before/.test(node.selector) && /::after/.test(node.selector)) {
    const selectorParts = node.selector.split(',')
    if (!selectorParts.includes('view')) {
      selectorParts.push('view')
      node.selector = selectorParts.join(',')
    }

    // node.walkDecls((decl) => {
    //   // remove empty var 来避免压缩css报错
    //   if (/^\s*$/.test(decl.value)) {
    //     decl.remove()
    //   }
    //   //  console.log(decl.prop, decl.value)
    // })

    // preset
    if (typeof cssInjectPreflight === 'function') {
      node.append(...cssInjectPreflight())
    }
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
