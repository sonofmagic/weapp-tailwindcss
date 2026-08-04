// 移除冗余的 CSS 自定义属性声明，避免重复覆盖
import type { AcceptedPlugin, Declaration } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import { regExpTest } from '@weapp-tailwindcss/shared'
import valueParser from 'postcss-value-parser'

export function getCustomPropertyCleaner(options: IStyleHandlerOptions): AcceptedPlugin | null {
  const includeCustomProperties = Array.isArray(options.cssCalc)
    ? options.cssCalc
    : typeof options.cssCalc === 'object'
      ? options.cssCalc.includeCustomProperties
      : []

  const shouldMatchCustomProperties = Array.isArray(includeCustomProperties)
    && includeCustomProperties.length > 0

  if (!shouldMatchCustomProperties) {
    return null
  }

  const shouldInspectValue = (value: string) => value.includes('var(') && value.includes('--')

  const containsIncludedCustomProperty = (value: string) => {
    if (!shouldInspectValue(value)) {
      return false
    }

    const parsed = valueParser(value)
    let containsIncludedCustomProperty = false

    parsed.walk((node) => {
      if (node.type !== 'function' || node.value !== 'var' || containsIncludedCustomProperty) {
        return
      }
      const match = node.nodes.find((x) => {
        return x.type === 'word' && regExpTest(includeCustomProperties, x.value)
      })
      if (match) {
        containsIncludedCustomProperty = true
      }
    })

    return containsIncludedCustomProperty
  }

  const hasSameSourceRange = (left: Declaration, right: Declaration) => {
    const leftSource = left.source
    const rightSource = right.source
    if (
      !leftSource?.start
      || !leftSource.end
      || !rightSource?.start
      || !rightSource.end
      || leftSource.input !== rightSource.input
    ) {
      return false
    }

    return leftSource.start.line === rightSource.start.line
      && leftSource.start.column === rightSource.start.column
      && leftSource.end.line === rightSource.end.line
      && leftSource.end.column === rightSource.end.column
  }

  return {
    postcssPlugin: 'postcss-remove-include-custom-properties',
    OnceExit(root) {
      root.walkDecls((decl) => {
        const prevNode = decl.prev()

        // 精确重复：仅比对紧邻前兄弟，保留原语义（避免 a:1;a:2;a:1 级联被误删）
        if (
          prevNode
          && prevNode.type === 'decl'
          && prevNode.prop === decl.prop
          && prevNode.important === decl.important
          && prevNode.value === decl.value
        ) {
          decl.remove()
          return
        }

        if (!containsIncludedCustomProperty(decl.value)) {
          return
        }

        // 逻辑简写展开后，同一来源的物理属性会交错排列；只允许跨过这些同源声明，
        // 避免把作者独立编写的非相邻级联声明误判为 fallback。
        let fallbackDecl: Declaration | undefined
        let node = prevNode
        while (node) {
          if (node.type === 'decl' && node.prop === decl.prop) {
            fallbackDecl = node
            break
          }
          node = node.prev()
        }
        if (
          !fallbackDecl
          || fallbackDecl.important !== decl.important
          || (fallbackDecl !== prevNode && !hasSameSourceRange(fallbackDecl, decl))
          || containsIncludedCustomProperty(fallbackDecl.value)
        ) {
          return
        }

        decl.remove()
      })
    },
  }
}
