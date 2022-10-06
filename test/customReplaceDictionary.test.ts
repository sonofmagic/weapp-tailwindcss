import { getOptions } from '@/defaults'

describe('customReplaceDictionary', () => {
  it('should ', () => {
    const { templeteHandler } = getOptions({
      customAttributes: {
        'van-image': ['other-attr']
      },
      customReplaceDictionary: {
        '[': '-',
        ']': '-'
      }
    })
    const res = templeteHandler('<van-image class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image class="w--0_d_5px-" custom-class="w--0_d_5px-" image-class="w--0_d_5px-" other-attr="w--0_d_5px-"></van-image>')
  })
})
