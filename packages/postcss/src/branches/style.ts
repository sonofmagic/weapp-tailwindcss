import type { IStyleHandlerOptions } from '../types'

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
    | 'uni-app-x-uvue'
    | 'uni-app-x-webview'
    | 'web'

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
    return options.uniAppXCssTarget === 'uvue' ? 'uni-app-x-uvue' : 'uni-app-x-webview'
  }
  if (isWebLikePlatform(options.platform)) {
    return 'web'
  }
  if (isMiniProgramAppType(options.appType)) {
    return 'mini-program'
  }
  return 'generic'
}

export function shouldApplyUniAppXBaseCompatibility(branch: PostcssStyleBranch) {
  return branch === 'uni-app-x-webview' || branch === 'uni-app-x-uvue'
}

export function shouldApplyUniAppXUvueCompatibility(branch: PostcssStyleBranch) {
  return branch === 'uni-app-x-uvue'
}
