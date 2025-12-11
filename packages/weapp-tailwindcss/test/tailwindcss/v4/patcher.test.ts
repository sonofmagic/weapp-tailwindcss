import type { InternalUserDefinedOptions, TailwindcssPatcherLike } from '@/types'
import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createTailwindcssPatcher = vi.fn()
const findNearestPackageRoot = vi.fn()
const isMpx = vi.fn(() => false)
const logger = {
  debug: vi.fn(),
}

vi.mock('@weapp-tailwindcss/logger', () => ({
  logger,
}))

vi.mock('@/tailwindcss/patcher', () => ({
  createTailwindcssPatcher,
}))

vi.mock('@/context/workspace', () => ({
  findNearestPackageRoot,
}))

vi.mock('@/shared/mpx', () => ({
  isMpx,
}))

async function loadModule() {
  return import('@/tailwindcss/v4/patcher')
}

describe('tailwindcss/v4/patcher helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    findNearestPackageRoot.mockReturnValue(undefined)
    isMpx.mockReturnValue(false)
  })

  it('guesses basedir from absolute css entries', async () => {
    findNearestPackageRoot.mockReturnValue('/packages/app')
    const { guessBasedirFromEntries } = await loadModule()

    const base = guessBasedirFromEntries(['/packages/app/src/app.css'])

    expect(base).toBe(path.normalize('/packages/app'))
  })

  it('returns undefined when css entries are missing or relative', async () => {
    const { guessBasedirFromEntries } = await loadModule()

    expect(guessBasedirFromEntries()).toBeUndefined()
    expect(guessBasedirFromEntries(['relative/app.css'])).toBeUndefined()
    expect(guessBasedirFromEntries([123 as any])).toBeUndefined()
    expect(guessBasedirFromEntries(['   '])).toBeUndefined()
  })

  it('continues when resolved base path is empty', async () => {
    const isAbsoluteSpy = vi.spyOn(path, 'isAbsolute').mockImplementation(() => true)
    const dirnameSpy = vi.spyOn(path, 'dirname').mockImplementation(() => '')
    findNearestPackageRoot.mockReturnValue(undefined)

    const { guessBasedirFromEntries } = await loadModule()
    expect(guessBasedirFromEntries(['mock'])).toBeUndefined()

    isAbsoluteSpy.mockRestore()
    dirnameSpy.mockRestore()
  })
  it('skips returning when resolved base is falsy', async () => {
    findNearestPackageRoot.mockReturnValue('')
    const { guessBasedirFromEntries } = await loadModule()

    expect(guessBasedirFromEntries(['/abs/path.css'])).toBeUndefined()
  })

  it('normalizes css entries relative to anchor', async () => {
    const { normalizeCssEntries } = await loadModule()
    const anchor = '/workspace/project'

    const normalized = normalizeCssEntries([' ./src/app.css ', '/abs/global.css'], anchor)

    expect(normalized).toEqual([
      path.normalize('/workspace/project/src/app.css'),
      path.normalize('/abs/global.css'),
    ])
  })

  it('returns undefined when no valid css entries exist after normalization', async () => {
    const { normalizeCssEntries } = await loadModule()
    const anchor = '/workspace/project'

    expect(normalizeCssEntries(['   ', 123 as any], anchor)).toBeUndefined()
    expect(normalizeCssEntries([], anchor)).toBeUndefined()
  })

  it('groups css entries by preferred base and workspace root', async () => {
    findNearestPackageRoot.mockImplementation((dir: string) => {
      if (dir.includes('pkg-a')) {
        return '/repo/packages/pkg-a'
      }
      if (dir.includes('pkg-b')) {
        return '/repo/packages/pkg-b'
      }
      return undefined
    })
    const { groupCssEntriesByBase } = await loadModule()

    const entries = [
      '/repo/packages/pkg-a/src/app.css',
      '/repo/packages/pkg-b/src/app.css',
    ]
    const groups = groupCssEntriesByBase(entries, {
      preferredBaseDir: '/repo/packages/pkg-a',
      workspaceRoot: '/repo',
    })

    expect([...groups.keys()].sort()).toEqual([
      path.normalize('/repo'),
      path.normalize('/repo/packages/pkg-a'),
    ])
  })

  it('groups css entries under normalized directory when no package root is found', async () => {
    findNearestPackageRoot.mockReturnValue(undefined)
    const { groupCssEntriesByBase } = await loadModule()

    const entries = ['/repo/random/src/app.css']
    const groups = groupCssEntriesByBase(entries)

    const normalizedBase = path.normalize('/repo/random/src')
    expect([...groups.keys()]).toEqual([normalizedBase])
    expect(groups.get(normalizedBase)).toEqual(entries)
  })

  it('falls back to package root when no workspace hints are provided', async () => {
    findNearestPackageRoot.mockReturnValue('/repo/packages/pkg-c')
    const { groupCssEntriesByBase } = await loadModule()

    const entries = ['/repo/packages/pkg-c/src/app.css']
    const groups = groupCssEntriesByBase(entries)

    expect([...groups.keys()]).toEqual([path.normalize('/repo/packages/pkg-c')])
  })

  it('handles empty normalized path segments when checking sub paths', async () => {
    const originalNormalize = path.normalize
    const normalizeSpy = vi.spyOn(path, 'normalize')
    normalizeSpy.mockImplementation((value: string) => originalNormalize(value))
    normalizeSpy.mockImplementationOnce((value: string) => originalNormalize(value)) // preferredBaseDir
    normalizeSpy.mockImplementationOnce(() => '') // normalizedDir

    const { groupCssEntriesByBase } = await loadModule()
    const groups = groupCssEntriesByBase(['/repo/misc/app.css'], {
      preferredBaseDir: '/repo/misc',
    })

    expect([...groups.keys()]).toEqual([''])
    normalizeSpy.mockRestore()
  })

  it('collects multiple entries under the same base', async () => {
    findNearestPackageRoot.mockReturnValue('/repo/packages/pkg-d')
    const { groupCssEntriesByBase } = await loadModule()

    const entries = [
      '/repo/packages/pkg-d/src/app.css',
      '/repo/packages/pkg-d/src/extra.css',
    ]
    const groups = groupCssEntriesByBase(entries)

    expect(groups.get(path.normalize('/repo/packages/pkg-d'))).toEqual(entries)
  })

  it('creates patcher with v4 defaults and mpx cache dir', async () => {
    isMpx.mockReturnValue(true)
    createTailwindcssPatcher.mockImplementation(options => ({
      ...options,
      majorVersion: 4,
      packageInfo: { version: '4.0.0' },
    }))

    const { createPatcherForBase } = await loadModule()
    const baseDir = '/workspace/app'
    const cssEntries = [`${baseDir}/src/app.css`]
    const factoryOptions = {
      tailwindcss: {},
      tailwindcssPatcherOptions: {
        tailwind: { resolve: { paths: ['/custom'] } },
      },
      supportCustomLengthUnitsPatch: false,
      appType: 'mpx',
    } as unknown as InternalUserDefinedOptions

    const patcher = createPatcherForBase(baseDir, cssEntries, factoryOptions)

    expect(createTailwindcssPatcher).toHaveBeenCalledTimes(2)
    const [callA, callB] = createTailwindcssPatcher.mock.calls.map(call => call[0])
    expect(new Set([callA.basedir, callB.basedir])).toEqual(new Set([baseDir]))
    expect(callA.cacheDir).toBeUndefined()
    expect(callA.tailwindcss?.version).toBe(4)
    expect(callA.tailwindcss?.v4?.base).toBe(baseDir)
    expect(callA.tailwindcss?.v4?.cssEntries).toEqual(cssEntries)
    expect(patcher.majorVersion).toBe(4)
  })

  it('creates dual patchers for v4 when no package is configured', async () => {
    createTailwindcssPatcher.mockImplementation(options => ({
      packageInfo: { name: options.tailwindcss?.packageName } as any,
      majorVersion: 4,
      options,
      patch: vi.fn(async () => ({})),
      getClassSet: vi.fn(async () => new Set()),
      extract: vi.fn(async () => undefined as any),
    }))
    const { createPatcherForBase } = await loadModule()

    createPatcherForBase('/workspace/app', ['/workspace/app/src/app.css'], {
      tailwindcss: { version: 4 },
      tailwindcssPatcherOptions: undefined,
      supportCustomLengthUnitsPatch: true,
      appType: 'taro',
    } as unknown as InternalUserDefinedOptions)

    expect(createTailwindcssPatcher).toHaveBeenCalledTimes(2)
    const packageNames = createTailwindcssPatcher.mock.calls.map(call => call[0].tailwindcss?.packageName)
    expect(packageNames).toContain('@tailwindcss/postcss')
    expect(packageNames).toContain('tailwindcss')
  })

  it('does not create extra patcher when packageName is already configured', async () => {
    createTailwindcssPatcher.mockImplementation(options => ({
      packageInfo: { name: options.tailwindcss?.packageName } as any,
      majorVersion: 4,
      options,
      patch: vi.fn(async () => ({})),
      getClassSet: vi.fn(async () => new Set()),
      extract: vi.fn(async () => undefined as any),
    }))
    const { createPatcherForBase } = await loadModule()

    createPatcherForBase('/workspace/app', ['/workspace/app/src/app.css'], {
      tailwindcss: { version: 4, packageName: 'tailwindcss4' },
      tailwindcssPatcherOptions: undefined,
      supportCustomLengthUnitsPatch: true,
      appType: 'taro',
    } as unknown as InternalUserDefinedOptions)

    expect(createTailwindcssPatcher).toHaveBeenCalledTimes(1)
    expect(createTailwindcssPatcher.mock.calls[0][0].tailwindcss?.packageName).toBe('tailwindcss4')
  })

  it('defaults supportCustomLengthUnitsPatch to true when unspecified', async () => {
    createTailwindcssPatcher.mockImplementation(options => options)
    const { createPatcherForBase } = await loadModule()
    const patcher = createPatcherForBase('/workspace/app', [], {
      tailwindcss: {},
      tailwindcssPatcherOptions: undefined,
      supportCustomLengthUnitsPatch: undefined,
      appType: 'taro',
    } as unknown as InternalUserDefinedOptions) as any

    expect(patcher.supportCustomLengthUnitsPatch).toBe(true)
  })

  it('fills missing v4 config when user config disables it', async () => {
    createTailwindcssPatcher.mockImplementation(options => options)
    const { createPatcherForBase } = await loadModule()

    const patcher = createPatcherForBase('/workspace/app', undefined, {
      tailwindcss: { v4: undefined, version: 3 },
      tailwindcssPatcherOptions: undefined,
      supportCustomLengthUnitsPatch: true,
      appType: 'taro',
    } as unknown as InternalUserDefinedOptions) as any

    expect(patcher.tailwindcss?.v4?.base).toBe('/workspace/app')
    expect(patcher.tailwindcss?.v4?.cssEntries).toEqual([])
  })

  it('repairs null v4 configs', async () => {
    createTailwindcssPatcher.mockImplementation(options => options)
    const { createPatcherForBase } = await loadModule()

    const patcher = createPatcherForBase('/workspace/app', ['/workspace/app/src/app.css'], {
      tailwindcss: { v4: null as any, version: 3 },
      tailwindcssPatcherOptions: undefined,
      supportCustomLengthUnitsPatch: true,
      appType: 'taro',
    } as unknown as InternalUserDefinedOptions) as any

    expect(patcher.tailwindcss?.v4?.base).toBe('/workspace/app')
    expect(patcher.tailwindcss?.v4?.cssEntries).toEqual(['/workspace/app/src/app.css'])
  })

  it('recreates v4 config when user explicitly disables it', async () => {
    createTailwindcssPatcher.mockImplementation(options => options)
    const { createPatcherForBase } = await loadModule()

    const patcher = createPatcherForBase('/workspace/app', undefined, {
      tailwindcss: { v4: false as any, version: 3 },
      tailwindcssPatcherOptions: undefined,
      supportCustomLengthUnitsPatch: true,
      appType: 'taro',
    } as unknown as InternalUserDefinedOptions) as any

    expect(patcher.tailwindcss?.v4?.base).toBe('/workspace/app')
    expect(patcher.tailwindcss?.v4?.cssEntries).toEqual([])
  })

  it('overrides legacy tailwindcssPatcherOptions for base', async () => {
    createTailwindcssPatcher.mockImplementation(options => options)
    const { createPatcherForBase } = await loadModule()
    const baseDir = '/workspace/app'
    const legacyOptions = {
      patch: {
        basedir: '/should/overwrite',
        tailwindcss: {
          v4: { cssEntries: ['/old'] },
        },
      },
    }

    const patcher = createPatcherForBase(baseDir, undefined, {
      tailwindcss: { version: 3 },
      tailwindcssPatcherOptions: legacyOptions as any,
      supportCustomLengthUnitsPatch: true,
      appType: 'taro',
    } as unknown as InternalUserDefinedOptions) as any

    expect(patcher.tailwindcssPatcherOptions?.patch?.basedir).toBe(baseDir)
    expect(patcher.tailwindcssPatcherOptions?.patch?.cwd).toBe(baseDir)
    expect(patcher.tailwindcssPatcherOptions?.patch?.tailwindcss?.v4?.base).toBe(baseDir)
  })

  it('keeps legacy patch config untouched when tailwindcss is missing', async () => {
    createTailwindcssPatcher.mockImplementation(options => options)
    const { createPatcherForBase } = await loadModule()

    const patcher = createPatcherForBase('/workspace/app', [], {
      tailwindcss: undefined,
      tailwindcssPatcherOptions: { patch: {} } as any,
      supportCustomLengthUnitsPatch: true,
      appType: 'taro',
    } as unknown as InternalUserDefinedOptions) as any

    expect(patcher.tailwindcssPatcherOptions.patch.tailwindcss).toBeUndefined()
  })

  it('populates legacy tailwindcss v4 config when missing', async () => {
    createTailwindcssPatcher.mockImplementation(options => options)
    const { createPatcherForBase } = await loadModule()

    const _patcher = createPatcherForBase('/workspace/app', ['/workspace/app/src/app.css'], {
      tailwindcss: undefined,
      tailwindcssPatcherOptions: { patch: { tailwindcss: {} } } as any,
      supportCustomLengthUnitsPatch: true,
      appType: 'taro',
    } as unknown as InternalUserDefinedOptions) as any

    const firstCall = createTailwindcssPatcher.mock.calls[0]?.[0] ?? {}
    const patchedV4 = firstCall.tailwindcssPatcherOptions?.patch?.tailwindcss?.v4
    expect(patchedV4).toEqual({
      base: '/workspace/app',
      cssEntries: ['/workspace/app/src/app.css'],
    })
    expect(patchedV4?.cssEntries?.length).toBe(1)
  })

  it('returns early for invalid tailwindcssPatcherOptions shapes', async () => {
    createTailwindcssPatcher.mockImplementation(options => options)
    const { createPatcherForBase } = await loadModule()

    const primitive = createPatcherForBase('/workspace/app', [], {
      tailwindcss: undefined,
      tailwindcssPatcherOptions: 1 as any,
      supportCustomLengthUnitsPatch: true,
      appType: 'taro',
    } as unknown as InternalUserDefinedOptions) as any

    expect(primitive.tailwindcssPatcherOptions).toBe(1)

    const withoutTailwind = createPatcherForBase('/workspace/app', [], {
      tailwindcss: undefined,
      tailwindcssPatcherOptions: {},
      supportCustomLengthUnitsPatch: true,
      appType: 'taro',
    } as unknown as InternalUserDefinedOptions) as any

    expect(withoutTailwind.tailwindcssPatcherOptions).toEqual({})

    const legacyWithoutPatch = createPatcherForBase('/workspace/app', [], {
      tailwindcss: undefined,
      tailwindcssPatcherOptions: { patch: undefined } as any,
      supportCustomLengthUnitsPatch: true,
      appType: 'taro',
    } as unknown as InternalUserDefinedOptions) as any

    expect(legacyWithoutPatch.tailwindcssPatcherOptions).toEqual({ patch: undefined })
  })

  it('merges multiple patchers into a single runtime', async () => {
    const patcherA: TailwindcssPatcherLike = {
      packageInfo: { version: '4.0.0' } as any,
      majorVersion: 4,
      options: {} as any,
      patch: vi.fn(async () => ({ exposeContext: 'ctxA' })),
      getClassSet: vi.fn(async () => new Set(['a'])),
      getClassSetSync: vi.fn(() => new Set(['a'])),
      extract: vi.fn(async () => ({
        classList: ['a'],
        classSet: new Set(['a']),
        filename: 'a.css',
      })),
    }
    const patcherB: TailwindcssPatcherLike = {
      packageInfo: { version: '4.0.0' } as any,
      majorVersion: 4,
      options: {} as any,
      patch: vi.fn(async () => ({ extendLengthUnits: true })),
      getClassSet: vi.fn(async () => new Set(['b'])),
      getClassSetSync: vi.fn(() => undefined),
      extract: vi.fn(async () => ({
        classList: ['b'],
        classSet: new Set(['b']),
        filename: 'b.css',
      })),
    }

    const { createMultiTailwindcssPatcher } = await loadModule()
    const merged = createMultiTailwindcssPatcher([patcherA, patcherB])

    const patchResult = await merged.patch()
    expect(patcherA.patch).toHaveBeenCalled()
    expect(patcherB.patch).toHaveBeenCalled()
    expect(patchResult).toEqual({ exposeContext: 'ctxA', extendLengthUnits: true })

    expect([...await merged.getClassSet()]).toEqual(['a', 'b'])
    expect(merged.getClassSetSync?.()).toEqual(new Set(['a']))

    const extracted = await merged.extract({})
    expect(extracted.filename).toBe('a.css')
    expect(extracted.classList).toEqual(['a', 'b'])
    expect([...extracted.classSet]).toEqual(['a', 'b'])
  })

  it('returns the original patcher when only one is provided', async () => {
    const patcher: TailwindcssPatcherLike = {
      packageInfo: { version: '4.0.0' } as any,
      majorVersion: 4,
      options: {} as any,
      patch: vi.fn(async () => ({})),
      getClassSet: vi.fn(async () => new Set(['only'])),
      extract: vi.fn(async () => ({
        classList: ['only'],
        classSet: new Set(['only']),
        filename: 'only.css',
      })),
    }

    const { createMultiTailwindcssPatcher } = await loadModule()
    const merged = createMultiTailwindcssPatcher([patcher])

    expect(merged).toBe(patcher)
  })

  it('skips falsy extract results when merging', async () => {
    const patcherA: TailwindcssPatcherLike = {
      packageInfo: { version: '4.0.0' } as any,
      majorVersion: 4,
      options: {} as any,
      patch: vi.fn(async () => ({})),
      getClassSet: vi.fn(async () => new Set()),
      extract: vi.fn(async () => undefined as any),
    }
    const patcherB: TailwindcssPatcherLike = {
      packageInfo: { version: '4.0.0' } as any,
      majorVersion: 4,
      options: {} as any,
      patch: vi.fn(async () => ({})),
      getClassSet: vi.fn(async () => new Set(['hit'])) as any,
      extract: vi.fn(async () => ({
        classList: ['hit'],
        classSet: new Set(['hit']),
      })),
    }

    const { createMultiTailwindcssPatcher } = await loadModule()
    const merged = createMultiTailwindcssPatcher([patcherA, patcherB])

    const extracted = await merged.extract({})
    expect(extracted.classList).toEqual(['hit'])
    expect([...extracted.classSet]).toEqual(['hit'])
  })

  it('merges classSet-only extract results', async () => {
    const patcherA: TailwindcssPatcherLike = {
      packageInfo: { version: '4.0.0' } as any,
      majorVersion: 4,
      options: {} as any,
      patch: vi.fn(async () => ({})),
      getClassSet: vi.fn(async () => new Set()),
      extract: vi.fn(async () => ({
        classSet: new Set(['only-set']),
      })),
    }
    const patcherB: TailwindcssPatcherLike = {
      packageInfo: { version: '4.0.0' } as any,
      majorVersion: 4,
      options: {} as any,
      patch: vi.fn(async () => ({})),
      getClassSet: vi.fn(async () => new Set()),
      extract: vi.fn(async () => ({
        classSet: new Set(['another']),
      })),
    }

    const { createMultiTailwindcssPatcher } = await loadModule()
    const merged = createMultiTailwindcssPatcher([patcherA, patcherB])

    const extracted = await merged.extract({})
    expect(extracted.classList).toEqual([])
    expect([...extracted.classSet].sort()).toEqual(['another', 'only-set'])
  })

  it('merges classList-only extract results', async () => {
    const patcherA: TailwindcssPatcherLike = {
      packageInfo: { version: '4.0.0' } as any,
      majorVersion: 4,
      options: {} as any,
      patch: vi.fn(async () => ({})),
      getClassSet: vi.fn(async () => new Set()),
      extract: vi.fn(async () => ({
        classList: ['only-list'],
      })),
    }
    const patcherB: TailwindcssPatcherLike = {
      packageInfo: { version: '4.0.0' } as any,
      majorVersion: 4,
      options: {} as any,
      patch: vi.fn(async () => ({})),
      getClassSet: vi.fn(async () => new Set()),
      extract: vi.fn(async () => ({
        classList: ['extra'],
      })),
    }

    const { createMultiTailwindcssPatcher } = await loadModule()
    const merged = createMultiTailwindcssPatcher([patcherA, patcherB])

    const extracted = await merged.extract({})
    expect(extracted.classList).toEqual(['only-list', 'extra'])
    expect([...extracted.classSet].sort()).toEqual(['extra', 'only-list'])
  })

  it('deduplicates repeated class names when merging class lists', async () => {
    const patcherA: TailwindcssPatcherLike = {
      packageInfo: { version: '4.0.0' } as any,
      majorVersion: 4,
      options: {} as any,
      patch: vi.fn(async () => ({})),
      getClassSet: vi.fn(async () => new Set()),
      extract: vi.fn(async () => ({
        classList: ['dup'],
        classSet: new Set(['dup']),
      })),
    }
    const patcherB: TailwindcssPatcherLike = {
      packageInfo: { version: '4.0.0' } as any,
      majorVersion: 4,
      options: {} as any,
      patch: vi.fn(async () => ({})),
      getClassSet: vi.fn(async () => new Set()),
      extract: vi.fn(async () => ({
        classList: ['dup'],
        classSet: new Set(['dup']),
      })),
    }

    const { createMultiTailwindcssPatcher } = await loadModule()
    const merged = createMultiTailwindcssPatcher([patcherA, patcherB])

    const extracted = await merged.extract({})
    expect(extracted.classList).toEqual(['dup'])
    expect([...extracted.classSet]).toEqual(['dup'])
  })

  it('returns undefined when only one css entry group exists', async () => {
    const { tryCreateMultiTailwindcssPatcher } = await loadModule()

    const groups = new Map<string, string[]>([['/base', ['/base/app.css']]])
    const result = tryCreateMultiTailwindcssPatcher(groups, {
      tailwindcss: {},
      tailwindcssPatcherOptions: undefined,
      supportCustomLengthUnitsPatch: true,
      appType: 'taro',
    } as unknown as InternalUserDefinedOptions)

    expect(result).toBeUndefined()
    expect(createTailwindcssPatcher).not.toHaveBeenCalled()
  })

  it('creates multiple patchers when multiple css entry groups exist', async () => {
    createTailwindcssPatcher.mockImplementation(options => ({
      packageInfo: { version: '4.0.0' } as any,
      majorVersion: 4,
      options,
      patch: vi.fn(async () => ({})),
      getClassSet: vi.fn(async () => new Set([options.basedir as string])),
      extract: vi.fn(async () => ({
        classList: [options.basedir as string],
        classSet: new Set([options.basedir as string]),
      })),
    }))
    const { tryCreateMultiTailwindcssPatcher } = await loadModule()

    const groups = new Map<string, string[]>([
      ['/base/a', ['/base/a/app.css']],
      ['/base/b', ['/base/b/app.css']],
    ])

    const merged = tryCreateMultiTailwindcssPatcher(groups, {
      tailwindcss: {},
      tailwindcssPatcherOptions: undefined,
      supportCustomLengthUnitsPatch: true,
      appType: 'taro',
    } as unknown as InternalUserDefinedOptions)

    expect(merged).toBeDefined()
    expect(createTailwindcssPatcher).toHaveBeenCalledTimes(4)
    expect(logger.debug).toHaveBeenCalled()

    const classSet = await merged!.getClassSet()
    expect([...classSet].sort()).toEqual(['/base/a', '/base/b'])
  })
})
