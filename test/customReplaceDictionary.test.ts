import { getOptions } from '@/defaults'

describe('customReplaceDictionary', () => {
  it('templeteHandler custom map', () => {
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
      }
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
    const { styleHandler } = getOptions()
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

  it('jsxHandler custom map', () => {
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

  it('jsxHandler complex mode', () => {
    const { jsxHandler } = getOptions({
      customReplaceDictionary: 'complex'
    })
    const { code } = jsxHandler(
      `_jsx(View, {
      className: 'border-[10px] border-[#098765] border-solid border-opacity-[0.44]'
    })`
    )

    expect(code).toBe('_jsx(View, {\n  className: "border-_bl_10px_br_ border-_bl__h_098765_br_ border-solid border-opacity-_bl_0_d_44_br_"\n});')
  })

  it('jsxHandler default(complex) mode', () => {
    const { jsxHandler } = getOptions()
    const { code } = jsxHandler(
      `_jsx(View, {
      className: 'border-[10px] border-[#098765] border-solid border-opacity-[0.44]'
    })`
    )

    expect(code).toBe('_jsx(View, {\n  className: "border-_bl_10px_br_ border-_bl__h_098765_br_ border-solid border-opacity-_bl_0_d_44_br_"\n});')
  })

  it('jsxHandler simple mode', () => {
    const { jsxHandler } = getOptions({
      customReplaceDictionary: 'simple'
    })
    const { code } = jsxHandler(
      `_jsx(View, {
      className: 'border-[10px] border-[#098765] border-solid border-opacity-[0.44]'
    })`
    )

    expect(code).toBe('_jsx(View, {\n  className: "border-_10px_ border-_h098765_ border-solid border-opacity-_0d44_"\n});')
  })
})
