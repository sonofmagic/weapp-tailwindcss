import type { PluginCreator } from 'postcss'
import { matchCustomPropertyFromValue, ifdef, ifndef } from './constants'
export interface Options {}

const creator: PluginCreator<Options> = () => {
  return {
    postcssPlugin: 'postcss-weapp-tw-css-macro-plugin',
    prepare() {
      return {
        AtRule(atRule, helper) {
          if (atRule.name === 'media') {
            const values: string[] = []
            matchCustomPropertyFromValue(atRule.params, (arr) => {
              values.push(arr[1])
            })
            if (values.length > 0) {
              const isNegative = atRule.params.includes('not')
              const text = values.join(' ')
              const comment = isNegative ? ifndef(text) : ifdef(text)

              atRule.before([
                helper.comment({
                  raws: {
                    before: '\n'
                  },
                  text: comment.start
                }),
                ...atRule.nodes, // .map((x) => x.clone()),
                helper.comment({
                  raws: {
                    before: '\n'
                  },
                  text: comment.end
                })
              ])
              atRule.remove()
            }
          }

          /*  #ifdef  %PLATFORM%  */
          // 平台特有样式
          /*  #endif  */
        },
        CommentExit(comment) {
          if (/#(?:ifn?def|endif)/.test(comment.text)) {
            comment.raws.left = ' '
            comment.raws.right = ' '
          }
        }
      }
    }
  }
}

creator.postcss = true

export default creator
