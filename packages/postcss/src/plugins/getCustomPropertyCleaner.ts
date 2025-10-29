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

  return {
    postcssPlugin: 'postcss-remove-include-custom-properties',
    OnceExit(root) {
      root.walkDecls((decl) => {
        const prevNode = decl.prev()
        if (!prevNode || prevNode.type !== 'decl' || prevNode.prop !== decl.prop) {
          return
        }

        if (prevNode.value === decl.value) {
          decl.remove()
          return
        }

        if (!shouldMatchCustomProperties || !/--/.test(decl.value)) {
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
