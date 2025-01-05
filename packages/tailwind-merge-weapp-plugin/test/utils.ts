import { withWeapp } from '@/index'
import { createTailwindMerge, extendTailwindMerge, fromTheme, getDefaultConfig, mergeConfigs, twJoin, validators } from 'tailwind-merge'
import { replaceJs } from 'weapp-tailwindcss/replace'

export {
  createTailwindMerge,
  extendTailwindMerge,
  fromTheme,
  getDefaultConfig,
  mergeConfigs,
  replaceJs,
  twJoin,
  validators,
}

export const twMerge = extendTailwindMerge(withWeapp)
