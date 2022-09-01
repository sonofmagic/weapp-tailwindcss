import { styleHandler } from '@/postcss'
import { createInjectPreflight } from '@/postcss/preflight'
import { getOptions } from '@/defaults'
import { cssCasePath, createGetCase, createPutCase } from './util'
import { replaceCss } from '@/replace'
const getCase = createGetCase(cssCasePath)
// @ts-ignore
// eslint-disable-next-line no-unused-vars
const putCase = createPutCase(cssCasePath)

describe('first', () => {
  it('shadow arbitrary values 0', async () => {
    // eslint-disable-next-line no-octal-escape
    const testCase = await getCase('shadow-arbitrary-0.css')
    expect(replaceCss(testCase)).toBe('.shadow-_bl_0px_2px_11px_0px_rgba_pl_0_co_0_co_0_co_0_d_4_qr__br_{}')
  })

  it('shadow arbitrary values 1', async () => {
    const testCase = await getCase('shadow-arbitrary-1.css')
    expect(replaceCss(testCase)).toBe('.shadow-_bl_0px_2px_11px_0px__h_00000a_br_{}')
  })

  it("arbitrary before:content-['hello']", () => {
    const testCase = ".before\\:content-\\[\\'hello\\'\\]::before"
    const result = replaceCss(testCase)
    expect(result).toBe('.before_c_content-_bl__q_hello_q__br_::before')
  })

  it('arbitrary variants case 1', () => {
    const result = replaceCss('.\\[\\&_\\.u-count-down\\\\_\\\\_text\\]\\:\\!text-red-400 .u-count-down__text')
    expect(result).toBe('._bl__am___d_u-count-down_bs___bs__text_br__c__i_text-red-400 .u-count-down__text')
  })

  it('css @media case', async () => {
    const opt = getOptions()
    const cssInjectPreflight = createInjectPreflight(opt.cssPreflight)
    const testCase = await getCase('media1.css')
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight,
      cssPreflightRange: opt.cssPreflightRange,
      customRuleCallback: opt.customRuleCallback,
      replaceUniversalSelectorWith: opt.replaceUniversalSelectorWith
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
    const opt = getOptions()
    const cssInjectPreflight = createInjectPreflight(opt.cssPreflight)
    const testCase = await getCase('taro.build.css')
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight,
      cssPreflightRange: opt.cssPreflightRange,
      customRuleCallback: opt.customRuleCallback,
      replaceUniversalSelectorWith: opt.replaceUniversalSelectorWith
    })
    // const expected = await getCase('taro.build.result.css')
    // await putCase('taro.build.result.css', result)
    // expect(true).toBe(true)
    // expect(result).toBe(expected)
    expect(result).toMatchSnapshot()
  })

  it('before,after content case', async () => {
    const testCase = await getCase('after-content.css')
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'all',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: 'view'
    })
    expect(result).toMatchSnapshot()
  })

  it('new option for customRuleCallback kbone', async () => {
    const opt = getOptions()
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
        // },
      },
      cssPreflightRange: opt.cssPreflightRange,
      replaceUniversalSelectorWith: 'view'
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
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: 'view'
    })
    expect(result).toMatchSnapshot()
  })

  it('cssPreflightRange option view', () => {
    const testCase = '::before,::after{}'
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: 'view'
    })
    expect(result).toMatchSnapshot()
  })

  it('cssPreflightRange option all', () => {
    const testCase = '::before,::after{}'
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'all',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: 'view'
    })
    expect(result).toMatchSnapshot()
  })

  it('should pseudo element', () => {
    const testCase = '.after\\:content-\\[\\"\\*\\"\\]::after{}'
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: 'view'
    })
    expect(result).toBe('.after_c_content-_bl__dq__a__dq__br_::after{}')
  })

  it('should * be replace as view etc', () => {
    const testCase = '.aspect-w-16 > *,.a>.b{aspect-ratio:1/1;}'
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: 'view'
    })
    expect(result).toBe('.aspect-w-16>view,.a>.b{aspect-ratio:1/1;}')
  })

  it('replaceUniversalSelectorWith option should * be replace as any string', () => {
    const testCase = '.aspect-w-16 > *,.a>.b{aspect-ratio:1/1;}'
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: '.happy'
    })
    expect(result).toBe('.aspect-w-16>.happy,.a>.b{aspect-ratio:1/1;}')
  })

  it('set replaceUniversalSelectorWith option to be false', () => {
    const testCase = '.aspect-w-16 > *,.a>.b{aspect-ratio:1/1;}'
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false
    })
    expect(result).toBe('.aspect-w-16>*,.a>.b{aspect-ratio:1/1;}')
  })

  it(':hover should be remove', () => {
    const testCase = '.a:hover{color:black;}'
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false
    })
    expect(result).toBe('')
  })

  it('mutiple selectors :hover should be remove only', () => {
    const testCase = '.a:hover,.b{color:black;}'
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false
    })
    expect(result).toBe('.b{color:black;}')
  })

  it('arbitrary values case 0', async () => {
    const testCase = await getCase('arbitrary-variants-0.css')
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false
    })
    expect(result.replace(/\r\n/g, '\n')).toBe(
      '._bl__am__c_nth-child_pl_3_qr__br__c_underline:nth-child(3),.underline {\n  -webkit-text-decoration-line: underline;\n  text-decoration-line: underline;\n}\n'
    )
  })

  it('arbitrary values case 1', async () => {
    const testCase = await getCase('arbitrary-variants-1.css')
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false
    })
    expect(result.replace(/\r\n/g, '\n')).toBe('\n')
  })

  it('arbitrary values case 2', async () => {
    const testCase = await getCase('arbitrary-variants-2.css')
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false
    })
    expect(result.replace(/\r\n/g, '\n')).toBe(
      '.lg_c__bl__am__c_nth-child_pl_3_qr__br__c_first-letter_c_underline:nth-child(3):first-letter {\n  -webkit-text-decoration-line: underline;\n  text-decoration-line: underline;\n}\n'
    )
  })

  it('arbitrary values case 3', async () => {
    const testCase = await getCase('arbitrary-variants-3.css')
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false
    })
    expect(result.replace(/\r\n/g, '\n')).toBe('._bl__am__p_br__c_mt-4 p {\n  margin-top: 1rem;\n}\n')
  })

  it('arbitrary values case 4', async () => {
    const testCase = await getCase('arbitrary-variants-4.css')
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false
    })
    expect(result.replace(/\r\n/g, '\n')).toBe(
      '@supports (display: grid) {\n  ._bl__at_supports_pl_display_c_grid_qr__br__c_grid {\n    text-decoration-style: underline;\n  }\n}\n'
    )
  })

  it('arbitrary values case 5', async () => {
    const testCase = await getCase('arbitrary-variants-5.css')
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false
    })
    expect(result.replace(/\r\n/g, '\n')).toBe(
      '@media (any-hover: hover) {\n  ._bl__at_media_pl_any-hover_c_hover_qr__bal__am__c_hover_bar__br__c_opacity-100:focus {\n    opacity: 1;\n  }\n}\n'
    )
  })

  it('arbitrary values case 6', async () => {
    const testCase = await getCase('arbitrary-variants-6.css')
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false
    })
    expect(result.replace(/\r\n/g, '\n')).toBe(
      '._bl__am___d_u-count-down_bs___bs__text_br__c__i_text-red-400 .u-count-down__text {\n  --tw-text-opacity: 1 !important;\n  color: rgb(248 113 113 / var(--tw-text-opacity)) !important;\n}\n'
    )
  })
})
