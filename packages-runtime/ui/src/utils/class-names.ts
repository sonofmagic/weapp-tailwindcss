/**
 * 类名合并工具
 * 基于 @weapp-tailwindcss/merge 的封装
 */
import { twMerge } from '@weapp-tailwindcss/merge'

export type ClassValue = Parameters<typeof twMerge>[number]

/**
 * 合并类名,解决 Tailwind CSS 冲突问题
 * @param classes - 类名值数组
 * @returns 合并后的类名字符串
 */
export function cn(...classes: ClassValue[]): string {
  return twMerge(...classes)
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
