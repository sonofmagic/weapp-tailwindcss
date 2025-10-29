import type { Declaration, Plugin, PluginCreator, Rule } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import { defu } from '@weapp-tailwindcss/shared'
import { postcssPlugin } from '../constants'
import { getFallbackRemove } from '../selectorParser'

function normalizeSelectorList(value?: string | string[] | false) {
  if (value === undefined || value === false) {
    return []
  }
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

function getSpecificityMatchingName(options: IStyleHandlerOptions) {
  const feature = options.cssPresetEnv?.features?.['is-pseudo-class']
  if (feature && typeof feature === 'object' && 'specificityMatchingName' in feature) {
    const specificityName = (feature as { specificityMatchingName?: string }).specificityMatchingName
    return typeof specificityName === 'string' && specificityName.length > 0 ? specificityName : undefined
  }
  return undefined
}

function createRootSpecificityCleaner(options: IStyleHandlerOptions) {
  const specificityMatchingName = getSpecificityMatchingName(options)
  const selectors = normalizeSelectorList(options.cssSelectorReplacement?.root)

  if (!specificityMatchingName || selectors.length === 0) {
    return undefined
  }

  const suffix = `:not(.${specificityMatchingName})`
  const targets = selectors
    .map(selector => selector?.trim())
    .filter((selector): selector is string => Boolean(selector?.length))
    .map(selector => ({
      match: `${selector}${suffix}`,
      spacedMatch: `${selector} ${suffix}`,
      replacement: selector,
    }))

  if (!targets.length) {
    return undefined
  }

  return (rule: Rule) => {
    if (!rule.selectors || rule.selectors.length === 0) {
      return
    }

    const next = rule.selectors.map((selector) => {
      let updated = selector
      for (const target of targets) {
        if (updated.includes(target.match)) {
          updated = updated.split(target.match).join(target.replacement)
        }
        if (updated.includes(target.spacedMatch)) {
          updated = updated.split(target.spacedMatch).join(target.replacement)
        }
      }
      return updated
    })

    rule.selectors = next
  }
}
// import valueParser from 'postcss-value-parser'

export type PostcssWeappTailwindcssRenamePlugin = PluginCreator<IStyleHandlerOptions>
// tailwindcss@4
const OklabSuffix = 'in oklab'

const logicalPropMap = new Map<string, string>([
  // margin
  ['margin-inline-start', 'margin-left'],
  ['margin-inline-end', 'margin-right'],
  ['margin-block-start', 'margin-top'],
  ['margin-block-end', 'margin-bottom'],
  // padding
  ['padding-inline-start', 'padding-left'],
  ['padding-inline-end', 'padding-right'],
  ['padding-block-start', 'padding-top'],
  ['padding-block-end', 'padding-bottom'],
  // border
  ['border-inline-start', 'border-left'],
  ['border-inline-end', 'border-right'],
  ['border-block-start', 'border-top'],
  ['border-block-end', 'border-bottom'],
  ['border-inline-start-width', 'border-left-width'],
  ['border-inline-end-width', 'border-right-width'],
])

const variablePriorityProps = new Set([
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-bottom',
  'border-left-width',
  'border-right-width',
  'border-top-width',
  'border-bottom-width',
])

function getCanonicalProp(prop: string) {
  return logicalPropMap.get(prop) ?? prop
}

function normalizeCalcValue(value: string) {
  if (!value.includes('calc')) {
    return value
  }

  let next = value
  let prev: string

  do {
    prev = next
    next = prev.replace(/calc\(\s*calc\(/gi, 'calc((')
  } while (next !== prev)

  return next.replace(/calc\(\s*(1\s*-\s*var\([^()]+\))\s*\)/gi, '($1)')
}

interface DedupeEntry {
  decl: Declaration
  normalizedValue: string
  canonicalProp: string
  importantKey: string
  isLogical: boolean
}

function hasVariableReference(value: string) {
  return value.includes('var(')
}

export function reorderVariableDeclarations(rule: Rule) {
  const groupedByProp = new Map<string, Declaration[]>()

  for (const node of rule.nodes) {
    if (node.type !== 'decl') {
      continue
    }
    if (node.prop.startsWith('--')) {
      continue
    }
    const existing = groupedByProp.get(node.prop)
    if (existing) {
      existing.push(node)
    }
    else {
      groupedByProp.set(node.prop, [node])
    }
  }

  for (const declarations of groupedByProp.values()) {
    if (declarations.length <= 1) {
      continue
    }

    const literalDecls = declarations.filter(decl => !hasVariableReference(decl.value))
    const variableDecls = declarations.filter(decl => hasVariableReference(decl.value))

    if (literalDecls.length === 0 || variableDecls.length === 0) {
      continue
    }

    const desiredOrder = [...literalDecls, ...variableDecls]
    let needsReorder = false

    for (let index = 0; index < declarations.length && !needsReorder; index++) {
      if (declarations[index] !== desiredOrder[index]) {
        needsReorder = true
      }
    }

    if (!needsReorder) {
      continue
    }

    const anchor = declarations[declarations.length - 1].next() ?? undefined

    for (const decl of declarations) {
      decl.remove()
    }

    for (const decl of desiredOrder) {
      if (anchor) {
        rule.insertBefore(anchor, decl)
      }
      else {
        rule.append(decl)
      }
    }
  }
}

function dedupeDeclarations(rule: Rule) {
  const entries: DedupeEntry[] = []

  for (const node of [...rule.nodes]) {
    if (node.type !== 'decl') {
      continue
    }
    const decl = node
    const normalizedValue = normalizeCalcValue(decl.value)
    if (normalizedValue !== decl.value) {
      decl.value = normalizedValue
    }
    const canonicalProp = getCanonicalProp(decl.prop)
    entries.push({
      decl,
      normalizedValue,
      canonicalProp,
      importantKey: decl.important ? '!important' : '',
      isLogical: canonicalProp !== decl.prop,
    })
  }

  const seen = new Map<string, DedupeEntry>()

  for (const entry of entries) {
    const key = `${entry.canonicalProp}${entry.importantKey}@@${entry.normalizedValue}`
    const existing = seen.get(key)
    if (!existing) {
      seen.set(key, entry)
      continue
    }

    if (existing.isLogical && !entry.isLogical) {
      existing.decl.remove()
      seen.set(key, entry)
    }
    else {
      entry.decl.remove()
    }
  }

  const reorderGroups = new Map<string, Declaration[]>()

  for (const node of rule.nodes) {
    if (node.type !== 'decl') {
      continue
    }
    const canonical = getCanonicalProp(node.prop)
    if (!variablePriorityProps.has(canonical)) {
      continue
    }
    const existing = reorderGroups.get(canonical)
    if (existing) {
      existing.push(node)
    }
    else {
      reorderGroups.set(canonical, [node])
    }
  }

  for (const declarations of reorderGroups.values()) {
    if (declarations.length <= 1) {
      continue
    }

    const literals = declarations.filter(decl => !hasVariableReference(decl.value))
    const variables = declarations.filter(decl => hasVariableReference(decl.value))

    if (literals.length === 0 || variables.length === 0) {
      continue
    }

    const ordered = [...literals, ...variables]

    let needReorder = false
    for (let index = 0; index < ordered.length; index++) {
      if (ordered[index] !== declarations[index]) {
        needReorder = true
        break
      }
    }

    if (!needReorder) {
      continue
    }

    const anchor = declarations[declarations.length - 1]?.next() ?? undefined

    for (const decl of declarations) {
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

  const literalSeen = new Map<string, Declaration>()

  for (const node of [...rule.nodes]) {
    if (node.type !== 'decl') {
      continue
    }

    const canonical = getCanonicalProp(node.prop)
    if (!variablePriorityProps.has(canonical)) {
      continue
    }

    if (hasVariableReference(node.value)) {
      continue
    }

    const existing = literalSeen.get(canonical)
    if (existing) {
      node.remove()
    }
    else {
      literalSeen.set(canonical, node)
    }
  }

  // reorderVariableDeclarations(rule)
}

const postcssWeappTailwindcssPostPlugin: PostcssWeappTailwindcssRenamePlugin = (
  options,
) => {
  const opts = defu(options, {
    isMainChunk: true,
  })
  const p: Plugin = {
    postcssPlugin,
  }
  const cleanRootSpecificity = createRootSpecificityCleaner(opts)

  const enableMainChunkTransforms = opts.isMainChunk !== false
  if (enableMainChunkTransforms || cleanRootSpecificity) {
    const fallbackRemove = enableMainChunkTransforms ? getFallbackRemove(undefined, opts) : undefined

    p.RuleExit = (rule) => {
      if (enableMainChunkTransforms) {
        fallbackRemove?.transformSync(rule)
      }
      cleanRootSpecificity?.(rule)

      if (enableMainChunkTransforms) {
        dedupeDeclarations(rule)

        if (rule.selectors.length === 0 || (rule.selectors.length === 1 && rule.selector.trim() === '')) {
          rule.remove()
        }

        if (opts.uniAppX && rule.nodes.length === 0) {
          rule.remove()
        }
      }
    }
  }

  if (enableMainChunkTransforms) {
    p.DeclarationExit = (decl) => {
      // tailwindcss v4
      /**
       * @description oklab 处理
       */
      if (decl.prop === '--tw-gradient-position' && decl.value.endsWith(OklabSuffix)) {
        decl.value = decl.value.slice(0, decl.value.length - OklabSuffix.length)
      }
      /**
       * @description 移除 calc(infinity * 1px)
       * https://github.com/tailwindlabs/tailwindcss/blob/77b3cb5318840925d8a75a11cc90552a93507ddc/packages/tailwindcss/src/utilities.ts#L2128
       */
      else if (/calc\(\s*infinity\s*\*\s*(?:\d+(?:\.\d*)?|\.\d+)r?px/.test(decl.value)) {
        decl.value = '9999px'
      }
    }

    p.AtRuleExit = (atRule) => {
      /**
       * @description 移除 property
       */
      if (opts.cssRemoveProperty && atRule.name === 'property') {
        atRule.remove()
      }
      /**
       * 清除空节点
       */
      atRule.nodes?.length === 0 && atRule.remove()
    }
  }
  if (typeof opts.customRuleCallback === 'function') {
    p.Rule = (rule) => {
      opts.customRuleCallback?.(rule, opts)
    }
  }
  return p
}

postcssWeappTailwindcssPostPlugin.postcss = true

export { postcssWeappTailwindcssPostPlugin }
