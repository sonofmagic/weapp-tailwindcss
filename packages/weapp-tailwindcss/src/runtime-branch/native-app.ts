import type { RuntimeBranch, RuntimeBranchBaseContext } from './types'
import { createRuntimeBranch } from './create-branch'
import { resolveExplicitOrEnvPlatform, resolveNativeAppPlatform } from './platform'

export function createNativeAppRuntimeBranch(base: RuntimeBranchBaseContext): RuntimeBranch {
  return createRuntimeBranch(base, 'native-app', {
    platform: resolveExplicitOrEnvPlatform(base.context, base.uniUtsPlatform),
    nativeAppPlatform: resolveNativeAppPlatform(base.uniUtsPlatform),
  })
}
