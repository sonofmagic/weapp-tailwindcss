import { fallbackRemove } from '@/postcss/selectorParser'

describe('selectorParser', () => {
  it('fallbackRemove case 0', async () => {
    const x = await fallbackRemove.process('#app-provider :is(.space-x-4>view+view)')
    expect(x).toMatchSnapshot()
  })
})
