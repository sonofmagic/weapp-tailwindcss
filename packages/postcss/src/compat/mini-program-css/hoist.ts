import postcss from 'postcss'
import {
  isMiniProgramPreflightRule,
  isMiniProgramThemeVariableRule,
} from './predicates'
import { getSortedRuleSelectorKey } from './selectors'

const HOIST_ANCHOR_COMMENT = '__weapp_tailwindcss_base_anchor__'

function getTopDirectiveTail(root: postcss.Root) {
  let tail: postcss.Node | undefined
  for (const node of root.nodes ?? []) {
    if (node.type === 'atrule' && (node.name === 'charset' || node.name === 'import')) {
      tail = node
      continue
    }
    break
  }
  return tail
}

export function createHoistInsertionAnchor(root: postcss.Root) {
  for (const node of root.nodes ?? []) {
    if (isMiniProgramPreflightRule(node) || isMiniProgramThemeVariableRule(node)) {
      const anchor = postcss.comment({
        text: HOIST_ANCHOR_COMMENT,
      })
      node.before(anchor)
      return anchor
    }
  }
}

export function insertHoistedRules(root: postcss.Root, rules: postcss.Rule[], anchor?: postcss.Comment) {
  if (anchor && !anchor.parent) {
    anchor = undefined
  }
  if (rules.length === 0) {
    anchor?.remove()
    return
  }

  const topDirectiveTail = getTopDirectiveTail(root)
  const firstRule = rules[0]
  if (!firstRule) {
    return
  }
  if (anchor) {
    if (anchor.raws.before === undefined) {
      delete firstRule.raws.before
    }
    else {
      firstRule.raws.before = anchor.raws.before
    }
    anchor.replaceWith(rules)
    return
  }
  firstRule.raws.before = topDirectiveTail ? '\n' : ''
  if (topDirectiveTail) {
    topDirectiveTail.after(rules)
  }
  else {
    root.prepend(rules)
  }
}

export function mergeEquivalentHoistedRules(rules: postcss.Rule[]) {
  const mergedRules: postcss.Rule[] = []
  const ruleBySelector = new Map<string, postcss.Rule>()
  const propsBySelector = new Map<string, Set<string>>()

  for (const rule of rules) {
    const key = getSortedRuleSelectorKey(rule)
    const existingRule = ruleBySelector.get(key)
    if (existingRule) {
      const existingProps = propsBySelector.get(key) ?? new Set<string>()
      const nextNodes = (rule.nodes ?? []).filter((node) => {
        if (node.type !== 'decl') {
          return true
        }
        if (existingProps.has(node.prop)) {
          return false
        }
        existingProps.add(node.prop)
        return true
      })
      existingRule.append(...nextNodes.map(node => node.clone()))
      propsBySelector.set(key, existingProps)
      continue
    }
    ruleBySelector.set(key, rule)
    propsBySelector.set(key, new Set((rule.nodes ?? []).flatMap(node => node.type === 'decl' ? [node.prop] : [])))
    mergedRules.push(rule)
  }

  return mergedRules
}
