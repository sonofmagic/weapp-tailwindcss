import { getCompilerContext } from '@/context'
import { replaceWxml } from '@/wxml'
import { generateCode, isPropsMatch } from '@/wxml/utils'
import { removeWxmlId } from '../util'

describe('utils', () => {
  it('isPropsMatch', () => {
    expect(isPropsMatch('a', 'a')).toBe(true)
    expect(isPropsMatch(['a'], 'a')).toBe(true)
    expect(isPropsMatch('rd-btn-class', 'rd-btn-class')).toBe(true)
    expect(isPropsMatch(['rd-btn-class'], 'rd-btn-class')).toBe(true)
    expect(isPropsMatch(/^rd-btn-class$/, 'rd-btn-class')).toBe(true)
    expect(isPropsMatch([/^rd-btn-class$/], 'rd-btn-class')).toBe(true)
    expect(isPropsMatch(/^rd-\w+-class$/, 'rd-btn-class')).toBe(true)
    expect(isPropsMatch([/^rd-\w+-class$/], 'rd-btn-class')).toBe(true)
    expect(isPropsMatch(/^rd-[A-Za-z]+-class$/, 'rd-btn-class')).toBe(true)
    expect(isPropsMatch([/^rd-[A-Za-z]+-class$/], 'rd-btn-class')).toBe(true)
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
})
