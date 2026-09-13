import { escape as escapeClassName } from '@weapp-core/escape'
import { describe, expect, it } from 'vitest'
import { cn } from '@/index'

describe('cn', () => {
  it('组合条件值和嵌套数组', () => {
    expect(cn('foo', undefined, ['bar', { baz: true, nope: false }])).toBe('foo bar baz')
  })

  it('按 Tailwind 冲突规则保留最后一个类名', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('处理小程序 rpx 任意值和 modifier', () => {
    expect(cn('w-[10rpx]', 'w-[24rpx]')).toBe(escapeClassName('w-[24rpx]'))
    expect(cn('hover:p-2', 'hover:p-4')).toBe(escapeClassName('hover:p-4'))
  })

  it('保留非 Tailwind 类名', () => {
    expect(cn('custom-card', 'p-4', 'p-2')).toBe('custom-card p-2')
  })
})
