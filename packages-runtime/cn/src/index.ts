import type { ClassValue } from '@weapp-tailwindcss/runtime'
import { clsx, resolveTransformers } from '@weapp-tailwindcss/runtime'
import { cn as mergeClasses } from 'cn'

const transformers = resolveTransformers()

/** 组合条件类名，并按 Tailwind 冲突规则保留最后一个类名。 */
export function cn(...inputs: ClassValue[]): string {
  const value = clsx(inputs)
  if (!value) {
    return value
  }
  return transformers.escape(mergeClasses(transformers.unescape(value)))
}

export type { ClassValue }
