import psp from 'postcss-selector-parser'
import { getFallbackRemove } from '@/selectorParser'

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
})
