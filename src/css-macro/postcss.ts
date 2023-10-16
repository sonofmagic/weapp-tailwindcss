import type { PluginCreator } from 'postcss'
import { matchCustomPropertyFromValue, ifdef, ifndef } from './constants'
export interface Options {}

const creator: PluginCreator<Options> = () => {
  return {
    postcssPlugin: 'postcss-weapp-tw-css-macro-plugin',
    AtRuleExit(atRule, helper) {
      if (atRule.name === 'media') {
        const values: string[] = []
        matchCustomPropertyFromValue(atRule.params, (arr) => {
          values.push(arr[1])
        })
        if (values.length > 0) {
          const isNegative = atRule.params.includes('not')
          const text = values.join(' ')
          const comment = isNegative ? ifndef(text) : ifdef(text)
          atRule.after([
            helper.comment({
              text: comment.start
            }),
            ...atRule.nodes,
            helper.comment({
              text: comment.end
            })
          ])
          atRule.remove()
        }
      }

      /*  #ifdef  %PLATFORM%  */
      // 平台特有样式
      /*  #endif  */
    }
  }
}

creator.postcss = true

export default creator
