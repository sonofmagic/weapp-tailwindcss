import { Rule, Declaration } from 'postcss'
// import { cssSelectorReplacer } from './shared'
import type { StyleHandlerOptions } from '@/types'
// import type { InjectPreflight } from './preflight'
// function isSupportedRule (selector: string) {
//   return !selector.includes(':hover')
// }

// ':not(template) ~ :not(template)'
// ':not(template)~:not(template)'
// const regexp1 = /:not\(template\)\s*~\s*:not\(template\)/g
// :not([hidden])~:not([hidden])
// :not([hidden]) ~ :not([hidden])
// const regexp2 = /:not\(\[hidden\]\)\s*~\s*:not\(\[hidden\]\)/g

const PATTERNS = [/:not\(template\)\s*~\s*:not\(template\)/.source, /:not\(\[hidden\]\)\s*~\s*:not\(\[hidden\]\)/.source].join('|')
const BROAD_MATCH_GLOBAL_REGEXP = new RegExp(PATTERNS, 'g')

export function commonChunkPreflight (node: Rule, options: StyleHandlerOptions) {
  node.selector = node.selector.replace(BROAD_MATCH_GLOBAL_REGEXP, 'view + view')

  // 变量注入和 preflight
  if (/:?:before/.test(node.selector) && /:?:after/.test(node.selector)) {
    // node.selector = node.selector.replace(/\*/g, 'view')
    const selectorParts = node.selector.split(',')
    // 没有 view 元素时，添加 view
    if (!selectorParts.includes('view')) {
      selectorParts.push('view')
    }
    if (options.cssPreflightRange === 'all') {
      // 默认对每个元素都生效
      if (!selectorParts.includes(':not(not)')) {
        selectorParts.push(':not(not)')
      }
    }

    node.selector = selectorParts.join(',')

    // node.walkDecls((decl) => {
    //   // remove empty var 来避免压缩css报错
    //   if (/^\s*$/.test(decl.value)) {
    //     decl.remove()
    //   }
    //   //  console.log(decl.prop, decl.value)
    // })

    // preset
    if (typeof options.cssInjectPreflight === 'function') {
      node.append(...options.cssInjectPreflight())
    }

    const pseudoVarRule = new Rule({
      // selectors: ['::before', '::after'],
      selector: '::before,::after'
    })
    pseudoVarRule.append(
      new Declaration({
        prop: '--tw-content',
        value: '""'
      })
    )
    node.before(pseudoVarRule)
  }
}

// export function removeUnsupportedRule (node: Rule, options?: StyleHandlerOptions) {
//   if (!isSupportedRule(node.selector)) {
//     node.remove()
//   }
// }

/**
 * @deprecated
 */
// export function mpRulePreflight (node: Rule, options?: StyleHandlerOptions) {
//   node.selector = cssSelectorReplacer(node.selector)
// }

// export function mpAtRulePreflight (node: AtRule) {
// if (node.name === 'media') {
// }
// do nothing
// }
