import { cva as _cva } from 'class-variance-authority'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { escape } from 'weapp-tailwindcss/escape'

export function cn(...inputs: ClassValue[]) {
  return escape(twMerge(clsx(inputs)))
}

export function cva(...inputs: Parameters<typeof cva>) {
  return escape(_cva(...inputs))
}
