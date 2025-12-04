import type { TVConfig, TWMConfig } from './types'

export const defaultConfig: TVConfig = {
  twMerge: true,
  twMergeConfig: {},
  responsiveVariants: false,
}

export type TailwindMergeConfig = NonNullable<TWMConfig['twMergeConfig']> | Record<string, never>
