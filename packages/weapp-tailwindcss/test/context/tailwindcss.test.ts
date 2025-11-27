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
    vi.doUnmock('@/context/workspace')
  })

  it('prefers npm_package_json directory when available', async () => {
    process.env.npm_package_json = '/workspace/apps/vite-native-skyline/package.json'

    const { resolveTailwindcssBasedir } = await import('@/context/tailwindcss')

    expect(resolveTailwindcssBasedir()).toBe(path.normalize('/workspace/apps/vite-native-skyline'))
  })

  it('resolves relative base against generic env anchor (prefers INIT_CWD over PWD)', async () => {
    process.env.PWD = '/anchor/from-pwd'
    process.env.INIT_CWD = '/ignored-init-cwd'
    const { resolveTailwindcssBasedir } = await import('@/context/tailwindcss')

    expect(resolveTailwindcssBasedir('./apps/demo')).toBe(path.normalize('/ignored-init-cwd/apps/demo'))
  })

  it('falls back to PWD when INIT_CWD is absent', async () => {
    process.env.PWD = '/anchor/from-pwd-only'
    delete process.env.INIT_CWD
    const { resolveTailwindcssBasedir } = await import('@/context/tailwindcss')

    expect(resolveTailwindcssBasedir('./apps/demo')).toBe(path.normalize('/anchor/from-pwd-only/apps/demo'))
  })

  it('prefers specific base env over generic anchors', async () => {
    process.env.PWD = '/generic/pwd'
    process.env.WEAPP_TAILWINDCSS_BASEDIR = '/specific/base'
    const { resolveTailwindcssBasedir } = await import('@/context/tailwindcss')

    expect(resolveTailwindcssBasedir('./tailwind')).toBe(path.normalize('/specific/base/tailwind'))
  })

  it('falls back to provided fallback when env not set', async () => {
    delete process.env.PWD
    delete process.env.INIT_CWD
    const { resolveTailwindcssBasedir } = await import('@/context/tailwindcss')

    expect(resolveTailwindcssBasedir(undefined, '/custom/fallback')).toBe(path.normalize('/custom/fallback'))
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
            // 测试仅校验结构传递，避免在此处施加过严的类型约束
            options: options as any,
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
        // 测试仅校验结构传递，避免在此处施加过严的类型约束
        options: options as any,
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
