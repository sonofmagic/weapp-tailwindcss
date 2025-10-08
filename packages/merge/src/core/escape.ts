import type { CreateOptions, EscapeFn } from '../types'
import { escape } from 'weapp-tailwindcss/escape'

const noop = (value: string) => value

export function resolveEscape(options?: CreateOptions): EscapeFn {
  if (options?.disableEscape) {
    return noop
  }

  return options?.escapeFn ?? escape
}

export {
  noop,
}
