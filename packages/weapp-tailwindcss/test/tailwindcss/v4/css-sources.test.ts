import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { upsertTailwindV4CssSource } from '@/tailwindcss/v4/css-sources'

describe('tailwindcss/v4/css-sources', () => {
  it('normalizes auto css source base so @source paths stay relative to the css file', () => {
    const options = {}

    upsertTailwindV4CssSource(options, {
      file: '/project/src/main.css',
      base: '/project/src',
      css: '@import "tailwindcss" source(none);\n@source "../src/**/*";',
      dependencies: ['./tailwind.config.js'],
    })

    expect(options).toEqual({
      tailwindcss: {
        v4: {
          cssSources: [{
            file: '/project/src/main.css',
            base: path.resolve('/project/src'),
            css: '@import "tailwindcss" source(none);\n@source "../src/**/*";',
            dependencies: ['./tailwind.config.js'],
          }],
        },
      },
    })
  })
})
