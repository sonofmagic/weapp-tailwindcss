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
})