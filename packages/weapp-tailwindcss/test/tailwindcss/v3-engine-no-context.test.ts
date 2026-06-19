import { vi } from 'vitest'

describe('tailwindcss v3 engine without private context', () => {
  afterEach(() => {
    vi.resetModules()
    vi.doUnmock('@tailwindcss-mangle/engine')
  })

  it('uses engine classSet when the raw generator does not expose Tailwind private context', async () => {
    const generateTailwindV3RawStyle = vi.fn(async () => ({
      version: 3,
      css: '.bg-blue-500 { background-color: rgb(59 130 246); }',
      classSet: new Set(['bg-blue-500']),
      dependencies: [],
      sources: [],
    }))
    vi.doMock('@tailwindcss-mangle/engine', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@tailwindcss-mangle/engine')>()
      return {
        ...actual,
        generateTailwindV3RawStyle,
      }
    })

    const { createTailwindV3Engine } = await import('@/tailwindcss/v3-engine')
    const engine = createTailwindV3Engine({
      version: 3,
      projectRoot: process.cwd(),
      cwd: process.cwd(),
      base: process.cwd(),
      css: '@tailwind utilities;',
      dependencies: [],
      packageName: 'tailwindcss',
      postcssPlugin: 'tailwindcss',
    })

    const validCandidates = await engine.validateCandidates(['bg-blue-500', 'missing-class'])
    const generated = await engine.generate({
      candidates: ['bg-blue-500'],
      incrementalCache: true,
    })

    expect(generateTailwindV3RawStyle).toHaveBeenCalledTimes(2)
    expect(validCandidates).toEqual(new Set(['bg-blue-500']))
    expect(generated.classSet).toEqual(new Set(['bg-blue-500']))
    expect(generated.css).toContain('.bg-blue-500')
  })
})
