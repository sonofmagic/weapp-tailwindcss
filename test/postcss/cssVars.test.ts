import cssVars from '@/postcss/cssVars'

describe('cssVars', () => {
  it('snap', () => {
    expect(cssVars).toMatchSnapshot()
  })
})
