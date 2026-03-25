import type { Rule } from 'postcss'

interface SelectorMutationMeta {
  phase: string
  reason: string
}

interface RuleSelectorMutationState {
  count: number
  seen: Set<string>
  trace: string[]
}

const ruleSelectorMutationStateMap = new WeakMap<Rule, RuleSelectorMutationState>()
const DEFAULT_SELECTOR_MUTATION_LIMIT = 24

function toSelectorSignature(selectors: string[]) {
  return selectors.join(',')
}

function getRuleSelectorMutationState(rule: Rule) {
  let state = ruleSelectorMutationStateMap.get(rule)
  if (!state) {
    state = {
      count: 0,
      seen: new Set<string>(),
      trace: [],
    }
    const current = rule.selectors ?? []
    state.seen.add(toSelectorSignature(current))
    ruleSelectorMutationStateMap.set(rule, state)
  }
  return state
}

function pushTrace(state: RuleSelectorMutationState, meta: SelectorMutationMeta, selectors: string[]) {
  state.trace.push(`${meta.phase}:${meta.reason}:${toSelectorSignature(selectors)}`)
  if (state.trace.length > DEFAULT_SELECTOR_MUTATION_LIMIT) {
    state.trace.shift()
  }
}

function createSelectorCycleError(meta: SelectorMutationMeta, state: RuleSelectorMutationState, selectors: string[]) {
  const next = toSelectorSignature(selectors)
  const trace = [...state.trace, `${meta.phase}:${meta.reason}:${next}`].join(' -> ')
  return new Error(`[postcss-selector-guard] 检测到可能的选择器死循环: ${trace}`)
}

export function assignRuleSelectors(
  rule: Rule,
  selectors: string[],
  meta: SelectorMutationMeta,
): boolean {
  const current = rule.selectors ?? []
  const currentSignature = toSelectorSignature(current)
  const nextSignature = toSelectorSignature(selectors)

  if (currentSignature === nextSignature) {
    return false
  }

  const state = getRuleSelectorMutationState(rule)

  if (state.seen.has(nextSignature)) {
    throw createSelectorCycleError(meta, state, selectors)
  }

  state.count += 1
  if (state.count > DEFAULT_SELECTOR_MUTATION_LIMIT) {
    throw createSelectorCycleError(meta, state, selectors)
  }

  pushTrace(state, meta, selectors)
  state.seen.add(nextSignature)
  rule.selectors = selectors
  return true
}

export function appendRuleSelector(
  rule: Rule,
  selector: string,
  meta: SelectorMutationMeta,
): boolean {
  const current = rule.selectors ?? []
  if (current.includes(selector)) {
    return false
  }
  return assignRuleSelectors(rule, [...current, selector], meta)
}
