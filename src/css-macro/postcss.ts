import type { PluginCreator } from 'postcss'

export interface Options {}

const creator: PluginCreator<Options> = () => {
  return {
    postcssPlugin: 'postcss-weapp-tw-css-macro-plugin',
    AtRuleExit(atRule, helper) {}
  }
}

creator.postcss = true

export default creator
