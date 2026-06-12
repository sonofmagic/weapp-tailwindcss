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
      tailwindcssV3Compatibility: options?.tailwindcssV3Compatibility ?? true,
      bareArbitraryValues: options?.bareArbitraryValues,
    })),
    resolveTailwindV3Source: vi.fn(async options => ({ version: 3, ...options })),
    resolveTailwindV4Source: vi.fn(async options => ({ version: 4, ...options })),
    ...overrides,
  }
  return {
    adapters,
    generate,
  }
}

describe('generator postcss plugin factory', () => {
  it('routes explicit v3 css through the injected v3 source resolver', async () => {
    const { adapters, generate } = createAdapters()
    const plugin = createWeappTailwindcssPostcssPlugin(adapters)
    const result = await postcss([
      plugin({
        version: 3,
        candidates: ['text-red-500'],
        scanSources: false,
      }),
    ]).process('@tailwind utilities;', {
      from: undefined,
    })

    expect(adapters.resolveTailwindV3Source).toHaveBeenCalledWith(expect.objectContaining({
      css: '@tailwind utilities;',
    }))
    expect(adapters.resolveTailwindV4Source).not.toHaveBeenCalled()
    expect(generate).toHaveBeenCalledWith(expect.objectContaining({
      candidates: new Set(['text-red-500']),
      target: 'weapp',
    }))
    expect(result.css).toContain('.generated')
    expect(result.messages).toContainEqual(expect.objectContaining({
      type: 'weapp-tailwindcss:generated',
      target: 'weapp',
    }))
  })

  it('prepends Tailwind import for v4 apply-only css before resolving source', async () => {
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
        version: 4,
        scanSources: false,
      }),
    ]).process('.card { @apply flex; }', {
      from: undefined,
    })

    expect(adapters.resolveTailwindV4Source).toHaveBeenCalledWith(expect.objectContaining({
      css: expect.stringContaining('@import "tailwindcss" source(none);'),
    }))
    expect(result.css).toContain('.card')
    expect(result.css).toContain('--spacing')
    expect(result.css).not.toContain('.unused')
  })

  it('uses explicit version before installed package detection', async () => {
    const { adapters } = createAdapters()
    const plugin = createWeappTailwindcssPostcssPlugin(adapters)
    await postcss([
      plugin({
        version: 4,
        scanSources: false,
      }),
    ]).process('.card { @apply flex; }', {
      from: import.meta.filename,
    })

    expect(adapters.resolveTailwindV4Source).toHaveBeenCalled()
    expect(adapters.resolveTailwindV3Source).not.toHaveBeenCalled()
  })
})
