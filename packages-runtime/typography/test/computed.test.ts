/* eslint-disable ts/no-require-imports */
import { generateCss4 } from '@weapp-tailwindcss/test-helper'

const typographyPlugin: any = require('../src/index.cjs')

describe('computed hooks', () => {
  afterEach(() => {
    delete typographyPlugin._computed.sample
  })

  it('merges computed entries when provided', async () => {
    typographyPlugin._computed.sample = (value: Record<string, string>) => value

    const { css } = await generateCss4('<div class="prose"></div>', {
      twConfig: {
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
      },
    })

    expect(css).toContain('color: tomato')
  })
})
