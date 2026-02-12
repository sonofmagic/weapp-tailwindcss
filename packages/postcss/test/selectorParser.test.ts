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

  it('ruleTransformSync keeps before after pseudo elements and removes backdrop', () => {
    const root = postcss.parse('::before,::after,::backdrop{--tw-content:"";}')
    const rule = root.first as Rule
    ruleTransformSync(rule, {})
    const transformed = rule.toString()
    expect(transformed).toContain('before')
    expect(transformed).toContain('after')
    expect(transformed).not.toContain('backdrop')
  })
})
