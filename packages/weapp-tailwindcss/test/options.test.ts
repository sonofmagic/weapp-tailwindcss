import { getCompilerContext } from '@/context'
import { defu } from '@/utils'

function sanitizeSnapshotOptions(options: ReturnType<typeof getCompilerContext>) {
  const cwd = process.cwd()
  if (typeof options.tailwindcssBasedir === 'string') {
    options.tailwindcssBasedir = options.tailwindcssBasedir.replace(cwd, '<cwd>')
  }
  return options
}

describe('get options', () => {
  it('default options', () => {
    const options = sanitizeSnapshotOptions(getCompilerContext({}))
    // @ts-ignore
    delete options.twPatcher
    expect(options).toMatchSnapshot()
  })

  it('default matcher', () => {
    const { cssMatcher, jsMatcher, mainCssChunkMatcher, htmlMatcher } = getCompilerContext()
    expect(cssMatcher('a.css')).toBe(true)
    expect(jsMatcher('a.js')).toBe(true)
    expect(jsMatcher('node_modules/a.js')).toBe(false)
    expect(mainCssChunkMatcher('app.wxss', 'native')).toBe(true)
    expect(htmlMatcher('a.wxml')).toBe(true)
  })

  // it.skip('glob matcher', () => {
  //   const { cssMatcher, jsMatcher, mainCssChunkMatcher, htmlMatcher } = getCompilerContext({
  //     cssMatcher: '*.xxss',
  //     jsMatcher: '*.abcd',
  //     mainCssChunkMatcher: '*.main',
  //     htmlMatcher: ['*.wxmm', '*.plmm']
  //   })
  //   expect(cssMatcher('a.xxss')).toBe(true)
  //   expect(jsMatcher('a.abcd')).toBe(true)
  //   expect(mainCssChunkMatcher('app.main', 'native')).toBe(true)
  //   expect(htmlMatcher('a.wxmm')).toBe(true)
  //   expect(htmlMatcher('a.plmm')).toBe(true)
  // })

  it('cssPreflight false', () => {
    const config = getCompilerContext({
      cssPreflight: false,
    })
    expect(config.cssPreflight).toBe(false)
  })

  it('cssPreflight partial', () => {
    const cssPreflight = {
      'border-color': false,
      'box-sizing': 'content-box',
      'border-style': 0,
    }
    const config = getCompilerContext({
      cssPreflight,
    })
    expect(config.cssPreflight).toStrictEqual({
      'border-color': false,
      'border-style': 0,
      'border-width': '0',
      'box-sizing': 'content-box',
    })
  })

  // it('supportCustomLengthUnitsPatch boolean', () => {
  //   const o0 = getCompilerContext()
  //   expect(o0.supportCustomLengthUnitsPatch).toEqual(defaultOptions.supportCustomLengthUnitsPatch)
  //   const o1 = getCompilerContext({
  //     supportCustomLengthUnitsPatch: true
  //   })
  //   expect(o1.supportCustomLengthUnitsPatch).toEqual(defaultOptions.supportCustomLengthUnitsPatch)
  //   const o2 = getCompilerContext({
  //     supportCustomLengthUnitsPatch: false
  //   })
  //   expect(o2.supportCustomLengthUnitsPatch).toEqual(false)
  //   const o0o = getCompilerContext({
  //     supportCustomLengthUnitsPatch: {
  //       units: ['upx', 'xxem']
  //     }
  //   })
  //   expect(typeof o0o.supportCustomLengthUnitsPatch === 'object').toBe(true)
  //   expect(o0o.supportCustomLengthUnitsPatch).toEqual({
  //     units: ['upx', 'xxem', 'rpx'],
  //     // @ts-ignore
  //     dangerousOptions: defaultOptions.supportCustomLengthUnitsPatch.dangerousOptions
  //   })
  // })

  it('arbitraryValues options', () => {
    let arbitraryValues: ReturnType<typeof getCompilerContext>['arbitraryValues'] = getCompilerContext().arbitraryValues
    expect(typeof arbitraryValues === 'object').toBe(true)
    expect(arbitraryValues.allowDoubleQuotes).toBeDefined()
    expect(arbitraryValues.allowDoubleQuotes).toBe(false)
    arbitraryValues = getCompilerContext({
      arbitraryValues: {},
    }).arbitraryValues
    expect(typeof arbitraryValues === 'object').toBe(true)
    expect(arbitraryValues.allowDoubleQuotes).toBeDefined()
    expect(arbitraryValues.allowDoubleQuotes).toBe(false)
    arbitraryValues = getCompilerContext({
      arbitraryValues: {
        allowDoubleQuotes: true,
      },
    }).arbitraryValues
    expect(typeof arbitraryValues === 'object').toBe(true)
    expect(arbitraryValues.allowDoubleQuotes).toBeDefined()
    expect(arbitraryValues.allowDoubleQuotes).toBe(true)
  })

  it('customAttributes defu merge', () => {
    // const { customAttributes } = getCompilerContext()

    const customAttributes = {
      '*': [/[A-Za-z-]*[Cc]lass/],
    }
    const t = defu(customAttributes, {
      '*': ['class', 'hover-class'],
    })
    expect(t['*'].length).toBe(3)
  })

  it('mpx should have unique cache dir', () => {
    let config = getCompilerContext({

    })
    let cacheOptions = config.twPatcher.options?.cache
    expect(cacheOptions?.enabled).toBe(true)
    expect(cacheOptions?.dir?.includes('node_modules/.cache/tailwindcss-patch')).toBe(true)
    config = getCompilerContext({
      appType: 'mpx',
    })
    cacheOptions = config.twPatcher.options?.cache
    expect(cacheOptions?.dir?.includes('node_modules/tailwindcss-patch/.cache')).toBe(true)
  })

  // it('customAttributes map defu merge', () => {
  //   // const { customAttributes } = getCompilerContext()

  //   const customAttributes = new Map<string, RegExp[]>()
  //   customAttributes.set('*', [/[A-Za-z]?[A-Za-z-]*[Cc]lass/])

  //   const t = defu(customAttributes, {
  //     '*': ['class', 'hover-class']
  //   })
  //   expect(isMap(t)).toBe(true)
  //   expect(t.get('*')).toBe(3)
  //   //  expect(t['*']).toBe(2)
  //   // expect(t.get('*')).toBe(1)
  //   // expect(t['*']).toBe(2)
  // })
})
