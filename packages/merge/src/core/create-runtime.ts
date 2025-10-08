import type { ClassValue } from 'clsx'
import type {
  CreateOptions,
  EscapeFn,
  TailwindMergeFactory,
  TailwindMergeLibraryFn,
  TailwindMergeRuntime,
  TailwindMergeVersion,
} from '../types'
import { clsx } from 'clsx'
import { resolveEscape } from './escape'

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

function wrapClassAggregator(fn: TailwindMergeLibraryFn, escapeFn: EscapeFn): TailwindMergeRuntime {
  return (...inputs: ClassValue[]) => {
    return escapeFn(fn(clsx(...inputs)))
  }
}

function wrapFactory<TFactory extends TailwindMergeFactoryFn>(
  factory: TFactory,
  escapeFn: EscapeFn,
): TailwindMergeFactory<TFactory> {
  return (...args: Parameters<TFactory>) => {
    const runtime = factory(...args)
    return wrapClassAggregator(runtime, escapeFn)
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
    const escapeFn = resolveEscape(createOptions)

    const twMerge: TailwindMergeRuntime = wrapClassAggregator(_twMerge, escapeFn)
    const twJoin: TailwindMergeRuntime = wrapClassAggregator(_twJoin, escapeFn)
    const extendTailwindMerge = wrapFactory(_extendTailwindMerge, escapeFn)
    const createTailwindMerge = wrapFactory(_createTailwindMerge, escapeFn)

    return {
      version,
      twMerge,
      twJoin,
      extendTailwindMerge,
      createTailwindMerge,
    }
  }
}
