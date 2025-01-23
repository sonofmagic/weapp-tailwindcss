import { getCompilerContext } from '@/context'
import { MappingChars2String } from '@weapp-core/escape'
import defu from 'defu'

describe('customReplaceDictionary', () => {
  it('templateHandler custom map', async () => {
    const { templateHandler } = getCompilerContext({
      customAttributes: {
        'van-image': ['other-attr'],
      },
      customReplaceDictionary: defu(
        {
          '[': '-',
          ']': '-',
        },
        MappingChars2String,
      ),
    })
    const res = await templateHandler('<van-image class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image class="w--0_d_5px-" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w--0_d_5px-"></van-image>')
  })

  it('templateHandler complex mode', async () => {
    const { templateHandler } = getCompilerContext({
      customAttributes: {
        'van-image': ['other-attr'],
      },
      customReplaceDictionary: MappingChars2String,
    })
    const res = await templateHandler('<van-image class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image class="w-_bl_0_d_5px_br_" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-_bl_0_d_5px_br_"></van-image>')
  })

  it('templateHandler default(complex) mode', async () => {
    const { templateHandler } = getCompilerContext({
      customAttributes: {
        'van-image': ['other-attr'],
      },
      customReplaceDictionary: MappingChars2String,
    })
    const res = await templateHandler('<van-image class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image class="w-_bl_0_d_5px_br_" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-_bl_0_d_5px_br_"></van-image>')
  })

  it('templateHandler simple mode', async () => {
    const { templateHandler } = getCompilerContext({
      customAttributes: {
        'van-image': ['other-attr'],
      },
    })
    const res = await templateHandler('<van-image class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image class="w-_0d5px_" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-_0d5px_"></van-image>')
  })

  it('styleHandler custom map', async () => {
    const { styleHandler } = getCompilerContext({
      customReplaceDictionary: defu(
        {
          '[': '-',
          ']': '-',
        },
        MappingChars2String,
      ),
    })
    const { css } = await styleHandler('.w-\\[0\\.5px\\]{--tw-border-opacity: 1;}', {
      isMainChunk: true,
    })
    expect(css).toBe('.w--0_d_5px-{--tw-border-opacity: 1;}')
  })

  it('styleHandler complex mode', async () => {
    const { styleHandler } = getCompilerContext({
      customReplaceDictionary: MappingChars2String,
    })
    const { css } = await styleHandler('.w-\\[0\\.5px\\]{--tw-border-opacity: 1;}', {
      isMainChunk: true,
    })
    expect(css).toBe('.w-_bl_0_d_5px_br_{--tw-border-opacity: 1;}')
  })

  it('styleHandler default(complex) mode', async () => {
    const { styleHandler } = getCompilerContext({
      customReplaceDictionary: MappingChars2String,
    })
    const { css } = await styleHandler('.w-\\[0\\.5px\\]{--tw-border-opacity: 1;}', {
      isMainChunk: true,
    })
    expect(css).toBe('.w-_bl_0_d_5px_br_{--tw-border-opacity: 1;}')
  })

  it('styleHandler simple mode', async () => {
    const { styleHandler } = getCompilerContext({})
    const { css } = await styleHandler('.w-\\[0\\.5px\\]{--tw-border-opacity: 1;}', {
      isMainChunk: true,
    })
    expect(css).toBe('.w-_0d5px_{--tw-border-opacity: 1;}')
  })

  it('all prop with testClass', async () => {
    const { templateHandler } = getCompilerContext({
      customAttributes: {
        '*': ['testClass'],
      },
    })
    const res = await templateHandler('<van-image testClass="w-[0.5px]" class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image testClass="w-_0d5px_" class="w-_0d5px_" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
  })

  it('all prop with [Cc]lass', async () => {
    const { templateHandler } = getCompilerContext({
      customAttributes: {
        '*': [/[A-Za-z-]*[Cc]lass/],
      },
    })
    const res = await templateHandler('<van-image testClass="w-[0.5px]" class="w-[0.5px]" custom-class="w-[0.5px]" image-class="w-[0.5px]" other-attr="w-[0.5px]"></van-image>')
    expect(res).toBe('<van-image testClass="w-_0d5px_" class="w-_0d5px_" custom-class="w-_0d5px_" image-class="w-_0d5px_" other-attr="w-[0.5px]"></van-image>')
  })
})
