import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import {
  createTailwindMerge as _createTailwindMerge,
  extendTailwindMerge as _extendTailwindMerge,
  twJoin as _twJoin,
  twMerge as _twMerge,
  getDefaultConfig,
  mergeConfigs,
} from 'tailwind-merge'
import { escape, weappTwIgnore } from 'weapp-tailwindcss/escape'

export function twMerge(...inputs: ClassValue[]) {
  return escape(_twMerge(clsx(inputs)))
}

export function twJoin(...inputs: ClassValue[]) {
  return escape(_twJoin(clsx(inputs)))
}

export const extendTailwindMerge: typeof _extendTailwindMerge = (...args) => {
  const customTwMerge = _extendTailwindMerge(...args)
  return function cn(...inputs: ClassValue[]) {
    return escape(customTwMerge(clsx(inputs)))
  }
}

export const createTailwindMerge: typeof _createTailwindMerge = (...args) => {
  const customTwMerge = _createTailwindMerge(...args)
  return function cn(...inputs: ClassValue[]) {
    return escape(customTwMerge(clsx(inputs)))
  }
}

export {
  getDefaultConfig,
  mergeConfigs,
  weappTwIgnore,
}

export type {
  ClassValue,
}
