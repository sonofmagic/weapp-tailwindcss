import type { CreateOptions } from '@weapp-tailwindcss/runtime'
import type { ClassValue, Config, Props } from './types'
import { resolveTransformers } from '@weapp-tailwindcss/runtime'
import { cva as baseCva } from 'class-variance-authority'

function create(options?: CreateOptions) {
  const transformers = resolveTransformers(options)

  function cva<T>(base?: ClassValue, config?: Config<T>): (props?: Props<T>) => string {
    const fn = baseCva(base, config) as (...args: any[]) => string

    return (...props) => {
      const value = fn(...props)
      const normalized = transformers.unescape(value)
      return transformers.escape(normalized)
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
