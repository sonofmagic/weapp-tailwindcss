import type { PostcssFrameworkProfile } from '../frameworks'
import type { PostcssStyleTarget } from '../style-targets'
import type { IStyleHandlerOptions } from '../types'
import { resolvePostcssFrameworkProfile, resolvePostcssStyleTarget } from '../frameworks'

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

export type PostcssStyleBranch = PostcssStyleTarget
export type PostcssStyleBranchProfile = PostcssFrameworkProfile

export interface ResolvePostcssStyleBranchOptions extends Pick<IStyleHandlerOptions, 'platform' | 'uniAppX' | 'uniAppXCssTarget'> {
  appType?: PostcssAppType | undefined
}

export function resolvePostcssStyleBranch(options: ResolvePostcssStyleBranchOptions): PostcssStyleBranch {
  return resolvePostcssStyleTarget(options)
}

export function resolvePostcssStyleBranchProfile(options: ResolvePostcssStyleBranchOptions): PostcssStyleBranchProfile {
  return resolvePostcssFrameworkProfile(options)
}
