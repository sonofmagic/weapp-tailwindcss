import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { AppType } from '@/types/shared'
import type { UniUtsPlatformInfo } from '@/utils'

export type TailwindcssBranchVersion = 3 | 4

export type RuntimePlatformFamily = 'web' | 'mini-program' | 'native-app' | 'tailwind'

export type NativeAppPlatform = 'android' | 'ios' | 'harmony' | 'unknown'

export type WeappTailwindcssGeneratorTarget = 'weapp' | 'web' | 'tailwind'

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

export interface RuntimeBranchBaseContext {
  context: RuntimeBranchContext
  tailwindcssVersion: TailwindcssBranchVersion
  uniUtsPlatform: UniUtsPlatformInfo
}
