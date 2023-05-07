import { getOptions } from '@/options'
import { MappingChars2String } from '@/dic'
import defu from 'defu'
describe('customReplaceDictionary', () => {
  it('templeteHandler custom map', () => {
    const { templeteHandler } = getOptions({
      customAttributes: {
        'van-image': ['other-attr']
      },
      customReplaceDictionary: defu(
        {
          '[': '-',
          ']': '-'
        },
        MappingChars2String
      )
    })
    const res = templeteHandler('<van-image class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image class="w--0_d_5px-" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w--0_d_5px-"></van-image>')
  })

  it('templeteHandler complex mode', () => {
    const { templeteHandler } = getOptions({
      customAttributes: {
        'van-image': ['other-attr']
      },
      customReplaceDictionary: 'complex'
    })
    const res = templeteHandler('<van-image class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image class="w-_bl_0_d_5px_br_" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-_bl_0_d_5px_br_"></van-image>')
  })

  it('templeteHandler default(complex) mode', () => {
    const { templeteHandler } = getOptions({
      customAttributes: {
        'van-image': ['other-attr']
      },
      customReplaceDictionary: 'complex'
    })
    const res = templeteHandler('<van-image class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image class="w-_bl_0_d_5px_br_" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-_bl_0_d_5px_br_"></van-image>')
  })

  it('templeteHandler simple mode', () => {
    const { templeteHandler } = getOptions({
      customAttributes: {
        'van-image': ['other-attr']
      },
      customReplaceDictionary: 'simple'
    })
    const res = templeteHandler('<van-image class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image class="w-_0d5px_" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-_0d5px_"></van-image>')
  })

  it('styleHandler custom map', () => {
    const { styleHandler } = getOptions({
      customReplaceDictionary: defu(
        {
          '[': '-',
          ']': '-'
        },
        MappingChars2String
      )
    })
    const res = styleHandler('.w-\\[0\\.5px\\]{--tw-border-opacity: 1;}', {
      isMainChunk: true
    })
    expect(res).toBe('.w--0_d_5px-{--tw-border-opacity: 1;}')
  })

  it('styleHandler complex mode', () => {
    const { styleHandler } = getOptions({
      customReplaceDictionary: 'complex'
    })
    const res = styleHandler('.w-\\[0\\.5px\\]{--tw-border-opacity: 1;}', {
      isMainChunk: true
    })
    expect(res).toBe('.w-_bl_0_d_5px_br_{--tw-border-opacity: 1;}')
  })

  it('styleHandler default(complex) mode', () => {
    const { styleHandler } = getOptions({
      customReplaceDictionary: 'complex'
    })
    const res = styleHandler('.w-\\[0\\.5px\\]{--tw-border-opacity: 1;}', {
      isMainChunk: true
    })
    expect(res).toBe('.w-_bl_0_d_5px_br_{--tw-border-opacity: 1;}')
  })

  it('styleHandler simple mode', () => {
    const { styleHandler } = getOptions({
      customReplaceDictionary: 'simple'
    })
    const res = styleHandler('.w-\\[0\\.5px\\]{--tw-border-opacity: 1;}', {
      isMainChunk: true
    })
    expect(res).toBe('.w-_0d5px_{--tw-border-opacity: 1;}')
  })
})
