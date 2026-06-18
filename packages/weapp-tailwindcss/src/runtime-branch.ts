import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { AppType } from './types/shared'
import type { UniUtsPlatformInfo } from './utils'
import type { WeappTailwindcssGeneratorTarget } from '@/generator'
import { resolveUniUtsPlatform } from './utils'

export type TailwindcssBranchVersion = 3 | 4

export type RuntimePlatformFamily = 'web' | 'mini-program' | 'native-app' | 'tailwind'

export type NativeAppPlatform = 'android' | 'ios' | 'harmony' | 'unknown'

export interface RuntimeBranchContext {
  appType?: AppType | undefined
  generatorTarget: WeappTailwindcssGeneratorTarget
  platform?: IStyleHandlerOptions['platform'] | undefined
  tailwindcssMajorVersion?: number | undefined
  uniAppX?: boolean | { enabled?: boolean | undefined } | undefined
  uniUtsPlatform?: string | UniUtsPlatformInfo | undefined
}

export interface RuntimeBranch {
  tailwindcssVersion: TailwindcssBranchVersion
  generatorTarget: WeappTailwindcssGeneratorTarget
  platformFamily: RuntimePlatformFamily
  platform: string | undefined
  nativeAppPlatform?: NativeAppPlatform | undefined
  isTailwindV3: boolean
  isTailwindV4: boolean
  isWeb: boolean
  isMiniProgram: boolean
  isNativeApp: boolean
}

export interface RuntimeBranchGeneratorOptions {
  target: WeappTailwindcssGeneratorTarget
  branch?: RuntimeBranch | undefined
}

function resolveTailwindcssBranchVersion(majorVersion: number | undefined): TailwindcssBranchVersion {
  return majorVersion === 4 ? 4 : 3
}

function isUniAppXEnabled(value: RuntimeBranchContext['uniAppX']) {
  return value === true || (typeof value === 'object' && value?.enabled !== false)
}

function normalizeUniUtsPlatform(value: RuntimeBranchContext['uniUtsPlatform']) {
  return typeof value === 'object' && value !== null
    ? value
    : resolveUniUtsPlatform(value)
}

function resolveNativeAppPlatform(platform: UniUtsPlatformInfo): NativeAppPlatform {
  if (platform.isAppAndroid) {
    return 'android'
  }
  if (platform.isAppIos) {
    return 'ios'
  }
  if (platform.isAppHarmony) {
    return 'harmony'
  }
  return 'unknown'
}

function resolvePlatformFamily(context: RuntimeBranchContext, uniUtsPlatform: UniUtsPlatformInfo): RuntimePlatformFamily {
  if (context.generatorTarget === 'tailwind') {
    return 'tailwind'
  }
  if (context.generatorTarget === 'web') {
    return 'web'
  }
  if (
    context.appType === 'uni-app-x'
    && isUniAppXEnabled(context.uniAppX)
    && uniUtsPlatform.isApp
  ) {
    return 'native-app'
  }
  return 'mini-program'
}

function resolvePlatform(context: RuntimeBranchContext, uniUtsPlatform: UniUtsPlatformInfo, platformFamily: RuntimePlatformFamily) {
  if (typeof context.platform === 'string' && context.platform.length > 0) {
    return context.platform
  }
  if (platformFamily === 'native-app' || platformFamily === 'web') {
    return uniUtsPlatform.normalized
  }
  return uniUtsPlatform.isMp ? uniUtsPlatform.normalized : context.platform
}

export function resolveRuntimeBranch(context: RuntimeBranchContext): RuntimeBranch {
  const tailwindcssVersion = resolveTailwindcssBranchVersion(context.tailwindcssMajorVersion)
  const uniUtsPlatform = normalizeUniUtsPlatform(context.uniUtsPlatform)
  const platformFamily = resolvePlatformFamily(context, uniUtsPlatform)
  const nativeAppPlatform = platformFamily === 'native-app'
    ? resolveNativeAppPlatform(uniUtsPlatform)
    : undefined
  const platform = resolvePlatform(context, uniUtsPlatform, platformFamily)

  return {
    tailwindcssVersion,
    generatorTarget: context.generatorTarget,
    platformFamily,
    platform,
    nativeAppPlatform,
    isTailwindV3: tailwindcssVersion === 3,
    isTailwindV4: tailwindcssVersion === 4,
    isWeb: platformFamily === 'web',
    isMiniProgram: platformFamily === 'mini-program',
    isNativeApp: platformFamily === 'native-app',
  }
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
