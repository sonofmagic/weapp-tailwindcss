import { templeteReplacer, templeteHandler } from '../src/wxml/index'

describe('wxml', () => {
  it('isStringLiteral', () => {
    const testCase = "{{['som-node__label','data-v-59229c4a','som-org__text-'+(node.align||''),node.active||collapsed?'som-node__label-active':'',d]}}"

    const result = templeteReplacer(testCase)

    expect(result).toBe('{{["som-node__label","data-v-59229c4a","som-org__text-"+(node.align||""),node.active||collapsed?"som-node__label-active":"",d]}}')
  })

  it('isConditionalExpression', () => {
    const testCase = "{{['flex','flex-col','items-center',flag===1?'bg-red-900':'bg-[#fafa00]']}}"
    const result = templeteReplacer(testCase)
    expect(result).toBe('{{["flex","flex-col","items-center",flag===1?"bg-red-900":"bg-_l__h_fafa00_r_"]}}')
  })

  it('nest ', () => {
    const testCase =
      "{{[flag?'bg-red-900':'bg-[#fafa00]',classObject,[(flag===true)?'bg-[#fafa00]':'',(true)?'text-sm':''],flag?flag===false?'bg-red-900':'bg-[#000]':'bg-[#fafa00]']}}"

    const result = templeteReplacer(testCase)
    expect(result).toBe(
      '{{[flag?"bg-red-900":"bg-_l__h_fafa00_r_",classObject,[flag===true?"bg-_l__h_fafa00_r_":"",true?"text-sm":""],flag?flag===false?"bg-red-900":"bg-_l__h_000_r_":"bg-_l__h_fafa00_r_"]}}'
    )
  })

  it('sm:text-3xl dark:text-sky-400', () => {
    const testCase = 'sm:text-3xl dark:text-slate-200 bg-[#ffffaa]'
    const result = templeteReplacer(testCase)
    expect(result).toBe('sm_c_text-3xl dark_c_text-slate-200 bg-_l__h_ffffaa_r_')
  })
  // it('should ', () => {
  //   const case3 =
  //     '<view class="_div data-v-59d503f6"><view class="container data-v-59d503f6">container</view><label class="decoration-clone bg-gradient-to-b from-yellow-400 to-red-500 text-transparent _span data-v-59d503f6">Hello<view class="_br data-v-59d503f6"></view>World</label><view class="box-border h-32 w-32 p-4 border-4 border-blue-400 bg-blue-200 rounded-md _div data-v-59d503f6"><view class="h-full w-full bg-blue-400 bg-stripes bg-stripes-white _div data-v-59d503f6"></view></view><view class="box-content h-32 w-32 p-4 border-4 border-green-400 bg-green-200 rounded-md _div data-v-59d503f6"><view class="h-full w-full bg-green-400 bg-stripes bg-stripes-white _div data-v-59d503f6"></view></view><block wx:for="{{displayArray}}" wx:for-item="d" wx:for-index="__i0__" wx:key="*this"><view class="{{_l_\'item\',\'data-v-59d503f6\',d]}}">{{d}}</view></block></view>'
  // })

  // it('static node', () => {
  //   const testCase =
  //     '<view class="p-[20px] -mt-2 mb-[-20px]">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view><view class="space-y-[1.6rem]"><view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view><view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view><view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view><view class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">Hello</view><view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view><view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid"><view>1</view><view>2</view><view>3</view></view></view><view class="test">test</view>'

  //   const regex = /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^"]+)['"]/gim
  //   let arr
  //   while ((arr = regex.exec(testCase)) !== null) {
  //     console.log(`Found ${arr[0]}. Next starts at ${regex.lastIndex}.`)
  //     // expected output: "Found foo. Next starts at 9."
  //     // expected output: "Found foo. Next starts at 19."
  //   }
  //   // const s = /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^"]+)['"]/gim.exec(testCase)
  //   // const result = templeteHandler(testCase)
  //   // console.log(result)
  // })
})
