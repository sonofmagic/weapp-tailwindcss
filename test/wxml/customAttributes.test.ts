import { getOptions } from '@/defaults'

describe('customAttributes', () => {
  it('van-image case 0', () => {
    const { templeteHandler } = getOptions({
      customAttributes: {
        'van-image': ['image-class', 'loading-class', 'error-class']
      }
    })
    const res = templeteHandler('<van-image class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image class="w-_bl_0_d_5px_br_" custom-class="w-[0.5px]" image-class="w-_bl_0_d_5px_br_" other-attr="w-[0.5px]"></van-image>')
  })

  it('van-image case 1', () => {
    const { templeteHandler } = getOptions({
      customAttributes: {
        'van-image': ['other-attr']
      }
    })
    const res = templeteHandler('<van-image class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image class="w-_bl_0_d_5px_br_" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-_bl_0_d_5px_br_"></van-image>')
  })

  it('view tag case', () => {
    const { templeteHandler } = getOptions({
      customAttributes: {
        view: ['aa', 'bb']
      }
    })
    const res = templeteHandler('<view class="w-[0.5px]" aa="w-[0.5px]" bb="w-[0.5px]" cc=="w-[0.5px]"></view>')
    expect(res).toBe('<view class="w-_bl_0_d_5px_br_" aa="w-_bl_0_d_5px_br_" bb="w-_bl_0_d_5px_br_" cc=="w-[0.5px]"></view>')
  })

  it('map case', () => {
    const map = new Map<string | RegExp, string | RegExp | (string | RegExp)[]>()
    map.set(/(?:van|el|ant)-(?:\w+)/g, ['custom-attrs', /shit/g])
    const { templeteHandler } = getOptions({
      customAttributes: map
    })
    const tags = ['van', 'el', 'ant']
    const res = templeteHandler(
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
})
