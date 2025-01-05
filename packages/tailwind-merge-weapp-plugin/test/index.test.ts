import { withWeapp } from '@/index'
import { twMerge as cn, extendTailwindMerge } from 'tailwind-merge'
import { replaceJs } from './utils'

const twMerge = extendTailwindMerge(withWeapp)

describe('index', () => {
  it('padding case 0', () => {
    const origin = 'p-1.5 p-2 p-3 p-[10px] p-[20px]'
    expect(cn(origin)).toBe('p-[20px]')
    const wxml = replaceJs(origin)
    expect(wxml).toBe('p-1d5 p-2 p-3 p-_10px_ p-_20px_')
    expect(twMerge(wxml)).toBe('p-_20px_')
  })

  it('padding case 1 rpx', () => {
    const origin = 'p-1.5 p-2 p-3 p-[10px] p-[20rpx]'
    expect(cn(origin)).toBe('p-[20rpx]')
    const wxml = replaceJs(origin)
    expect(wxml).toBe('p-1d5 p-2 p-3 p-_10px_ p-_20rpx_')
    expect(twMerge(wxml)).toBe('p-_20rpx_')
  })

  it('padding case 2', () => {
    const origin = 'p-0.5 p-1.5 p-2'
    expect(cn(origin)).toBe('p-2')
    const wxml = replaceJs(origin)
    expect(wxml).toBe('p-0d5 p-1d5 p-2')
    expect(twMerge(wxml)).toBe('p-2')
  })
})
