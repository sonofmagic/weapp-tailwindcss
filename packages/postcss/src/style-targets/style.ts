import type { Result } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import { postprocessMiniProgramCss } from '../branches/mini-program'
import { postprocessUniAppXUvueCss } from '../branches/uni-app-x-css-uvue'
import { postprocessUniAppXWebviewCss } from '../branches/uni-app-x-css-webview'
import { postprocessWebCss } from '../branches/web'

export type PostcssStyleTarget
  = | 'generic'
    | 'mini-program'
    | 'uni-app-x-css-uvue'
    | 'uni-app-x-css-webview'
    | 'web'

export interface PostcssStyleTargetProfile {
  target: PostcssStyleTarget
  postprocess: (result: Result, options: IStyleHandlerOptions) => Result
}

function postprocessGenericCss(result: Result, _options: IStyleHandlerOptions) {
  return result
}

export function createPostcssStyleTargetProfile(target: PostcssStyleTarget): PostcssStyleTargetProfile {
  switch (target) {
    case 'mini-program':
      return {
        target,
        postprocess: postprocessMiniProgramCss,
      }
    case 'uni-app-x-css-uvue':
      return {
        target,
        postprocess: postprocessUniAppXUvueCss,
      }
    case 'uni-app-x-css-webview':
      return {
        target,
        postprocess: postprocessUniAppXWebviewCss,
      }
    case 'web':
      return {
        target,
        postprocess: postprocessWebCss,
      }
    case 'generic':
    default:
      return {
        target,
        postprocess: postprocessGenericCss,
      }
  }
}
