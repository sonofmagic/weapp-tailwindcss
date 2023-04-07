import { defaultOptions } from '@/defaults'
import { getOptions } from '@/options'

describe('get options', () => {
  it('default options', () => {
    const options = getOptions()
    expect(options).toMatchSnapshot()
  })
  it('vue framework', () => {
    const options = getOptions({
      framework: 'vue'
    })
    expect(options.framework).toBe('vue2')
    expect(options).toMatchSnapshot()
  })

  it('default matcher', () => {
    const { cssMatcher, jsMatcher, mainCssChunkMatcher, htmlMatcher } = getOptions()
    expect(cssMatcher('a.css')).toBe(true)
    expect(jsMatcher('a.js')).toBe(true)
    expect(jsMatcher('node_modules/a.js')).toBe(false)
    expect(mainCssChunkMatcher('app.wxss', 'native')).toBe(true)
    expect(htmlMatcher('a.wxml')).toBe(true)
  })

  it('glob matcher', () => {
    const { cssMatcher, jsMatcher, mainCssChunkMatcher, htmlMatcher } = getOptions({
      cssMatcher: '*.xxss',
      jsMatcher: '*.abcd',
      mainCssChunkMatcher: '*.main',
      htmlMatcher: ['*.wxmm', '*.plmm']
    })
    expect(cssMatcher('a.xxss')).toBe(true)
    expect(jsMatcher('a.abcd')).toBe(true)
    expect(mainCssChunkMatcher('app.main', 'native')).toBe(true)
    expect(htmlMatcher('a.wxmm')).toBe(true)
    expect(htmlMatcher('a.plmm')).toBe(true)
  })

  it('cssPreflight false', () => {
    const config = getOptions({
      cssPreflight: false
    })
    expect(config.cssPreflight).toBe(false)
  })

  it('cssPreflight partial', () => {
    const cssPreflight = {
      'border-color': false,
      'box-sizing': 'content-box',
      'border-style': 0
    }
    const config = getOptions({
      cssPreflight
    })
    expect(config.cssPreflight).toStrictEqual({
      'border-color': false,
      'border-style': 0,
      'border-width': '0',
      'box-sizing': 'content-box'
    })
  })

  it('supportCustomLengthUnitsPatch boolean', () => {
    const o0 = getOptions()
    expect(o0.supportCustomLengthUnitsPatch).toEqual(defaultOptions.supportCustomLengthUnitsPatch)
    const o1 = getOptions({
      supportCustomLengthUnitsPatch: true
    })
    expect(o1.supportCustomLengthUnitsPatch).toEqual(defaultOptions.supportCustomLengthUnitsPatch)
    const o2 = getOptions({
      supportCustomLengthUnitsPatch: false
    })
    expect(o2.supportCustomLengthUnitsPatch).toEqual(false)
    const o0o = getOptions({
      supportCustomLengthUnitsPatch: {
        units: ['upx', 'xxem']
      }
    })
    expect(typeof o0o.supportCustomLengthUnitsPatch === 'object').toBe(true)
    expect(o0o.supportCustomLengthUnitsPatch).toEqual({
      units: ['upx', 'xxem', 'rpx'],
      // @ts-ignore
      dangerousOptions: defaultOptions.supportCustomLengthUnitsPatch.dangerousOptions
    })
  })
})
