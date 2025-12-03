// 后处理阶段插件：负责选择器兜底、声明去重与变量排序
import type { Declaration, Plugin, PluginCreator, Rule } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import { defu } from '@weapp-tailwindcss/shared'
import { normalizeTailwindcssV4Declaration } from '../compat/tailwindcss-v4'
import { shouldRemoveEmptyRuleForUniAppX } from '../compat/uni-app-x'
import { postcssPlugin } from '../constants'
import { getFallbackRemove } from '../selectorParser'

// normalizeSelectorList 将 root/universal 替换配置规范化为数组
function normalizeSelectorList(value?: string | string[] | false) {
  if (value === undefined || value === false) {
    return []
  }
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

// 读取 preset-env 设置的 specificityMatchingName，供后续清理使用
function getSpecificityMatchingName(options: IStyleHandlerOptions) {
  const feature = options.cssPresetEnv?.features?.['is-pseudo-class']
  if (feature && typeof feature === 'object' && 'specificityMatchingName' in feature) {
    const specificityName = (feature as { specificityMatchingName?: string }).specificityMatchingName
    return typeof specificityName === 'string' && specificityName.length > 0 ? specificityName : undefined
  }
  return undefined
}

// createRootSpecificityCleaner 用于删除 root 选择器上多余的 :not() 包裹
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
// 可选依赖：import valueParser from 'postcss-value-parser'

export type PostcssWeappTailwindcssRenamePlugin = PluginCreator<IStyleHandlerOptions>

const logicalPropMap = new Map<string, string>([
  // margin 方向映射
  ['margin-inline-start', 'margin-left'],
  ['margin-inline-end', 'margin-right'],
  ['margin-block-start', 'margin-top'],
  ['margin-block-end', 'margin-bottom'],
  // padding 方向映射
  ['padding-inline-start', 'padding-left'],
  ['padding-inline-end', 'padding-right'],
  ['padding-block-start', 'padding-top'],
  ['padding-block-end', 'padding-bottom'],
  // border 方向映射
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

// normalizeCalcValue 消除嵌套 calc 带来的冗余括号，兼容小程序解析器
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

// reorderVariableDeclarations 确保普通声明在变量声明之前，避免被变量覆盖
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

// dedupeDeclarations 去除逻辑属性与变量重复定义，保留最优组合
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

// 后处理插件收敛所有规则，在退出阶段执行去重与兜底
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

    // RuleExit 阶段执行选择器兜底、声明清理等操作
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

        if (shouldRemoveEmptyRuleForUniAppX(rule, opts)) {
          rule.remove()
        }
      }
    }
  }

  if (enableMainChunkTransforms) {
    p.DeclarationExit = decl => normalizeTailwindcssV4Declaration(decl)

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
  return p
}

postcssWeappTailwindcssPostPlugin.postcss = true

export { postcssWeappTailwindcssPostPlugin }
