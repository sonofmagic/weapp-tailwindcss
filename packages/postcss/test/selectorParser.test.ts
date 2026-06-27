import type { Rule } from 'postcss'
import type { IStyleHandlerOptions } from '@/types'
import postcss from 'postcss'
import psp from 'postcss-selector-parser'
import { getFallbackRemove, ruleTransformSync } from '@/selectorParser'

describe('selectorParser', () => {
  it('fallbackRemove case 0', async () => {
    const x = await getFallbackRemove().process('#app-provider :is(.space-x-4>view+view)')
    expect(x).toMatchSnapshot()
  })

  it('fallbackRemove case 1', async () => {
    const x = await getFallbackRemove().process('#app :is(.space-x-0>view+view)')
    expect(x).toMatchSnapshot()
  })

  it('fallbackRemove case 2', async () => {
    const x = await getFallbackRemove().process('button:not(n),input:where(,,):not(n)')
    expect(x).toMatchSnapshot()
  })

  it('fallbackRemove case 3', async () => {
    const x = await getFallbackRemove().process('[hidden]:where(:not([hidden="until-found"])):not(n):not(n):not(n)')
    expect(x).toMatchSnapshot()
  })

  it('fallbackRemove case 4', async () => {
    const x = await getFallbackRemove().process('button:not(n),input:where():not(n)')
    expect(x).toMatchSnapshot()
  })

  it('ruleTransformSync case 0', async () => {
    const target = psp((selectors) => {
      selectors.walkTags((tag) => {
        tag.remove()
      })
    })
    const normalized = await target.process('.dark view.darkcbg-black,.dark text.darkcbg-black', { updateSelector: true })
    expect(normalized).toMatchSnapshot()
  })

  it('fallbackRemove transformSync normalizes options for rule input', () => {
    const fallback = getFallbackRemove(undefined, {} as IStyleHandlerOptions)
    const root = postcss.parse('#app :is(.space-x-4>view+view){}')
    const rule = root.first as Rule
    fallback.transformSync(rule)
    expect(rule.toString()).toMatchSnapshot()
  })

  it('fallbackRemove caches keep, update and remove results for repeated rule selectors', () => {
    const fallback = getFallbackRemove(undefined, {} as IStyleHandlerOptions)

    const keepRule = postcss.parse('.keep{}').first as Rule
    fallback.transformSync(keepRule)
    expect(keepRule.selector).toBe('.keep')
    const cachedKeepRule = postcss.parse('.keep{}').first as Rule
    fallback.transformSync(cachedKeepRule)
    expect(cachedKeepRule.selector).toBe('.keep')

    const updateRule = postcss.parse('#app :is(.space-x-4>view+view){}').first as Rule
    fallback.transformSync(updateRule)
    expect(updateRule.selector).toBe('#app .space-x-4>view+view')
    const cachedUpdateRule = postcss.parse('#app :is(.space-x-4>view+view){}').first as Rule
    fallback.transformSync(cachedUpdateRule)
    expect(cachedUpdateRule.selector).toBe('#app .space-x-4>view+view')

    const removeRoot = postcss.parse('[hidden]{}')
    const removeRule = removeRoot.first as Rule
    fallback.transformSync(removeRule)
    expect(removeRule.parent).toBeUndefined()
    const cachedRemoveRoot = postcss.parse('[hidden]{}')
    const cachedRemoveRule = cachedRemoveRoot.first as Rule
    fallback.transformSync(cachedRemoveRule)
    expect(cachedRemoveRule.parent).toBeUndefined()
  })

  it('ruleTransformSync caches parser per options instance', () => {
    const options: IStyleHandlerOptions = {
      cssSelectorReplacement: {
        universal: ['view', 'text'],
      },
    }
    const firstRoot = postcss.parse('.foo *{}')
    const firstRule = firstRoot.first as Rule
    ruleTransformSync(firstRule, options)
    expect(firstRule.toString()).toMatchSnapshot()

    const secondRoot = postcss.parse('.bar :where(.buzz > :not(:last-child)){}')
    const secondRule = secondRoot.first as Rule
    ruleTransformSync(secondRule, options)
    expect(secondRule.toString()).toMatchSnapshot()
  })

  it('ruleTransformSync covers fast path cache, empty selectors, and child combinator template fallbacks', () => {
    const options: IStyleHandlerOptions = {
      cssSelectorReplacement: {
        universal: ['view', 'text'],
      },
      cssChildCombinatorReplaceValue: ['view', 'text'],
    }
    const fastRule = postcss.parse('.foo .bar{}').first as Rule
    ruleTransformSync(fastRule, options)
    expect(fastRule.selector).toBe('.foo .bar')

    const cachedFastRule = postcss.parse('.foo .bar{}').first as Rule
    ruleTransformSync(cachedFastRule, options)
    expect(cachedFastRule.selector).toBe('.foo .bar')

    const emptyRule = postcss.rule({ selector: '' })
    ruleTransformSync(emptyRule, options)
    expect(emptyRule.selector).toBe('')

    const hiddenRoot = postcss.parse('.space-y-2 > :not(template) ~ :not([hidden]){margin-top:1px;margin-top:var(--v)}')
    const hiddenRule = hiddenRoot.first as Rule
    ruleTransformSync(hiddenRule, options)
    expect(hiddenRule.selector).toContain('.space-y-2>:is(view,text)+:is(view,text)')
    expect(hiddenRule.toString()).toContain('margin-top:var(--v)')
  })

  it('ruleTransformSync rewrites root and universal selectors with custom escape map', () => {
    const options: IStyleHandlerOptions = {
      cssSelectorReplacement: {
        root: ['page', '.tw-root'],
        universal: ['view'],
      },
      escapeMap: {
        ':': '_c_',
      } as any,
    }
    const root = postcss.parse(':root *,.hover\\:bg:hover{color:red}')
    const rule = root.first as Rule
    ruleTransformSync(rule, options)
    const transformed = root.toString()

    expect(transformed).toContain(':is(page,.tw-root) view')
    expect(transformed).toContain('.hover_c_bg:hover')
  })

  it('ruleTransformSync expands where pseudo branches to mini-program selectors', () => {
    const root = postcss.parse('.theme-dark :where(.dark\\:bg-black,.dark\\:text-white){color:red;}')
    const rule = root.first as Rule
    ruleTransformSync(rule, {})
    expect(rule.toString()).toMatchSnapshot()
  })

  it.each([
    [
      'tailwind class dark selector',
      '.dark\\:bg-black:where(.dark, .dark *){color:red;}',
      ['.dark_cbg-black.dark', '.dark_cbg-black.dark *'],
      [':where('],
    ],
    [
      'tailwind attribute dark selector',
      '.dark\\:bg-black:where([data-mode="dark"], [data-mode="dark"] *){color:red;}',
      ['.dark_cbg-black[data-mode="dark"]', '.dark_cbg-black[data-mode="dark"] *'],
      [':where('],
    ],
    [
      'tailwind v4 space child selector',
      ':where(.space-y-2 > :not(:last-child)){margin-top:1px;margin-bottom:2px;}',
      ['.space-y-2>:is(view,text)+:is(view,text)'],
      [':where(', ':not('],
    ],
    [
      'tailwind v4 divide child selector',
      ':where(.divide-x-4 > :not(:last-child)){border-left-width:4px;}',
      ['.divide-x-4>:is(view,text)+:is(view,text)'],
      [':where(', ':not('],
    ],
    [
      'tailwind v4 button type preflight selector',
      'button,input:where([type="button"], [type="reset"], [type="submit"]){appearance:button;}',
      ['input[type="button"]', 'input[type="reset"]', 'input[type="submit"]'],
      [':where('],
    ],
    [
      'tailwind v4 nested select preflight selector',
      ':where(select:is([multiple], [size])) optgroup{font-weight:700;}',
      ['select[multiple] optgroup', 'select[size] optgroup'],
      [':where(', ':is('],
    ],
    [
      'tailwind v4 nested select option preflight selector',
      ':where(select:is([multiple], [size])) optgroup option{padding-inline-start:20px;}',
      ['select[multiple] optgroup option', 'select[size] optgroup option'],
      [':where(', ':is('],
    ],
    [
      'nested where selector with comma inside branch',
      '.scope :where(:where(.alpha, .beta) > .target){color:green;}',
      ['.scope .alpha>.target', '.scope .beta>.target'],
      [':where('],
    ],
    [
      'child plugin selector',
      ':where(.child\\:ring-white) > :where(:not(.not-child)){box-shadow:0 0 #fff;}',
      ['.child\\:ring-white'],
      [':where('],
    ],
  ])('ruleTransformSync covers %s', (_name, source, includes, excludes) => {
    const root = postcss.parse(source)
    root.walkRules(rule => ruleTransformSync(rule, {
      cssChildCombinatorReplaceValue: ['view', 'text'],
    }))
    const transformed = root.toString()
    for (const expected of includes) {
      expect(transformed).toContain(expected)
    }
    for (const unexpected of excludes) {
      expect(transformed).not.toContain(unexpected)
    }
  })

  it('ruleTransformSync strips unsupported rtl language pseudo selectors', () => {
    const root = postcss.parse('.space-x-2\\.5>view+view:not(:-webkit-any(:lang(ar),:lang(he))),.space-x-2\\.5>view+view:not(:-moz-any(:lang(ar),:lang(he))),.space-x-2\\.5>view+view:-webkit-any(:lang(ar),:lang(he)),.space-x-2\\.5>view+view:-moz-any(:lang(ar),:lang(he)){margin-right:1px;}')
    const rule = root.first as Rule
    ruleTransformSync(rule, {})
    const transformed = rule.toString()
    expect(transformed).toContain('.space-x-2_d5>view+view')
    expect(transformed).not.toContain(':-webkit-any')
    expect(transformed).not.toContain(':-moz-any')
    expect(transformed).not.toContain(':lang(')
  })

  it('ruleTransformSync keeps before after pseudo elements and removes unsupported pseudo elements', () => {
    const root = postcss.parse('::before,::after,::backdrop,::-webkit-backdrop,::-ms-backdrop{--tw-content:"";}')
    const rule = root.first as Rule
    ruleTransformSync(rule, {})
    const transformed = rule.toString()
    expect(transformed).toContain('before')
    expect(transformed).toContain('after')
    expect(transformed).not.toContain('backdrop')
  })

  it('ruleTransformSync removes pure backdrop pseudo element rules', () => {
    const root = postcss.parse('::-webkit-backdrop,::-ms-backdrop,::backdrop{box-sizing:border-box;}')
    const rule = root.first as Rule
    ruleTransformSync(rule, {})
    expect(rule.parent).toBeUndefined()
  })

  it('ruleTransformSync removes file selector button pseudo element', () => {
    const root = postcss.parse('.a::file-selector-button,.b{color:red;}')
    const rule = root.first as Rule
    ruleTransformSync(rule, {})
    const transformed = rule.toString()
    expect(transformed).not.toContain('file-selector-button')
    expect(transformed).toContain('.b')
  })
})
