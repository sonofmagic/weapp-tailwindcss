import type { ClassValue } from 'clsx'
import {
  createTailwindMerge as _createTailwindMerge,
  extendTailwindMerge as _extendTailwindMerge,
  twJoin as _twJoin,
  twMerge as _twMerge,
  getDefaultConfig,
  mergeConfigs,
} from 'tailwind-merge-v2'
import { weappTwIgnore } from 'weapp-tailwindcss/escape'
import { createFactory } from './utils'

const create = createFactory({
  createTailwindMerge: _createTailwindMerge,
  extendTailwindMerge: _extendTailwindMerge,
  twJoin: _twJoin,
  twMerge: _twMerge,
  version: 2,
})

const { twMerge, twJoin, extendTailwindMerge, createTailwindMerge } = create()

export {
  create,
  createTailwindMerge,
  extendTailwindMerge,
  getDefaultConfig,
  mergeConfigs,
  twJoin,
  twMerge,
  weappTwIgnore,
}

export type {
  ClassValue,
}
