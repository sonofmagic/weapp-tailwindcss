import type { RuntimeBranch, RuntimeBranchBaseContext } from './types'
import { createRuntimeBranch } from './create-branch'

export function createMiniProgramRuntimeBranch(base: RuntimeBranchBaseContext): RuntimeBranch {
  const { context, uniUtsPlatform } = base
  const platform = typeof context.platform === 'string' && context.platform.length > 0
    ? context.platform
    : uniUtsPlatform.isMp
      ? uniUtsPlatform.normalized
      : context.platform

  return createRuntimeBranch(base, 'mini-program', {
    platform,
  })
}
