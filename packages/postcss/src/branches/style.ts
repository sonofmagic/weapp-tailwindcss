import type { Result } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import { postprocessMiniProgramCss } from './mini-program'
import { postprocessUniAppXUvueCss } from './uni-app-x-css-uvue'
import { postprocessUniAppXWebviewCss } from './uni-app-x-css-webview'
import { postprocessWebCss } from './web'

export type PostcssAppType
  = | 'kbone'
    | 'mpx'
    | 'native'
    | 'remax'
    | 'taro'
    | 'uni-app'
    | 'uni-app-vite'
    | 'uni-app-x'
    | 'weapp-vite'

export type PostcssStyleBranch
  = | 'generic'
    | 'mini-program'
    | 'uni-app-x-css-uvue'
    | 'uni-app-x-css-webview'
    | 'web'

export interface PostcssStyleBranchProfile {
  branch: PostcssStyleBranch
  postprocess: (result: Result, options: IStyleHandlerOptions) => Result
}

export interface ResolvePostcssStyleBranchOptions extends Pick<IStyleHandlerOptions, 'platform' | 'uniAppX' | 'uniAppXCssTarget'> {
  appType?: PostcssAppType | undefined
}

function isWebLikePlatform(platform: string | undefined) {
  const normalized = platform?.trim().toLowerCase()
  return normalized === 'h5'
    || normalized === 'web'
    || normalized?.startsWith('web-') === true
    || normalized === 'app'
    || normalized === 'app-plus'
    || normalized?.startsWith('app-') === true
}

function isMiniProgramAppType(appType: PostcssAppType | undefined) {
  return appType === 'mpx'
    || appType === 'native'
    || appType === 'remax'
    || appType === 'taro'
    || appType === 'uni-app'
    || appType === 'uni-app-vite'
    || appType === 'weapp-vite'
}

export function resolvePostcssStyleBranch(options: ResolvePostcssStyleBranchOptions): PostcssStyleBranch {
  if (options.uniAppX) {
    return options.uniAppXCssTarget === 'uvue' ? 'uni-app-x-css-uvue' : 'uni-app-x-css-webview'
  }
  if (isWebLikePlatform(options.platform)) {
    return 'web'
  }
  if (isMiniProgramAppType(options.appType)) {
    return 'mini-program'
  }
  return 'generic'
}

export function resolvePostcssStyleBranchProfile(options: ResolvePostcssStyleBranchOptions): PostcssStyleBranchProfile {
  const branch = resolvePostcssStyleBranch(options)
  switch (branch) {
    case 'mini-program':
      return {
        branch,
        postprocess: postprocessMiniProgramCss,
      }
    case 'uni-app-x-css-uvue':
      return {
        branch,
        postprocess: postprocessUniAppXUvueCss,
      }
    case 'uni-app-x-css-webview':
      return {
        branch,
        postprocess: postprocessUniAppXWebviewCss,
      }
    case 'web':
      return {
        branch,
        postprocess: postprocessWebCss,
      }
    case 'generic':
    default:
      return {
        branch,
        postprocess: postprocessMiniProgramCss,
      }
  }
}
