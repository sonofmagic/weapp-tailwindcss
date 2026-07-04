import type { ResolveBundlerAppBranchOptions } from './types'
import type { DetectableAppType, FrameworkEnv } from '@/framework'
import type { AppType, UserDefinedOptions } from '@/types'
import { detectAppType } from '@/framework'
import { resolveUniAppXOptions } from '@/uni-app-x/options'

export function resolveBranchAppType(options: ResolveBundlerAppBranchOptions): AppType | DetectableAppType | undefined {
  if (options.appType) {
    return options.appType
  }
  return detectAppType({
    cwd: options.cwd,
    detectEnv: options.detectEnv,
    env: options.env as FrameworkEnv | undefined,
    manifest: options.manifest,
    packageJson: options.packageJson,
    root: options.root,
    searchUp: options.searchUp,
  })
}

export function isUniAppXBranch(appType: AppType | DetectableAppType | undefined, uniAppX: UserDefinedOptions['uniAppX']) {
  return appType === 'uni-app-x' || resolveUniAppXOptions(uniAppX).enabled
}
