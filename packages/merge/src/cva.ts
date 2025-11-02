import type { ClassValue, Config, Props } from './cva/index'
import type { CreateOptions } from './types'
import { cva as _cva } from 'class-variance-authority'
import { resolveTransformers } from './core/transformers'

function create(options?: CreateOptions) {
  const transformers = resolveTransformers(options)
  function cva<T>(base?: ClassValue, config?: Config<T>): (props?: Props<T> | undefined) => string {
    const fn = _cva(base, config) as (...args: any[]) => string
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
