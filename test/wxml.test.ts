import { templeteReplacer } from '../src/wxml/index'

describe('wxml', () => {
  it('isStringLiteral', () => {
    const case1 =
      "'{{['som-node__label','data-v-59229c4a','som-org__text-'+(node.align||''),node.active||collapsed?'som-node__label-active':'',d]}}'"

    const result = templeteReplacer(case1)

    expect(result).toBe(
      '{{[\'som-node__label\',\'data-v-59229c4a\',\'som-org__text-\'+(node.align||\'\'),node.active||collapsed?\'som-node__label-active\':\'\',d]}}'
    )
  })

  it('isConditionalExpression', () => {
    const case2 =
      "'{{['flex','flex-col','items-center',flag===1?'bg-red-900':'bg-[#fafa00]']}}'"
    const result = templeteReplacer(case2)
    expect(result).toBe(
      "{{['flex','flex-col','items-center',flag===1?'bg-red-900':'bg-_l__h_fafa00_r_']}}"
    )
  })

  // it('should ', () => {
  //   const case3 =
  //     '<view class="_div data-v-59d503f6"><view class="container data-v-59d503f6">container</view><label class="decoration-clone bg-gradient-to-b from-yellow-400 to-red-500 text-transparent _span data-v-59d503f6">Hello<view class="_br data-v-59d503f6"></view>World</label><view class="box-border h-32 w-32 p-4 border-4 border-blue-400 bg-blue-200 rounded-md _div data-v-59d503f6"><view class="h-full w-full bg-blue-400 bg-stripes bg-stripes-white _div data-v-59d503f6"></view></view><view class="box-content h-32 w-32 p-4 border-4 border-green-400 bg-green-200 rounded-md _div data-v-59d503f6"><view class="h-full w-full bg-green-400 bg-stripes bg-stripes-white _div data-v-59d503f6"></view></view><block wx:for="{{displayArray}}" wx:for-item="d" wx:for-index="__i0__" wx:key="*this"><view class="{{_l_\'item\',\'data-v-59d503f6\',d]}}">{{d}}</view></block></view>'
  // })
})
