import { defaultConfig } from './constants'
import { cn, cnBase } from './merge'
import { createTV, tv } from './tv'

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

export function voidEmpty<T>(value: T): T | undefined {
  return value || undefined
}
