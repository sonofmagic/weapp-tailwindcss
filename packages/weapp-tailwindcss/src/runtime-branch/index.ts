import type { RuntimeBranch, RuntimeBranchContext, RuntimeBranchGeneratorOptions } from './types'
import { createMiniProgramRuntimeBranch } from './mini-program'
import { createNativeAppRuntimeBranch } from './native-app'
import { isRuntimeUniAppXEnabled, normalizeRuntimeUniUtsPlatform } from './platform'
import { resolveTailwindcssBranchVersion } from './tailwind-version'
import { createWebRuntimeBranch } from './web'

function shouldUseNativeAppBranch(base: Pick<RuntimeBranchContext, 'appType' | 'uniAppX'>, uniUtsPlatform: ReturnType<typeof normalizeRuntimeUniUtsPlatform>) {
  return base.appType === 'uni-app-x'
    && isRuntimeUniAppXEnabled(base.uniAppX)
    && uniUtsPlatform.isApp
}

export function resolveRuntimeBranch(context: RuntimeBranchContext): RuntimeBranch {
  const uniUtsPlatform = normalizeRuntimeUniUtsPlatform(context.uniUtsPlatform)
  const base = {
    context,
    tailwindcssVersion: resolveTailwindcssBranchVersion(context.tailwindcssMajorVersion),
    uniUtsPlatform,
  }

  if (context.generatorTarget === 'web') {
    return createWebRuntimeBranch(base)
  }
  if (shouldUseNativeAppBranch(context, uniUtsPlatform)) {
    return createNativeAppRuntimeBranch(base)
  }
  return createMiniProgramRuntimeBranch(base)
}

export function resolveGeneratorRuntimeBranch(
  options: RuntimeBranchGeneratorOptions,
  context: Omit<RuntimeBranchContext, 'generatorTarget'> = {},
): RuntimeBranch {
  return options.branch ?? resolveRuntimeBranch({
    ...context,
    generatorTarget: options.target,
  })
}

export function shouldUseMiniProgramCssBranch(branch: RuntimeBranch) {
  return branch.platformFamily === 'mini-program' || branch.platformFamily === 'native-app'
}

export function shouldUseNativeAppCssBranch(branch: RuntimeBranch) {
  return branch.platformFamily === 'native-app'
}

export type {
  NativeAppPlatform,
  RuntimeBranch,
  RuntimeBranchContext,
  RuntimeBranchGeneratorOptions,
  RuntimePlatformFamily,
  TailwindcssBranchVersion,
} from './types'
