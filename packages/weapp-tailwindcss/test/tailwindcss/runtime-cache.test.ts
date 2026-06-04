import type { TailwindcssPatcherLike } from '@/types'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { runtimeSignaturePatchersSymbol } from '@/tailwindcss/runtime/cache'

function createMockPatcher(
  configPath = '/tmp/tailwind.config.js',
  options?: {
    cssEntries?: string[]
    cssSources?: Array<{ css: string, file?: string, dependencies?: string[] }>
    projectRoot?: string
    packageVersion?: string
    packageRootPath?: string
  },
): TailwindcssPatcherLike {
  const cssEntries = options?.cssEntries ?? []
  return {
    packageInfo: {
      name: 'tailwindcss',
      version: options?.packageVersion ?? '4.0.0',
      rootPath: options?.packageRootPath ?? '/tmp/tailwindcss',
      packageJsonPath: '/tmp/tailwindcss/package.json',
      packageJson: {},
    },
    majorVersion: 4,
    options: {
      projectRoot: options?.projectRoot ?? '/tmp/project',
      tailwind: {
        config: configPath,
        versionHint: 4,
        cwd: options?.projectRoot ?? '/tmp/project',
        v4: {
          base: options?.projectRoot ?? '/tmp/project',
          cssEntries,
          cssSources: options?.cssSources ?? [],
          sources: [],
          hasUserDefinedSources: false,
        },
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
      .mockImplementation((filePath: string) => {
        if (filePath === '/tmp/tailwind.config.js') {
          return { size: 10, mtimeMs: 1000 }
        }
        return { size: 20, mtimeMs: 2000 }
      })
    vi.doMock('node:fs', () => ({
      statSync,
    }))

    const { getRuntimeClassSetSignature } = await import('@/tailwindcss/runtime/cache')
    const patcher = createMockPatcher('/tmp/tailwind.config.js', {
      cssEntries: ['/tmp/project/src/app.css'],
    })

    const first = getRuntimeClassSetSignature(patcher)
    const second = getRuntimeClassSetSignature(patcher)

    expect(first).toContain('/tmp/tailwind.config.js:10:1000')
    expect(first).toContain('/tmp/project/src/app.css:20:2000')
    expect(second).toBe(first)
    expect(statSync).toHaveBeenCalledTimes(2)
  })

  it('re-stats config on the next event-loop turn so file changes are observed', async () => {
    let configCallCount = 0
    const statSync = vi.fn((filePath: string) => {
      if (filePath === '/tmp/tailwind.config.js') {
        configCallCount += 1
        return configCallCount === 1
          ? { size: 10, mtimeMs: 1000 }
          : { size: 12, mtimeMs: 2000 }
      }
      return { size: 20, mtimeMs: 2000 }
    })
    vi.doMock('node:fs', () => ({
      statSync,
    }))

    const { getRuntimeClassSetSignature } = await import('@/tailwindcss/runtime/cache')
    const patcher = createMockPatcher('/tmp/tailwind.config.js', {
      cssEntries: ['/tmp/project/src/app.css'],
    })

    const first = getRuntimeClassSetSignature(patcher)
    await vi.runAllTimersAsync()
    const second = getRuntimeClassSetSignature(patcher)

    expect(first).toContain('/tmp/tailwind.config.js:10:1000')
    expect(second).toContain('/tmp/tailwind.config.js:12:2000')
    expect(second).not.toBe(first)
    expect(statSync).toHaveBeenCalledTimes(4)
  })

  it('clears cached config signature immediately when invalidated', async () => {
    let configCallCount = 0
    let cssCallCount = 0
    const statSync = vi.fn((filePath: string) => {
      if (filePath === '/tmp/tailwind.config.js') {
        configCallCount += 1
        return configCallCount === 1
          ? { size: 10, mtimeMs: 1000 }
          : { size: 14, mtimeMs: 3000 }
      }
      cssCallCount += 1
      return cssCallCount === 1
        ? { size: 20, mtimeMs: 2000 }
        : { size: 21, mtimeMs: 4000 }
    })
    vi.doMock('node:fs', () => ({
      statSync,
    }))

    const { getRuntimeClassSetSignature, invalidateRuntimeClassSet } = await import('@/tailwindcss/runtime/cache')
    const patcher = createMockPatcher('/tmp/tailwind.config.js', {
      cssEntries: ['/tmp/project/src/app.css'],
    })

    const first = getRuntimeClassSetSignature(patcher)
    invalidateRuntimeClassSet(patcher)
    const second = getRuntimeClassSetSignature(patcher)

    expect(first).toContain('/tmp/tailwind.config.js:10:1000')
    expect(first).toContain('/tmp/project/src/app.css:20:2000')
    expect(second).toContain('/tmp/tailwind.config.js:14:3000')
    expect(second).toContain('/tmp/project/src/app.css:21:4000')
    expect(second).not.toBe(first)
    expect(statSync).toHaveBeenCalledTimes(4)
  })

  it('changes signature when cssEntries change', async () => {
    const statSync = vi.fn((filePath: string) => {
      if (filePath.endsWith('app.css')) {
        return { size: 20, mtimeMs: 2000 }
      }
      if (filePath.endsWith('extra.css')) {
        return { size: 30, mtimeMs: 3000 }
      }
      return { size: 10, mtimeMs: 1000 }
    })
    vi.doMock('node:fs', () => ({
      statSync,
    }))

    const { getRuntimeClassSetSignature } = await import('@/tailwindcss/runtime/cache')
    const first = createMockPatcher('/tmp/tailwind.config.js', {
      cssEntries: ['/tmp/project/src/app.css'],
    })
    const second = createMockPatcher('/tmp/tailwind.config.js', {
      cssEntries: ['/tmp/project/src/extra.css'],
    })

    expect(getRuntimeClassSetSignature(first)).not.toBe(getRuntimeClassSetSignature(second))
  })

  it('changes signature when cssSources content changes', async () => {
    const statSync = vi.fn(() => ({ size: 10, mtimeMs: 1000 }))
    vi.doMock('node:fs', () => ({
      statSync,
    }))

    const { getRuntimeClassSetSignature } = await import('@/tailwindcss/runtime/cache')
    const first = createMockPatcher('/tmp/tailwind.config.js', {
      cssSources: [
        {
          file: '/tmp/project/src/app.css',
          css: '@import "tailwindcss";\n@source inline("w-4");',
        },
      ],
    })
    const second = createMockPatcher('/tmp/tailwind.config.js', {
      cssSources: [
        {
          file: '/tmp/project/src/app.css',
          css: '@import "tailwindcss";\n@source inline("h-4");',
        },
      ],
    })

    expect(getRuntimeClassSetSignature(first)).not.toBe(getRuntimeClassSetSignature(second))
  })

  it('tracks cssSources files and dependencies in the signature', async () => {
    const statSync = vi.fn((filePath: string) => {
      if (filePath.endsWith('app.css')) {
        return { size: 20, mtimeMs: 2000 }
      }
      if (filePath.endsWith('theme.css')) {
        return { size: 30, mtimeMs: 3000 }
      }
      return { size: 10, mtimeMs: 1000 }
    })
    vi.doMock('node:fs', () => ({
      statSync,
    }))

    const { getRuntimeClassSetSignature } = await import('@/tailwindcss/runtime/cache')
    const patcher = createMockPatcher('/tmp/tailwind.config.js', {
      cssSources: [
        {
          file: '/tmp/project/src/app.css',
          css: '@import "tailwindcss";',
          dependencies: ['/tmp/project/src/theme.css'],
        },
      ],
    })

    const signature = getRuntimeClassSetSignature(patcher)

    expect(signature).toContain('/tmp/project/src/app.css:20:2000')
    expect(signature).toContain('/tmp/project/src/theme.css:30:3000')
  })

  it('changes signature when package version changes', async () => {
    const statSync = vi.fn(() => ({ size: 10, mtimeMs: 1000 }))
    vi.doMock('node:fs', () => ({
      statSync,
    }))

    const { getRuntimeClassSetSignature } = await import('@/tailwindcss/runtime/cache')
    const first = createMockPatcher('/tmp/tailwind.config.js', {
      packageVersion: '4.0.0',
    })
    const second = createMockPatcher('/tmp/tailwind.config.js', {
      packageVersion: '4.1.0',
    })

    expect(getRuntimeClassSetSignature(first)).not.toBe(getRuntimeClassSetSignature(second))
  })

  it('composes signatures for multi patchers so multiple bases do not share one cache key', async () => {
    const statSync = vi.fn((filePath: string) => {
      if (filePath.includes('app-a')) {
        return { size: 11, mtimeMs: 1100 }
      }
      if (filePath.includes('app-b')) {
        return { size: 22, mtimeMs: 2200 }
      }
      return { size: 10, mtimeMs: 1000 }
    })
    vi.doMock('node:fs', () => ({
      statSync,
    }))

    const { getRuntimeClassSetSignature } = await import('@/tailwindcss/runtime/cache')
    const patcherA = createMockPatcher('/tmp/app-a/tailwind.config.js', {
      cssEntries: ['/tmp/app-a/src/app.css'],
      projectRoot: '/tmp/app-a',
      packageRootPath: '/tmp/app-a/node_modules/tailwindcss',
    })
    const patcherB = createMockPatcher('/tmp/app-b/tailwind.config.js', {
      cssEntries: ['/tmp/app-b/src/app.css'],
      projectRoot: '/tmp/app-b',
      packageRootPath: '/tmp/app-b/node_modules/tailwindcss',
    })
    const multi = {
      ...patcherA,
      [runtimeSignaturePatchersSymbol]: [patcherA, patcherB],
    } as TailwindcssPatcherLike

    const signature = getRuntimeClassSetSignature(multi)

    expect(signature).toContain('/tmp/app-a/tailwind.config.js:11:1100')
    expect(signature).toContain('/tmp/app-b/tailwind.config.js:22:2200')
    expect(signature.split('||')).toHaveLength(2)
  })

  it('changes async signature when files matched by tailwind v4 @source change', async () => {
    vi.useRealTimers()
    vi.resetModules()
    vi.doUnmock('node:fs')

    const tempRoot = path.join(tmpdir(), `weapp-tw-runtime-source-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    const srcRoot = path.join(tempRoot, 'src')
    await mkdir(srcRoot, { recursive: true })
    const cssEntry = path.join(srcRoot, 'app.css')
    const template = path.join(srcRoot, 'index.wxml')
    await writeFile(cssEntry, '@import "tailwindcss";\n@source "./**/*.wxml";', 'utf8')
    await writeFile(template, '<view class="text-xs"></view>', 'utf8')

    try {
      const { getRuntimeClassSetSignatureWithSources } = await import('@/tailwindcss/runtime/cache')
      const patcher = createMockPatcher(path.join(tempRoot, 'tailwind.config.js'), {
        cssEntries: [cssEntry],
        projectRoot: tempRoot,
      })

      const first = await getRuntimeClassSetSignatureWithSources(patcher)
      await new Promise(resolve => setTimeout(resolve, 5))
      await writeFile(template, '<view class="text-sm"></view>', 'utf8')
      const second = await getRuntimeClassSetSignatureWithSources(patcher)

      expect(first).toContain(template)
      expect(second).toContain(template)
      expect(second).not.toBe(first)
    }
    finally {
      await rm(tempRoot, { force: true, recursive: true })
    }
  })
})
