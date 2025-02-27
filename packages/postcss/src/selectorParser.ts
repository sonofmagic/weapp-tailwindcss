import type { Rule } from 'postcss'
import type { SyncProcessor } from 'postcss-selector-parser'
import type { IStyleHandlerOptions } from './types'
import psp from 'postcss-selector-parser'
import { getCombinatorSelectorAst } from './mp'
import { composeIsPseudo, internalCssSelectorReplacer } from './shared'

function createRuleTransform(rule: Rule, options: IStyleHandlerOptions) {
  const { escapeMap, mangleContext, cssSelectorReplacement, cssRemoveHoverPseudoClass } = options

  const transform: SyncProcessor = (selectors) => {
    selectors.walk((selector, index) => {
      // do something with the selector
      // node.selector.replace(/\*/g, 'view')
      if (selector.type === 'universal') {
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
          // :where(.space-y-1 > :not(:last-child))
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
          }
        }
      }
      else if (selector.type === 'class') {
        selector.value = internalCssSelectorReplacer(selector.value, {
          escapeMap,
          mangleContext,
        })
      }
      else if (selector.type === 'combinator') {
        // .space-x-4 > :not([hidden]) ~ :not([hidden])
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
    })
    if (selectors.length === 0) {
      rule.remove()
    }
  }
  return transform
}

export function ruleTransformSync(rule: Rule, options: IStyleHandlerOptions) {
  const transformer = psp(createRuleTransform(rule, options))

  return transformer.transformSync(rule, {
    lossless: false,
    updateSelector: true,
  })
}

export function isOnlyBeforeAndAfterPseudoElement(node: Rule) {
  let b = false
  let a = false

  psp((selectors) => {
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
  const fallbackRemove = psp((selectors) => {
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
                psp.tag({
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
