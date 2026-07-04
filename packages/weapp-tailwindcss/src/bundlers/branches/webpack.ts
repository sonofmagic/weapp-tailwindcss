import type { BundlerAppBranchName } from './types'
import type { DetectableAppType } from '@/framework'
import type { AppType, UserDefinedOptions } from '@/types'
import { isUniAppXBranch } from './app-type'

export function resolveWebpackAppBranch(appType: AppType | DetectableAppType | undefined, uniAppX: UserDefinedOptions['uniAppX']): BundlerAppBranchName {
  if (isUniAppXBranch(appType, uniAppX)) {
    return 'uni-app-x-vite'
  }
  if (appType === 'mpx') {
    return 'mpx-webpack'
  }
  if (appType === 'taro') {
    return 'taro-webpack'
  }
  if (appType === 'uni-app' || appType === 'uni-app-vite') {
    return 'uni-app-webpack'
  }
  if (appType === 'weapp-vite') {
    return 'weapp-vite'
  }
  return 'generic-webpack'
}
