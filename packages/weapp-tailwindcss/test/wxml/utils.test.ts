import { describe, expect, it, vi } from 'vitest'
import { getCompilerContext } from '@/context'
import { replaceWxml } from '@/wxml'
import { generateCode, isPropsMatch } from '@/wxml/utils'
import { removeWxmlId } from '../util'

const EXACT_RD_BTN_CLASS_REGEXP = /^rd-btn-class$/
const RD_WORD_CLASS_REGEXP = /^rd-\w+-class$/
const RD_ALPHA_CLASS_REGEXP = /^rd-[A-Za-z]+-class$/

describe('utils', () => {
  it('isPropsMatch', () => {
    expect(isPropsMatch('a', 'a')).toBe(true)
    expect(isPropsMatch(['a'], 'a')).toBe(true)
    expect(isPropsMatch('rd-btn-class', 'rd-btn-class')).toBe(true)
    expect(isPropsMatch(['rd-btn-class'], 'rd-btn-class')).toBe(true)
    expect(isPropsMatch(EXACT_RD_BTN_CLASS_REGEXP, 'rd-btn-class')).toBe(true)
    expect(isPropsMatch([EXACT_RD_BTN_CLASS_REGEXP], 'rd-btn-class')).toBe(true)
    expect(isPropsMatch(RD_WORD_CLASS_REGEXP, 'rd-btn-class')).toBe(true)
    expect(isPropsMatch([RD_WORD_CLASS_REGEXP], 'rd-btn-class')).toBe(true)
    expect(isPropsMatch(RD_ALPHA_CLASS_REGEXP, 'rd-btn-class')).toBe(true)
    expect(isPropsMatch([RD_ALPHA_CLASS_REGEXP], 'rd-btn-class')).toBe(true)
  })

  it('remove all id', () => {
    const html = `<view class="afterccontent-_m_ aftercml-0d5 afterctext-red-500 aspect-w-16" data-sid="_Au" id="_Au" style="">
    <view class="itext-_h555_" data-sid="_Ap" id="_Ap" style="">aspect</view>
    <view class="bg-_hfaf_" data-sid="_Ar" id="_Ar" style="">w</view>
    <view class="bg-_h123_" data-sid="_At" id="_At" style="">16</view>
  </view>`
    const res = removeWxmlId(html)
    expect(res).toMatchSnapshot()
  })

  it('remove all id case 0', () => {
    const html = `<view data-sid="_Au" id="_Au" class="afterccontent-_m_ aftercml-0d5 afterctext-red-500 aspect-w-16" style="">
    <view class="itext-_h555_" data-sid="_Ap" id="_Ap" style="">aspect</view>
    <view class="bg-_hfaf_" data-sid="_Ar" id="_Ar" style="">w</view>
    <view class="bg-_h123_" data-sid="_At" id="_At" style="">16</view>
  </view>`
    const res = removeWxmlId(html)
    expect(res).toMatchSnapshot()
  })

  it('strip luna dom highlighter snippet', () => {
    const html = `<view>test</view>
.luna-dom-highlighter{position:fixed;left:0;top:0;width:100%;height:100%;z-index:100000;}
.luna-dom-highlighter-fill{position:absolute;}`
    const res = removeWxmlId(html)
    expect(res).toBe('<view>test</view>')
  })

  it('wraps expressions automatically when template bindings start with objects', () => {
    const { jsHandler } = getCompilerContext()
    const runtimeSet = new Set<string>(['border-[#ff0000]', 'bg-blue-600/50'])
    const code = generateCode(`{'border-[#ff0000] bg-blue-600/50': flag}`, {
      jsHandler,
      runtimeSet,
    })
    expect(code).toContain(replaceWxml('border-[#ff0000] bg-blue-600/50'))
  })

  it('does not retry when wrapExpression is already enabled', () => {
    const jsHandler = vi.fn(() => ({
      code: 'wrapped',
      error: new Error('already wrapped'),
    }))
    const runtimeSet = new Set<string>()
    const code = generateCode(`{'foo': flag}`, {
      jsHandler,
      runtimeSet,
      wrapExpression: true,
    })

    expect(code).toBe('wrapped')
    expect(jsHandler).toHaveBeenCalledTimes(1)
    expect(jsHandler.mock.calls[0]?.[2]).toEqual({
      wrapExpression: true,
    })
  })

  it('retries once with wrapExpression when the initial parse fails', () => {
    const jsHandler = vi
      .fn()
      .mockReturnValueOnce({
        code: 'initial',
        error: new Error('parse error'),
      })
      .mockReturnValueOnce({
        code: 'fallback',
      })
    const runtimeSet = new Set<string>()
    const code = generateCode(`{'foo': flag}`, {
      jsHandler,
      runtimeSet,
    })

    expect(code).toBe('fallback')
    expect(jsHandler).toHaveBeenCalledTimes(2)
    expect(jsHandler.mock.calls[0]?.[2]).toBeUndefined()
    expect(jsHandler.mock.calls[1]?.[2]).toEqual({
      wrapExpression: true,
    })
  })
})
