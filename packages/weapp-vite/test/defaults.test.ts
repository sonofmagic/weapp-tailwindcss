import { defaultExcluded, getWeappWatchOptions } from '@/defaults'

describe('defaults', () => {
  it('getWeappWatchOptions', () => {
    expect(getWeappWatchOptions()).toMatchSnapshot()
  })

  it('defaultExcluded', () => {
    expect(defaultExcluded).toMatchSnapshot()
  })

  // it('getDefaultViteConfig case 0', () => {
  //   const ctx = createContext()
  //   const config = getDefaultViteConfig(ctx)
  // })
})
