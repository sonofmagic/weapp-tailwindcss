// 移除冗余的 CSS 自定义属性声明，避免重复覆盖
import type { AcceptedPlugin } from 'postcss'
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

        // 逻辑简写（如 margin-inline）会被展开成交错的物理声明
        // （margin-left; margin-right; margin-left(calc); margin-right(calc)），
        // 故字面回退值未必是紧邻前兄弟，需向前扫描同规则内所有兄弟声明。
        let hasEarlierSameProp = false
        let node = prevNode
        while (node) {
          if (node.type === 'decl' && node.prop === decl.prop) {
            hasEarlierSameProp = true
            break
          }
          node = node.prev()
        }
        if (!hasEarlierSameProp) {
          return
        }

        if (!shouldInspectValue(decl.value)) {
          return
        }

        const parsed = valueParser(decl.value)
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

        if (containsIncludedCustomProperty) {
          decl.remove()
        }
      })
    },
  }
}
