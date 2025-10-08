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

  if (!includeCustomProperties || includeCustomProperties.length === 0) {
    return null
  }

  return {
    postcssPlugin: 'postcss-remove-include-custom-properties',
    OnceExit(root) {
      root.walkDecls((decl, idx) => {
        if (idx === 0 || !/--/.test(decl.value)) {
          return
        }

        const prevNode = decl.parent?.nodes[idx - 1] as Declaration | undefined
        if (!prevNode || prevNode.prop !== decl.prop) {
          return
        }

        const parsed = valueParser(decl.value)
        parsed.walk((node) => {
          if (node.type !== 'function' || node.value !== 'var') {
            return
          }
          const match = node.nodes.find((x) => {
            return x.type === 'word' && regExpTest(includeCustomProperties, x.value)
          })
          if (match) {
            decl.remove()
          }
        })
      })
    },
  }
}
