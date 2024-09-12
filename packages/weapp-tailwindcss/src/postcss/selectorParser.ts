import type { Rule } from 'postcss'
import type { SyncProcessor } from 'postcss-selector-parser'
import type { IStyleHandlerOptions } from '../types'
import selectorParser from 'postcss-selector-parser'
import { composeIsPseudo, internalCssSelectorReplacer } from './shared'

function createRuleTransform(rule: Rule, options: IStyleHandlerOptions) {
  const { escapeMap, mangleContext, cssSelectorReplacement, cssRemoveHoverPseudoClass } = options

  const transform: SyncProcessor = (selectors) => {
    selectors.walk((selector) => {
      // do something with the selector
      // node.selector.replace(/\*/g, 'view')
      if (selector.type === 'universal' && cssSelectorReplacement && cssSelectorReplacement.universal) {
        selector.value = composeIsPseudo(cssSelectorReplacement.universal)
      }

      if (cssRemoveHoverPseudoClass && selector.type === 'selector') {
        const node = selector.nodes.find(x => x.type === 'pseudo' && x.value === ':hover')
        if (node) {
          selector.remove()
        }
      }

      if (
        selector.type === 'pseudo'
        && selector.value === ':root'
        && cssSelectorReplacement
        && cssSelectorReplacement.root
      ) {
        selector.value = composeIsPseudo(cssSelectorReplacement.root)
      }

      if (selector.type === 'class') {
        selector.value = internalCssSelectorReplacer(selector.value, {
          escapeMap,
          mangleContext,
        })
      }
    })
    if (selectors.length === 0) {
      rule.remove()
    }
  }
  return transform
}

function getRuleTransformer(rule: Rule, options: IStyleHandlerOptions) {
  return selectorParser(createRuleTransform(rule, options))
}

export function ruleTransformSync(rule: Rule, options: IStyleHandlerOptions) {
  const transformer = getRuleTransformer(rule, options)

  return transformer.transformSync(rule, {
    lossless: false,
    updateSelector: true,
  })
}

export function isOnlyBeforeAndAfterPseudoElement(node: Rule) {
  let b = false
  let a = false

  selectorParser((selectors) => {
    selectors.walkPseudos((s) => {
      if (s.parent?.length === 1) {
        if (/^:?:before$/.test(s.value)) {
          b = true
        }
        if (/^:?:after$/.test(s.value)) {
          a = true
        }
      }
    })
  }).astSync(node)

  return b && a
}

export const fallbackRemove = selectorParser((selectors) => {
  selectors.walk((selector) => {
    if (selector.type === 'universal') {
      selector.parent?.remove()
    }
    if (selector.type === 'pseudo' && selector.value === ':is') {
      selector.parent?.remove()
    }
  })
})
