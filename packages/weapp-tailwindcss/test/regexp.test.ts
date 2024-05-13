// import replace from 'regexp-replace'
import { createGetCase, format, matchAll, wxmlCasePath } from './util'
// import { normalizeEol } from './helpers/normalizeEol'
import { createTemplateClassRegexp, createTemplateHandlerMatchRegexp, escapeStringRegexp, getSourceString, variableRegExp } from '@/reg'
// #endregion
import { replaceWxml } from '@/wxml/index'
// import redent from 'redent'
import { MappingChars2String } from '@/escape'
import { classStringReplace, tagStringReplace, tagWithClassRegexp, wxmlAllowClassCharsRegExp } from '#test/v2/reg'

const getCase = createGetCase(wxmlCasePath)

describe('regexp', () => {
  it('percentage unit', () => {
    const testCase = '<view class="h-[200%]" />'
    const result = classStringReplace(testCase, (y, g1) => {
      return y.replace(g1, replaceWxml(g1, { escapeMap: MappingChars2String }))
    })
    expect(result).toBe('<view class="h-_bl_200_p__br_" />')
  })

  it('static node = self', () => {
    const testCase
      = '<view class="p-[20px] -mt-2 mb-[-20px]">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view><view class="space-y-[1.6rem]"><view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view><view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view><view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view><view class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">Hello</view><view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view><view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid"><view>1</view><view>2</view><view>3</view></view></view><view class="test">test</view>'
    const result = classStringReplace(testCase, x => x)
    expect(result).toBe(testCase)
    expect(result).toMatchSnapshot()
  })

  it('static node ', () => {
    const testCase
      = '<view class="p-[20px] -mt-2 mb-[-20px]">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view><view class="space-y-[1.6rem]"><view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view><view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view><view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view><view class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">Hello</view><view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view><view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid"><view>1</view><view>2</view><view>3</view></view></view><view class="test">test</view>'
    const result = classStringReplace(testCase, (y, g1) => {
      return y.replace(g1, replaceWxml(g1))
    })
    expect(result).toMatchSnapshot()
  })
  it('tagStringReplace', () => {
    const wxmlCase
      = '<view class="p-[20px] -mt-2 mb-[-20px]">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view><view class="space-y-[1.6rem]"><view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view><view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view><view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view><view class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">Hello</view><view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view><view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid"><view>1</view><view>2</view><view>3</view></view></view><view class="test">test</view>'

    const str = tagStringReplace(wxmlCase, (x) => {
      const res = classStringReplace(x, (y, g1) => {
        return y.replace(g1, replaceWxml(g1))
      })
      return res
    })

    expect(str).toMatchSnapshot()
  })

  it('tagStringReplace2', () => {
    const wxmlCase
      = '<view class="p-[20px] -mt-2 mb-[-20px]">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view><view class="space-y-[1.6rem]"><view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view><view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view><view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view><view class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">Hello</view><view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view><view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid"><view>1</view><view>2</view><view>3</view></view></view><view class="test">test</view>'

    const str = tagStringReplace(wxmlCase, (x) => {
      const res = classStringReplace(x, (y, g1) => {
        return y.replace(g1, replaceWxml(g1))
      })
      return res
    })

    expect(str).toMatchSnapshot()
  })

  it('with var 5', () => {
    const case3 = '{{ utils.bem(\'button\', [type, size, { block, round, plain, square, loading, disabled, hairline, unclickable: disabled || loading }]) }}'
    const arr = matchAll(variableRegExp, case3)

    expect(arr.length).toBe(1)
  })

  it('with var 6', () => {
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

  it('exec pref.wxml ', async () => {
    const testCase = await getCase('pref.wxml')

    const arr = matchAll(tagWithClassRegexp, testCase)

    expect(arr.length).toBe(10)
    expect(arr[0][2]).toBe('pixel-art-container flex flex-col items-center')
    expect(arr[1][2]).toBe('pixel-art-wrapper')
    expect(arr[2][2]).toBe('pixel-art-scroll-view')
    expect(arr[3][2]).toBe('pixel-art-scroll-view-inner')
    expect(arr[4][2]).toBe('pixel-art-row flex')
    expect(arr[5][2]).toBe('{{[\'pixel-art-item\',\'z-50\',rowIdx===activePosition.y&&colIdx===activePosition.x?\'active\':\'\']}}')
    expect(arr[6][2]).toBe('w-full h-full')
    expect(arr[7][2]).toBe('flex justify-end my-4')
    expect(arr[8][2]).toBe('mt-6')
    expect(arr[9][2]).toBe('vue-ref')
  })

  it('exec pref.wxml 0', async () => {
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
    `),
    )
  })

  it('wxmlAllowClassCharsRegExp test columns-_l_10rem_r_', () => {
    expect(wxmlAllowClassCharsRegExp.test('columns-_l_10rem_r_')).toBe(true)
  })

  it('customAttributes case 0', () => {
    const attrs = ['image-class', 'loading-class', 'error-class', 'custom-class']
    const regexp = createTemplateHandlerMatchRegexp('van-image', attrs)
    const testCase = '<van-image class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>'
    const matches = [...testCase.matchAll(regexp)]
    expect(matches.length > 0).toBe(true)
    const regexp0 = createTemplateClassRegexp(attrs)
    const matches0 = [...testCase.matchAll(regexp0)]
    expect(matches0.length === 2).toBe(true)
    for (const match of matches0) {
      expect(match[1]).toBe('w-[0.5px]')
    }
  })

  it('escapeStringRegexp throw error', () => {
    expect(() => {
      // @ts-ignore
      escapeStringRegexp({})
    }).toThrow()
  })

  it('getSourceString case0', () => {
    let input: any = 'a'
    expect(getSourceString(input)).toBe(input)
    input = /\s\w\b$/
    expect(getSourceString(input)).toBe(input.source)
    input = {}
    expect(getSourceString(input)).toBe(Object.prototype.toString.call(input))
  })
})
