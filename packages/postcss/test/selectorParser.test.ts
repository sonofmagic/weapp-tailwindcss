import { fallbackRemove } from '@/selectorParser'

describe('selectorParser', () => {
  it('fallbackRemove case 0', async () => {
    const x = await fallbackRemove.process('#app-provider :is(.space-x-4>view+view)')
    expect(x).toMatchSnapshot()
  })

  it('fallbackRemove case 1', async () => {
    const x = await fallbackRemove.process('#app :is(.space-x-0>view+view)')
    expect(x).toMatchSnapshot()
  })
})
