import type { TailwindMergeVersion } from '@weapp-tailwindcss/runtime'
import type { ClassValue } from '..'
import { expectAssignable, expectType } from 'tsd'
import {
  create,
  createTailwindMerge,
  extendTailwindMerge,
  getDefaultConfig,
  mergeConfigs,
  tailwindMergeVersion,
  twJoin,
  twMerge,
  weappTwIgnore,
} from '..'

const classValue: ClassValue = ['text-sm', { 'text-lg': true }]
expectType<string>(twMerge(classValue))
expectType<string>(twJoin('px-2', false, undefined))
expectType<string>(weappTwIgnore`text-${1}`)

const runtime = create({ escape: true, unescape: false })
expectType<string>(runtime.twMerge('text-sm', 'text-lg'))
expectType<string>(runtime.twJoin('text-sm', 'text-lg'))

const defaultConfig = getDefaultConfig()
const mergedConfig = mergeConfigs(defaultConfig, defaultConfig)
expectAssignable<ReturnType<typeof getDefaultConfig>>(mergedConfig)

const factory = createTailwindMerge(defaultConfig)
expectType<string>(factory('text-sm', 'text-lg'))

const extender = extendTailwindMerge(defaultConfig)
expectType<string>(extender('text-sm', 'text-lg'))

expectAssignable<TailwindMergeVersion>(tailwindMergeVersion)
