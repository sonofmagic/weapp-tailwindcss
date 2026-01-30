import type { CnOptions, TVConfig, TWMConfig } from './types'
import { defaultConfig } from './constants'
import { cn, cnBase } from './merge'
import { createTV, tv } from './tv'
import { mergeObjects } from './utils'

export type { TVGeneratedScreens } from './generated'
export type {
  ClassProp,
  ClassValue,
  CnOptions,
  CnReturn,
  CreateTVFactory,
  isTrueOrArray,
  OmitUndefined,
  StringToBoolean,
  TailwindMergeAdapter,
  TV,
  TVCompoundSlots,
  TVCompoundVariants,
  TVConfig,
  TVDefaultVariants,
  TVProps,
  TVReturnProps,
  TVReturnType,
  TVScreenPropsValue,
  TVVariantKeys,
  TVVariants,
  TWMConfig,
  VariantProps,
  WithInitialScreen,
} from './types'

export { cn, cnBase, createTV, defaultConfig, tv }

export function create(configProp?: TVConfig) {
  const baseConfig = configProp
    ? (mergeObjects(defaultConfig, configProp) as TVConfig)
    : defaultConfig

  const mergeConfig = (config?: TVConfig | TWMConfig) => (config
    ? (mergeObjects(baseConfig as Record<string, any>, config as Record<string, any>) as TVConfig)
    : baseConfig)

  return {
    cn: (...classes: CnOptions) => (config?: TWMConfig) => cn(...classes)(mergeConfig(config)),
    cnBase,
    tv: (options: Parameters<typeof tv>[0], config?: TVConfig) => tv(options, mergeConfig(config)),
    createTV: (config?: TVConfig) => createTV(mergeConfig(config)),
    defaultConfig: baseConfig,
  }
}

export function voidEmpty<T>(value: T): T | undefined {
  return value || undefined
}
