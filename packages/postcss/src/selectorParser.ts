import type { Rule } from 'postcss'
import type { SyncProcessor } from 'postcss-selector-parser'
import type { IStyleHandlerOptions } from './types'
import selectorParser from 'postcss-selector-parser'
import { composeIsPseudo, internalCssSelectorReplacer } from './shared'

function createRuleTransform(rule: Rule, options: IStyleHandlerOptions) {
  const { escapeMap, mangleContext, cssSelectorReplacement, cssRemoveHoverPseudoClass } = options

  const transform: SyncProcessor = (selectors) => {
    selectors.walk((selector) => {
      // do something with the selector
      // node.selector.replace(/\*/g, 'view')
      if (selector.type === 'universal' && cssSelectorReplacement?.universal) {
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
        && cssSelectorReplacement?.root
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

export function ruleTransformSync(rule: Rule, options: IStyleHandlerOptions) {
  const transformer = selectorParser(createRuleTransform(rule, options))

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

export function getFallbackRemove(rule?: Rule) {
  const fallbackRemove = selectorParser((selectors) => {
    let maybeImportantId = false
    selectors.walk((selector, idx) => {
      if (idx === 0 && (selector.type === 'id' || selector.type === 'class' || selector.type === 'attribute')) {
        maybeImportantId = true
      }
      if (selector.type === 'universal') {
        selector.parent?.remove()
      }
      if (selector.type === 'pseudo') {
        if (selector.value === ':is') {
          if (maybeImportantId && selector.nodes[0]?.type === 'selector') {
            selector.replaceWith(selector.nodes[0])
          }
          else {
            selector.parent?.remove()
          }
        }
        else if (selector.value === ':not') {
          for (const x of selector.nodes) {
            if (
              x.nodes.length === 1
              && x.nodes[0].type === 'id'
              && x.nodes[0].value === '#'
            ) {
              // if (removeNegationPseudoClass) {
              //   selector.remove()
              // }
              x.nodes = [
                selectorParser.tag({
                  value: '#n',
                }),
              ]
            }
          }
        }
        else if (selector.value === ':where') {
          for (const n of selector.nodes) {
            for (const node of n.nodes) {
              if (node.type === 'attribute') {
                node.remove()
              }
            }
          }
        }
      }
      if (selector.type === 'attribute') {
        if (selector.attribute === 'hidden') {
          rule?.remove()
        }
      }
    })
    selectors.walk((selector) => {
      if (selector.type === 'pseudo') {
        if (selector.value === ':where') {
          const res = selector.nodes.every(x => x.nodes.length === 0)
          if (res) {
            selector.remove()
          }
          // for (const x of selector.nodes) {
          //   if (x.nodes.length === 0) {
          //     x.remove()
          //   }
          // }
        }
      }
    })
  })
  return fallbackRemove
}
