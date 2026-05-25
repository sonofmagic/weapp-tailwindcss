// 后处理阶段插件：负责选择器兜底、声明去重与变量排序
import type { Declaration, Plugin, PluginCreator, Rule } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import { defu } from '@weapp-tailwindcss/shared'
import { normalizeMiniProgramPrefixedDeclaration, removeUnsupportedMiniProgramPrefixedAtRule } from '../compat/mini-program-prefixes'
import { normalizeTailwindcssRpxDeclaration } from '../compat/tailwindcss-rpx'
import { normalizeTailwindcssV4Declaration } from '../compat/tailwindcss-v4'
import { shouldRemoveEmptyRuleForUniAppX } from '../compat/uni-app-x'
import { postcssPlugin } from '../constants'
import { getFallbackRemove } from '../selectorParser'
import { appendRuleSelector } from '../utils/selector-guard'
import { dedupeDeclarations } from './post/decl-dedupe'
import { createFallbackPlaceholderCleaner, createRootSpecificityCleaner } from './post/specificity-cleaner'
// 可选依赖：import valueParser from 'postcss-value-parser'

export type PostcssWeappTailwindcssRenamePlugin = PluginCreator<IStyleHandlerOptions>

export { reorderVariableDeclarations } from './post/decl-dedupe'

const DEFAULT_ROOT_SELECTORS = ['page', '.tw-root', 'wx-root-portal-content'] as const
const LEGACY_FLEXBOX_DECLARATION_PROPS = new Set([
  '-webkit-align-content',
  '-webkit-align-items',
  '-webkit-align-self',
  '-webkit-flex',
  '-webkit-flex-basis',
  '-webkit-flex-direction',
  '-webkit-flex-flow',
  '-webkit-flex-grow',
  '-webkit-flex-shrink',
  '-webkit-flex-wrap',
  '-webkit-justify-content',
  '-webkit-order',
])
const LEGACY_FLEXBOX_DISPLAY_VALUES = new Set([
  '-webkit-flex',
  '-webkit-inline-flex',
])

function normalizeRootSelectors(value?: string | string[] | false) {
  if (value === undefined || value === false) {
    return []
  }
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

function createHostSelectorAppender(options: IStyleHandlerOptions) {
  const rootSelectors = normalizeRootSelectors(options.cssSelectorReplacement?.root)
  const shouldAppendHostSelector = (
    rootSelectors.length === DEFAULT_ROOT_SELECTORS.length
    && rootSelectors.every((selector, index) => selector === DEFAULT_ROOT_SELECTORS[index])
  )

  if (!shouldAppendHostSelector) {
    return undefined
  }

  return (rule: Rule) => {
    const selectors = rule.selectors ?? []
    if (selectors.includes(':host')) {
      return false
    }
    return DEFAULT_ROOT_SELECTORS.every(selector => selectors.includes(selector))
  }
}

function removeLegacyFlexboxPrefix(decl: Declaration) {
  if (decl.prop === 'display' && LEGACY_FLEXBOX_DISPLAY_VALUES.has(decl.value)) {
    decl.remove()
    return
  }
  if (LEGACY_FLEXBOX_DECLARATION_PROPS.has(decl.prop)) {
    decl.remove()
  }
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
  const cleanFallbackPlaceholder = createFallbackPlaceholderCleaner()
  const shouldAppendHostSelector = createHostSelectorAppender(opts)

  const enableMainChunkTransforms = opts.isMainChunk !== false
  if (enableMainChunkTransforms || cleanRootSpecificity) {
    const fallbackRemove = enableMainChunkTransforms ? getFallbackRemove(undefined, opts) : undefined

    // RuleExit 阶段执行选择器兜底、声明清理等操作
    p.RuleExit = (rule) => {
      if (enableMainChunkTransforms) {
        fallbackRemove?.transformSync(rule)
      }
      cleanFallbackPlaceholder(rule)
      cleanRootSpecificity?.(rule)

      if (enableMainChunkTransforms) {
        if (shouldAppendHostSelector?.(rule)) {
          appendRuleSelector(rule, ':host', {
            phase: 'post',
            reason: 'append-host-selector',
          })
        }

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

  p.DeclarationExit = (decl) => {
    if (opts.majorVersion === undefined) {
      normalizeTailwindcssRpxDeclaration(decl)
    }
    else {
      normalizeTailwindcssRpxDeclaration(decl, { majorVersion: opts.majorVersion })
    }
    if (enableMainChunkTransforms) {
      normalizeTailwindcssV4Declaration(decl)
    }
    removeLegacyFlexboxPrefix(decl)
    if (enableMainChunkTransforms) {
      normalizeMiniProgramPrefixedDeclaration(decl)
    }
  }

  if (enableMainChunkTransforms) {
    p.OnceExit = (root) => {
      root.walkDecls((decl) => {
        normalizeMiniProgramPrefixedDeclaration(decl)
      })
      root.walkAtRules((atRule) => {
        removeUnsupportedMiniProgramPrefixedAtRule(atRule)
      })
    }

    p.AtRuleExit = (atRule) => {
      removeUnsupportedMiniProgramPrefixedAtRule(atRule)
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
