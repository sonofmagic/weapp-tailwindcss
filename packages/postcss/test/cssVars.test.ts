import cssVars from '@/cssVars'

describe('cssVars', () => {
  it('snap', () => {
    expect(cssVars).toMatchSnapshot()
  })
})
