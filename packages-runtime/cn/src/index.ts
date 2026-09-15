import type { ClassValue } from '@weapp-tailwindcss/runtime'
import { resolveTransformers, wrapRuntimeAggregator } from '@weapp-tailwindcss/runtime'
import { twMerge } from 'cn'

const transformers = resolveTransformers()

/**
 * 组合条件类名，并按 Tailwind 冲突规则保留最后一个类名。
 * 经 runtime 聚合包装：有界 LRU、按需 unescape/escape。
 */
export const cn = wrapRuntimeAggregator(twMerge, transformers)

export type { ClassValue }
