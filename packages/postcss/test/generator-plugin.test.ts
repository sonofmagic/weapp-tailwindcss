import type { WeappTailwindcssPostcssPluginAdapters } from '@/generator-plugin'
import postcss from 'postcss'
import { createWeappTailwindcssPostcssPlugin } from '@/generator-plugin'

function createAdapters(overrides: Partial<WeappTailwindcssPostcssPluginAdapters> = {}) {
  const generate = vi.fn(async () => ({
    css: '.generated { color: red; }',
    rawCss: '.generated { color: red; }',
    target: 'weapp' as const,
    classSet: new Set(['generated']),
    dependencies: [],
  }))
  const adapters: WeappTailwindcssPostcssPluginAdapters = {
    createGenerator: vi.fn(() => ({ generate })),
    normalizeGeneratorOptions: vi.fn(options => ({
      target: options?.target ?? 'weapp',
      config: options?.config,
      styleOptions: options?.styleOptions,
      webCompat: options?.webCompat,
      importFallback: options?.importFallback ?? true,
      bareArbitraryValues: options?.bareArbitraryValues,
    })),
    resolveTailwindV4Source: vi.fn(async options => ({ version: 4, ...options })),
    ...overrides,
  }
  return {
    adapters,
    generate,
  }
}

describe('generator postcss plugin factory', () => {
  it('prepends Tailwind import and reference for apply-only css before resolving source', async () => {
    const { adapters } = createAdapters({
      createGenerator: vi.fn(() => ({
        generate: vi.fn(async () => ({
          css: [
            '.card { display: flex; }',
            '.unused { color: red; }',
            ':root { --spacing: 0.25rem; }',
          ].join('\n'),
          rawCss: '',
          target: 'weapp',
          classSet: new Set<string>(),
          dependencies: [],
        })),
      })),
    })
    const plugin = createWeappTailwindcssPostcssPlugin(adapters)
    const result = await postcss([
      plugin({
        scanSources: false,
      }),
    ]).process('.card { @apply flex; }', {
      from: undefined,
    })

    expect(adapters.resolveTailwindV4Source).toHaveBeenCalledWith(expect.objectContaining({
      css: expect.stringContaining('@import "tailwindcss" source(none);'),
    }))
    expect(adapters.resolveTailwindV4Source).toHaveBeenCalledWith(expect.objectContaining({
      css: expect.stringContaining('@reference "tailwindcss";'),
    }))
    expect(result.css).toContain('.card')
    expect(result.css).toContain('--spacing')
    expect(result.css).not.toContain('.unused')
  })

  it('applies web css compatibility transform for web target', async () => {
    const { adapters } = createAdapters({
      createGenerator: vi.fn(() => ({
        generate: vi.fn(async () => ({
          css: [
            '@layer theme {',
            '  :root { --color-blue-500: oklch(62.3% .214 259.815); }',
            '}',
            '@property --tw-rotate-x { syntax: "*"; inherits: false; }',
            '@supports (color: color-mix(in lab, red, red)) {',
            '  .text-blue { color: color-mix(in oklab, var(--color-blue-500) 50%, transparent); }',
            '}',
          ].join('\n'),
          rawCss: '',
          target: 'web',
          classSet: new Set<string>(),
          dependencies: [],
        })),
      })),
    })
    const plugin = createWeappTailwindcssPostcssPlugin(adapters)
    const result = await postcss([
      plugin({
        generator: {
          target: 'web',
          webCompat: true,
        },
      }),
    ]).process('@import "tailwindcss";', {
      from: undefined,
    })

    expect(result.css).not.toContain('@layer')
    expect(result.css).not.toContain('@property')
    expect(result.css).not.toContain('@supports')
    expect(result.css).toContain('color: rgba(')
    expect(result.css).toContain('color: color-mix(')
    expect(result.css).toContain('--color-blue-500: rgb(')
    expect(result.css).toContain('--color-blue-500: oklch(')
    expect(result.css).toContain(':root')
    expect(result.css).toContain('.text-blue')
  })

  it('applies default web css compatibility transform for web target', async () => {
    const { adapters } = createAdapters({
      normalizeGeneratorOptions: vi.fn(options => ({
        target: options?.target ?? 'weapp',
        webCompat: options?.webCompat ?? (options?.target === 'web' ? true : undefined),
        importFallback: options?.importFallback ?? true,
      })),
      createGenerator: vi.fn(() => ({
        generate: vi.fn(async () => ({
          css: [
            '@layer utilities { .text-blue { color: oklch(62.3% .214 259.815); } }',
            '.space-y-2 { :where(& > :not(:last-child)) { margin-block-end: calc(var(--spacing) * 2); } }',
            '@property --tw-rotate-x { syntax: "*"; inherits: false; }',
          ].join('\n'),
          rawCss: '',
          target: 'web',
          classSet: new Set<string>(),
          dependencies: [],
        })),
      })),
    })
    const plugin = createWeappTailwindcssPostcssPlugin(adapters)
    const result = await postcss([
      plugin({
        generator: {
          target: 'web',
        },
      }),
    ]).process('@import "tailwindcss";', {
      from: undefined,
    })

    expect(result.css).not.toContain('@layer')
    expect(result.css).not.toContain('@property')
    expect(result.css).toContain('color: rgb(')
    expect(result.css).toContain('color: oklch(')
    expect(result.css).not.toContain('& > :not(:last-child)')
    expect(result.css).toContain(':where(.space-y-2 > :not(:last-child))')
    expect(result.css).toContain('.text-blue')
  })
})
