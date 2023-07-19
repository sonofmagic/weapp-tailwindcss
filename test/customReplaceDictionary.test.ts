import defu from 'defu'
import { getOptions } from '@/options'
import { MappingChars2String } from '@/dic'
describe('customReplaceDictionary', () => {
  it('templateHandler custom map', () => {
    const { templateHandler } = getOptions({
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
    const res = templateHandler('<van-image class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image class="w--0_d_5px-" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w--0_d_5px-"></van-image>')
  })

  it('templateHandler complex mode', () => {
    const { templateHandler } = getOptions({
      customAttributes: {
        'van-image': ['other-attr']
      },
      customReplaceDictionary: 'complex'
    })
    const res = templateHandler('<van-image class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image class="w-_bl_0_d_5px_br_" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-_bl_0_d_5px_br_"></van-image>')
  })

  it('templateHandler default(complex) mode', () => {
    const { templateHandler } = getOptions({
      customAttributes: {
        'van-image': ['other-attr']
      },
      customReplaceDictionary: 'complex'
    })
    const res = templateHandler('<van-image class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image class="w-_bl_0_d_5px_br_" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-_bl_0_d_5px_br_"></van-image>')
  })

  it('templateHandler simple mode', () => {
    const { templateHandler } = getOptions({
      customAttributes: {
        'van-image': ['other-attr']
      },
      customReplaceDictionary: 'simple'
    })
    const res = templateHandler('<van-image class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
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

  it('all prop with testClass', () => {
    const { templateHandler } = getOptions({
      customAttributes: {
        '*': ['testClass']
      }
    })
    const res = templateHandler('<van-image testClass="w-[0.5px]" class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image testClass="w-_0d5px_" class="w-_0d5px_" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
  })

  it('all prop with [Cc]lass', () => {
    const { templateHandler } = getOptions({
      customAttributes: {
        '*': [/[A-Za-z]?[A-Za-z-]*[Cc]lass/]
      }
    })
    const res = templateHandler('<van-image testClass="w-[0.5px]" class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image testClass="w-_0d5px_" class="w-_0d5px_" custom-class="w-_0d5px_" image-class="w-_0d5px_" other-attr="w-[0.5px]"></van-image>')
  })
})
