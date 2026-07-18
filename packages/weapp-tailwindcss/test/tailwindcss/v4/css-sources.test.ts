import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { filterTailwindV4CssSourceRoots, hasConfiguredTailwindV4CssRoots, hasCssSourcesValue, removeTailwindV4CssSource, upsertTailwindV4CssSource } from '@/tailwindcss/v4/css-sources'

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

  it('detects, filters, updates, and dedupes configured css source roots', () => {
    expect(hasConfiguredTailwindV4CssRoots({
      cssEntries: '/project/src/app.css',
    })).toBe(true)
    expect(hasConfiguredTailwindV4CssRoots({
      tailwindcssRuntimeOptions: {
        tailwindcss: {
          v4: {
            cssSources: [{
              file: '/project/src/app.css',
              css: '@import "tailwindcss";',
            }],
          },
        },
      } as any,
    })).toBe(true)
    expect(hasCssSourcesValue([{ file: '/project/src/app.css', css: '   ' }])).toBe(false)
    expect(filterTailwindV4CssSourceRoots(undefined)).toBeUndefined()
    expect(filterTailwindV4CssSourceRoots([
      { file: '/project/src/app.vue', css: '<style />' } as any,
      { file: '/project/src/app.css', css: '@import "tailwindcss";' },
    ])).toEqual([
      { file: '/project/src/app.css', css: '@import "tailwindcss";' },
    ])

    const options = {
      tailwindcss: {
        v4: {
          cssSources: [{
            file: '/project/src/app.css',
            base: '/project/src',
            css: '@import "tailwindcss";',
            dependencies: ['/project/src/tailwind.config.js', ''],
          }],
        },
      },
    } as any

    expect(upsertTailwindV4CssSource(options, {
      file: '/project/src/app.css',
      base: '/project/src',
      css: '@import "tailwindcss";',
      dependencies: ['/project/src/tailwind.config.js'],
    })).toBe(false)
    expect(upsertTailwindV4CssSource(options, {
      file: '/project/src/app.css',
      css: '@import "tailwindcss";\n@source "./pages/**/*";',
      dependencies: ['/project/src/other.config.js', ''],
    })).toBe(true)
    expect(options.tailwindcss.v4.cssSources).toEqual([{
      file: '/project/src/app.css',
      base: path.resolve('/project/src'),
      css: '@import "tailwindcss";\n@source "./pages/**/*";',
      dependencies: ['/project/src/other.config.js'],
    }])
  })

  it('removes an auto css source by its normalized file identity', () => {
    const options = {
      tailwindcss: {
        v4: {
          cssSources: [
            { file: '/project/src/app.css', css: '@import "tailwindcss";' },
            { file: '/project/src/page.css', css: '@import "tailwindcss" source(none);' },
          ],
        },
      },
    }

    expect(removeTailwindV4CssSource(options, '/project/src/app.css')).toBe(true)
    expect(removeTailwindV4CssSource(options, '/project/src/missing.css')).toBe(false)
    expect(options.tailwindcss.v4.cssSources).toEqual([
      { file: '/project/src/page.css', css: '@import "tailwindcss" source(none);' },
    ])
  })
})
