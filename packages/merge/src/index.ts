import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { escape, weappTwIgnore } from 'weapp-tailwindcss/escape'

export function cn(...inputs: ClassValue[]) {
  return escape(twMerge(clsx(inputs)))
}

export {
  weappTwIgnore,
}
