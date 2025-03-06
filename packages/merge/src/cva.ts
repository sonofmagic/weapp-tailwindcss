import type { ClassValue, Config, Props } from './cva/index'
import type { CreateOptions } from './types'
import { cva as _cva } from 'class-variance-authority'
import { escape } from 'weapp-tailwindcss/escape'
import { noop } from './utils'

function create(options?: CreateOptions) {
  const e = options?.disableEscape ? noop : escape
  function cva<T>(base?: ClassValue, config?: Config<T>): (props?: Props<T> | undefined) => string {
    // @ts-ignore
    const fn = _cva(base, config)
    return (...props) => {
      return e(fn(...props))
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
