import { beforeEach, describe, expect, it, vi } from 'vitest'

const postcssAsync = vi.fn(async () => ({ css: '' }))
const postcssProcess = vi.fn<(css?: string, options?: Record<string, unknown>) => { async: typeof postcssAsync }>(
  () => ({
    async: postcssAsync,
  }),
)

const postcssFactory = vi.fn((plugins?: unknown) => ({ process: postcssProcess, plugins }))

vi.mock('postcss', async () => {
  const actual = await vi.importActual<typeof import('postcss')>('postcss')
  return {
    ...actual,
    default: postcssFactory,
  }
})

vi.mock('@/plugins', async () => {
  const actual = await vi.importActual<typeof import('@/plugins')>('@/plugins')
  return {
    ...actual,
    getPlugins: vi.fn(() => ['mock-plugin']),
  }
})

const { createStyleHandler } = await import('@/handler')

describe('style handler caching', () => {
  beforeEach(() => {
    postcssFactory.mockClear()
    postcssProcess.mockClear()
  })

  it('provides fresh process options while preserving cache state', async () => {
    const handler = createStyleHandler()

    const override: { postcssOptions: { options: Record<string, unknown> } } = {
      postcssOptions: {
        options: {
          map: false,
        },
      },
    }

    await handler('.foo { color: red; }', override)
    const firstOptions = postcssProcess.mock.calls[0][1]
    expect(firstOptions).toBeDefined()
    firstOptions!.mutated = true

    await handler('.bar { color: blue; }', override)
    const secondOptions = postcssProcess.mock.calls[1][1]
    expect(secondOptions?.mutated).toBeUndefined()

    override.postcssOptions.options.extra = 'value'

    await handler('.baz { color: green; }', override)
    const thirdOptions = postcssProcess.mock.calls[2][1]
    expect(thirdOptions?.extra).toBe('value')
  })
})
