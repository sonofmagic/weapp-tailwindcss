import type { CreateTailwindcssPatcherOptions } from '@/tailwindcss/patcher'
import type { InternalUserDefinedOptions, TailwindcssPatcherLike } from '@/types'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const originalEnv = process.env

describe('resolveTailwindcssBasedir', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    vi.resetModules()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('prefers npm_package_json directory when available', async () => {
    process.env.npm_package_json = '/workspace/apps/vite-native-skyline/package.json'

    const { resolveTailwindcssBasedir } = await import('@/context/tailwindcss')

    expect(resolveTailwindcssBasedir()).toBe(path.normalize('/workspace/apps/vite-native-skyline'))
  })
})

describe('createTailwindcssPatcherFromContext', () => {
  afterEach(() => {
    vi.doUnmock('@/tailwindcss')
    vi.resetModules()
  })

  it('creates multiple patchers when css entries resolve to different directories', async () => {
    const calls: CreateTailwindcssPatcherOptions[] = []
    const createdPatchers: TailwindcssPatcherLike[] = []
    const classSets = [['foo'], ['bar']]

    vi.resetModules()
    vi.doMock('@/tailwindcss', () => {
      return {
        createTailwindcssPatcher: vi.fn((options: CreateTailwindcssPatcherOptions) => {
          calls.push(options)
          const classes = classSets[createdPatchers.length] ?? []
          const stub: TailwindcssPatcherLike = {
            packageInfo: { version: '4.1.0' } as any,
            majorVersion: 4,
            options,
            patch: vi.fn(async () => ({})),
            getClassSet: vi.fn(async () => new Set(classes)),
            extract: vi.fn(async () => ({
              classList: classes,
              classSet: new Set(classes),
            })),
          }
          createdPatchers.push(stub)
          return stub
        }),
      }
    })

    const { createTailwindcssPatcherFromContext } = await import('@/context/tailwindcss')
    const workspace = path.resolve('/workspace/project')
    const entryA = path.join(workspace, 'apps', 'alpha', 'src', 'app.css')
    const entryB = path.join(workspace, 'apps', 'beta', 'src', 'app.css')
    const ctx = {
      tailwindcssBasedir: workspace,
      supportCustomLengthUnitsPatch: undefined,
      tailwindcss: undefined,
      tailwindcssPatcherOptions: undefined,
      cssEntries: [entryA, entryB],
      appType: 'taro',
    } as unknown as InternalUserDefinedOptions

    const patcher = createTailwindcssPatcherFromContext(ctx)

    expect(calls).toHaveLength(2)
    expect(calls.map(call => call.basedir)).toEqual([
      path.dirname(entryA),
      path.dirname(entryB),
    ])

    await patcher.patch()
    expect(createdPatchers[0].patch).toHaveBeenCalledTimes(1)
    expect(createdPatchers[1].patch).toHaveBeenCalledTimes(1)

    const classSet = await patcher.getClassSet()
    expect(Array.from(classSet)).toEqual(['foo', 'bar'])

    const extracted = await patcher.extract({})
    expect(Array.from(extracted.classSet)).toEqual(['foo', 'bar'])
    expect(extracted.classList).toEqual(['foo', 'bar'])
  })

  it('returns a single patcher when css entries share the same base directory', async () => {
    const createdPatchers: TailwindcssPatcherLike[] = []
    const calls: CreateTailwindcssPatcherOptions[] = []
    const createTailwindcssPatcher = vi.fn((options: CreateTailwindcssPatcherOptions) => {
      calls.push(options)
      const stub: TailwindcssPatcherLike = {
        packageInfo: { version: '4.1.0' } as any,
        majorVersion: 4,
        options,
        patch: vi.fn(async () => ({})),
        getClassSet: vi.fn(async () => new Set(['foo'])),
        extract: vi.fn(async () => ({
          classList: ['foo'],
          classSet: new Set(['foo']),
        })),
      }
      createdPatchers.push(stub)
      return stub
    })

    vi.resetModules()
    vi.doMock('@/tailwindcss', () => ({ createTailwindcssPatcher }))

    const { createTailwindcssPatcherFromContext } = await import('@/context/tailwindcss')
    const workspace = path.resolve('/workspace/project')
    const baseDir = path.join(workspace, 'apps', 'alpha', 'src')
    const ctx = {
      tailwindcssBasedir: undefined,
      supportCustomLengthUnitsPatch: undefined,
      tailwindcss: undefined,
      tailwindcssPatcherOptions: undefined,
      cssEntries: [
        path.join(baseDir, 'app.css'),
        path.join(baseDir, 'other.css'),
      ],
      appType: 'taro',
    } as unknown as InternalUserDefinedOptions

    const patcher = createTailwindcssPatcherFromContext(ctx)

    expect(createTailwindcssPatcher).toHaveBeenCalledTimes(1)
    expect(patcher).toBe(createdPatchers[0])
    expect(calls[0].tailwindcss?.v4?.cssEntries).toEqual([
      path.join(baseDir, 'app.css'),
      path.join(baseDir, 'other.css'),
    ])
  })
})
