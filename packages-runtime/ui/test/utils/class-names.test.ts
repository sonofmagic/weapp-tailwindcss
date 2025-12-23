/**
 * 类名合并工具测试
 */
import { describe, expect, it } from 'vitest'
import { clsx, cn } from '../../src/utils/class-names'

describe('cn', () => {
  it('should merge simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle undefined and null values', () => {
    expect(cn('foo', undefined, 'bar', null)).toBe('foo bar')
  })

  it('should handle boolean conditions', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz')
  })

  it('should handle object syntax', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })

  it('should handle array of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('should merge Tailwind CSS classes correctly', () => {
    // tailwind-merge 应该解决冲突
    expect(cn('p-4', 'p-2')).toBe('p-2')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle wt- prefixed classes', () => {
    expect(cn('wt-button', 'wt-button--primary')).toBe('wt-button wt-button--primary')
  })
})

describe('clsx', () => {
  it('should work like cn with base and conditions', () => {
    expect(clsx('base', { active: true, disabled: false })).toBe('base active')
  })
})
