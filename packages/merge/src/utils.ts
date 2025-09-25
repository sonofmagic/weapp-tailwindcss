import type { ClassValue } from 'clsx'
import type {
  createTailwindMerge as _createTailwindMergeV3,
  extendTailwindMerge as _extendTailwindMergeV3,
  twJoin as _twJoinV3,
  twMerge as _twMergeV3,
} from 'tailwind-merge'
import type {
  createTailwindMerge as _createTailwindMergeV2,
  extendTailwindMerge as _extendTailwindMergeV2,
  twJoin as _twJoinV2,
  twMerge as _twMergeV2,
} from 'tailwind-merge-v2'
import type { CreateOptions } from './types'
import { clsx } from 'clsx'
import { escape } from 'weapp-tailwindcss/escape'

export type TailwindMergeVersion = 2 | 3
// 处理 escape 逻辑
export function noop(x: string) {
  return x
}

export interface CreateFactoryOptions<V extends TailwindMergeVersion> {
  version: V
  twMerge: V extends 3 ? typeof _twMergeV3 : typeof _twMergeV2
  twJoin: V extends 3 ? typeof _twJoinV3 : typeof _twJoinV2
  extendTailwindMerge: V extends 3 ? typeof _extendTailwindMergeV3 : typeof _extendTailwindMergeV2
  createTailwindMerge: V extends 3 ? typeof _createTailwindMergeV3 : typeof _createTailwindMergeV2
}

export function createFactory<V extends TailwindMergeVersion>(opts: CreateFactoryOptions<V>) {
  const {
    twMerge: _twMerge,
    twJoin: _twJoin,
    createTailwindMerge: _createTailwindMerge,
    extendTailwindMerge: _extendTailwindMerge,
  } = opts

  return function create(options?: CreateOptions) {
    const escapeFn = options?.escapeFn ?? escape
    const e = options?.disableEscape ? noop : escapeFn

    function twMerge(...inputs: ClassValue[]): string {
      return e(_twMerge(clsx(...inputs)))
    }

    function twJoin(...inputs: ClassValue[]): string {
      return e(_twJoin(clsx(...inputs)))
    }

    // 版本安全的 extendTailwindMerge
    const extendTailwindMerge = (...args: Parameters<typeof _extendTailwindMerge>) => {
      // @ts-ignore
      const customTwMerge = _extendTailwindMerge(...args)
      return function cn(...inputs: ClassValue[]): string {
        return e(customTwMerge(clsx(...inputs)))
      }
    }

    // 版本安全的 createTailwindMerge
    const createTailwindMerge = (...args: Parameters<typeof _createTailwindMerge>) => {
      // @ts-ignore
      const customTwMerge = _createTailwindMerge(...args)
      return function cn(...inputs: ClassValue[]): string {
        return e(customTwMerge(clsx(...inputs)))
      }
    }

    return {
      twMerge,
      twJoin,
      extendTailwindMerge,
      createTailwindMerge,
    }
  }
}
