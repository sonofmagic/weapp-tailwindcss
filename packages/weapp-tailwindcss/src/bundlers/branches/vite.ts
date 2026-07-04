import type { BundlerAppBranchName } from './types'
import type { DetectableAppType } from '@/framework'
import type { AppType, UserDefinedOptions } from '@/types'
import { isUniAppXBranch } from './app-type'

export function resolveViteAppBranch(appType: AppType | DetectableAppType | undefined, uniAppX: UserDefinedOptions['uniAppX']): BundlerAppBranchName {
  if (isUniAppXBranch(appType, uniAppX)) {
    return 'uni-app-x-vite'
  }
  if (appType === 'uni-app' || appType === 'uni-app-vite') {
    return 'uni-app-vite'
  }
  if (appType === 'taro') {
    return 'taro-vite'
  }
  if (appType === 'weapp-vite') {
    return 'weapp-vite'
  }
  return 'generic-vite'
}
