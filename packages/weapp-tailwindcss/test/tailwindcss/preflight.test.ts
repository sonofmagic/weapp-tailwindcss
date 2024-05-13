import { getCss } from '../helpers/getTwCss'

describe('preflight', () => {
  it('preflight', async () => {
    const { css } = await getCss([], {
      css: '@tailwind base;',
      twConfig: {},
    })
    expect(css).toMatchSnapshot()
  })
})
