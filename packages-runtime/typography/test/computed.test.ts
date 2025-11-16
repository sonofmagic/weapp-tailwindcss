/* eslint-disable ts/no-require-imports */
import postcss from 'postcss'
import tailwind from 'tailwindcss'

const typographyPlugin: any = require('../src/index')

describe('computed hooks', () => {
  afterEach(() => {
    delete typographyPlugin._computed.sample
  })

  it('merges computed entries when provided', async () => {
    typographyPlugin._computed.sample = (value: Record<string, string>) => value

    const { css } = await postcss([tailwind({
      content: [{ raw: '<div class="prose"></div>' }],
      corePlugins: { preflight: false },
      plugins: [typographyPlugin()],
      theme: {
        typography: {
          DEFAULT: {
            sample: {
              color: 'tomato',
            },
          },
        },
      },
    })]).process('@tailwind base; @tailwind components; @tailwind utilities;', { from: undefined })

    expect(css).toContain('color: tomato')
  })
})
