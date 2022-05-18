import { getOptions, styleHandler, createInjectPreflight } from '@/shared'
import { cssCasePath, createGetCase, createPutCase } from './util'
import { replaceCss } from '@/replace'
const getCase = createGetCase(cssCasePath)
// @ts-ignore
// eslint-disable-next-line no-unused-vars
const putCase = createPutCase(cssCasePath)

describe('first', () => {
  it('css @media case', async () => {
    const opt = getOptions(null)
    const cssInjectPreflight = createInjectPreflight(opt.cssPreflight)
    const testCase = await getCase('media1.css')
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight
    })
    // const expected = await getCase('media1.result.css')
    // await putCase('media1.result.css', result)
    // expect(result).toBe(expected)
    expect(result).toMatchSnapshot()
  })

  // it('main chunk remove empty var', async () => {
  //   const testCase = await getCase('taro.dev.css')
  //   const result = styleHandler(testCase, {
  //     isMainChunk: true
  //   })
  //   const expected = await getCase('taro.dev.result.css')
  //   // await putCase('taro.dev.result.css', result)
  //   // expect(true).toBe(true)
  //   expect(result).toBe(expected)
  // })

  it('main chunk build error', async () => {
    const opt = getOptions(null)
    const cssInjectPreflight = createInjectPreflight(opt.cssPreflight)
    const testCase = await getCase('taro.build.css')
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight
    })
    // const expected = await getCase('taro.build.result.css')
    // await putCase('taro.build.result.css', result)
    // expect(true).toBe(true)
    // expect(result).toBe(expected)
    expect(result).toMatchSnapshot()
  })

  it('new option for customRuleCallback kbone', async () => {
    const opt = getOptions(null)
    const cssInjectPreflight = createInjectPreflight(opt.cssPreflight)

    const testCase = await getCase('kbone1.css')
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight,
      customRuleCallback: (node, opt) => {
        // if (opt.isMainChunk) {
        //   if (node.selector.includes('page,::after,::before')) {
        //     // page,::after,::before
        //     node.selector = node.selector
        //       .replace(/page/, 'view')
        //       .replace(/::after/, 'view::after')
        //       .replace(/::before/, 'view::before') // 'view,view::before,view::after'
        //   }
        // }
      }
    })
    // const expected = await getCase('kbone1.result.css')
    // await putCase('kbone1.result.css', result)
    // expect(result).toBe(expected)
    expect(result).toMatchSnapshot()
  })

  it('tailwindcss v2 jit should append view selector', () => {
    const testCase = '::before,::after{}'
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => []
    })
    expect(result).toBe('::before,::after,view{}')
  })

  it('shadow arbitrary values 0', async () => {
    // eslint-disable-next-line no-octal-escape
    const testCase = await getCase('shadow-arbitrary-0.css')
    expect(replaceCss(testCase)).toBe('.shadow-_l_0px_2px_11px_0px_rgba_p_0_d_0_d_0_d_0_dot_4_q__r_{}')
  })

  it('shadow arbitrary values 1', async () => {
    const testCase = await getCase('shadow-arbitrary-1.css')
    expect(replaceCss(testCase)).toBe('.shadow-_l_0px_2px_11px_0px__h_00000a_r_{}')
  })
})
