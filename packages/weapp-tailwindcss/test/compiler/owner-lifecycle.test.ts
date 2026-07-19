import { afterEach, describe, expect, it, vi } from 'vitest'

const source = {
  projectRoot: '/workspace',
  base: '/workspace',
  baseFallbacks: [],
  css: '@import "tailwindcss";',
  dependencies: [],
}

describe('compiler owner lifecycle', () => {
  afterEach(() => {
    vi.doUnmock('@/generator')
    vi.resetModules()
  })

  it('disposes owner-bound state and creates fresh sessions for later builds', async () => {
    const dispose = vi.fn()
    const createGenerator = vi.fn(() => ({
      dispose,
      generate: vi.fn(async () => ({
        css: '',
        rawCss: '',
        classSet: new Set(),
        rawCandidates: new Set(),
        dependencies: [],
        sources: [],
        root: null,
        target: 'web',
      })),
      validateCandidates: vi.fn(),
      source,
    }))
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: createGenerator,
    }))
    const {
      disposeCompilerOwner,
      getCompilationChangeCoordinator,
      getCompilationSessionPool,
      getCompilerShadowReportSession,
      getTailwindGenerationSessionPool,
    } = await import('@/compiler')
    const owner = {}
    const compilationPool = getCompilationSessionPool(owner)
    const coordinator = getCompilationChangeCoordinator(owner)
    const generationPool = getTailwindGenerationSessionPool(owner)
    const shadowSession = getCompilerShadowReportSession(owner)
    shadowSession.beginRun()
    await generationPool.generate(source as any)

    await disposeCompilerOwner(owner)

    expect(dispose).toHaveBeenCalledTimes(1)
    expect(() => coordinator.consume('app.css')).toThrow('已释放')
    expect(() => shadowSession.snapshot()).toThrow('已释放')
    expect(() => compilationPool.run({
      scope: { id: 'app.css', kind: 'global' },
      outputId: 'app.css',
      sources: [],
    }, async () => undefined)).toThrow('已释放')

    const nextCompilationPool = getCompilationSessionPool(owner)
    const nextCoordinator = getCompilationChangeCoordinator(owner)
    const nextGenerationPool = getTailwindGenerationSessionPool(owner)
    const nextShadowSession = getCompilerShadowReportSession(owner)
    expect(nextCompilationPool).not.toBe(compilationPool)
    expect(nextCoordinator).not.toBe(coordinator)
    expect(nextGenerationPool).not.toBe(generationPool)
    expect(nextShadowSession).not.toBe(shadowSession)

    await nextGenerationPool.generate(source as any)
    expect(createGenerator).toHaveBeenCalledTimes(2)
  })

  it('shares an in-flight disposal until active compilation work completes', async () => {
    const {
      disposeCompilerOwner,
      getCompilationSessionPool,
    } = await import('@/compiler')
    const owner = {}
    const pool = getCompilationSessionPool(owner)
    let releaseCompile: (() => void) | undefined
    const compilePending = new Promise<void>((resolve) => {
      releaseCompile = resolve
    })
    const execution = pool.run({
      scope: { id: 'app.css', kind: 'global' },
      outputId: 'app.css',
      sources: [{ id: '/src/app.css', kind: 'css', candidates: ['p-4'] }],
    }, async compilation => {
      await compilePending
      return { classSet: compilation.candidates }
    })

    const firstDisposal = disposeCompilerOwner(owner)
    const secondDisposal = disposeCompilerOwner(owner)
    let disposed = false
    void secondDisposal.then(() => {
      disposed = true
    })
    expect(secondDisposal).toBe(firstDisposal)
    await Promise.resolve()
    expect(disposed).toBe(false)

    releaseCompile?.()
    await expect(execution).resolves.toMatchObject({ committed: false })
    await Promise.all([firstDisposal, secondDisposal])
    expect(disposed).toBe(true)
  })
})
