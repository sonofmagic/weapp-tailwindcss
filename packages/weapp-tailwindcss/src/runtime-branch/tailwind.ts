import type { RuntimeBranch, RuntimeBranchBaseContext } from './types'
import { createRuntimeBranch } from './create-branch'

export function createTailwindRuntimeBranch(base: RuntimeBranchBaseContext): RuntimeBranch {
  return createRuntimeBranch(base, 'tailwind', {
    platform: base.context.platform,
  })
}
