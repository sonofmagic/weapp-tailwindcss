declare module 'postcss-pxtransform' {
  import type { PluginCreator } from 'postcss'

  export interface PxtransformOptions {
    platform?: string
    designWidth?: number | (() => number)
    deviceRatio?: Record<string, number>
    unitPrecision?: number
    propList?: (string | RegExp)[]
    selectorBlackList?: (string | RegExp) []
    replace?: boolean
    mediaQuery?: boolean
    minPixelValue?: number
  }

  const pxtransform: PluginCreator<PxtransformOptions>
  export default pxtransform
}
// 默认值
// unitPrecision: 5,
// propList: ['*'],
// selectorBlackList: [],
// replace: true,
// mediaQuery: false,
// minPixelValue: 0
