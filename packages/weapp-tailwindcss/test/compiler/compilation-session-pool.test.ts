import { describe, expect, it, vi } from 'vitest'
import { CompilationSessionPool } from '@/compiler'

const componentScope = { id: 'pages/index.css', kind: 'component' as const }

describe('CompilationSessionPool', () => {
  it('owns candidates and validation for one scope revision', async () => {
    const pool = new CompilationSessionPool()
    const compile = vi.fn(async (compilation) => ({
      classSet: compilation.candidates,
      css: '.generated{}',
    }))
    const first = await pool.run({
      scope: componentScope,
      outputId: 'pages/index.css',
      sources: [{ id: '/src/app.css', kind: 'css', candidates: ['p-4'], content: '@import "tailwindcss";' }],
    }, compile)
    const second = await pool.run({
      scope: componentScope,
      outputId: 'pages/index.css',
      sources: [{ id: '/src/app.css', kind: 'css', candidates: ['text-red-500'], content: '@import "tailwindcss";' }],
    }, compile)

    expect(first.compilation.revision).toBe(1)
    expect(first.compilation.validatedClassSet).toEqual(new Set(['p-4']))
    expect(second.compilation.revision).toBe(2)
    expect(second.compilation.candidates).toEqual(new Set(['text-red-500']))
    expect(second.compilation.candidatesBySource.get('/src/app.css')).toEqual(new Set(['text-red-500']))
    expect(second.compilation.invalidatedScopes).toEqual(new Set([componentScope.id]))
  })

  it('isolates scopes and ignores stale revision commits without blocking generation', async () => {
    const pool = new CompilationSessionPool()
    let releaseFirst: (() => void) | undefined
    const pending = new Promise<void>((resolve) => {
      releaseFirst = resolve
    })
    const first = pool.run({
      scope: componentScope,
      outputId: 'pages/index.css',
      sources: [{ id: '/src/app.css', kind: 'css', candidates: ['p-4'] }],
    }, async compilation => {
      await pending
      return { classSet: compilation.candidates }
    })
    const secondCompile = vi.fn(async compilation => ({ classSet: compilation.candidates }))
    const second = pool.run({
      scope: componentScope,
      outputId: 'pages/index.css',
      sources: [{ id: '/src/app.css', kind: 'css', candidates: ['m-2'] }],
    }, secondCompile)
    const global = await pool.run({
      scope: { id: 'app.css', kind: 'global' },
      outputId: 'app.css',
      sources: [{ id: '/src/global.css', kind: 'css', candidates: ['text-lg'] }],
    }, async compilation => ({ classSet: compilation.candidates }))

    await vi.waitFor(() => {
      expect(secondCompile).toHaveBeenCalledTimes(1)
    })
    expect(global.compilation.candidates).toEqual(new Set(['text-lg']))
    releaseFirst?.()
    const [firstResult, secondResult] = await Promise.all([first, second])
    expect(firstResult.committed).toBe(false)
    expect(secondResult.committed).toBe(true)
  })

  it('retains deleted candidates only when the scope requests it', async () => {
    const pool = new CompilationSessionPool()
    await pool.run({
      scope: componentScope,
      outputId: 'pages/index.css',
      sources: [{ id: '/src/app.css', kind: 'css', candidates: ['p-4'] }],
      preserveDeletedCss: true,
    }, async compilation => ({ classSet: compilation.candidates }))
    const retained = await pool.run({
      scope: componentScope,
      outputId: 'pages/index.css',
      sources: [{ id: '/src/app.css', kind: 'css', candidates: ['m-2'] }],
      preserveDeletedCss: true,
    }, async compilation => ({ classSet: compilation.candidates }))
    const removed = await pool.run({
      scope: componentScope,
      outputId: 'pages/index.css',
      sources: [{ id: '/src/app.css', kind: 'css', candidates: ['m-2'] }],
      preserveDeletedCss: false,
    }, async compilation => ({ classSet: compilation.candidates }))

    expect(retained.compilation.candidates).toEqual(new Set(['p-4', 'm-2']))
    expect(retained.compilation.validatedClassSet).toEqual(new Set(['p-4', 'm-2']))
    expect(removed.compilation.candidates).toEqual(new Set(['m-2']))
    expect(removed.compilation.validatedClassSet).toEqual(new Set(['m-2']))
  })
})
