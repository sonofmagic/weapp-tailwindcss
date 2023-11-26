import { Rule, Declaration } from 'postcss'
import cssVars from './cssVars'
import { composeIsPseudo } from './shared'
import type { IStyleHandlerOptions } from '@/types'

const initialNodes = cssVars.map((x) => {
  return new Declaration({
    prop: x.prop,
    value: x.value
  })
})
// ':not(template) ~ :not(template)'
// ':not(template)~:not(template)'
// const regexp1 = /:not\(template\)\s*~\s*:not\(template\)/g
// :not([hidden])~:not([hidden])
// :not([hidden]) ~ :not([hidden])
// const regexp2 = /:not\(\[hidden\]\)\s*~\s*:not\(\[hidden\]\)/g

/**
 * 带有子选择器的
 * https://tailwindcss.com/docs/space
 * .space-x-4>:not([hidden])~:not([hidden])
 *
 * https://tailwindcss.com/docs/divide-width
 * .divide-x>:not([hidden])~:not([hidden])
 *
 * https://tailwindcss.com/docs/divide-color
 * .divide-blue-200>:not([hidden])~:not([hidden])
 * :is(.dark .dark\:divide-slate-700)>:not([hidden])~:not([hidden])
 *
 * https://tailwindcss.com/docs/divide-style
 * .divide-dashed>:not([hidden])~:not([hidden])
 *
 * 其中小程序里直接写
 * .divide-y-4>:not(hidden) + :not(hidden)
 * 会语法错误
 */

// eslint-disable-next-line unicorn/better-regex
const PATTERNS = [/:not\(template\)\s*~\s*:not\(template\)/.source, /:not\(\[hidden\]\)\s*~\s*:not\(\[hidden\]\)/.source].join('|')
const BROAD_MATCH_GLOBAL_REGEXP = new RegExp(PATTERNS, 'g')

export function testIfVariablesScope(node: Rule, count = 2): boolean {
  if (/:?:before/.test(node.selector) && /:?:after/.test(node.selector)) {
    const nodes = node.nodes
    let c = 0
    for (const tryTestDecl of nodes) {
      if (tryTestDecl && tryTestDecl.type === 'decl' && tryTestDecl.prop.startsWith('--tw-')) {
        c++
      }
      if (c >= count) {
        return true
      }
    }
    return false
  }
  return false
}

export function testIfTwBackdrop(node: Rule, count = 2) {
  if (node.type === 'rule' && node.selector === '::backdrop') {
    const nodes = node.nodes
    let c = 0
    for (const tryTestDecl of nodes) {
      if (tryTestDecl && tryTestDecl.type === 'decl' && tryTestDecl.prop.startsWith('--tw-')) {
        c++
      }
      if (c >= count) {
        return true
      }
    }
    return false
  }
  return false
}

export function makePseudoVarRule() {
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
  return pseudoVarRule
}

export function remakeCssVarSelector(selectors: string[], cssPreflightRange: IStyleHandlerOptions['cssPreflightRange']) {
  if (
    cssPreflightRange === 'all' && // 默认对每个元素都生效
    !selectors.includes(':not(not)')
  ) {
    selectors.push(':not(not)')
  }

  return selectors
}

export function remakeCombinatorSelector(selector: string, cssChildCombinatorReplaceValue: IStyleHandlerOptions['cssChildCombinatorReplaceValue']) {
  let childCombinatorReplaceValue = 'view + view'

  if (Array.isArray(cssChildCombinatorReplaceValue) && cssChildCombinatorReplaceValue.length > 0) {
    const x = composeIsPseudo(cssChildCombinatorReplaceValue)
    childCombinatorReplaceValue = x + ' + ' + x
  } else if (typeof cssChildCombinatorReplaceValue === 'string') {
    childCombinatorReplaceValue = cssChildCombinatorReplaceValue
  }
  return selector.replaceAll(BROAD_MATCH_GLOBAL_REGEXP, childCombinatorReplaceValue)
}

export function commonChunkPreflight(node: Rule, options: IStyleHandlerOptions) {
  // css vars scope
  node.selector = remakeCombinatorSelector(node.selector, options.cssChildCombinatorReplaceValue)

  // 变量注入和 preflight
  if (testIfVariablesScope(node)) {
    node.selectors = remakeCssVarSelector(node.selectors, options.cssPreflightRange)
    node.before(makePseudoVarRule())
    if (typeof options.cssInjectPreflight === 'function') {
      node.append(...options.cssInjectPreflight())
    }
  }
  if (options.injectAdditionalCssVarScope && testIfTwBackdrop(node)) {
    const syntheticRule = new Rule({
      selectors: ['*', '::after', '::before'],
      nodes: initialNodes
    })
    syntheticRule.selectors = remakeCssVarSelector(syntheticRule.selectors, options.cssPreflightRange)
    node.before(syntheticRule)
    node.before(makePseudoVarRule())
    if (typeof options.cssInjectPreflight === 'function') {
      syntheticRule.append(...options.cssInjectPreflight())
    }
  }
}
