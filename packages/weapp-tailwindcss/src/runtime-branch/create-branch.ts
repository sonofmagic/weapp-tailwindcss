import type { RuntimeBranch, RuntimeBranchBaseContext, RuntimePlatformFamily } from './types'

export function createRuntimeBranch(
  base: RuntimeBranchBaseContext,
  platformFamily: RuntimePlatformFamily,
  options: Pick<RuntimeBranch, 'platform'> & Partial<Pick<RuntimeBranch, 'nativeAppPlatform'>>,
): RuntimeBranch {
  const { context, tailwindcssVersion } = base

  return {
    tailwindcssVersion,
    generatorTarget: context.generatorTarget,
    platformFamily,
    platform: options.platform,
    nativeAppPlatform: options.nativeAppPlatform,
    isTailwindV3: tailwindcssVersion === 3,
    isTailwindV4: tailwindcssVersion === 4,
    isWeb: platformFamily === 'web',
    isMiniProgram: platformFamily === 'mini-program',
    isNativeApp: platformFamily === 'native-app',
  }
}
