/* eslint-disable ts/no-require-imports, style/quote-props */
import type { Config } from 'tailwindcss'
import { generateCss4 } from '@weapp-tailwindcss/test-helper'

const typographyPlugin = require('../src/index')

const html = String.raw

function extractContentInput(content: unknown) {
  if (Array.isArray(content)) {
    return content.map((entry) => {
      if (entry && typeof entry === 'object' && 'raw' in entry) {
        return String(entry.raw)
      }
      return String(entry)
    })
  }
  return ''
}

function run(config: Config) {
  const mergedConfig = {
    plugins: [typographyPlugin({ target: 'modern', classPrefix: 'tw-' })],
    corePlugins: { preflight: false },
    ...config,
  }
  const { content, ...twConfig } = mergedConfig as Config & { content?: unknown }
  return generateCss4(extractContentInput(content), {
    twConfig,
  })
}

describe('modern target', () => {
  it('handles nested selectors, pseudos and array values', async () => {
    const { css } = await run({
      content: [{ raw: html`<div class="prose"></div>` }],
      theme: {
        typography: {
          DEFAULT: {
            css: {
              '> ul > li::marker': {
                color: 'hotpink',
                '& span': { color: 'blue' },
              },
              code: {
                backgroundColor: '#000',
              },
              textAlign: ['left', 'right'],
            },
          },
        },
      },
    })

    expect(css).toContain(':where(.prose > ul > li):not(:where([class~="not-prose"], [class~="not-prose"] *))::marker')
    expect(css).toContain('text-align: left')
    expect(css).toContain('text-align: right')
    expect(css).toContain(':where(code):not(:where([class~="not-prose"], [class~="not-prose"] *))')
  })

  it('applies modern selectors for non-default modifiers', async () => {
    const { css } = await run({
      content: [{ raw: html`<div class="prose prose-lg"></div>` }],
      theme: {
        typography: {
          DEFAULT: {
            css: {
              strong: { color: 'blue' },
            },
          },
          lg: {
            css: {
              '> h1': { color: 'red' },
            },
          },
        },
      },
    })

    expect(css).toContain('.prose-lg')
    expect(css).toContain(':where(.prose-lg > h1):not(:where([class~="not-prose"], [class~="not-prose"] *))')
    expect(css).toContain('strong')
  })
})
