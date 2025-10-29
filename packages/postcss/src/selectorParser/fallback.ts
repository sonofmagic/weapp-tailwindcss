// 针对小程序不支持的选择器语法提供兜底清理能力
import type { Rule } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import type { RuleTransformer } from './rule-transformer'
import type { ParserTransformOptions } from './utils'
import psp from 'postcss-selector-parser'
import { normalizeTransformOptions } from './utils'

const fallbackRemoveCache = new WeakMap<object, {
  parser: ReturnType<typeof psp>
  transform: RuleTransformer
}>()
const fallbackDefaultKey: object = {}

/**
 * 获取用于小程序兼容性处理的解析器，内部会缓存实例并移除不支持的选择器。
 * @returns 带清理规则的解析器实例。
 */
export function getFallbackRemove(_rule?: Rule, options?: IStyleHandlerOptions) {
  const cacheKey = options ?? fallbackDefaultKey
  let entry = fallbackRemoveCache.get(cacheKey)

  if (!entry) {
    const uniAppX = Boolean(options?.uniAppX)
    let currentRule: Rule | undefined

    const parser = psp((selectors) => {
      const activeRule = currentRule
      let maybeImportantId = false
      selectors.walk((selector, idx) => {
        if (idx === 0 && (selector.type === 'id' || selector.type === 'class' || selector.type === 'attribute')) {
          maybeImportantId = true
        }
        if (selector.type === 'universal') {
          selector.parent?.remove()
        }
        else if (selector.type === 'pseudo') {
          if (selector.value === ':is') {
            if (maybeImportantId && selector.nodes[0]?.type === 'selector') {
              selector.replaceWith(selector.nodes[0])
            }
            else {
              selector.parent?.remove()
            }
          }
          else if (selector.value === ':not') {
            for (const x of selector.nodes) {
              if (
                x.nodes.length === 1
                && x.nodes[0].type === 'id'
                && x.nodes[0].value === '#'
              ) {
                x.nodes = [
                  psp.tag({
                    value: '#n',
                  }),
                ]
              }
            }
          }
          else if (selector.value === ':where') {
            for (const n of selector.nodes) {
              for (const node of n.nodes) {
                if (node.type === 'attribute') {
                  node.remove()
                }
              }
            }
          }
        }
        else if (selector.type === 'attribute') {
          if (selector.attribute === 'hidden') {
            activeRule?.remove()
          }
        }
      })
      selectors.walk((selector) => {
        if (selector.type === 'pseudo') {
          if (selector.value === ':where') {
            const res = selector.nodes.every(x => x.nodes.length === 0)
            if (res) {
              selector.remove()
            }
          }
          else if (selector.type === 'pseudo') {
            if (uniAppX) {
              selector.remove()
            }
          }
        }
      })
    })

    const rawTransformSync = parser.transformSync.bind(parser)

    const transform: RuleTransformer = (targetRule: Rule) => {
      currentRule = targetRule
      try {
        rawTransformSync(targetRule, normalizeTransformOptions())
      }
      finally {
        currentRule = undefined
      }
    }

    parser.transformSync = ((input: unknown, opts?: ParserTransformOptions) => {
      if (input && typeof input === 'object' && 'type' in (input as Record<string, unknown>)) {
        const maybeRule = input as Record<string, unknown>
        if (maybeRule.type === 'rule') {
          currentRule = input as Rule
          try {
            return rawTransformSync(input as string | Rule, normalizeTransformOptions(opts))
          }
          finally {
            currentRule = undefined
          }
        }
      }
      return rawTransformSync(input as string | Rule, opts)
    }) as typeof parser.transformSync

    entry = {
      parser,
      transform,
    }
    fallbackRemoveCache.set(cacheKey, entry)
  }

  return entry.parser
}
