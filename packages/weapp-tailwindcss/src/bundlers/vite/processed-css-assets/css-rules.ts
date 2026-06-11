import type { Node, Selector } from 'postcss-selector-parser'
import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'

const MINI_PROGRAM_PREFLIGHT_SELECTOR_KEY = 'view,text,::after,::before'
const MINI_PROGRAM_PREFLIGHT_SELECTOR_KEYS = new Set(['view', 'text', '::after', '::before'])
const MINI_PROGRAM_THEME_SCOPE_SELECTOR_KEY = ':host,page,.tw-root,wx-root-portal-content'
const MINI_PROGRAM_THEME_SCOPE_SELECTOR_KEYS = new Set([':host', 'page', '.tw-root', 'wx-root-portal-content'])

function normalizeCssForContainment(css: string) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/::(before|after)\b/g, ':$1')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>+~()])\s*/g, '$1')
    .replace(/;\}/g, '}')
    .trim()
}

function collectNormalizedCssNodes(css: string) {
  try {
    const root = postcss.parse(css)
    return (root.nodes ?? [])
      .filter(node => node.type !== 'comment')
      .map(node => normalizeCssForContainment(node.toString()))
      .filter(Boolean)
  }
  catch {
    const normalizedCss = normalizeCssForContainment(css)
    return normalizedCss ? [normalizedCss] : []
  }
}

function normalizeCssRuleKeyPart(value: string) {
  return value
    .replace(/::(before|after)\b/g, ':$1')
    .replace(/\s+/g, ' ')
    .replace(/\s*([>+~(),])\s*/g, '$1')
    .trim()
}

function getRuleAtRuleChain(rule: postcss.Rule) {
  const chain: string[] = []
  let parent = rule.parent
  while (parent && parent.type !== 'root') {
    if (parent.type === 'atrule') {
      chain.unshift(`@${parent.name} ${normalizeCssRuleKeyPart(parent.params)}`)
    }
    parent = parent.parent
  }
  return chain
}

function getCssRuleStructuralKey(rule: postcss.Rule) {
  const selector = normalizeCssRuleKeyPart(rule.selector)
  if (selector.length === 0) {
    return undefined
  }
  return [
    ...getRuleAtRuleChain(rule),
    selector,
  ].join('|')
}

function getCssRuleStructuralKeyWithSelectorKey(rule: postcss.Rule, selectorKey: string) {
  return [
    ...getRuleAtRuleChain(rule),
    selectorKey,
  ].join('|')
}

function getCssRuleContentKey(rule: postcss.Rule) {
  const structuralKey = getCssRuleStructuralKey(rule)
  if (!structuralKey) {
    return undefined
  }
  return [
    structuralKey,
    normalizeCssForContainment(rule.toString()),
  ].join('|')
}

function collectCssRuleContentKeys(css: string) {
  const keys = new Set<string>()
  try {
    const root = postcss.parse(css)
    root.walkRules((rule) => {
      const key = getCssRuleContentKey(rule)
      if (key) {
        keys.add(key)
      }
    })
  }
  catch {
  }
  return keys
}

function normalizeCssDeclarationKey(decl: postcss.Declaration) {
  return [
    decl.prop.trim(),
    normalizeCssForContainment(decl.value),
    decl.important ? '!important' : '',
  ].join(':')
}

function collectCssRuleDeclarationKeys(rule: postcss.Rule) {
  const keys = new Set<string>()
  for (const node of rule.nodes ?? []) {
    if (node.type === 'decl') {
      keys.add(normalizeCssDeclarationKey(node))
    }
  }
  return keys
}

function collectCssRuleDeclarationProps(rule: postcss.Rule) {
  const props = new Set<string>()
  for (const node of rule.nodes ?? []) {
    if (node.type === 'decl') {
      props.add(node.prop.trim())
    }
  }
  return props
}

function collectCssRuleDeclarations(rule: postcss.Rule) {
  return (rule.nodes ?? []).filter((node): node is postcss.Declaration => node.type === 'decl')
}

function collectCssRuleDeclarationKeyMap(css: string) {
  const map = new Map<string, Set<string>>()
  try {
    const root = postcss.parse(css)
    root.walkRules((rule) => {
      const key = getCssRuleStructuralKey(rule)
      if (!key) {
        return
      }
      const declarations = collectCssRuleDeclarationKeys(rule)
      if (declarations.size === 0) {
        return
      }
      let existing = map.get(key)
      if (!existing) {
        existing = new Set<string>()
        map.set(key, existing)
      }
      for (const declaration of declarations) {
        existing.add(declaration)
      }
    })
  }
  catch {
  }
  return map
}

interface CssRuleDeclarationRecord {
  rule: postcss.Rule
  keys: Set<string>
  props: Set<string>
}

type CssRuleKeyResolver = (rule: postcss.Rule) => string | undefined

function collectCssRuleDeclarationRecords(
  root: postcss.Root,
  resolveRuleKey: CssRuleKeyResolver = getCssRuleStructuralKey,
) {
  const map = new Map<string, CssRuleDeclarationRecord[]>()
  root.walkRules((rule) => {
    const key = resolveRuleKey(rule)
    if (!key) {
      return
    }
    const keys = collectCssRuleDeclarationKeys(rule)
    if (keys.size === 0) {
      return
    }
    const records = map.get(key) ?? []
    records.push({
      rule,
      keys,
      props: collectCssRuleDeclarationProps(rule),
    })
    map.set(key, records)
  })
  return map
}

function normalizeSimpleMiniProgramSelectorNode(node: Node) {
  if (node.type === 'tag') {
    const value = node.value.toLowerCase()
    if (value === 'view' || value === 'text' || value === 'page' || value === 'wx-root-portal-content') {
      return value
    }
    return undefined
  }
  if (node.type === 'class') {
    const value = node.value.toLowerCase()
    return value === 'tw-root' ? '.tw-root' : undefined
  }
  if (node.type === 'pseudo') {
    if (node.nodes && node.nodes.length > 0) {
      return undefined
    }
    const value = node.value.toLowerCase()
    if (value === ':before' || value === '::before') {
      return '::before'
    }
    if (value === ':after' || value === '::after') {
      return '::after'
    }
    if (value === ':host') {
      return ':host'
    }
  }
  return undefined
}

function normalizeSimpleMiniProgramSelector(selector: Selector) {
  if (selector.nodes.length !== 1) {
    return undefined
  }
  return normalizeSimpleMiniProgramSelectorNode(selector.nodes[0])
}

function collectMiniProgramSelectorSet(selector: string) {
  try {
    const selectorSet = new Set<string>()
    const ast = selectorParser().astSync(selector)
    for (const child of ast.nodes) {
      const key = normalizeSimpleMiniProgramSelector(child)
      if (!key || selectorSet.has(key)) {
        return undefined
      }
      selectorSet.add(key)
    }
    return selectorSet
  }
  catch {
    return undefined
  }
}

function isSameSelectorSet(actual: Set<string> | undefined, expected: Set<string>) {
  return actual?.size === expected.size
    && [...expected].every(key => actual.has(key))
}

function getMiniProgramPreflightRuleStructuralKey(rule: postcss.Rule) {
  if (!isSameSelectorSet(collectMiniProgramSelectorSet(rule.selector), MINI_PROGRAM_PREFLIGHT_SELECTOR_KEYS)) {
    return undefined
  }
  return getCssRuleStructuralKeyWithSelectorKey(rule, MINI_PROGRAM_PREFLIGHT_SELECTOR_KEY)
}

function getMiniProgramThemeScopeRuleStructuralKey(rule: postcss.Rule) {
  if (!isSameSelectorSet(collectMiniProgramSelectorSet(rule.selector), MINI_PROGRAM_THEME_SCOPE_SELECTOR_KEYS)) {
    return undefined
  }
  return getCssRuleStructuralKeyWithSelectorKey(rule, MINI_PROGRAM_THEME_SCOPE_SELECTOR_KEY)
}

export function mergeMiniProgramPreflightRuleDeclarations(baseCss: string, css: string) {
  try {
    const baseRoot = postcss.parse(baseCss)
    const root = postcss.parse(css)
    const baseRuleRecords = collectCssRuleDeclarationRecords(baseRoot, getMiniProgramPreflightRuleStructuralKey)
    let changedBase = false
    let changedCss = false

    root.walkRules((rule) => {
      const key = getMiniProgramPreflightRuleStructuralKey(rule)
      if (!key) {
        return
      }
      const records = baseRuleRecords.get(key)
      const targetRecord = records?.[0]
      if (!targetRecord) {
        return
      }
      const existingProps = new Set(records.flatMap(record => [...record.props]))
      for (const decl of collectCssRuleDeclarations(rule)) {
        const prop = decl.prop.trim()
        if (existingProps.has(prop)) {
          continue
        }
        targetRecord.rule.append(decl.clone())
        targetRecord.keys.add(normalizeCssDeclarationKey(decl))
        targetRecord.props.add(prop)
        existingProps.add(prop)
        changedBase = true
      }
      rule.remove()
      changedCss = true
    })

    if (!changedBase && !changedCss) {
      return { baseCss, css, changed: false }
    }
    removeEmptyAtRules(root)
    return {
      baseCss: changedBase ? baseRoot.toString() : baseCss,
      css: changedCss ? root.toString().trim() : css,
      changed: true,
    }
  }
  catch {
    return { baseCss, css, changed: false }
  }
}

export function mergeMiniProgramThemeScopeRuleDeclarations(baseCss: string, css: string) {
  try {
    const baseRoot = postcss.parse(baseCss)
    const root = postcss.parse(css)
    const baseRuleRecords = collectCssRuleDeclarationRecords(baseRoot, getMiniProgramThemeScopeRuleStructuralKey)
    let changedBase = false
    let changedCss = false

    root.walkRules((rule) => {
      const key = getMiniProgramThemeScopeRuleStructuralKey(rule)
      if (!key) {
        return
      }
      const records = baseRuleRecords.get(key)
      const targetRecord = records?.[0]
      if (!targetRecord) {
        return
      }
      const incomingDeclarations = collectCssRuleDeclarations(rule)
      if (incomingDeclarations.length === 0) {
        return
      }
      const existingKeys = new Set(records.flatMap(record => [...record.keys]))
      const existingProps = new Set(records.flatMap(record => [...record.props]))
      const hasConflictingOverride = incomingDeclarations.some((decl) => {
        const prop = decl.prop.trim()
        return existingProps.has(prop) && !existingKeys.has(normalizeCssDeclarationKey(decl))
      })
      if (hasConflictingOverride) {
        return
      }
      for (const decl of incomingDeclarations) {
        const declarationKey = normalizeCssDeclarationKey(decl)
        if (existingKeys.has(declarationKey)) {
          continue
        }
        targetRecord.rule.append(decl.clone())
        targetRecord.keys.add(declarationKey)
        targetRecord.props.add(decl.prop.trim())
        existingKeys.add(declarationKey)
        existingProps.add(decl.prop.trim())
        changedBase = true
      }
      rule.remove()
      changedCss = true
    })

    if (!changedBase && !changedCss) {
      return { baseCss, css, changed: false }
    }
    removeEmptyAtRules(root)
    return {
      baseCss: changedBase ? baseRoot.toString() : baseCss,
      css: changedCss ? root.toString().trim() : css,
      changed: true,
    }
  }
  catch {
    return { baseCss, css, changed: false }
  }
}

function isCssRuleCoveredByDeclarations(
  rule: postcss.Rule,
  baseRuleDeclarationKeys: Map<string, Set<string>>,
) {
  const key = getCssRuleStructuralKey(rule)
  if (!key) {
    return false
  }
  const baseDeclarations = baseRuleDeclarationKeys.get(key)
  if (!baseDeclarations) {
    return false
  }
  const declarations = collectCssRuleDeclarationKeys(rule)
  return declarations.size > 0
    && [...declarations].every(declaration => baseDeclarations.has(declaration))
}

export function mergeCoveredCssRuleDeclarations(baseCss: string, css: string) {
  try {
    const baseRoot = postcss.parse(baseCss)
    const root = postcss.parse(css)
    const baseRuleRecords = collectCssRuleDeclarationRecords(baseRoot)
    let changedBase = false
    let changedCss = false

    root.walkRules((rule) => {
      const key = getCssRuleStructuralKey(rule)
      const records = key ? baseRuleRecords.get(key) : undefined
      if (!records || records.length === 0) {
        return
      }
      const incomingDeclarations = collectCssRuleDeclarations(rule)
      if (incomingDeclarations.length === 0) {
        return
      }
      const baseKeys = new Set(records.flatMap(record => [...record.keys]))
      const coveredDeclarations = incomingDeclarations.filter(decl => baseKeys.has(normalizeCssDeclarationKey(decl)))
      if (coveredDeclarations.length === 0) {
        return
      }
      const missingDeclarations = incomingDeclarations.filter(decl => !baseKeys.has(normalizeCssDeclarationKey(decl)))
      if (missingDeclarations.length === 0) {
        rule.remove()
        changedCss = true
        return
      }

      const baseProps = new Set(records.flatMap(record => [...record.props]))
      const conflictingDeclarations = missingDeclarations.filter(decl => baseProps.has(decl.prop.trim()))
      if (conflictingDeclarations.length > 0) {
        return
      }

      const targetRecord = records[0]
      if (!targetRecord) {
        return
      }
      for (const decl of missingDeclarations) {
        targetRecord.rule.append(decl.clone())
        targetRecord.keys.add(normalizeCssDeclarationKey(decl))
        targetRecord.props.add(decl.prop.trim())
      }
      rule.remove()
      changedBase = true
      changedCss = true
    })

    if (!changedBase && !changedCss) {
      return { baseCss, css, changed: false }
    }
    removeEmptyAtRules(root)
    return {
      baseCss: changedBase ? baseRoot.toString() : baseCss,
      css: changedCss ? root.toString().trim() : css,
      changed: true,
    }
  }
  catch {
    return { baseCss, css, changed: false }
  }
}

function removeEmptyAtRules(root: postcss.Root) {
  root.walkAtRules((atRule) => {
    if (atRule.nodes && atRule.nodes.length === 0) {
      atRule.remove()
    }
  })
}

export function filterExistingCssRules(baseCss: string, css: string) {
  const baseRuleKeys = collectCssRuleContentKeys(baseCss)
  if (baseRuleKeys.size === 0) {
    return css
  }
  try {
    const root = postcss.parse(css)
    const baseRuleDeclarationKeys = collectCssRuleDeclarationKeyMap(baseCss)
    let changed = false
    root.walkRules((rule) => {
      const key = getCssRuleContentKey(rule)
      if (
        (key && baseRuleKeys.has(key))
        || isCssRuleCoveredByDeclarations(rule, baseRuleDeclarationKeys)
      ) {
        rule.remove()
        changed = true
      }
    })
    if (!changed) {
      return css
    }
    removeEmptyAtRules(root)
    return root.toString().trim()
  }
  catch {
    return css
  }
}

export function containsCssAfterMinify(baseCss: string, css: string) {
  if (baseCss.includes(css)) {
    return true
  }
  const normalizedBaseCss = normalizeCssForContainment(baseCss)
  const normalizedCss = normalizeCssForContainment(css)
  if (normalizedCss.length > 0 && normalizedBaseCss.includes(normalizedCss)) {
    return true
  }
  const normalizedNodes = collectNormalizedCssNodes(css)
  if (normalizedNodes.length > 0 && normalizedNodes.every(node => normalizedBaseCss.includes(node))) {
    return true
  }
  const baseRuleKeys = collectCssRuleContentKeys(baseCss)
  const ruleKeys = collectCssRuleContentKeys(css)
  return ruleKeys.size > 0
    && [...ruleKeys].every(key => baseRuleKeys.has(key))
}
