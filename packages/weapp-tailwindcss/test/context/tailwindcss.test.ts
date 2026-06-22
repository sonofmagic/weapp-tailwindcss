import type { CreateTailwindcssRuntimeOptions } from '@/tailwindcss/runtime-factory'
import type { InternalUserDefinedOptions, TailwindcssRuntimeLike } from '@/types'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
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
    process.env.npm_package_json = '/workspace/demo/weapp-vite-tailwindcss-v4/package.json'

    const { resolveTailwindcssBasedir } = await import('@/context/tailwindcss')

    // npm_package_json 为绝对路径，取其 dirname 后经 path.normalize 返回
    expect(resolveTailwindcssBasedir()).toBe(path.normalize('/workspace/demo/weapp-vite-tailwindcss-v4'))
  })

  it('resolves relative base against generic env anchor (prefers INIT_CWD over PWD)', async () => {
    process.env.PWD = '/anchor/from-pwd'
    process.env.INIT_CWD = '/ignored-init-cwd'
    const { resolveTailwindcssBasedir } = await import('@/context/tailwindcss')

    // 相对路径基于 INIT_CWD 锚点 resolve，Windows 下会带盘符
    expect(resolveTailwindcssBasedir('./apps/demo')).toBe(path.resolve('/ignored-init-cwd', './apps/demo'))
  })

  it('falls back to PWD when INIT_CWD is absent', async () => {
    process.env.PWD = '/anchor/from-pwd-only'
    delete process.env.INIT_CWD
    const { resolveTailwindcssBasedir } = await import('@/context/tailwindcss')

    // 相对路径基于 PWD 锚点 resolve
    expect(resolveTailwindcssBasedir('./apps/demo')).toBe(path.resolve('/anchor/from-pwd-only', './apps/demo'))
  })

  it('prefers specific base env over generic anchors', async () => {
    process.env.PWD = '/generic/pwd'
    process.env.WEAPP_TAILWINDCSS_BASEDIR = '/specific/base'
    const { resolveTailwindcssBasedir } = await import('@/context/tailwindcss')

    // 相对路径基于 WEAPP_TAILWINDCSS_BASEDIR 锚点 resolve
    expect(resolveTailwindcssBasedir('./tailwind')).toBe(path.resolve('/specific/base', './tailwind'))
  })

  it('returns a specific env basedir when no explicit basedir is provided', async () => {
    process.env.WEAPP_TAILWINDCSS_BASE_DIR = '/specific/base-dir'
    process.env.PWD = '/generic/pwd'
    const { resolveTailwindcssBasedir } = await import('@/context/tailwindcss')

    expect(resolveTailwindcssBasedir()).toBe(path.normalize('/specific/base-dir'))
  })

  it('resolves explicit relative basedir against the selected anchor', async () => {
    process.env.TAILWINDCSS_BASEDIR = '/tailwind/env-base'
    const { resolveTailwindcssBasedir } = await import('@/context/tailwindcss')

    expect(resolveTailwindcssBasedir('packages/app')).toBe(path.resolve('/tailwind/env-base', 'packages/app'))
    expect(resolveTailwindcssBasedir('/absolute/app')).toBe(path.normalize('/absolute/app'))
  })

  it('falls back to provided fallback when env not set', async () => {
    delete process.env.PWD
    delete process.env.INIT_CWD
    const { resolveTailwindcssBasedir } = await import('@/context/tailwindcss')

    expect(resolveTailwindcssBasedir(undefined, '/custom/fallback')).toBe(path.normalize('/custom/fallback'))
  })

  it('uses npm_config_local_prefix when npm_package_json is absent', async () => {
    delete process.env.PWD
    delete process.env.INIT_CWD
    delete process.env.npm_package_json
    process.env.npm_config_local_prefix = '/workspace/local-prefix'
    const { resolveTailwindcssBasedir } = await import('@/context/tailwindcss')

    expect(resolveTailwindcssBasedir()).toBe(path.normalize('/workspace/local-prefix'))
  })

  it('ignores blank explicit basedir and resolves fallback from package env anchor', async () => {
    delete process.env.PWD
    delete process.env.INIT_CWD
    process.env.npm_package_json = '/workspace/app/package.json'
    const { resolveTailwindcssBasedir } = await import('@/context/tailwindcss')

    expect(resolveTailwindcssBasedir('  ', './fallback')).toBe(path.resolve('/workspace/app', './fallback'))
  })

  it('ignores relative package env paths and falls back to cwd', async () => {
    delete process.env.PWD
    delete process.env.INIT_CWD
    process.env.npm_package_json = 'relative/package.json'
    process.env.npm_config_local_prefix = 'relative'

    const { resolveTailwindcssBasedir } = await import('@/context/tailwindcss')

    expect(resolveTailwindcssBasedir()).toBe(path.normalize(process.cwd()))
  })

})

describe('createTailwindcssRuntimeFromContext', () => {
  afterEach(() => {
    vi.doUnmock('@/tailwindcss/runtime-factory')
    vi.resetModules()
  })

  it('creates multiple runtimes when css entries belong to different package roots', async () => {
    const calls: CreateTailwindcssRuntimeOptions[] = []
    const createdRuntimes: TailwindcssRuntimeLike[] = []
    const classSets = [['foo'], ['bar']]

    vi.resetModules()
    vi.doMock('@/tailwindcss/runtime-factory', () => {
      const createTailwindcssRuntime = vi.fn((options: CreateTailwindcssRuntimeOptions) => {
        calls.push(options)
        const classes = classSets[createdRuntimes.length] ?? []
        const stub: TailwindcssRuntimeLike = {
          packageInfo: { version: '4.1.0' } as any,
          majorVersion: 4,
          options: options as any,
          getClassSet: vi.fn(async () => new Set(classes)),
          extract: vi.fn(async () => ({
            classList: classes,
            classSet: new Set(classes),
          })),
        }
        createdRuntimes.push(stub)
        return stub
      })
      return {
        createTailwindcssRuntime,
      }
    })

    const { createTailwindcssRuntimeFromContext } = await import('@/context/tailwindcss')

    const workspaceTemp = mkdtempSync(path.join(os.tmpdir(), 'weapp-tw-workspace-'))
    const workspace = path.join(workspaceTemp, 'project')
    mkdirSync(path.join(workspace, 'apps', 'alpha', 'src'), { recursive: true })
    writeFileSync(path.join(workspace, 'package.json'), JSON.stringify({ name: 'workspace-root' }))
    writeFileSync(path.join(workspace, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n')
    writeFileSync(path.join(workspace, 'apps', 'alpha', 'package.json'), JSON.stringify({ name: 'alpha' }))
    const entryA = path.join(workspace, 'apps', 'alpha', 'src', 'app.css')

    const externalTemp = mkdtempSync(path.join(os.tmpdir(), 'weapp-tw-external-'))
    const externalRoot = path.join(externalTemp, 'external')
    mkdirSync(path.join(externalRoot, 'src'), { recursive: true })
    writeFileSync(path.join(externalRoot, 'package.json'), JSON.stringify({ name: 'external-app' }))
    const entryB = path.join(externalRoot, 'src', 'app.css')

    try {
      const ctx = {
        tailwindcssBasedir: workspace,
        supportCustomLengthUnits: undefined,
        tailwindcss: undefined,
        tailwindcssRuntimeOptions: undefined,
        cssEntries: [entryA, entryB],
        appType: 'taro',
      } as unknown as InternalUserDefinedOptions

      const runtime = createTailwindcssRuntimeFromContext(ctx)

      expect(calls).toHaveLength(2)
      const basedirs = calls.map(call => call.basedir)
      expect(new Set(basedirs)).toEqual(new Set([workspace, externalRoot]))
      expect(basedirs.filter(b => b === workspace)).toHaveLength(1)
      expect(basedirs.filter(b => b === externalRoot)).toHaveLength(1)
      expect(calls.map(call => call.tailwindcss?.packageName)).toEqual(['tailwindcss', 'tailwindcss'])

      const classSet = await runtime.getClassSet()
      expect([...classSet]).toEqual(['foo', 'bar'])

      const extracted = await runtime.extract({})
      expect([...extracted.classSet]).toEqual(['foo', 'bar'])
      expect(extracted.classList).toEqual(['foo', 'bar'])
    }
    finally {
      rmSync(workspaceTemp, { recursive: true, force: true })
      rmSync(externalTemp, { recursive: true, force: true })
    }
  })

  it('returns a single runtime when css entries share the same workspace base', async () => {
    const createdRuntimes: TailwindcssRuntimeLike[] = []
    const calls: CreateTailwindcssRuntimeOptions[] = []
    const createTailwindcssRuntime = vi.fn((options: CreateTailwindcssRuntimeOptions) => {
      calls.push(options)
      const stub: TailwindcssRuntimeLike = {
        packageInfo: { version: '4.1.0' } as any,
        majorVersion: 4,
        // 测试仅校验结构传递，避免在此处施加过严的类型约束
        options: options as any,
        getClassSet: vi.fn(async () => new Set(['foo'])),
        extract: vi.fn(async () => ({
          classList: ['foo'],
          classSet: new Set(['foo']),
        })),
      }
      createdRuntimes.push(stub)
      return stub
    })

    vi.resetModules()
    vi.doMock('@/tailwindcss/runtime-factory', () => ({
      createTailwindcssRuntime,
    }))

    const { createTailwindcssRuntimeFromContext } = await import('@/context/tailwindcss')
    const workspaceTemp = mkdtempSync(path.join(os.tmpdir(), 'weapp-tw-single-'))
    const workspace = path.join(workspaceTemp, 'project')
    mkdirSync(path.join(workspace, 'apps', 'alpha', 'src'), { recursive: true })
    mkdirSync(path.join(workspace, 'apps', 'beta', 'src'), { recursive: true })
    writeFileSync(path.join(workspace, 'package.json'), JSON.stringify({ name: 'workspace-root' }))
    writeFileSync(path.join(workspace, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n')
    writeFileSync(path.join(workspace, 'apps', 'alpha', 'package.json'), JSON.stringify({ name: 'alpha' }))
    writeFileSync(path.join(workspace, 'apps', 'beta', 'package.json'), JSON.stringify({ name: 'beta' }))
    const entryA = path.join(workspace, 'apps', 'alpha', 'src', 'app.css')
    const entryB = path.join(workspace, 'apps', 'beta', 'src', 'other.css')

    try {
      const ctx = {
        tailwindcssBasedir: workspace,
        supportCustomLengthUnits: undefined,
        tailwindcss: undefined,
        tailwindcssRuntimeOptions: undefined,
        cssEntries: [entryA, entryB],
        appType: 'taro',
      } as unknown as InternalUserDefinedOptions

      const _runtime = createTailwindcssRuntimeFromContext(ctx)

      expect(createTailwindcssRuntime).toHaveBeenCalledTimes(1)
      expect(new Set(calls.map(call => call.basedir))).toEqual(new Set([workspace]))
      expect(calls[0].tailwindcss?.v4?.base).toBeUndefined()
      expect(calls[0].tailwindcss?.packageName).toBe('tailwindcss')
      expect(calls[0].tailwindcss?.v4?.cssEntries).toEqual([
        entryA,
        entryB,
      ])
      expect(ctx.cssEntries).toEqual([
        entryA,
        entryB,
      ])
    }
    finally {
      rmSync(workspaceTemp, { recursive: true, force: true })
    }
  })

  it('disables custom length units for web generator target', async () => {
    const calls: CreateTailwindcssRuntimeOptions[] = []
    const createTailwindcssRuntime = vi.fn((options: CreateTailwindcssRuntimeOptions) => {
      calls.push(options)
      return {
        packageInfo: { version: '4.1.0' } as any,
        majorVersion: 4,
        options: options as any,
        getClassSet: vi.fn(async () => new Set<string>()),
        extract: vi.fn(async () => ({
          classList: [],
          classSet: new Set<string>(),
        })),
      } as TailwindcssRuntimeLike
    })

    vi.resetModules()
    vi.doMock('@/tailwindcss/runtime-factory', () => ({
      createTailwindcssRuntime,
    }))

    const { createTailwindcssRuntimeFromContext } = await import('@/context/tailwindcss')

    createTailwindcssRuntimeFromContext({
      tailwindcssBasedir: '/workspace/website',
      supportCustomLengthUnits: undefined,
      tailwindcss: undefined,
      tailwindcssRuntimeOptions: undefined,
      cssEntries: ['/workspace/website/src/css/tailwind.css'],
      appType: undefined,
      arbitraryValues: { allowDoubleQuotes: false, bareArbitraryValues: false },
      generator: {
        target: 'web',
      },
    } as unknown as InternalUserDefinedOptions)

    expect(createTailwindcssRuntime).toHaveBeenCalledTimes(1)
    expect(calls[0].supportCustomLengthUnits).toBe(false)
  })

})
