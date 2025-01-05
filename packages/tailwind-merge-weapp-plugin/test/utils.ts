import { withWeapp } from '@/index'
import { createTailwindMerge, extendTailwindMerge, fromTheme, getDefaultConfig, mergeConfigs, twJoin, validators } from 'tailwind-merge'

export {
  createTailwindMerge,
  extendTailwindMerge,
  fromTheme,
  getDefaultConfig,
  mergeConfigs,
  twJoin,
  validators,
}

export const twMerge = extendTailwindMerge(withWeapp)
