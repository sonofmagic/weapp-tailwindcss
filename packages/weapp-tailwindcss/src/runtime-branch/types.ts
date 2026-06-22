import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { AppType } from '@/types/shared'
import type { UniUtsPlatformInfo } from '@/utils'

export type TailwindcssBranchVersion = 4

export type RuntimePlatformFamily = 'web' | 'mini-program' | 'native-app'

export type NativeAppPlatform = 'android' | 'ios' | 'harmony' | 'unknown'

export type WeappTailwindcssGeneratorTarget = 'weapp' | 'web'

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
