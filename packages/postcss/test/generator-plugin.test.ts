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
})
