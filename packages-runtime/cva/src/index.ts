import type { CreateOptions } from '@weapp-tailwindcss/runtime'
import type { ClassValue, Config, Props } from './types'
import { resolveTransformers } from '@weapp-tailwindcss/runtime'
import { cva as baseCva } from 'class-variance-authority'

function create(options?: CreateOptions) {
  const transformers = resolveTransformers(options)
  const cacheLimit = 256

  function cva<T>(base?: ClassValue, config?: Config<T>): (props?: Props<T>) => string {
    const fn = baseCva(base, config) as (...args: any[]) => string
    const cache = new Map<string, string>()

    return (...props) => {
      const value = fn(...props)
      if (!value) {
        return value
      }

      const cached = cache.get(value)
      if (cached !== undefined) {
        return cached
      }

      const escaped = transformers.escape(value)

      if (cache.size >= cacheLimit) {
        const firstEntry = cache.keys().next()
        if (!firstEntry.done) {
          cache.delete(firstEntry.value)
        }
      }
      cache.set(value, escaped)

      return escaped
    }
  }

  return {
    cva,
  }
}

const { cva } = create()

export {
  create,
  cva,
}

export type {
  ClassProp,
  ClassPropKey,
  ClassValue,
  Config,
  ConfigSchema,
  ConfigVariants,
  ConfigVariantsMulti,
  CxOptions,
  CxReturn,
  OmitUndefined,
  Props,
  StringToBoolean,
  VariantProps,
} from './types'
