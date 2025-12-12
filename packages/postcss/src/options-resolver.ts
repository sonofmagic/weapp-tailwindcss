import type { IStyleHandlerOptions } from './types'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import { fingerprintOptions } from './fingerprint'

const BASE_CACHE_KEY = 'base'

function hasOverrides(options?: Partial<IStyleHandlerOptions>): options is Partial<IStyleHandlerOptions> {
  return Boolean(options && Object.keys(options).length > 0)
}

export interface OptionsResolver {
  resolve: (overrides?: Partial<IStyleHandlerOptions>) => IStyleHandlerOptions
}

export function createOptionsResolver(baseOptions: IStyleHandlerOptions): OptionsResolver {
  const cacheByKey = new Map<string, IStyleHandlerOptions>()
  const cacheByRef = new WeakMap<Partial<IStyleHandlerOptions>, IStyleHandlerOptions>()
  const fingerprintByRef = new WeakMap<Partial<IStyleHandlerOptions>, string>()
  cacheByKey.set(BASE_CACHE_KEY, baseOptions)

  const resolve = (overrides?: Partial<IStyleHandlerOptions>) => {
    if (!hasOverrides(overrides)) {
      return baseOptions
    }

    const refCached = cacheByRef.get(overrides)
    if (refCached) {
      return refCached
    }

    let key = fingerprintByRef.get(overrides)
    if (!key) {
      key = fingerprintOptions(overrides)
      fingerprintByRef.set(overrides, key)
    }

    const cached = cacheByKey.get(key)
    if (cached) {
      cacheByRef.set(overrides, cached)
      return cached
    }

    const merged = defuOverrideArray<
      IStyleHandlerOptions,
      Partial<IStyleHandlerOptions>[]
    >(
      { ...overrides } as IStyleHandlerOptions,
      baseOptions,
    )
    cacheByKey.set(key, merged)
    cacheByRef.set(overrides, merged)
    return merged
  }

  return {
    resolve,
  }
}
