import { createGetCase, createPutCase, cssCasePath } from '../util'
import { normalizeEol } from '../helpers/normalizeEol'
import { styleHandler } from '@/postcss/index'

import { createInjectPreflight } from '@/postcss/preflight'
import { getOptions } from '@/options'
import { MappingChars2String } from '@/escape'

const getCase = createGetCase(cssCasePath)
// @ts-ignore

const putCase = createPutCase(cssCasePath)

export function cssUnescape(str: string) {
  return str.replaceAll(/\\([\dA-Fa-f]{1,6}[\t\n\f\r ]?|[\S\s])/g, (match) => {
    return match.length > 2 ? String.fromCodePoint(Number.parseInt(match.slice(1).trim(), 16)) : match[1]
  })
}
describe('styleHandler', () => {
  it('css @media case', async () => {
    const opt = getOptions({
      customReplaceDictionary: MappingChars2String,
    })
    const cssInjectPreflight = createInjectPreflight(opt.cssPreflight)
    const testCase = await getCase('media1.css')
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight,
      cssPreflightRange: opt.cssPreflightRange,
      customRuleCallback: opt.customRuleCallback,
      cssSelectorReplacement: opt.cssSelectorReplacement,
    })
    // const expected = await getCase('media1.result.css')
    // await putCase('media1.result.css', result)
    // expect(result).toBe(expected)
    expect(result).toMatchSnapshot()
  })

  it('css @media hover case 0', async () => {
    const { styleHandler } = getOptions()
    const code = await styleHandler(
      `@media (hover: hover) {
      a {
        color: white;
        background: black;
      }
    }`,
      {
        isMainChunk: true,
      },
    )
    expect(code).toMatchSnapshot()
  })

  it('css @media hover case 1', async () => {
    const { styleHandler } = getOptions()
    const code = await styleHandler(
      `@media (hover: hover) {
      a:hover {
        color: white;
        background: black;
      }
    }`,
      {
        isMainChunk: true,
      },
    )
    expect(code).toMatchSnapshot()
  })

  // it('main chunk remove empty var', async () => {
  //   const testCase = await getCase('taro.dev.css')
  //   const result = await styleHandler(testCase, {
  //     isMainChunk: true
  //   })
  //   const expected = await getCase('taro.dev.result.css')
  //   // await putCase('taro.dev.result.css', result)
  //   // expect(true).toBe(true)
  //   expect(result).toBe(expected)
  // })

  it('main chunk build error', async () => {
    const opt = getOptions({ customReplaceDictionary: MappingChars2String })
    const cssInjectPreflight = createInjectPreflight(opt.cssPreflight)
    const testCase = await getCase('taro.build.css')
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight,
      cssPreflightRange: opt.cssPreflightRange,
      customRuleCallback: opt.customRuleCallback,
      cssSelectorReplacement: opt.cssSelectorReplacement,
    })
    // const expected = await getCase('taro.build.result.css')
    // await putCase('taro.build.result.css', result)
    // expect(true).toBe(true)
    // expect(result).toBe(expected)
    expect(result).toMatchSnapshot()
  })

  it('before,after content case', async () => {
    const testCase = await getCase('after-content.css')
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'all',
      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: 'view',
      },
      escapeMap: MappingChars2String,
    })
    expect(result).toMatchSnapshot()
  })

  it('new option for customRuleCallback kbone', async () => {
    const opt = getOptions({
      customReplaceDictionary: MappingChars2String,
    })
    const cssInjectPreflight = createInjectPreflight(opt.cssPreflight)

    const testCase = await getCase('kbone1.css')
    const result = await styleHandler(testCase, {
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
      cssSelectorReplacement: {
        universal: 'view',
      },
      escapeMap: MappingChars2String,
    })
    // const expected = await getCase('kbone1.result.css')
    // await putCase('kbone1.result.css', result)
    // expect(result).toBe(expected)
    expect(result).toMatchSnapshot()
  })

  it('tailwindcss v2 jit should append view selector', async () => {
    const testCase = '::before,::after{--tw-border-opacity: 1;}'
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: 'view',
      },
      escapeMap: MappingChars2String,
    })
    expect(result).toMatchSnapshot()
  })

  it('cssPreflightRange option view', async () => {
    const testCase = '::before,::after{--tw-border-opacity: 1;}'
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: 'view',
      },
      escapeMap: MappingChars2String,
    })
    expect(result).toMatchSnapshot()
  })

  it('cssPreflightRange option all', async () => {
    const testCase = '::before,::after{--tw-border-opacity: 1;}'
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],
      cssPreflightRange: 'all',
      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: 'view',
      },
      escapeMap: MappingChars2String,
    })
    expect(result).toMatchSnapshot()
  })

  it('should pseudo element', async () => {
    const testCase = '.after\\:content-\\[\\"\\*\\"\\]::after{}'
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: 'view',
      },
      escapeMap: MappingChars2String,
    })
    expect(result).toBe('.after_c_content-_bl__dq__a__dq__br_::after{}')
  })

  it('should * be replace as view etc', async () => {
    const testCase = '.aspect-w-16 > *,.a>.b{aspect-ratio:1/1;}'
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: 'view',
      },
      escapeMap: MappingChars2String,
    })
    expect(result).toBe('.aspect-w-16>view,.a>.b{aspect-ratio:1/1;}')
  })

  it('replaceUniversalSelectorWith option should * be replace as any string', async () => {
    const testCase = '.aspect-w-16 > *,.a>.b{aspect-ratio:1/1;}'
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: '.happy',
      },

      escapeMap: MappingChars2String,
    })
    expect(result).toBe('.aspect-w-16>.happy,.a>.b{aspect-ratio:1/1;}')
  })

  it('set replaceUniversalSelectorWith option to be false', async () => {
    const testCase = '.aspect-w-16 > *,.a>.b{aspect-ratio:1/1;}'
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
    })
    expect(result).toBe('.aspect-w-16>*,.a>.b{aspect-ratio:1/1;}')
  })

  it('set replaceUniversalSelectorWith option and cssSelectorReplacement case 0', async () => {
    const { styleHandler } = getOptions()
    const testCase = '.aspect-w-16 > *,.a>.b{aspect-ratio:1/1;}'
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssSelectorReplacement: {
        universal: 'view',
      },
    })
    expect(result).toBe('.aspect-w-16>view,.a>.b{aspect-ratio:1/1;}')
  })

  it('set replaceUniversalSelectorWith option and cssSelectorReplacement case 1', async () => {
    const { styleHandler } = getOptions()
    const testCase = '.aspect-w-16 > *,.a>.b{aspect-ratio:1/1;}'
    const result = await styleHandler(testCase, {
      isMainChunk: true,

      cssSelectorReplacement: {
        universal: false,
      },
    })
    expect(result).toBe('.aspect-w-16>*,.a>.b{aspect-ratio:1/1;}')
  })

  it(':hover should be remove', async () => {
    const testCase = '.a:hover{color:black;}'
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
      cssRemoveHoverPseudoClass: true,
    })
    expect(result).toBe('')
  })

  it('mutiple selectors :hover should be remove only', async () => {
    const testCase = '.a:hover,.b{color:black;}'
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
      cssRemoveHoverPseudoClass: true,
    })
    expect(result).toBe('.b{color:black;}')
  })

  it('arbitrary values case 0', async () => {
    const testCase = await getCase('arbitrary-variants-0.css')
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
    })
    expect(normalizeEol(result)).toBe(
      '._bl__am__c_nth-child_pl_3_qr__br__c_underline:nth-child(3),.underline {\n  -webkit-text-decoration-line: underline;\n  text-decoration-line: underline;\n}\n',
    )
  })

  it('arbitrary values case 1', async () => {
    const testCase = await getCase('arbitrary-variants-1.css')
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
      cssRemoveHoverPseudoClass: true,
    })
    expect(normalizeEol(result)).toBe('\n')
  })

  it('arbitrary values case 2', async () => {
    const testCase = await getCase('arbitrary-variants-2.css')
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
    })
    expect(normalizeEol(result)).toBe(
      '.lg_c__bl__am__c_nth-child_pl_3_qr__br__c_first-letter_c_underline:nth-child(3):first-letter {\n  -webkit-text-decoration-line: underline;\n  text-decoration-line: underline;\n}\n',
    )
  })

  it('arbitrary values case 3', async () => {
    const testCase = await getCase('arbitrary-variants-3.css')
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
    })
    expect(normalizeEol(result)).toBe('._bl__am__p_br__c_mt-4 p {\n  margin-top: 1rem;\n}\n')
  })

  it('arbitrary values case 4', async () => {
    const testCase = await getCase('arbitrary-variants-4.css')
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
    })
    expect(normalizeEol(result)).toBe('@supports (display: grid) {\n  ._bl__at_supports_pl_display_c_grid_qr__br__c_grid {\n    text-decoration-style: underline;\n  }\n}\n')
  })

  it('arbitrary values case 5', async () => {
    const testCase = await getCase('arbitrary-variants-5.css')
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
    })
    expect(normalizeEol(result)).toBe(
      '@media (any-hover: hover) {\n  ._bl__at_media_pl_any-hover_c_hover_qr__bal__am__c_hover_bar__br__c_opacity-100:focus {\n    opacity: 1;\n  }\n}\n',
    )
  })

  it('arbitrary values case 6', async () => {
    const testCase = await getCase('arbitrary-variants-6.css')
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
    })
    expect(normalizeEol(result)).toBe(
      '._bl__am___d_u-count-down_bs___bs__text_br__c__i_text-red-400 .u-count-down__text {\n  --tw-text-opacity: 1 !important;\n  color: rgb(248 113 113 / var(--tw-text-opacity)) !important;\n}\n',
    )
  })

  it('global variables scope matched case', async () => {
    const testCase = ':before,:after{--tw-:\'test\'}'
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
    })
    expect(normalizeEol(result)).toMatchSnapshot()
  })

  it('global variables scope matched and inject', async () => {
    const opt = getOptions()
    const cssInjectPreflight = createInjectPreflight(opt.cssPreflight)
    const testCase = ':before,:after{--tw-:\'test\'}'
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight,

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
    })
    expect(normalizeEol(result)).toBe(testCase)
  })

  it('global variables scope matched and inject with isMainChunk false', async () => {
    const opt = getOptions()
    const cssInjectPreflight = createInjectPreflight(opt.cssPreflight)
    const testCase = ':before,:after{--tw-:\'test\'}'
    const result = await styleHandler(testCase, {
      isMainChunk: false,
      cssInjectPreflight,

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
    })
    expect(normalizeEol(result)).toBe(testCase)
  })

  it('global variables scope matched and inject and modify preflight range', async () => {
    const opt = getOptions()
    const cssInjectPreflight = createInjectPreflight(opt.cssPreflight)
    const testCase = ':before,:after{--tw-:\'test\'}'
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight,
      cssPreflightRange: 'all',
      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
    })
    expect(normalizeEol(result)).toBe(testCase)
  })

  it('global variables scope matched and inject and modify preflight range with isMainChunk false', async () => {
    const opt = getOptions()
    const cssInjectPreflight = createInjectPreflight(opt.cssPreflight)
    const testCase = ':before,:after{--tw-:\'test\'}'
    const result = await styleHandler(testCase, {
      isMainChunk: false,
      cssInjectPreflight,
      cssPreflightRange: 'all',
      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
    })
    expect(normalizeEol(result)).toBe(testCase)
  })

  it('global variables scope not matched', async () => {
    const testCase = ':before,:after{color:red}'
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
    })
    expect(normalizeEol(result)).toBe(testCase)
  })

  it('before:content-[\'+\']', async () => {
    const testCase = '.before\\:content-\\[\\\'\\+\\\'\\]::before {\n    --tw-content: \'+\';\n    content: var(--tw-content)\n}'
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
    })
    expect(normalizeEol(result)).toBe('.before_c_content-_bl__q__plus__q__br_::before {\n    --tw-content: \'+\';\n    content: var(--tw-content)\n}')
  })

  it('@apply space-y/x css selector', async () => {
    const testCase = '.test > :not([hidden]) ~ :not([hidden]){}'
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
    })
    expect(normalizeEol(result)).toBe('.test>view+view{}')
  })

  it('is Pseudo Class', async () => {
    const testCase = ':is(.dark .dark:bg-zinc-800) {}'
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
    })
    expect(normalizeEol(result)).toBe('.dark .dark:bg-zinc-800 {}')
  })

  it('utf8 charset', async () => {
    const testCase = await getCase('utf8.css')
    const result = await styleHandler(testCase, {
      isMainChunk: true,
      cssInjectPreflight: () => [],

      customRuleCallback: () => {},
      cssSelectorReplacement: {
        universal: false,
      },
      escapeMap: MappingChars2String,
    })
    expect(normalizeEol(result)).toMatchSnapshot()
  })

  it('cssUnescape case 0', () => {
    expect(cssUnescape('\\31 2345')).toBe('12345')
  })

  it('cssUnescape case 1', () => {
    expect(cssUnescape('\\32xlctext-base')).toBe('2xlctext-base')
  })

  it('injectAdditionalCssVarScope option true', async () => {
    const { styleHandler } = getOptions({
      injectAdditionalCssVarScope: true,
    })
    const rawSource = await getCase('backdrop.css')
    const result = await styleHandler(rawSource, { isMainChunk: true })
    expect(result).toMatchSnapshot()
  })

  it('injectAdditionalCssVarScope option true and replace universal', async () => {
    const { styleHandler } = getOptions({
      injectAdditionalCssVarScope: true,
      cssSelectorReplacement: {
        universal: ['view', 'text', 'button'],
      },
    })
    const rawSource = await getCase('backdrop.css')
    const result = await styleHandler(rawSource, { isMainChunk: true })
    expect(result).toMatchSnapshot()
  })

  it('injectAdditionalCssVarScope option true isMainChunk false', async () => {
    const { styleHandler } = getOptions({
      injectAdditionalCssVarScope: true,
    })
    const rawSource = await getCase('backdrop.css')
    const result = await styleHandler(rawSource, { isMainChunk: false })
    expect(result).toMatchSnapshot()
  })

  it(':root pseudo case 0', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `:root{}`
    const result = await styleHandler(rawCode, { isMainChunk: false })
    expect(result).toBe('page{}')
  })

  it(':root pseudo case 0 invert', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `:root{}`
    const result = await styleHandler(rawCode, {
      isMainChunk: false,
      cssSelectorReplacement: {
        root: false,
      },
    })
    expect(result).toBe(rawCode)
  })

  it(':root pseudo case 1', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `:root,[data-theme]{}`
    const result = await styleHandler(rawCode, { isMainChunk: false })
    expect(result).toBe('page,[data-theme]{}')
  })

  it(':root pseudo case 1 invert', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `:root,[data-theme]{}`
    const result = await styleHandler(rawCode, {
      isMainChunk: false,
      cssSelectorReplacement: {
        root: false,
      },
    })
    expect(result).toBe(rawCode)
  })

  it('combinator selector case 0', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `.space-x-4>:not([hidden])~:not([hidden]){}`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toBe('.space-x-4>view+view{}')
  })

  it('combinator selector case 1', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `.divide-x>:not([hidden])~:not([hidden]){}`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toBe('.divide-x>view+view{}')
  })

  it('combinator selector case 2', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `.divide-blue-200>:not([hidden])~:not([hidden]){}`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toBe('.divide-blue-200>view+view{}')
  })

  it('combinator selector case 3', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `:is(.dark .dark:divide-slate-700)>:not([hidden])~:not([hidden]){}`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toBe('.dark .dark:divide-slate-700>view+view{}')
  })

  it('combinator selector case 4', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `.divide-dashed>:not([hidden])~:not([hidden]){}`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toBe('.divide-dashed>view+view{}')
  })

  it('comment case 0', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `/* #ifdef MP-WEIXIN */\n.divide-dashed>:not([hidden])~:not([hidden]){}\n/* #endif */`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toBe('/* #ifdef MP-WEIXIN */\n.divide-dashed>view+view{}\n/* #endif */')
  })

  it('is-pseudo-class case 0', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `:is(view,text),:after.:before{color:red;}`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toBe('view,text,:after.:before{color:red;}')
  })

  it('is-pseudo-class case 1', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `:is(view,text),::before,::after,view,text{color:red;}`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toBe(':is(view,text),::before,::after,view,text{color:red;}')
  })

  it('is-pseudo-class case 2', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `:is(.aa,bb,view,text),::before,::after{color:red;}`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toBe('.aa,bb:not(.weapp-tw-ig),view:not(.weapp-tw-ig),text:not(.weapp-tw-ig),::before,::after{color:red;}')
  })

  it('use with weapp-pandacss case 0 ', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `:is(view,text),view,text,::before,::after{--tw-border-opacity: 1;--tw-border-opacity: 1;}`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toMatchSnapshot()
  })

  it('use with weapp-pandacss case 1 ', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `*,:is(view,text),view,text,::before,::after{--tw-border-opacity: 1;--tw-border-opacity: 1;}`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toMatchSnapshot()
  })

  it('use with weapp-pandacss case 2 ', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `*,:is(view,text),::before,::after{--tw-border-opacity: 1;--tw-border-opacity: 1;}`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toMatchSnapshot()
  })

  it('use with weapp-pandacss case 2 ', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `*,view,text,::before,::after{--tw-border-opacity: 1;--tw-border-opacity: 1;}`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toMatchSnapshot()
  })

  it('use with weapp-pandacss case 3 ', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `*,view,text,:is(view,text),:is(view,text),::before,::after,*{--tw-border-opacity: 1;--tw-border-opacity: 1;}`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toMatchSnapshot()
  })

  it('use with weapp-pandacss case 4 ', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `.space-y-4>:not([hidden])+:not([hidden]){--tw-border-opacity: 1;--tw-border-opacity: 1;}`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toMatchSnapshot()
  })

  it('.steps @icestack/ui case 0', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `.steps .step-primary+.step-primary:before,.steps .step-primary:after {
      --tw-bg-opacity: 1;
      background-color: rgba(var(--ice-primary) / var(--tw-bg-opacity));
      --tw-text-opacity: 1;
      color: rgba(var(--ice-primary-content) / var(--tw-text-opacity));
    }`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toMatchSnapshot()
  })

  it('guess css var scoped', async () => {
    const { styleHandler } = getOptions()
    const rawCode = `*, ::before, ::after {
      --tw-border-spacing-x: 0;
      --tw-border-spacing-y: 0;
      --tw-translate-x: 0;
      --tw-translate-y: 0;
      --tw-rotate: 0;
      --tw-skew-x: 0;
      --tw-skew-y: 0;
      --tw-scale-x: 1;
      --tw-scale-y: 1;
      --tw-pan-x:  ;
      --tw-pan-y:  ;
      --tw-pinch-zoom:  ;
      --tw-scroll-snap-strictness: proximity;
      --tw-gradient-from-position:  ;
      --tw-gradient-via-position:  ;
      --tw-gradient-to-position:  ;
      --tw-ordinal:  ;
      --tw-slashed-zero:  ;
      --tw-numeric-figure:  ;
      --tw-numeric-spacing:  ;
      --tw-numeric-fraction:  ;
      --tw-ring-inset:  ;
      --tw-ring-offset-width: 0px;
      --tw-ring-offset-color: #fff;
      --tw-ring-color: rgb(59 130 246 / 0.5);
      --tw-ring-offset-shadow: 0 0 #0000;
      --tw-ring-shadow: 0 0 #0000;
      --tw-shadow: 0 0 #0000;
      --tw-shadow-colored: 0 0 #0000;
      --tw-blur:  ;
      --tw-brightness:  ;
      --tw-contrast:  ;
      --tw-grayscale:  ;
      --tw-hue-rotate:  ;
      --tw-invert:  ;
      --tw-saturate:  ;
      --tw-sepia:  ;
      --tw-drop-shadow:  ;
      --tw-backdrop-blur:  ;
      --tw-backdrop-brightness:  ;
      --tw-backdrop-contrast:  ;
      --tw-backdrop-grayscale:  ;
      --tw-backdrop-hue-rotate:  ;
      --tw-backdrop-invert:  ;
      --tw-backdrop-opacity:  ;
      --tw-backdrop-saturate:  ;
      --tw-backdrop-sepia:  
  }`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toMatchSnapshot()
  })

  it('add postcss plugins case 0', async () => {
    const tw = await import('tailwindcss')
    const { styleHandler } = getOptions({
      postcssOptions: {
        plugins: [tw.default({ content: [], corePlugins: { preflight: false } })],
      },
    })
    const rawCode = `@tailwind base;
  `
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toMatchSnapshot()
  })

  it(':hover remove case 0', async () => {
    const { styleHandler } = getOptions({})
    const rawCode = `.a:hover{color:red;}`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toMatchSnapshot()
  })

  it(':hover remove case 1', async () => {
    const { styleHandler } = getOptions({})
    const rawCode = `.b,.a:hover{color:red;}`
    const result = await styleHandler(rawCode, { isMainChunk: true })
    expect(result).toMatchSnapshot()
  })

  it(':hover remove case 0 revert', async () => {
    const { styleHandler } = getOptions({})
    const rawCode = `.a:hover{color:red;}`
    const result = await styleHandler(rawCode, { isMainChunk: true, cssRemoveHoverPseudoClass: false })
    expect(result).toMatchSnapshot()
  })

  it(':hover remove case 1 revert', async () => {
    const { styleHandler } = getOptions({})
    const rawCode = `.b,.a:hover{color:red;}`
    const result = await styleHandler(rawCode, { isMainChunk: true, cssRemoveHoverPseudoClass: false })
    expect(result).toMatchSnapshot()
  })
})
