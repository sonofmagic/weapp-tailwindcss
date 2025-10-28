import type { Rule } from 'postcss'
import type { SyncProcessor } from 'postcss-selector-parser'
import type { IStyleHandlerOptions } from '../types'
import psp from 'postcss-selector-parser'
import { composeIsPseudo, internalCssSelectorReplacer } from '../shared'
import {
  getCombinatorSelectorAst,
  normalizeTransformOptions,
} from './utils'

export type RuleTransformer = (rule: Rule) => void

const ruleTransformCache = new WeakMap<IStyleHandlerOptions, RuleTransformer>()

function createRuleTransformer(options: IStyleHandlerOptions): RuleTransformer {
  let currentRule: Rule | undefined

  const { escapeMap, cssSelectorReplacement, cssRemoveHoverPseudoClass, uniAppX } = options

  const transform: SyncProcessor = (selectors) => {
    const rule = currentRule
    if (!rule) {
      return
    }

    selectors.walk((selector, index) => {
      if (selector.type === 'class') {
        selector.value = internalCssSelectorReplacer(selector.value, {
          escapeMap,
        })
      }
      else if (selector.type === 'universal') {
        if (cssSelectorReplacement?.universal) {
          selector.value = composeIsPseudo(cssSelectorReplacement.universal)
        }
      }
      else if (selector.type === 'selector') {
        if (cssRemoveHoverPseudoClass) {
          const node = selector.nodes.find(x => x.type === 'pseudo' && x.value === ':hover')
          if (node) {
            selector.remove()
          }
        }
      }
      else if (selector.type === 'pseudo') {
        if (
          selector.value === ':root'
          && cssSelectorReplacement?.root) {
          selector.value = composeIsPseudo(cssSelectorReplacement.root)
        }
        else if (selector.value === ':where') {
          if (uniAppX) {
            selector.value = ':is'
          }
          if (index === 0 && selector.length === 1) {
            selector.walk((node, idx) => {
              if (idx === 0 && node.type === 'class') {
                const nodes = node.parent?.nodes
                if (nodes) {
                  const first = nodes[idx + 1]
                  if (first && first.type === 'combinator' && first.value === '>') {
                    const second = nodes[idx + 2]
                    if (second && second.type === 'pseudo' && second.value === ':not' && second.first.first.type === 'pseudo' && second.first.first.value === ':last-child') {
                      const ast = getCombinatorSelectorAst(options)

                      second.replaceWith(
                        ...ast,
                      )
                    }
                  }
                }
              }
            })

            selector.replaceWith(...selector.nodes)
            for (const node of rule.nodes) {
              if (node.type === 'decl') {
                if (node.prop === 'margin-block-start') {
                  node.prop = 'margin-block-end'
                }
                else if (node.prop === 'margin-block-end') {
                  node.prop = 'margin-block-start'
                }
                else if (node.prop === 'margin-inline-start') {
                  node.prop = 'margin-inline-end'
                }
                else if (node.prop === 'margin-inline-end') {
                  node.prop = 'margin-inline-start'
                }
                else if (node.prop === 'margin-top') {
                  node.prop = 'margin-bottom'
                }
                else if (node.prop === 'margin-bottom') {
                  node.prop = 'margin-top'
                }
                else if (node.prop === 'margin-left') {
                  node.prop = 'margin-right'
                }
                else if (node.prop === 'margin-right') {
                  node.prop = 'margin-left'
                }
                else if (node.prop === 'border-inline-start-width') {
                  node.prop = 'border-right-width'
                }
                else if (node.prop === 'border-inline-end-width') {
                  node.prop = 'border-left-width'
                }
                else if (node.prop === 'border-top-width') {
                  node.prop = 'border-bottom-width'
                }
                else if (node.prop === 'border-bottom-width') {
                  node.prop = 'border-top-width'
                }
                else if (node.prop === 'border-left-width') {
                  node.prop = 'border-right-width'
                }
                else if (node.prop === 'border-right-width') {
                  node.prop = 'border-left-width'
                }
                else if (node.prop === '-webkit-margin-start' || node.prop === '-webkit-margin-end' || node.prop === '-webkit-margin-before' || node.prop === '-webkit-margin-after') {
                  node.remove()
                }
              }
            }
          }
        }
      }
      else if (selector.type === 'combinator') {
        if (selector.value === '>') {
          const nodes = selector.parent?.nodes
          if (nodes) {
            const first = nodes[index + 1]
            if (first && first.type === 'pseudo' && first.value === ':not'
              && (
                (first.first.first.type === 'attribute' && first.first.first.attribute === 'hidden')
                || (first.first.first.type === 'tag' && first.first.first.value === 'template')
              )) {
              const second = nodes[index + 2]
              if (second && second.type === 'combinator' && (second.value === '~' || second.value === '+')) {
                const third = nodes[index + 3]
                if (third && third.type === 'pseudo' && third.value === ':not' && (
                  (third.first.first.type === 'attribute' && third.first.first.attribute === 'hidden')
                  || (third.first.first.type === 'tag' && third.first.first.value === 'template')
                )) {
                  const ast = getCombinatorSelectorAst(options)
                  selector.parent?.nodes.splice(
                    index + 1,
                    3,
                    ...ast,
                  )
                }
              }
            }
          }
        }
      }
      else if (selector.type === 'tag') {
        if (uniAppX) {
          selector.remove()
        }
      }
      else if (selector.type === 'attribute') {
        if (uniAppX) {
          selector.remove()
        }
      }
    })
    selectors.walk((selector) => {
      if (selector.type === 'selector') {
        selector.length === 0 && selector.remove()
      }
    })
    if (selectors.length === 0) {
      rule.remove()
    }
  }
  const parser = psp(transform)

  return (rule: Rule) => {
    currentRule = rule
    try {
      parser.transformSync(rule, normalizeTransformOptions())
    }
    finally {
      currentRule = undefined
    }
  }
}

export function ruleTransformSync(rule: Rule, options: IStyleHandlerOptions) {
  let transformer = ruleTransformCache.get(options)
  if (!transformer) {
    transformer = createRuleTransformer(options)
    ruleTransformCache.set(options, transformer)
  }
  transformer(rule)
}
