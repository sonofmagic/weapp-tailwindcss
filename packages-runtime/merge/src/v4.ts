import type { ClassValue } from '@weapp-tailwindcss/runtime'
import {
  createRuntimeFactory,
  weappTwIgnore,
} from '@weapp-tailwindcss/runtime'
import {
  createTailwindMerge as _createTailwindMerge,
  extendTailwindMerge as _extendTailwindMerge,
  twJoin as _twJoin,
  twMerge as _twMerge,
  getDefaultConfig,
  mergeConfigs,
} from 'tailwind-merge'

const create = createRuntimeFactory({
  createTailwindMerge: _createTailwindMerge,
  extendTailwindMerge: _extendTailwindMerge,
  twJoin: _twJoin,
  twMerge: _twMerge,
  version: 3,
})

const {
  version: tailwindMergeVersion,
  twMerge,
  twJoin,
  extendTailwindMerge,
  createTailwindMerge,
} = create()

export {
  create,
  createTailwindMerge,
  extendTailwindMerge,
  getDefaultConfig,
  mergeConfigs,
  tailwindMergeVersion,
  twJoin,
  twMerge,
  weappTwIgnore,
}

export type {
  ClassValue,
}

export type {
  CreateOptions,
  EscapeConfig,
  UnescapeConfig,
} from '@weapp-tailwindcss/runtime'
