import { getOptions } from '@/defaults'

describe('customReplaceDictionary', () => {
  it('templeteHandler', () => {
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

  it('styleHandler', () => {
    const { styleHandler } = getOptions({
      customReplaceDictionary: {
        '[': '-',
        ']': '-'
      }
    })
    const res = styleHandler('.w-\\[0\\.5px\\]{--tw-border-opacity: 1;}', {
      isMainChunk: true
    })
    expect(res).toBe('.w--0_d_5px-{--tw-border-opacity: 1;}')
  })

  it('jsxHandler ', () => {
    const { jsxHandler } = getOptions({
      customReplaceDictionary: {
        '[': '-',
        ']': '-'
      }
    })
    const { code } = jsxHandler(
      `_jsx(View, {
      className: 'border-[10px] border-[#098765] border-solid border-opacity-[0.44]'
    })`
    )

    expect(code).toBe('_jsx(View, {\n  className: "border--10px- border--_h_098765- border-solid border-opacity--0_d_44-"\n});')
  })
})
