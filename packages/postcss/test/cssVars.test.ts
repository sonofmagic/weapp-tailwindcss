import cssVars from '@/cssVarsV3'

describe('cssVars', () => {
  it('snap', () => {
    expect(cssVars).toMatchSnapshot()
  })
})
