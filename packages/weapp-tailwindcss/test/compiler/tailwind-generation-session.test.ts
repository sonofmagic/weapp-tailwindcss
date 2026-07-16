import { afterEach, describe, expect, it, vi } from 'vitest'

const source = {
  projectRoot: '/workspace',
  base: '/workspace',
  baseFallbacks: [],
  css: '@import "tailwindcss";',
  dependencies: [],
}

describe('tailwind generation session', () => {
  afterEach(() => {
    vi.doUnmock('@/generator')
    vi.resetModules()
  })

  it('reuses generators by source fingerprint and supports invalidation', async () => {
    const generate = vi.fn(async () => ({ css: '', rawCss: '', classSet: new Set(), rawCandidates: new Set(), dependencies: [], sources: [], root: null, target: 'web' }))
    const createGenerator = vi.fn(() => ({ generate, validateCandidates: vi.fn(), source }))
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: createGenerator,
    }))
    const { TailwindGenerationSession } = await import('@/compiler/tailwind-generation-session')
    const session = new TailwindGenerationSession()

    await session.generate(source as any)
    await session.generate({ ...source } as any)
    expect(createGenerator).toHaveBeenCalledTimes(1)

    session.invalidate({ type: 'source', source: source as any })
    await session.generate(source as any)
    expect(createGenerator).toHaveBeenCalledTimes(2)
  })

  it('rejects work after disposal', async () => {
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(),
    }))
    const { TailwindGenerationSession } = await import('@/compiler/tailwind-generation-session')
    const session = new TailwindGenerationSession()
    session.dispose()

    await expect(session.generate(source as any)).rejects.toThrow('已释放')
  })
})
