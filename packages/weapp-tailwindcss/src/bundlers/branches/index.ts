import type { BundlerAppBranch, BundlerAppBranchName, BundlerAppBranchState, ResolveBundlerAppBranchOptions } from './types'
import type { DetectableAppType } from '@/framework'
import type { AppType } from '@/types'
import { resolveBranchAppType } from './app-type'
import { resolveGulpAppBranch } from './gulp'
import { resolveViteAppBranch } from './vite'
import { resolveWebpackAppBranch } from './webpack'

function resolveBranchName(options: ResolveBundlerAppBranchOptions, appType: AppType | DetectableAppType | undefined): BundlerAppBranchName {
  if (options.bundler === 'gulp') {
    return resolveGulpAppBranch()
  }
  if (options.bundler === 'vite') {
    return resolveViteAppBranch(appType, options.uniAppX)
  }
  return resolveWebpackAppBranch(appType, options.uniAppX)
}

function createBranchDescriptor(
  options: ResolveBundlerAppBranchOptions,
  appType: AppType | DetectableAppType | undefined,
  branch: BundlerAppBranchName,
): BundlerAppBranch {
  return {
    appType,
    branch,
    bundler: options.bundler,
    isGeneric: branch === 'generic-vite' || branch === 'generic-webpack',
    isMpx: branch === 'mpx-webpack',
    isTaro: branch === 'taro-vite' || branch === 'taro-webpack',
    isUniApp: branch === 'uni-app-vite' || branch === 'uni-app-webpack' || branch === 'uni-app-x-vite',
    isUniAppX: branch === 'uni-app-x-vite',
    isWeappVite: branch === 'weapp-vite',
  }
}

export function resolveBundlerAppBranch(options: ResolveBundlerAppBranchOptions): BundlerAppBranch {
  const appType = resolveBranchAppType(options)
  return createBranchDescriptor(options, appType, resolveBranchName(options, appType))
}

export function createBundlerAppBranchState(options: ResolveBundlerAppBranchOptions): BundlerAppBranchState {
  let currentOptions = { ...options }
  let currentBranch = resolveBundlerAppBranch(currentOptions)
  return {
    current() {
      return currentBranch
    },
    refresh(nextOptions = {}) {
      currentOptions = {
        ...currentOptions,
        ...nextOptions,
      }
      currentBranch = resolveBundlerAppBranch(currentOptions)
      return currentBranch
    },
  }
}

export type {
  BundlerAppBranch,
  BundlerAppBranchName,
  BundlerAppBranchState,
  BundlerKind,
  ResolveBundlerAppBranchOptions,
} from './types'
