// import replace from 'regexp-replace'
import { classStringReplace, tagStringReplace, variableRegExp, tagWithClassRegexp } from '@/reg'
import { replaceWxml } from '@/wxml/index'
// import redent from 'redent'
import { wxmlCasePath, createGetCase, matchAll, format } from './util'

const getCase = createGetCase(wxmlCasePath)

describe('regexp', () => {
  it('percentage unit', () => {
    const testCase = '<view class="h-[200%]" />'
    const result = classStringReplace(testCase, (x) => {
      return replaceWxml(x)
    })
    expect(result).toBe('<view class="h-_l_200_pct__r_" />')
  })

  it('static node = self', () => {
    const testCase =
      '<view class="p-[20px] -mt-2 mb-[-20px]">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view><view class="space-y-[1.6rem]"><view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view><view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view><view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view><view class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">Hello</view><view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view><view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid"><view>1</view><view>2</view><view>3</view></view></view><view class="test">test</view>'
    const result = classStringReplace(testCase, (x) => x)
    expect(result).toBe(testCase)
    expect(result).toMatchSnapshot()
  })

  it('static node ', () => {
    const testCase =
      '<view class="p-[20px] -mt-2 mb-[-20px]">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view><view class="space-y-[1.6rem]"><view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view><view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view><view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view><view class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">Hello</view><view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view><view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid"><view>1</view><view>2</view><view>3</view></view></view><view class="test">test</view>'
    const result = classStringReplace(testCase, (x) => {
      return replaceWxml(x)
    })
    expect(result).toBe(
      '<view class="p-_l_20px_r_ -mt-2 mb-_l_-20px_r_">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view><view class="space-y-_l_1_dot_6rem_r_"><view class="w-_l_300rpx_r_ text-black text-opacity-_l_0_dot_19_r_">w-[300rpx] text-black text-opacity-[0.19]</view><view class="min-w-_l_300rpx_r_ max-h-_l_100px_r_ text-_l_20px_r_ leading-_l_0_dot_9_r_">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view><view class="max-w-_l_300rpx_r_ min-h-_l_100px_r_ text-_l__h_dddddd_r_">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view><view class="flex items-center justify-center h-_l_100px_r_ w-_l_100px_r_ rounded-_l_40px_r_ bg-_l__h_123456_r_ bg-opacity-_l_0_dot_54_r_ text-_l__h_ffffff_r_">Hello</view><view class="border-_l_10px_r_ border-_l__h_098765_r_ border-solid border-opacity-_l_0_dot_44_r_">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view><view class="grid grid-cols-3 divide-x-_l_10px_r_ divide-_l__h_010101_r_ divide-solid"><view>1</view><view>2</view><view>3</view></view></view><view class="test">test</view>'
    )
    expect(result).toMatchSnapshot()
  })
  test('tagStringReplace', async () => {
    const wxmlCase =
      '<view class="p-[20px] -mt-2 mb-[-20px]">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view><view class="space-y-[1.6rem]"><view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view><view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view><view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view><view class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">Hello</view><view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view><view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid"><view>1</view><view>2</view><view>3</view></view></view><view class="test">test</view>'

    const str = tagStringReplace(wxmlCase, (x) => {
      const res = classStringReplace(x, (y) => {
        return replaceWxml(y)
      })
      return res
    })

    expect(str).toBe(
      '<view class="p-_l_20px_r_ -mt-2 mb-_l_-20px_r_">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view><view class="space-y-_l_1_dot_6rem_r_"><view class="w-_l_300rpx_r_ text-black text-opacity-_l_0_dot_19_r_">w-[300rpx] text-black text-opacity-[0.19]</view><view class="min-w-_l_300rpx_r_ max-h-_l_100px_r_ text-_l_20px_r_ leading-_l_0_dot_9_r_">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view><view class="max-w-_l_300rpx_r_ min-h-_l_100px_r_ text-_l__h_dddddd_r_">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view><view class="flex items-center justify-center h-_l_100px_r_ w-_l_100px_r_ rounded-_l_40px_r_ bg-_l__h_123456_r_ bg-opacity-_l_0_dot_54_r_ text-_l__h_ffffff_r_">Hello</view><view class="border-_l_10px_r_ border-_l__h_098765_r_ border-solid border-opacity-_l_0_dot_44_r_">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view><view class="grid grid-cols-3 divide-x-_l_10px_r_ divide-_l__h_010101_r_ divide-solid"><view>1</view><view>2</view><view>3</view></view></view><view class="test">test</view>'
    )
  })

  test('tagStringReplace2', async () => {
    const wxmlCase =
      '<view class="p-[20px] -mt-2 mb-[-20px]">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view><view class="space-y-[1.6rem]"><view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view><view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view><view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view><view class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">Hello</view><view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view><view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid"><view>1</view><view>2</view><view>3</view></view></view><view class="test">test</view>'

    const str = tagStringReplace(wxmlCase, (x) => {
      const res = classStringReplace(x, (y) => {
        return replaceWxml(y)
      })
      return res
    })

    expect(str).toBe(
      '<view class="p-_l_20px_r_ -mt-2 mb-_l_-20px_r_">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view><view class="space-y-_l_1_dot_6rem_r_"><view class="w-_l_300rpx_r_ text-black text-opacity-_l_0_dot_19_r_">w-[300rpx] text-black text-opacity-[0.19]</view><view class="min-w-_l_300rpx_r_ max-h-_l_100px_r_ text-_l_20px_r_ leading-_l_0_dot_9_r_">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view><view class="max-w-_l_300rpx_r_ min-h-_l_100px_r_ text-_l__h_dddddd_r_">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view><view class="flex items-center justify-center h-_l_100px_r_ w-_l_100px_r_ rounded-_l_40px_r_ bg-_l__h_123456_r_ bg-opacity-_l_0_dot_54_r_ text-_l__h_ffffff_r_">Hello</view><view class="border-_l_10px_r_ border-_l__h_098765_r_ border-solid border-opacity-_l_0_dot_44_r_">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view><view class="grid grid-cols-3 divide-x-_l_10px_r_ divide-_l__h_010101_r_ divide-solid"><view>1</view><view>2</view><view>3</view></view></view><view class="test">test</view>'
    )
  })

  test('with var 5', () => {
    const case3 = "{{ utils.bem('button', [type, size, { block, round, plain, square, loading, disabled, hairline, unclickable: disabled || loading }]) }}"
    const arr = matchAll(variableRegExp, case3)

    expect(arr.length).toBe(1)
  })

  test('with var 6', () => {
    const case3 = `{{[
      'flex',
      'items-center',
      'justify-center',
      'h-_l_100px_r_',
      'w-_l_100px_r_',
      'rounded-_l_40px_r_',
      'bg-_l__h_123456_r_',
      'bg-opacity-_l_0-dot-54_r_',
      'text-_l__h_ffffff_r_',
      'data-v-1badc801',
      'text-_l__h_123456_r_',
      b]}}`
    const arr = matchAll(variableRegExp, case3)
    expect(arr.length).toBe(1)
  })

  // 已测试，原生wxs的 wxml 不合法，故此测试用例废弃
  //  <view class="{{utils.bem({})}}">
  // test('with var 7', () => {
  //   const case3 = "{{b('b',{a:{c:'d'}})}}"
  //   const arr = []
  //   let res
  //   do {
  //     res = variableMatch(case3)
  //     if (res) {
  //       arr.push(res)
  //     }
  //   } while (res !== null)
  //   expect(arr[0][1]).toBe("b('b',{a:{}})")
  // })

  test('exec pref.wxml ', async () => {
    const testCase = await getCase('pref.wxml')

    const arr = matchAll(tagWithClassRegexp, testCase)

    expect(arr.length).toBe(10)
    expect(arr[0][2]).toBe('pixel-art-container flex flex-col items-center')
    expect(arr[1][2]).toBe('pixel-art-wrapper')
    expect(arr[2][2]).toBe('pixel-art-scroll-view')
    expect(arr[3][2]).toBe('pixel-art-scroll-view-inner')
    expect(arr[4][2]).toBe('pixel-art-row flex')
    expect(arr[5][2]).toBe("{{['pixel-art-item','z-50',rowIdx===activePosition.y&&colIdx===activePosition.x?'active':'']}}")
    expect(arr[6][2]).toBe('w-full h-full')
    expect(arr[7][2]).toBe('flex justify-end my-4')
    expect(arr[8][2]).toBe('mt-6')
    expect(arr[9][2]).toBe('vue-ref')
  })

  test('exec pref.wxml ', async () => {
    const testCase = await getCase('case1.wxml')

    const arr = matchAll(tagWithClassRegexp, testCase)

    expect(arr.length).toBe(1)
    expect(format(arr[0][2])).toBe(
      format(`
    bg-white
    rounded-full
    w-10
    h-10
    flex
    justify-center
    items-center
    pointer-events-auto
  `)
    )
  })
})
