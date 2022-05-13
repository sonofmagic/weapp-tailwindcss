// import replace from 'regexp-replace'
import { classStringReplace, tagStringRegexp } from '@/reg'
import { replaceWxml } from '@/wxml/index'
describe('regexp', () => {
  test('tagStringRegexp', async () => {
    const wxmlCase =
      '<view class="p-[20px] -mt-2 mb-[-20px]">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view><view class="space-y-[1.6rem]"><view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view><view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view><view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view><view class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">Hello</view><view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view><view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid"><view>1</view><view>2</view><view>3</view></view></view><view class="test">test</view>'

    const str = tagStringRegexp(wxmlCase, (x) => {
      const res = classStringReplace(x, (y) => {
        return replaceWxml(y)
      })
      return res
    })

    expect(str).toBe(
      '<view class="p-_l_20px_r_ -mt-2 mb-_l_-20px_r_">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view><view class="space-y-_l_1-dot-6rem_r_"><view class="w-_l_300rpx_r_ text-black text-opacity-_l_0-dot-19_r_">w-[300rpx] text-black text-opacity-[0.19]</view><view class="min-w-_l_300rpx_r_ max-h-_l_100px_r_ text-_l_20px_r_ leading-_l_0-dot-9_r_">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view><view class="max-w-_l_300rpx_r_ min-h-_l_100px_r_ text-_l__h_dddddd_r_">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view><view class="flex items-center justify-center h-_l_100px_r_ w-_l_100px_r_ rounded-_l_40px_r_ bg-_l__h_123456_r_ bg-opacity-_l_0-dot-54_r_ text-_l__h_ffffff_r_">Hello</view><view class="border-_l_10px_r_ border-_l__h_098765_r_ border-solid border-opacity-_l_0-dot-44_r_">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view><view class="grid grid-cols-3 divide-x-_l_10px_r_ divide-_l__h_010101_r_ divide-solid"><view>1</view><view>2</view><view>3</view></view></view><view class="test">test</view>'
    )
  })
})
