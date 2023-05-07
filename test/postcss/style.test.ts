import { styleHandler } from '@/postcss'
import { createInjectPreflight } from '@/postcss/preflight'
import { getOptions } from '@/options'
import { cssCasePath, createGetCase, createPutCase } from '../util'
import { MappingChars2String } from '@/dic'
const getCase = createGetCase(cssCasePath)
// @ts-ignore
// eslint-disable-next-line no-unused-vars
const putCase = createPutCase(cssCasePath)

describe('styleHandler', () => {
  it('css @media case', async () => {
    const opt = getOptions({
      customReplaceDictionary: 'complex'
    })
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
    const opt = getOptions({ customReplaceDictionary: 'complex' })
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
      replaceUniversalSelectorWith: 'view',
      escapeMap: MappingChars2String
    })
    expect(result).toMatchSnapshot()
  })

  it('new option for customRuleCallback kbone', async () => {
    const opt = getOptions({
      customReplaceDictionary: 'complex'
    })
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
      replaceUniversalSelectorWith: 'view',
      escapeMap: MappingChars2String
    })
    // const expected = await getCase('kbone1.result.css')
    // await putCase('kbone1.result.css', result)
    // expect(result).toBe(expected)
    expect(result).toMatchSnapshot()
  })

  it('tailwindcss v2 jit should append view selector', () => {
    const testCase = '::before,::after{--tw-border-opacity: 1;}'
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: 'view',
      escapeMap: MappingChars2String
    })
    expect(result).toMatchSnapshot()
  })

  it('cssPreflightRange option view', () => {
    const testCase = '::before,::after{--tw-border-opacity: 1;}'
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: 'view',
      escapeMap: MappingChars2String
    })
    expect(result).toMatchSnapshot()
  })

  it('cssPreflightRange option all', () => {
    const testCase = '::before,::after{--tw-border-opacity: 1;}'
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'all',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: 'view',
      escapeMap: MappingChars2String
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
      replaceUniversalSelectorWith: 'view',
      escapeMap: MappingChars2String
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
      replaceUniversalSelectorWith: 'view',
      escapeMap: MappingChars2String
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
      replaceUniversalSelectorWith: '.happy',
      escapeMap: MappingChars2String
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
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
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
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
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
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
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
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
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
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
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
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
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
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
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
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
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
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
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
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
    })
    expect(result.replace(/\r\n/g, '\n')).toBe(
      '._bl__am___d_u-count-down_bs___bs__text_br__c__i_text-red-400 .u-count-down__text {\n  --tw-text-opacity: 1 !important;\n  color: rgb(248 113 113 / var(--tw-text-opacity)) !important;\n}\n'
    )
  })

  it('global variables scope matched case', async () => {
    const testCase = ":before,:after{--tw-:'test'}"
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
    }).replace(/\r\n/g, '\n')
    expect(result).toBe('::before,::after{--tw-content:""}\n:before,:after,view{--tw-:\'test\'}')
  })

  it('global variables scope matched and inject', async () => {
    const opt = getOptions()
    const cssInjectPreflight = createInjectPreflight(opt.cssPreflight)
    const testCase = ":before,:after{--tw-:'test'}"
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight,
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
    }).replace(/\r\n/g, '\n')
    expect(result).toBe('::before,::after{--tw-content:""}\n:before,:after,view{--tw-:\'test\';box-sizing:border-box;border-width:0;border-style:solid;border-color:currentColor}')
  })

  it('global variables scope matched and inject with isMainChunk false', async () => {
    const opt = getOptions()
    const cssInjectPreflight = createInjectPreflight(opt.cssPreflight)
    const testCase = ":before,:after{--tw-:'test'}"
    const result = styleHandler(testCase, {
      isMainChunk: false,
      cssInjectPreflight,
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
    }).replace(/\r\n/g, '\n')
    expect(result).toBe(testCase)
  })

  it('global variables scope matched and inject and modify preflight range', async () => {
    const opt = getOptions()
    const cssInjectPreflight = createInjectPreflight(opt.cssPreflight)
    const testCase = ":before,:after{--tw-:'test'}"
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight,
      cssPreflightRange: 'all',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
    }).replace(/\r\n/g, '\n')
    expect(result).toBe(
      '::before,::after{--tw-content:""}\n:before,:after,view,:not(not){--tw-:\'test\';box-sizing:border-box;border-width:0;border-style:solid;border-color:currentColor}'
    )
  })

  it('global variables scope matched and inject and modify preflight range with isMainChunk false', async () => {
    const opt = getOptions()
    const cssInjectPreflight = createInjectPreflight(opt.cssPreflight)
    const testCase = ":before,:after{--tw-:'test'}"
    const result = styleHandler(testCase, {
      isMainChunk: false,
      cssInjectPreflight,
      cssPreflightRange: 'all',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
    }).replace(/\r\n/g, '\n')
    expect(result).toBe(testCase)
  })

  it('global variables scope not matched', async () => {
    const testCase = ':before,:after{color:red}'
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
    }).replace(/\r\n/g, '\n')
    expect(result).toBe(testCase)
  })

  it("before:content-['+']", async () => {
    const testCase = ".before\\:content-\\[\\'\\+\\'\\]::before {\n    --tw-content: '+';\n    content: var(--tw-content)\n}"
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
    }).replace(/\r\n/g, '\n')
    expect(result).toBe(".before_c_content-_bl__q__plus__q__br_::before {\n    --tw-content: '+';\n    content: var(--tw-content)\n}")
  })

  it('@apply space-y/x css selector', async () => {
    const testCase = '.test > :not([hidden]) ~ :not([hidden]){}'
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
    }).replace(/\r\n/g, '\n')
    expect(result).toBe('.test>view + view{}')
  })

  it('Is Pseudo Class', async () => {
    const testCase = ':is(.dark .dark:bg-zinc-800) {}'
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
    }).replace(/\r\n/g, '\n')
    expect(result).toBe('.dark .dark:bg-zinc-800 {}')
  })

  it('utf8 charset', async () => {
    const testCase = await getCase('utf8.css')
    const result = styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'view',
      customRuleCallback: () => {},
      replaceUniversalSelectorWith: false,
      escapeMap: MappingChars2String
    }).replace(/\r\n/g, '\n')
    expect(result).toMatchSnapshot()
  })
})
