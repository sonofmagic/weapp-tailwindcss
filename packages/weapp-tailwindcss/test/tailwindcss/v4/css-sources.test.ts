import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { hasConfiguredTailwindV4CssRoots, upsertTailwindV4CssSource } from '@/tailwindcss/v4/css-sources'

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

  it('rejects non-css files as Tailwind v4 css roots', () => {
    const options = {}

    expect(upsertTailwindV4CssSource(options, {
      file: '/project/src/app.scss',
      css: '@import "tailwindcss";',
    })).toBe(false)

    expect(upsertTailwindV4CssSource(options, {
      file: '/project/src/app.vue',
      css: '<style>@import "tailwindcss";</style>',
    })).toBe(false)

    expect(options).toEqual({})
    expect(hasConfiguredTailwindV4CssRoots({
      cssEntries: ['/project/src/app.less'],
      tailwindcss: {
        v4: {
          cssSources: [{
            file: '/project/src/app.scss',
            css: '@import "tailwindcss";',
          }],
        },
      },
    })).toBe(false)
  })
})
