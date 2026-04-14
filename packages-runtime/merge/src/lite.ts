import type { ClassValue } from '@weapp-tailwindcss/runtime'
import {
  createRpxLengthTransform,
  createRuntimeFactory,
  weappTwIgnore,
} from '@weapp-tailwindcss/runtime'
import {
  createTailwindMerge as _createTailwindMerge,
  mergeConfigs,
  twJoin as _twJoin,
} from 'tailwind-merge'

const rpxTransform = createRpxLengthTransform()

/**
 * 轻量版 `extendTailwindMerge`，不依赖上游 `getDefaultConfig`。
 *
 * 用户需提供一个基础配置获取函数作为第一个参数，后续参数为配置扩展函数。
 * 与上游 `extendTailwindMerge` 不同，此版本不会自动注入默认配置。
 */
const extendTailwindMerge: typeof _createTailwindMerge = _createTailwindMerge

const create = createRuntimeFactory({
  createTailwindMerge: _createTailwindMerge,
  extendTailwindMerge,
  twJoin: _twJoin,
  twMerge: _twJoin,
  version: 3,
  ...rpxTransform,
})

const {
  version: tailwindMergeVersion,
  twJoin,
  extendTailwindMerge: _wrappedExtendTailwindMerge,
  createTailwindMerge,
} = create()

export {
  create,
  createTailwindMerge,
  _wrappedExtendTailwindMerge as extendTailwindMerge,
  mergeConfigs,
  tailwindMergeVersion,
  twJoin,
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
