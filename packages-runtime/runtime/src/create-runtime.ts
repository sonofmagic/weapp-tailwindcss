import type {
  CreateOptions,
  TailwindMergeFactory,
  TailwindMergeLibraryFn,
  TailwindMergeRuntime,
  TailwindMergeVersion,
  Transformers,
} from './types'
import { MappingChars2String } from '@weapp-core/escape'
import { clsx } from 'clsx'
import { resolveTransformers } from './transformers'

type TailwindMergeFactoryFn = (...args: any[]) => TailwindMergeLibraryFn

interface TransformResult {
  value: string
  metadata?: unknown
}

interface CreateRuntimeFactoryOptions<
  TTwMerge extends TailwindMergeLibraryFn,
  TTwJoin extends TailwindMergeLibraryFn,
  TExtendFactory extends TailwindMergeFactoryFn,
  TCreateFactory extends TailwindMergeFactoryFn,
> {
  version: TailwindMergeVersion
  twMerge: TTwMerge
  twJoin: TTwJoin
  extendTailwindMerge: TExtendFactory
  createTailwindMerge: TCreateFactory
  /**
   * Optional hook to normalize class lists before running tailwind-merge.
   */
  prepareValue?: (value: string) => string | TransformResult
  /**
   * Optional hook to restore/denormalize class lists after tailwind-merge.
   */
  restoreValue?: (value: string, metadata?: unknown) => string
}

const CACHE_LIMIT = 256

const UNESCAPE_RE = /u[0-9a-f]{3,}/i
const ESCAPE_NEEDLES = Object.keys(MappingChars2String).filter(Boolean)

function hasWhitespace(value: string) {
  return value.includes(' ')
    || value.includes('\t')
    || value.includes('\n')
    || value.includes('\r')
    || value.includes('\f')
    || value.includes('\v')
}

function shouldUnescape(value: string) {
  return value.includes('_') || UNESCAPE_RE.test(value)
}

function shouldEscape(value: string) {
  for (const needle of ESCAPE_NEEDLES) {
    if (value.includes(needle)) {
      return true
    }
  }
  return false
}

function transformTokens(value: string, transformFn: (token: string) => string): string {
  if (!value) {
    return value
  }
  if (!hasWhitespace(value)) {
    return transformFn(value)
  }
  return value.split(/\s+/).filter(Boolean).map(transformFn).join(' ')
}

/**
 * 为任意 class 聚合函数套上 unescape / 可选 prepare-restore / escape 与有界 LRU。
 * 命中缓存时直接返回已转义结果，避免重复跑引擎。
 */
export function wrapRuntimeAggregator(
  fn: TailwindMergeLibraryFn,
  transformers: Transformers,
  prepareValue?: (value: string) => string | TransformResult,
  restoreValue?: (value: string, metadata?: unknown) => string,
): TailwindMergeRuntime {
  const cache = new Map<string, string>()

  return (...inputs: Parameters<typeof clsx>) => {
    let rawInput: string
    if (inputs.length === 1 && typeof inputs[0] === 'string') {
      rawInput = inputs[0]
    }
    else {
      rawInput = clsx(...inputs)
    }

    if (!rawInput) {
      // `clsx` returns an empty string when nothing is aggregatable, keep parity.
      return rawInput as string
    }

    const cached = cache.get(rawInput)
    if (cached !== undefined) {
      return cached
    }

    const normalized = shouldUnescape(rawInput) ? transformTokens(rawInput, transformers.unescape) : rawInput
    let metadata: unknown
    let preparedValue = normalized
    if (prepareValue) {
      const result = prepareValue(normalized)
      if (typeof result === 'string') {
        preparedValue = result
      }
      else {
        preparedValue = result.value
        metadata = result.metadata
      }
    }
    const merged = fn(preparedValue)
    const restored = restoreValue ? restoreValue(merged, metadata) : merged

    const escaped = shouldEscape(restored)
      ? transformTokens(restored, transformers.escape)
      : restored

    if (cache.size >= CACHE_LIMIT) {
      const firstEntry = cache.keys().next()
      if (!firstEntry.done) {
        cache.delete(firstEntry.value)
      }
    }
    cache.set(rawInput, escaped)

    return escaped
  }
}

function wrapFactory<TFactory extends TailwindMergeFactoryFn>(
  factory: TFactory,
  transformers: Transformers,
  prepareValue?: (value: string) => string | TransformResult,
  restoreValue?: (value: string, metadata?: unknown) => string,
): TailwindMergeFactory<TFactory> {
  return (...args: Parameters<TFactory>) => {
    const runtime = factory(...args)
    return wrapRuntimeAggregator(runtime, transformers, prepareValue, restoreValue)
  }
}

export function createRuntimeFactory<
  TTwMerge extends TailwindMergeLibraryFn,
  TTwJoin extends TailwindMergeLibraryFn,
  TExtendFactory extends TailwindMergeFactoryFn,
  TCreateFactory extends TailwindMergeFactoryFn,
>(options: CreateRuntimeFactoryOptions<TTwMerge, TTwJoin, TExtendFactory, TCreateFactory>) {
  const {
    version,
    twMerge: twMergeImpl,
    twJoin: twJoinImpl,
    extendTailwindMerge: extendFactory,
    createTailwindMerge: createFactory,
    prepareValue,
    restoreValue,
  } = options

  return function createRuntime(createOptions?: CreateOptions) {
    const transformers = resolveTransformers(createOptions)

    const twMerge: TailwindMergeRuntime = wrapRuntimeAggregator(twMergeImpl, transformers, prepareValue, restoreValue)
    const twJoin: TailwindMergeRuntime = wrapRuntimeAggregator(twJoinImpl, transformers, prepareValue, restoreValue)
    const extendTailwindMerge = wrapFactory(extendFactory, transformers, prepareValue, restoreValue)
    const createTailwindMerge = wrapFactory(createFactory, transformers, prepareValue, restoreValue)

    return {
      version,
      twMerge,
      twJoin,
      extendTailwindMerge,
      createTailwindMerge,
    }
  }
}
