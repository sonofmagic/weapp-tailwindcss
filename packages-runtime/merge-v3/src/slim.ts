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
import { getSlimConfig } from './slim-config'

const rpxTransform = createRpxLengthTransform()

/**
 * 基于 Slim_Config 的 `extendTailwindMerge`。
 *
 * 与上游 `extendTailwindMerge` 行为一致，但使用 `getSlimConfig` 替代 `getDefaultConfig` 作为基础配置。
 */
function _extendTailwindMerge(configExtension: any, ...createConfig: any[]) {
  return typeof configExtension === 'function'
    ? _createTailwindMerge(getSlimConfig, configExtension, ...createConfig)
    : _createTailwindMerge(() => mergeConfigs(getSlimConfig(), configExtension), ...createConfig)
}

/** 基于 Slim_Config 的预配置 twMerge */
const _twMerge = _createTailwindMerge(getSlimConfig)

const create = createRuntimeFactory({
  createTailwindMerge: _createTailwindMerge,
  extendTailwindMerge: _extendTailwindMerge,
  twJoin: _twJoin,
  twMerge: _twMerge,
  version: 2,
  ...rpxTransform,
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
  getSlimConfig,
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
