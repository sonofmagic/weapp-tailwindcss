import type { IStyleHandlerOptions } from './types'
import { Declaration, Rule } from 'postcss'
import cssVarsV3 from './cssVarsV3'
import cssVarsV4 from './cssVarsV4'
import { isOnlyBeforeAndAfterPseudoElement } from './selectorParser'

const cssVarsV3Nodes = cssVarsV3.map((x) => {
  return new Declaration({
    prop: x.prop,
    value: x.value,
  })
})

export const cssVarsV4Nodes = cssVarsV4.map((x) => {
  return new Declaration({
    prop: x.prop,
    value: x.value,
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

export function testIfVariablesScope(node: Rule, count = 2): boolean {
  if (isOnlyBeforeAndAfterPseudoElement(node)) {
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

export function testIfRootHostForV4(node: Rule) {
  return node.type === 'rule' && node.selector.includes(':root') && node.selector.includes(':host')
}

export function makePseudoVarRule() {
  const pseudoVarRule = new Rule({
    // selectors: ['::before', '::after'],
    selector: '::before,::after',
  })
  pseudoVarRule.append(
    new Declaration({
      prop: '--tw-content',
      value: '""',
    }),
  )
  return pseudoVarRule
}

export function remakeCssVarSelector(selectors: string[], options: IStyleHandlerOptions) {
  const { cssPreflightRange, cssSelectorReplacement } = options
  if (
    cssPreflightRange === 'all' // 默认对每个元素都生效
    && !selectors.includes(':not(not)')
  ) {
    selectors.push(':not(not)')
  }
  if (cssSelectorReplacement) {
    if (Array.isArray(cssSelectorReplacement.universal)) {
      if (
        !cssSelectorReplacement.universal.every((x) => {
          return selectors.includes(x)
        })
        && !selectors.includes('*')
      ) {
        selectors.unshift('*')
      }
    }
    else if (
      typeof cssSelectorReplacement.universal === 'string'
      && !selectors.includes(cssSelectorReplacement.universal)
      && !selectors.includes('*')
    ) {
      selectors.unshift('*')
    }
  }

  return selectors
}

export function commonChunkPreflight(node: Rule, options: IStyleHandlerOptions) {
  const { ctx, cssInjectPreflight, injectAdditionalCssVarScope } = options
  // css vars scope
  // node.selector = remakeCombinatorSelector(node.selector, options)

  // 变量注入和 preflight
  if (testIfVariablesScope(node)) {
    ctx?.markVariablesScope(node)
    node.selectors = remakeCssVarSelector(node.selectors, options)
    node.before(makePseudoVarRule())
    if (typeof cssInjectPreflight === 'function') {
      node.append(...cssInjectPreflight())
    }
  }
  const isTailwindcss4 = options.majorVersion === 4
  if (injectAdditionalCssVarScope && (isTailwindcss4 ? testIfRootHostForV4(node) : testIfTwBackdrop(node))) {
    const syntheticRule = new Rule({
      selectors: ['*', '::after', '::before'],
      nodes: isTailwindcss4 ? cssVarsV4Nodes : cssVarsV3Nodes,
    })
    syntheticRule.selectors = remakeCssVarSelector(syntheticRule.selectors, options)
    node.before(syntheticRule)
    node.before(makePseudoVarRule())
    if (typeof cssInjectPreflight === 'function') {
      syntheticRule.append(...cssInjectPreflight())
    }
  }
}
