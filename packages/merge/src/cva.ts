import { cva as _cva } from 'class-variance-authority'
import { escape } from 'weapp-tailwindcss/escape'

export function cva(...inputs: Parameters<typeof _cva>) {
  const fn = _cva(...inputs)
  return (...props: Parameters<typeof fn>) => {
    return escape(fn(...props))
  }
}
