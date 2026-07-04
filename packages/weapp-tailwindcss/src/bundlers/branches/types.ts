import type { DetectableAppType, DetectAppTypeOptions } from '@/framework'
import type { AppType, UserDefinedOptions } from '@/types'

export type BundlerKind = 'gulp' | 'vite' | 'webpack'

export type BundlerAppBranchName
  = | 'generic-vite'
    | 'generic-webpack'
    | 'mpx-webpack'
    | 'native-gulp'
    | 'taro-vite'
    | 'taro-webpack'
    | 'uni-app-vite'
    | 'uni-app-webpack'
    | 'uni-app-x-vite'
    | 'weapp-vite'

export interface BundlerAppBranch {
  appType?: AppType | DetectableAppType | undefined
  branch: BundlerAppBranchName
  bundler: BundlerKind
  isGeneric: boolean
  isMpx: boolean
  isTaro: boolean
  isUniApp: boolean
  isUniAppX: boolean
  isWeappVite: boolean
}

export interface ResolveBundlerAppBranchOptions extends Pick<DetectAppTypeOptions, 'cwd' | 'env' | 'manifest' | 'packageJson' | 'root' | 'searchUp'> {
  appType?: AppType | undefined
  bundler: BundlerKind
  detectEnv?: boolean | undefined
  uniAppX?: UserDefinedOptions['uniAppX']
}

export interface BundlerAppBranchState {
  current: () => BundlerAppBranch
  refresh: (options?: Partial<ResolveBundlerAppBranchOptions>) => BundlerAppBranch
}
