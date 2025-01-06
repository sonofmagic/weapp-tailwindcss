import type { ClassNameValue } from 'tailwind-merge'
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

export function twMergeReplaceJs(...classLists: ClassNameValue[]) {
  return twMerge(classLists.map((x) => {
    if (typeof x === 'string') {
      return replaceJs(x)
    }
    else if (Array.isArray(x)) {
      return x.flatMap((x) => {
        return replaceJs(x)
      })
    }
    else {
      return x
    }
  }))
}
