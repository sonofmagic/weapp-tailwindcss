import type { RuntimeBranch, RuntimeBranchBaseContext } from './types'
import { createRuntimeBranch } from './create-branch'
import { resolveExplicitOrEnvPlatform } from './platform'

export function createWebRuntimeBranch(base: RuntimeBranchBaseContext): RuntimeBranch {
  return createRuntimeBranch(base, 'web', {
    platform: resolveExplicitOrEnvPlatform(base.context, base.uniUtsPlatform),
  })
}
