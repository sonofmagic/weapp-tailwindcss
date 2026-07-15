import { postcss } from '@weapp-tailwindcss/postcss'

const VUE_SCOPED_SELECTOR_RE = /\.data-v-[\w-]+|\[data-v-[^\]]+\]/g

function normalizeGeneratedSelector(selector: string) {
  return selector.replace(/:not\(#\\#\)/g, '').trim()
}

function normalizeVueScopedSelector(selector: string) {
  let scoped = false
  const normalized = normalizeGeneratedSelector(selector).replace(VUE_SCOPED_SELECTOR_RE, () => {
    scoped = true
    return ''
  }).trim()
  return {
    normalized,
    scoped,
  }
}

function normalizeCssComparableValue(value: string) {
  const normalizeUnquotedSegment = (segment: string) => segment.replace(/(^|[^\w.-])(-?)0+\.(\d+)/g, '$1$2.$3')
  let result = ''
  let segmentStart = 0
  let index = 0
  while (index < value.length) {
    const quote = value[index]
    if (quote !== '"' && quote !== '\'') {
      index++
      continue
    }
    result += normalizeUnquotedSegment(value.slice(segmentStart, index))
    const stringStart = index
    index++
    while (index < value.length) {
      if (value[index] === '\\') {
        index += 2
        continue
      }
      if (value[index] === quote) {
        index++
        break
      }
      index++
    }
    result += value.slice(stringStart, index)
    segmentStart = index
  }
  return result + normalizeUnquotedSegment(value.slice(segmentStart))
}

function createCssNodeSignature(node: postcss.ChildNode): string {
  if (node.type === 'decl') {
    return JSON.stringify(['decl', node.prop, normalizeCssComparableValue(node.value), node.important])
  }
  if (node.type === 'atrule') {
    return JSON.stringify([
      'atrule',
      node.name,
      normalizeCssComparableValue(node.params),
      node.nodes?.map(createCssNodeSignature) ?? null,
    ])
  }
  if (node.type === 'rule') {
    return JSON.stringify([
      'rule',
      node.selector,
      node.nodes?.map(createCssNodeSignature) ?? null,
    ])
  }
  if (node.type === 'comment') {
    return JSON.stringify(['comment', node.text])
  }
  return node.toString()
}

function createRuleBodySignature(rule: postcss.Rule) {
  return JSON.stringify(rule.nodes?.map(createCssNodeSignature) ?? [])
}

function createRuleAtRuleContextSignature(rule: postcss.Rule) {
  const context: string[] = []
  let parent = rule.parent
  while (parent && parent.type !== 'root' && parent.type !== 'document') {
    if (parent.type === 'atrule') {
      context.unshift(JSON.stringify([parent.name, parent.params]))
    }
    parent = parent.parent
  }
  return JSON.stringify(context)
}

function createScopedRuleCoverageKey(rule: postcss.Rule, selector: string) {
  return JSON.stringify([
    createRuleAtRuleContextSignature(rule),
    createRuleBodySignature(rule),
    selector,
  ])
}

function removeUnscopedRulesCoveredByScopedRules(root: postcss.Root) {
  const scopedCoverage = new Set<string>()
  root.walkRules((rule) => {
    for (const selector of rule.selectors ?? [rule.selector]) {
      const normalized = normalizeVueScopedSelector(selector)
      if (normalized.scoped && normalized.normalized) {
        scopedCoverage.add(createScopedRuleCoverageKey(rule, normalized.normalized))
      }
    }
  })
  if (scopedCoverage.size === 0) {
    return
  }
  root.walkRules((rule) => {
    const selectors = rule.selectors ?? [rule.selector]
    const normalizedSelectors = selectors.map(normalizeVueScopedSelector)
    if (
      normalizedSelectors.some(selector => selector.scoped || !selector.normalized)
      || !normalizedSelectors.every(selector => scopedCoverage.has(createScopedRuleCoverageKey(rule, selector.normalized)))
    ) {
      return
    }
    rule.remove()
  })
}

export function preferScopedGeneratedCssRules(css: string) {
  if (!css.includes('data-v-')) {
    return css
  }
  try {
    const root = postcss.parse(css)
    removeUnscopedRulesCoveredByScopedRules(root)
    root.walkAtRules((rule) => {
      if (rule.nodes !== undefined && rule.nodes.length === 0) {
        rule.remove()
      }
    })
    return root.toString()
  }
  catch {
    return css
  }
}
