import type { Declaration, Plugin, PluginCreator, Rule } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import { defu } from '@weapp-tailwindcss/shared'
import { postcssPlugin } from '../constants'
import { getFallbackRemove } from '../selectorParser'
// import valueParser from 'postcss-value-parser'

export type PostcssWeappTailwindcssRenamePlugin = PluginCreator<IStyleHandlerOptions>
// tailwindcss@4
const OklabSuffix = 'in oklab'

const logicalPropMap = new Map<string, string>([
  ['margin-inline-start', 'margin-left'],
  ['margin-inline-end', 'margin-right'],
  ['margin-block-start', 'margin-top'],
  ['margin-block-end', 'margin-bottom'],
  ['padding-inline-start', 'padding-left'],
  ['padding-inline-end', 'padding-right'],
  ['padding-block-start', 'padding-top'],
  ['padding-block-end', 'padding-bottom'],
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

  if (opts.isMainChunk) {
    const fallbackRemove = getFallbackRemove(undefined, opts)

    p.RuleExit = (rule) => {
      fallbackRemove.transformSync(rule)
      dedupeDeclarations(rule)

      if (rule.selectors.length === 0 || (rule.selectors.length === 1 && rule.selector.trim() === '')) {
        rule.remove()
      }

      if (opts.uniAppX) {
        if (rule.nodes.length === 0) {
          rule.remove()
        }
      }
    }

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
