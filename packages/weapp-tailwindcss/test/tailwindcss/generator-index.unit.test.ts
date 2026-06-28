import { describe, expect, it, vi } from 'vitest'

const createTailwindV4Engine = vi.fn()
const resolveTailwindV4SourceFromRuntime = vi.fn()

vi.mock('@/tailwindcss/v4-engine', () => ({
  createTailwindV4Engine,
  resolveTailwindV4Source: vi.fn(),
  resolveTailwindV4SourceFromRuntime,
  resolveTailwindV4SourceFromRuntimeOptions: vi.fn(),
  resolveTailwindV4SourceOptionsFromRuntime: vi.fn(),
  transformTailwindV4CssByTarget: vi.fn(),
  transformTailwindV4CssToWeapp: vi.fn(),
}))

describe('generator index helpers', () => {
  it('creates generators directly and from Tailwind runtime sources', async () => {
    const source = { css: '@import "tailwindcss";', base: '/project', baseFallbacks: [], projectRoot: '/project' }
    const engine = { generate: vi.fn() }
    createTailwindV4Engine.mockReturnValue(engine)
    resolveTailwindV4SourceFromRuntime.mockResolvedValue(source)

    const {
      createWeappTailwindcssGenerator,
      createWeappTailwindcssGeneratorFromRuntime,
      resolveTailwindSourceFromRuntime,
    } = await import('@/generator')

    expect(createWeappTailwindcssGenerator(source as any)).toBe(engine)
    await expect(resolveTailwindSourceFromRuntime({} as any)).resolves.toBe(source)
    await expect(createWeappTailwindcssGeneratorFromRuntime({} as any)).resolves.toBe(engine)
    expect(createTailwindV4Engine).toHaveBeenCalledWith(source)
  })
})
