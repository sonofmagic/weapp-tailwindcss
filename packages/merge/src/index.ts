import { twMerge } from 'tailwind-merge'
import { replaceJs } from 'weapp-tailwindcss/replace'

export function tw(...args: Parameters<typeof twMerge>) {
  return replaceJs(twMerge(...args))
}
