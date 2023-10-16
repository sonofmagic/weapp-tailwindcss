import type { PluginCreator } from 'postcss'
import { queryKey, ifdef, ifndef } from './constants'
export interface Options {}

export function matchCustomPropertyFromValue(str: string, cb: (arr: RegExpExecArray, index: number) => void) {
  let arr: RegExpExecArray | null
  let index = 0
  const regex = new RegExp('\\(\\s*' + queryKey + '\\s*:([^)]*)\\)', 'g')
  while ((arr = regex.exec(str)) !== null) {
    cb(arr, index)
    index++
  }
}

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
