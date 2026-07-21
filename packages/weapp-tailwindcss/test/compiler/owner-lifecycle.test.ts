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
      getCompilationChangeCoordinator,
      getCompilationSessionPool,
      getCompilerShadowReportSession,
      getTailwindGenerationSessionPool,
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
    expect(() => getCompilationSessionPool(owner)).toThrow('正在释放')
    expect(() => getCompilationChangeCoordinator(owner)).toThrow('正在释放')
    expect(() => getTailwindGenerationSessionPool(owner)).toThrow('正在释放')
    expect(() => getCompilerShadowReportSession(owner)).toThrow('正在释放')
    await Promise.resolve()
    expect(disposed).toBe(false)

    releaseCompile?.()
    await expect(execution).resolves.toMatchObject({ committed: false })
    await Promise.all([firstDisposal, secondDisposal])
    expect(disposed).toBe(true)
    expect(getCompilationSessionPool(owner)).not.toBe(pool)
  })

  it('waits for owner activity before disposal and queues the next build behind it', async () => {
    const {
      runCompilerOwnerActivity,
      runCompilerOwnerDisposal,
    } = await import('@/compiler/compiler-owner-state')
    const owner = {}
    let releaseCurrent: (() => void) | undefined
    const currentGate = new Promise<void>((resolve) => {
      releaseCurrent = resolve
    })
    let currentStarted = false
    let disposed = false
    let nextStarted = false

    const current = runCompilerOwnerActivity(owner, async () => {
      currentStarted = true
      await currentGate
    })
    expect(currentStarted).toBe(true)

    const disposal = runCompilerOwnerDisposal(owner, async () => {
      disposed = true
    })
    const next = runCompilerOwnerActivity(owner, async () => {
      nextStarted = true
    })

    await Promise.resolve()
    expect(disposed).toBe(false)
    expect(nextStarted).toBe(false)

    releaseCurrent?.()
    await current
    await disposal
    await next

    expect(disposed).toBe(true)
    expect(nextStarted).toBe(true)
  })

  it('does not retain owner-bound state across 100 build lifecycles', async () => {
    const dispose = vi.fn()
    const createGenerator = vi.fn(() => ({
      dispose,
      generate: vi.fn(async () => ({
        css: '',
        rawCss: '',
        classSet: new Set(['p-4']),
        rawCandidates: new Set(['p-4']),
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
    let previousCompilationPool: unknown
    let previousCoordinator: unknown
    let previousGenerationPool: unknown
    let previousShadowSession: unknown

    for (let index = 0; index < 100; index++) {
      const compilationPool = getCompilationSessionPool(owner)
      const coordinator = getCompilationChangeCoordinator(owner)
      const generationPool = getTailwindGenerationSessionPool(owner)
      const shadowSession = getCompilerShadowReportSession(owner)
      expect(compilationPool).not.toBe(previousCompilationPool)
      expect(coordinator).not.toBe(previousCoordinator)
      expect(generationPool).not.toBe(previousGenerationPool)
      expect(shadowSession).not.toBe(previousShadowSession)

      shadowSession.beginRun()
      await generationPool.generate(source as any, { candidates: ['p-4'] })
      await compilationPool.run({
        scope: { id: 'app.css', kind: 'global' },
        outputId: 'app.css',
        sources: [{ id: '/src/app.css', kind: 'css', candidates: ['p-4'] }],
      }, async compilation => ({ classSet: compilation.candidates }))
      await disposeCompilerOwner(owner)

      expect(compilationPool.size).toBe(0)
      expect(generationPool.size).toBe(0)
      expect(() => coordinator.consume('app.css')).toThrow('已释放')
      expect(() => shadowSession.snapshot()).toThrow('已释放')
      previousCompilationPool = compilationPool
      previousCoordinator = coordinator
      previousGenerationPool = generationPool
      previousShadowSession = shadowSession
    }

    expect(createGenerator).toHaveBeenCalledTimes(100)
    expect(dispose).toHaveBeenCalledTimes(100)
  })
})
