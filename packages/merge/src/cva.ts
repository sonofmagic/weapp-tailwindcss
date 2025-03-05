import type { CreateOptions } from './types'
import { cva as _cva } from 'class-variance-authority'
import { escape } from 'weapp-tailwindcss/escape'
import { noop } from './utils'

function create(options?: CreateOptions) {
  const e = options?.disableEscape ? noop : escape
  function cva(...inputs: Parameters<typeof _cva>) {
    const fn = _cva(...inputs)
    return (...props: Parameters<typeof fn>) => {
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
