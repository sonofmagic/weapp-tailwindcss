// 后处理阶段插件：负责选择器兜底、声明去重与变量排序
import type { Plugin, PluginCreator } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import { defu } from '@weapp-tailwindcss/shared'
import { normalizeTailwindcssRpxDeclaration } from '../compat/tailwindcss-rpx'
import { normalizeTailwindcssV4Declaration } from '../compat/tailwindcss-v4'
import { shouldRemoveEmptyRuleForUniAppX } from '../compat/uni-app-x'
import { postcssPlugin } from '../constants'
import { getFallbackRemove } from '../selectorParser'
import { dedupeDeclarations } from './post/decl-dedupe'
import { createRootSpecificityCleaner } from './post/specificity-cleaner'
// 可选依赖：import valueParser from 'postcss-value-parser'

export type PostcssWeappTailwindcssRenamePlugin = PluginCreator<IStyleHandlerOptions>

export { reorderVariableDeclarations } from './post/decl-dedupe'

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
    p.DeclarationExit = (decl) => {
      if (opts.majorVersion === undefined) {
        normalizeTailwindcssRpxDeclaration(decl)
      }
      else {
        normalizeTailwindcssRpxDeclaration(decl, { majorVersion: opts.majorVersion })
      }
      normalizeTailwindcssV4Declaration(decl)
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
  return p
}

postcssWeappTailwindcssPostPlugin.postcss = true

export { postcssWeappTailwindcssPostPlugin }
