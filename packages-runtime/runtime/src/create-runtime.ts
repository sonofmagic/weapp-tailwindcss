import type {
  CreateOptions,
  TailwindMergeFactory,
  TailwindMergeLibraryFn,
  TailwindMergeRuntime,
  TailwindMergeVersion,
  Transformers,
} from './types'
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

function shouldUnescape(value: string) {
  return value.includes('_') || /u[0-9a-f]{3,}/i.test(value)
}

function wrapClassAggregator(
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

    const normalized = shouldUnescape(rawInput) ? transformers.unescape(rawInput) : rawInput
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

    const escaped = transformers.escape(restored)

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
    return wrapClassAggregator(runtime, transformers, prepareValue, restoreValue)
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

    const twMerge: TailwindMergeRuntime = wrapClassAggregator(twMergeImpl, transformers, prepareValue, restoreValue)
    const twJoin: TailwindMergeRuntime = wrapClassAggregator(twJoinImpl, transformers, prepareValue, restoreValue)
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
