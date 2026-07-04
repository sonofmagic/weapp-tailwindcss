import type { PostcssFrameworkStrategy } from '../types'

export const uniAppXPostcssFrameworkStrategy: PostcssFrameworkStrategy = {
  framework: 'uni-app-x',
  resolveStyleTarget: options => options.uniAppXCssTarget === 'uvue'
    ? 'uni-app-x-css-uvue'
    : 'uni-app-x-css-webview',
}
