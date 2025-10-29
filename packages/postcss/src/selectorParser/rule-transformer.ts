import type { Declaration, Rule } from 'postcss'
import type { Node, Pseudo, Selector, SyncProcessor } from 'postcss-selector-parser'
import type { IStyleHandlerOptions } from '../types'
import psp from 'postcss-selector-parser'
import { composeIsPseudo, internalCssSelectorReplacer } from '../shared'
import {
  getCombinatorSelectorAst,
  normalizeTransformOptions,
} from './utils'

export type RuleTransformer = (rule: Rule) => void

const ruleTransformCache = new WeakMap<IStyleHandlerOptions, RuleTransformer>()

const spacingPropSet = new Set([
  'margin-top',
  'margin-bottom',
  'margin-left',
  'margin-right',
  'margin-inline-start',
  'margin-inline-end',
  'margin-block-start',
  'margin-block-end',
  'border-top-width',
  'border-bottom-width',
  'border-left-width',
  'border-right-width',
  'border-inline-start-width',
  'border-inline-end-width',
  'border-block-start-width',
  'border-block-end-width',
])

function includesVariableReference(value: string) {
  return value.includes('var(')
}

function dedupeSpacingProps(rule: Rule) {
  const grouped = new Map<string, Declaration[]>()

  for (const node of rule.nodes) {
    if (node.type !== 'decl') {
      continue
    }
    if (!spacingPropSet.has(node.prop)) {
      continue
    }
    const list = grouped.get(node.prop)
    if (list) {
      list.push(node)
    }
    else {
      grouped.set(node.prop, [node])
    }
  }

  for (const [, declarations] of grouped) {
    if (declarations.length <= 1) {
      continue
    }

    const unique: Declaration[] = []
    const seenValues = new Set<string>()

    for (const decl of declarations) {
      if (decl.parent !== rule) {
        continue
      }
      const key = `${decl.important ? '!important@@' : ''}${decl.value}`
      if (seenValues.has(key)) {
        decl.remove()
        continue
      }
      seenValues.add(key)
      unique.push(decl)
    }

    if (unique.length <= 1) {
      continue
    }

    const literals: Declaration[] = []
    const variables: Declaration[] = []

    for (const decl of unique) {
      if (includesVariableReference(decl.value)) {
        variables.push(decl)
      }
      else {
        literals.push(decl)
      }
    }

    if (variables.length === 0 || literals.length === 0) {
      continue
    }

    const ordered = [...literals, ...variables]

    let needReorder = false
    for (let index = 0; index < ordered.length; index++) {
      if (ordered[index] !== unique[index]) {
        needReorder = true
        break
      }
    }

    if (!needReorder) {
      continue
    }

    const anchor = unique[unique.length - 1]?.next() ?? undefined

    for (const decl of unique) {
      decl.remove()
    }

    for (const decl of ordered) {
      if (anchor) {
        rule.insertBefore(anchor, decl)
      }
      else {
        rule.append(decl)
      }
    }
  }
}

function isNotLastChildPseudo(node?: Node | null): node is Pseudo {
  if (!node || node.type !== 'pseudo' || node.value !== ':not') {
    return false
  }

  const selectors = node.nodes
  if (!selectors || selectors.length !== 1) {
    return false
  }

  const firstSelector = selectors[0]
  if (firstSelector.type !== 'selector') {
    return false
  }

  const target = firstSelector.nodes?.[0]
  return Boolean(target && target.type === 'pseudo' && target.value === ':last-child')
}

function transformSpacingSelector(nodes: Node[] | undefined, options: IStyleHandlerOptions): boolean {
  if (!nodes || nodes.length === 0) {
    return false
  }

  for (let idx = 0; idx < nodes.length; idx++) {
    const current = nodes[idx]
    if (current.type !== 'class' && current.type !== 'nesting') {
      continue
    }

    const combinator = nodes[idx + 1]
    if (!combinator || combinator.type !== 'combinator' || combinator.value !== '>') {
      continue
    }

    const candidate = nodes[idx + 2]
    if (!isNotLastChildPseudo(candidate)) {
      continue
    }

    const ast = getCombinatorSelectorAst(options)
    candidate.replaceWith(...ast)
    return true
  }

  return false
}

function normalizeSpacingDeclarations(rule: Rule) {
  for (const node of [...rule.nodes]) {
    if (node.type !== 'decl') {
      continue
    }

    switch (node.prop) {
      case 'margin-block-start':
        node.prop = 'margin-block-end'
        break
      case 'margin-block-end':
        node.prop = 'margin-block-start'
        break
      case 'margin-inline-start':
        node.prop = 'margin-inline-end'
        break
      case 'margin-inline-end':
        node.prop = 'margin-inline-start'
        break
      case 'margin-top':
        node.prop = 'margin-bottom'
        break
      case 'margin-bottom':
        node.prop = 'margin-top'
        break
      case 'margin-left':
        node.prop = 'margin-right'
        break
      case 'margin-right':
        node.prop = 'margin-left'
        break
      case 'border-inline-start-width':
        node.prop = 'border-right-width'
        break
      case 'border-inline-end-width':
        node.prop = 'border-left-width'
        break
      case 'border-top-width':
        node.prop = 'border-bottom-width'
        break
      case 'border-bottom-width':
        node.prop = 'border-top-width'
        break
      case 'border-left-width':
        node.prop = 'border-right-width'
        break
      case 'border-right-width':
        node.prop = 'border-left-width'
        break
      case '-webkit-margin-start':
      case '-webkit-margin-end':
      case '-webkit-margin-before':
      case '-webkit-margin-after':
        node.remove()
        break
      default:
        break
    }
  }

  dedupeSpacingProps(rule)
}

function createRuleTransformer(options: IStyleHandlerOptions): RuleTransformer {
  let currentRule: Rule | undefined

  const { escapeMap, cssSelectorReplacement, cssRemoveHoverPseudoClass, uniAppX } = options

  const transform: SyncProcessor = (selectors) => {
    const rule = currentRule
    if (!rule) {
      return
    }

    let requiresSpacingNormalization = false

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
            return
          }
        }

        if (transformSpacingSelector(selector.nodes, options)) {
          requiresSpacingNormalization = true
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
            const targetSelector = selector.nodes?.[0] as Selector | undefined
            if (targetSelector && targetSelector.type === 'selector') {
              if (transformSpacingSelector(targetSelector.nodes, options)) {
                requiresSpacingNormalization = true
              }
            }
            selector.replaceWith(...selector.nodes)
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

    if (requiresSpacingNormalization) {
      normalizeSpacingDeclarations(rule)
    }

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
