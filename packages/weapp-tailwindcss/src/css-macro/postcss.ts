import type { PluginCreator } from 'postcss'
import { ifdef, ifndef, matchCustomPropertyFromValue } from './constants'

const IFDEF_ENDIF_RE = /#(?:ifn?def|endif)/
export const CSS_MACRO_POSTCSS_PLUGIN_NAME = 'postcss-weapp-tw-css-macro-plugin'

export interface Options {}

const creator: PluginCreator<Options> = () => {
  return {
    postcssPlugin: CSS_MACRO_POSTCSS_PLUGIN_NAME,
    prepare() {
      return {
        AtRule(atRule, helper) {
          if (atRule.name === 'media') {
            const values: string[] = []
            matchCustomPropertyFromValue(atRule.params, (arr) => {
              const value = arr[1]
              if (value) {
                values.push(value)
              }
            })
            if (values.length > 0) {
              const isNegative = atRule.params.includes('not')
              const text = values.join(' ')
              const comment = isNegative ? ifndef(text) : ifdef(text)
              const nextNodes = [
                helper.comment({
                  raws: {
                    before: '\n',
                  },
                  text: comment.start,
                }),
                ...(atRule.nodes ?? []).map(node => node.clone()),
                helper.comment({
                  raws: {
                    before: '\n',
                  },
                  text: comment.end,
                }),
              ]
              atRule.replaceWith(nextNodes)
            }
          }

          /*  #ifdef  %PLATFORM%  */
          // 平台特有样式
          /*  #endif  */
        },
        CommentExit(comment) {
          if (IFDEF_ENDIF_RE.test(comment.text)) {
            comment.raws.left = ' '
            comment.raws.right = ' '
          }
        },
      }
    },
  }
}

creator.postcss = true

export default creator
