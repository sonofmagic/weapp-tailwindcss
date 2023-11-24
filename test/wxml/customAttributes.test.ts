import { getOptions } from '@/options'
import { MappingChars2String } from '@/escape'
describe('customAttributes', () => {
  it('van-image case 0', () => {
    const { templateHandler } = getOptions({
      customAttributes: {
        'van-image': ['image-class', 'loading-class', 'error-class']
      },
      customReplaceDictionary: MappingChars2String
    })
    const res = templateHandler('<van-image class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image class="w-_bl_0_d_5px_br_" custom-class="w-[0.5px]" image-class="w-_bl_0_d_5px_br_" other-attr="w-[0.5px]"></van-image>')
  })

  it('van-image case 1', () => {
    const { templateHandler } = getOptions({
      customAttributes: {
        'van-image': ['other-attr']
      },
      customReplaceDictionary: MappingChars2String
    })
    const res = templateHandler('<van-image class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image class="w-_bl_0_d_5px_br_" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-_bl_0_d_5px_br_"></van-image>')
  })

  it('view tag case', () => {
    const { templateHandler } = getOptions({
      customAttributes: {
        view: ['aa', 'bb']
      },
      customReplaceDictionary: MappingChars2String
    })
    const res = templateHandler('<view class="w-[0.5px]" aa="w-[0.5px]" bb="w-[0.5px]" cc=="w-[0.5px]"></view>')
    expect(res).toBe('<view class="w-_bl_0_d_5px_br_" aa="w-_bl_0_d_5px_br_" bb="w-_bl_0_d_5px_br_" cc=="w-[0.5px]"></view>')
  })

  it('wild card case', () => {
    const { templateHandler } = getOptions({
      customAttributes: {
        '*': ['aa', 'bb']
      },
      customReplaceDictionary: MappingChars2String
    })
    const res = templateHandler('<view class="w-[0.5px]" aa="w-[0.5px]" bb="w-[0.5px]" cc=="w-[0.5px]"></view>')
    expect(res).toBe('<view class="w-_bl_0_d_5px_br_" aa="w-_bl_0_d_5px_br_" bb="w-_bl_0_d_5px_br_" cc=="w-[0.5px]"></view>')
  })

  it('wild card case 0', () => {
    const { templateHandler } = getOptions({
      customAttributes: {
        '*': ['group-hover-class']
      }
    })
    const res = templateHandler('<view class="w-0.5 group" group-hover-class="!bg-indigo-500 !text-red"></view>')
    expect(res).toBe('<view class="w-0d5 group" group-hover-class="ibg-indigo-500 itext-red"></view>')
  })

  it('wild card via normal case', () => {
    const { templateHandler } = getOptions({
      customAttributes: {
        '*': ['aa', 'bb'],
        cc: ['dd', 'ee']
      },
      customReplaceDictionary: MappingChars2String
    })
    const res = templateHandler(
      '<view class="w-[0.5px]" aa="w-[0.5px]" bb="w-[0.5px]" dd="w-[0.5px]" ee="w-[0.5px]"></view><cc class="w-[0.5px]" aa="w-[0.5px]" bb="w-[0.5px]" dd="w-[0.5px]" ee="w-[0.5px]"></cc>'
    )
    expect(res).toBe(
      '<view class="w-_bl_0_d_5px_br_" aa="w-_bl_0_d_5px_br_" bb="w-_bl_0_d_5px_br_" dd="w-[0.5px]" ee="w-[0.5px]"></view><cc class="w-_bl_0_d_5px_br_" aa="w-_bl_0_d_5px_br_" bb="w-_bl_0_d_5px_br_" dd="w-_bl_0_d_5px_br_" ee="w-_bl_0_d_5px_br_"></cc>'
    )
  })

  it('map case', () => {
    const map = new Map<string | RegExp, string | RegExp | (string | RegExp)[]>()
    map.set(/(?:van|el|ant)-\w+/g, ['custom-attrs', /shit/])
    const { templateHandler } = getOptions({
      customAttributes: map,
      customReplaceDictionary: MappingChars2String
    })
    const tags = ['van', 'el', 'ant']
    const res = templateHandler(
      tags
        .map((x) => {
          return `<${x}-a class="w-[0.5px]" hover-class="w-[0.5px]" custom-attrs="w-[0.5px]" shit="w-[0.5px]" play-with-shit="w-[0.5px]"></${x}-a>`
        })
        .join('\n')
    )
    expect(res).toBe(
      '<van-a class="w-_bl_0_d_5px_br_" hover-class="w-_bl_0_d_5px_br_" custom-attrs="w-_bl_0_d_5px_br_" shit="w-_bl_0_d_5px_br_" play-with-shit="w-_bl_0_d_5px_br_"></van-a>\n<el-a class="w-_bl_0_d_5px_br_" hover-class="w-_bl_0_d_5px_br_" custom-attrs="w-_bl_0_d_5px_br_" shit="w-_bl_0_d_5px_br_" play-with-shit="w-_bl_0_d_5px_br_"></el-a>\n<ant-a class="w-_bl_0_d_5px_br_" hover-class="w-_bl_0_d_5px_br_" custom-attrs="w-_bl_0_d_5px_br_" shit="w-_bl_0_d_5px_br_" play-with-shit="w-_bl_0_d_5px_br_"></ant-a>'
    )
  })

  it('simple map case', () => {
    const map = new Map<string | RegExp, string | RegExp | (string | RegExp)[]>()
    map.set(/(?:van|el|ant)-\w+/, ['custom-attrs', /shit/])
    const { templateHandler } = getOptions({
      customAttributes: map,
      customReplaceDictionary: MappingChars2String
    })
    const tags = ['van']
    const res = templateHandler(
      tags
        .map((x) => {
          return `<${x}-a class="w-[0.5px]" hover-class="w-[0.5px]" custom-attrs="w-[0.5px]" shit="w-[0.5px]" play-with-shit="w-[0.5px]"></${x}-a>`
        })
        .join('\n')
    )
    expect(res).toBe(
      '<van-a class="w-_bl_0_d_5px_br_" hover-class="w-_bl_0_d_5px_br_" custom-attrs="w-_bl_0_d_5px_br_" shit="w-_bl_0_d_5px_br_" play-with-shit="w-_bl_0_d_5px_br_"></van-a>'
    )
  })
})
