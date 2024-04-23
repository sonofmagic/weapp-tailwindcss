import { removeWxmlId } from '../util'
import { isPropsMatch } from '@/wxml/utils'

describe('utils', () => {
  it('isPropsMatch', () => {
    expect(isPropsMatch('a', 'a')).toBe(true)
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
})
