import type { TailwindcssPatcherLike } from '@/types'
import { describe, expect, it, vi } from 'vitest'
import { collectRuntimeClassSet } from '@/tailwindcss/runtime'

function createFakePatcher(): TailwindcssPatcherLike & {
  collectContentTokens: ReturnType<typeof vi.fn>
  extract: ReturnType<typeof vi.fn>
  getClassSet: ReturnType<typeof vi.fn>
} {
  const baseClassSet = new Set<string>(['text-[#f50707]'])

  const patcher: TailwindcssPatcherLike & {
    collectContentTokens: ReturnType<typeof vi.fn>
    extract: ReturnType<typeof vi.fn>
    getClassSet: ReturnType<typeof vi.fn>
  } = {
    packageInfo: {
      name: 'tailwindcss',
      version: '3.0.0',
      rootPath: '',
      packageJsonPath: '',
      packageJson: {},
    },
    majorVersion: 3,
    options: undefined,
    patch: vi.fn(async () => ({})),
    extract: vi.fn(async () => ({
      classSet: new Set(baseClassSet),
      classList: Array.from(baseClassSet),
    })),
    getClassSet: vi.fn(async () => new Set(baseClassSet)),
    collectContentTokens: vi.fn(async () => ({
      entries: [
        { rawCandidate: 'text-[#ff00ff]' },
      ],
      filesScanned: 0,
      skippedFiles: [],
      sources: [],
    })),
  }

  return patcher
}

describe('collectRuntimeClassSet()', () => {
  it('merges fresh content tokens when force refreshing', async () => {
    const patcher = createFakePatcher()

    const first = await collectRuntimeClassSet(patcher, { force: true })
    expect(first.has('text-[#f50707]')).toBe(true)
    expect(first.has('text-[#ff00ff]')).toBe(true)
    expect(patcher.collectContentTokens).toHaveBeenCalledTimes(1)

    const cached = await collectRuntimeClassSet(patcher)
    expect(cached).toBe(first)
    expect(patcher.collectContentTokens).toHaveBeenCalledTimes(1)
  })
})
