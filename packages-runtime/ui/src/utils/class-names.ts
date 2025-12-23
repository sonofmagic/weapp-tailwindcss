/**
 * 类名合并工具
 * 基于 tailwind-merge 的封装
 */
import { twMerge } from 'tailwind-merge'

export type ClassValue = string | number | boolean | undefined | null | ClassValue[] | Record<string, boolean>

/**
 * 合并类名,解决 Tailwind CSS 冲突问题
 * @param classes - 类名值数组
 * @returns 合并后的类名字符串
 */
export function cn(...classes: ClassValue[]): string {
  const flattenedClasses: string[] = []

  for (const cls of classes) {
    if (!cls) {
      continue
    }

    if (typeof cls === 'string' || typeof cls === 'number') {
      flattenedClasses.push(String(cls))
    }
    else if (Array.isArray(cls)) {
      const nested = cn(...cls)
      if (nested) {
        flattenedClasses.push(nested)
      }
    }
    else if (typeof cls === 'object') {
      for (const [key, value] of Object.entries(cls)) {
        if (value) {
          flattenedClasses.push(key)
        }
      }
    }
  }

  return twMerge(flattenedClasses.join(' '))
}

/**
 * 条件类名组合
 * @param base - 基础类名
 * @param conditions - 条件类名映射
 * @returns 合并后的类名字符串
 */
export function clsx(base: ClassValue, conditions?: Record<string, boolean>): string {
  return cn(base, conditions)
}
