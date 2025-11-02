import type { ClassValue } from 'clsx'
import type {
  CreateOptions,
  TailwindMergeFactory,
  TailwindMergeLibraryFn,
  TailwindMergeRuntime,
  TailwindMergeVersion,
  Transformers,
} from '../types'
import { clsx } from 'clsx'
import { resolveTransformers } from './transformers'

type TailwindMergeFactoryFn = (...args: any[]) => TailwindMergeLibraryFn

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
}

function wrapClassAggregator(fn: TailwindMergeLibraryFn, transformers: Transformers): TailwindMergeRuntime {
  return (...inputs: ClassValue[]) => {
    const normalized = transformers.unescape(clsx(...inputs))
    return transformers.escape(fn(normalized))
  }
}

function wrapFactory<TFactory extends TailwindMergeFactoryFn>(
  factory: TFactory,
  transformers: Transformers,
): TailwindMergeFactory<TFactory> {
  return (...args: Parameters<TFactory>) => {
    const runtime = factory(...args)
    return wrapClassAggregator(runtime, transformers)
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
    twMerge: _twMerge,
    twJoin: _twJoin,
    extendTailwindMerge: _extendTailwindMerge,
    createTailwindMerge: _createTailwindMerge,
  } = options

  return function createRuntime(createOptions?: CreateOptions) {
    const transformers = resolveTransformers(createOptions)

    const twMerge: TailwindMergeRuntime = wrapClassAggregator(_twMerge, transformers)
    const twJoin: TailwindMergeRuntime = wrapClassAggregator(_twJoin, transformers)
    const extendTailwindMerge = wrapFactory(_extendTailwindMerge, transformers)
    const createTailwindMerge = wrapFactory(_createTailwindMerge, transformers)

    return {
      version,
      twMerge,
      twJoin,
      extendTailwindMerge,
      createTailwindMerge,
    }
  }
}
