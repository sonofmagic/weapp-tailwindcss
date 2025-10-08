import type { ClassValue, Config, Props } from './cva/index'
import type { CreateOptions } from './types'
import { cva as _cva } from 'class-variance-authority'
import { resolveEscape } from './core/escape'

function create(options?: CreateOptions) {
  const escapeFn = resolveEscape(options)
  function cva<T>(base?: ClassValue, config?: Config<T>): (props?: Props<T> | undefined) => string {
    const fn = _cva(base, config) as (...args: any[]) => string
    return (...props) => {
      return escapeFn(fn(...props))
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
