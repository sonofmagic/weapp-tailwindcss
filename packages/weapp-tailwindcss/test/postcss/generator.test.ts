import postcss from 'postcss'
import { afterEach, vi } from 'vitest'

const MINIMAL_THEME_CSS = `
@theme default {
  --color-blue-500: oklch(62.3% 0.214 259.815);
  --spacing: 0.25rem;
}
@tailwind utilities;
`

describe('weapp-tailwindcss postcss generator', () => {
  afterEach(() => {
    vi.doUnmock('@/generator')
    vi.resetModules()
  })

  it('generates mini-program css from postcss input', async () => {
    const { default: weappTailwindcss } = await import('@/postcss')
    const result = await postcss([
      weappTailwindcss({
        candidates: ['hover:bg-blue-500', 'w-[100px]'],
        scanSources: false,
      }),
    ]).process(MINIMAL_THEME_CSS, {
      from: undefined,
    })

    expect(result.css).toContain('.w-_b100px_B')
    expect(result.css).toContain('width: 100px')
    expect(result.css).not.toContain(':hover')
    expect(result.css).not.toContain('@supports')
    expect(result.messages).toContainEqual(expect.objectContaining({
      type: 'weapp-tailwindcss:generated',
      target: 'weapp',
    }))
  })

  it('can generate web css from the same postcss entry', async () => {
    const { default: weappTailwindcss } = await import('@/postcss')
    const result = await postcss([
      weappTailwindcss({
        generator: {
          target: 'web',
        },
        packageName: 'tailwindcss4',
        candidates: ['hover:bg-blue-500', 'w-[100px]'],
        scanSources: false,
      }),
    ]).process(MINIMAL_THEME_CSS, {
      from: undefined,
    })

    expect(result.css).toContain('.hover\\:bg-blue-500')
    expect(result.css).toContain('@media (hover: hover)')
    expect(result.css).toContain('.w-\\[100px\\]')
    expect(result.css).not.toContain('.w-_b100px_B')
    expect(result.messages).toContainEqual(expect.objectContaining({
      type: 'weapp-tailwindcss:generated',
      target: 'web',
    }))
  })

  it('prefers the installed Tailwind package version over v4 css syntax', async () => {
    const resolveTailwindV3Source = vi.fn(async (options: any) => ({
      projectRoot: process.cwd(),
      base: process.cwd(),
      baseFallbacks: [],
      css: options.css,
      dependencies: [],
      version: 3,
    }))
    const generateMock = vi.fn(async () => ({
      css: '.v3-generated{}',
      rawCss: '.v3-generated{}',
      target: 'weapp',
      classSet: new Set<string>(),
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.doMock('@/generator', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/generator')>()
      return {
        ...actual,
        createWeappTailwindcssGenerator: vi.fn(() => ({
          generate: generateMock,
        })),
        resolveTailwindV3Source,
        resolveTailwindV4Source: vi.fn(async () => {
          throw new Error('should not resolve Tailwind v4 source')
        }),
      }
    })

    const { default: weappTailwindcss } = await import('@/postcss')
    const result = await postcss([
      weappTailwindcss({
        candidates: [],
        scanSources: false,
      }),
    ]).process(MINIMAL_THEME_CSS, {
      from: undefined,
    })

    expect(result.css).toBe('.v3-generated{}\n')
    expect(resolveTailwindV3Source).toHaveBeenCalledTimes(1)
    expect(generateMock).toHaveBeenCalledTimes(1)
  })
})
