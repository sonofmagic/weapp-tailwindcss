import type { ClassNameValue } from 'tailwind-merge'
import { withWeapp } from '@/index'
import { createTailwindMerge, extendTailwindMerge, fromTheme, getDefaultConfig, mergeConfigs, twJoin, validators } from 'tailwind-merge'
import { replaceJs } from 'weapp-tailwindcss/replace'
import { cn } from './origin'

export {
  cn,
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

export function twMergeReplaceJs(...classLists: ClassNameValue[]) {
  return twMerge(
    classLists.flat(10).map((x) => {
      if (typeof x === 'string') {
        return replaceJs(x)
      }
      else {
        return x
      }
    }),
  )
}
