import type { TailwindcssPatcherLike } from '@/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function createMockPatcher(configPath = '/tmp/tailwind.config.js'): TailwindcssPatcherLike {
  return {
    packageInfo: {
      name: 'tailwindcss',
      version: '4.0.0',
      rootPath: '/tmp/tailwindcss',
      packageJsonPath: '/tmp/tailwindcss/package.json',
      packageJson: {},
    },
    majorVersion: 4,
    options: {
      tailwind: {
        config: configPath,
      },
    } as any,
    patch: vi.fn().mockResolvedValue(undefined),
    extract: vi.fn().mockResolvedValue({ classSet: new Set<string>() }),
    getClassSet: vi.fn().mockResolvedValue(new Set<string>()),
  }
}

describe('tailwindcss runtime cache signature', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('reuses config stat result within the same event-loop turn', async () => {
    const statSync = vi.fn()
      .mockReturnValue({ size: 10, mtimeMs: 1000 })
    vi.doMock('node:fs', () => ({
      statSync,
    }))

    const { getRuntimeClassSetSignature } = await import('@/tailwindcss/runtime/cache')
    const patcher = createMockPatcher()

    const first = getRuntimeClassSetSignature(patcher)
    const second = getRuntimeClassSetSignature(patcher)

    expect(first).toContain('/tmp/tailwind.config.js:10:1000')
    expect(second).toBe(first)
    expect(statSync).toHaveBeenCalledTimes(1)
  })

  it('re-stats config on the next event-loop turn so file changes are observed', async () => {
    const statSync = vi.fn()
      .mockReturnValueOnce({ size: 10, mtimeMs: 1000 })
      .mockReturnValueOnce({ size: 12, mtimeMs: 2000 })
    vi.doMock('node:fs', () => ({
      statSync,
    }))

    const { getRuntimeClassSetSignature } = await import('@/tailwindcss/runtime/cache')
    const patcher = createMockPatcher()

    const first = getRuntimeClassSetSignature(patcher)
    await vi.runAllTimersAsync()
    const second = getRuntimeClassSetSignature(patcher)

    expect(first).toContain('/tmp/tailwind.config.js:10:1000')
    expect(second).toContain('/tmp/tailwind.config.js:12:2000')
    expect(second).not.toBe(first)
    expect(statSync).toHaveBeenCalledTimes(2)
  })

  it('clears cached config signature immediately when invalidated', async () => {
    const statSync = vi.fn()
      .mockReturnValueOnce({ size: 10, mtimeMs: 1000 })
      .mockReturnValueOnce({ size: 14, mtimeMs: 3000 })
    vi.doMock('node:fs', () => ({
      statSync,
    }))

    const { getRuntimeClassSetSignature, invalidateRuntimeClassSet } = await import('@/tailwindcss/runtime/cache')
    const patcher = createMockPatcher()

    const first = getRuntimeClassSetSignature(patcher)
    invalidateRuntimeClassSet(patcher)
    const second = getRuntimeClassSetSignature(patcher)

    expect(first).toContain('/tmp/tailwind.config.js:10:1000')
    expect(second).toContain('/tmp/tailwind.config.js:14:3000')
    expect(second).not.toBe(first)
    expect(statSync).toHaveBeenCalledTimes(2)
  })
})
