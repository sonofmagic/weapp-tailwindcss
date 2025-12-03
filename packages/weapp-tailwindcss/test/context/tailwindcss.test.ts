import type { CreateTailwindcssPatcherOptions } from '@/tailwindcss/patcher'
import type { InternalUserDefinedOptions, TailwindcssPatcherLike } from '@/types'
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
    vi.doUnmock('@/tailwindcss/patcher')
    vi.resetModules()
  })

  it('creates multiple patchers when css entries belong to different package roots', async () => {
    const calls: CreateTailwindcssPatcherOptions[] = []
    const createdPatchers: TailwindcssPatcherLike[] = []
    const classSets = [['foo'], ['bar']]

    vi.resetModules()
    vi.doMock('@/tailwindcss/patcher', () => {
      return {
        createTailwindcssPatcher: vi.fn((options: CreateTailwindcssPatcherOptions) => {
          calls.push(options)
          const classes = classSets[createdPatchers.length] ?? []
          const stub: TailwindcssPatcherLike = {
            packageInfo: { version: '4.1.0' } as any,
            majorVersion: 4,
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
        supportCustomLengthUnitsPatch: undefined,
        tailwindcss: undefined,
        tailwindcssPatcherOptions: undefined,
        cssEntries: [entryA, entryB],
        appType: 'taro',
      } as unknown as InternalUserDefinedOptions

      const patcher = createTailwindcssPatcherFromContext(ctx)

      expect(calls).toHaveLength(2)
      expect(calls.map(call => call.basedir)).toEqual([
        workspace,
        externalRoot,
      ])

      await patcher.patch()
      expect(createdPatchers[0].patch).toHaveBeenCalledTimes(1)
      expect(createdPatchers[1].patch).toHaveBeenCalledTimes(1)

      const classSet = await patcher.getClassSet()
      expect(Array.from(classSet)).toEqual(['foo', 'bar'])

      const extracted = await patcher.extract({})
      expect(Array.from(extracted.classSet)).toEqual(['foo', 'bar'])
      expect(extracted.classList).toEqual(['foo', 'bar'])
    }
    finally {
      rmSync(workspaceTemp, { recursive: true, force: true })
      rmSync(externalTemp, { recursive: true, force: true })
    }
  })

  it('returns a single patcher when css entries share the same workspace base', async () => {
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
    vi.doMock('@/tailwindcss/patcher', () => ({ createTailwindcssPatcher }))

    const { createTailwindcssPatcherFromContext } = await import('@/context/tailwindcss')
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
        supportCustomLengthUnitsPatch: undefined,
        tailwindcss: undefined,
        tailwindcssPatcherOptions: undefined,
        cssEntries: [entryA, entryB],
        appType: 'taro',
      } as unknown as InternalUserDefinedOptions

      const patcher = createTailwindcssPatcherFromContext(ctx)

      expect(createTailwindcssPatcher).toHaveBeenCalledTimes(1)
      expect(patcher).toBe(createdPatchers[0])
      expect(calls[0].basedir).toBe(workspace)
      expect(calls[0].tailwindcss?.v4?.base).toBe(workspace)
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

  it('detects default cssEntries for rax projects when omitted', async () => {
    const createdPatchers: TailwindcssPatcherLike[] = []
    const createTailwindcssPatcher = vi.fn((options: CreateTailwindcssPatcherOptions) => {
      const stub: TailwindcssPatcherLike = {
        packageInfo: { version: '4.1.0' } as any,
        majorVersion: 4,
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
    vi.doMock('@/tailwindcss/patcher', () => ({ createTailwindcssPatcher }))

    const { createTailwindcssPatcherFromContext } = await import('@/context/tailwindcss')
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'weapp-tw-rax-'))
    const projectRoot = path.join(tempRoot, 'rax-app')
    mkdirSync(path.join(projectRoot, 'src'), { recursive: true })
    const globalEntry = path.join(projectRoot, 'src', 'global.scss')
    writeFileSync(globalEntry, '@import "tailwindcss";')

    try {
      const ctx = {
        tailwindcssBasedir: projectRoot,
        supportCustomLengthUnitsPatch: undefined,
        tailwindcss: undefined,
        tailwindcssPatcherOptions: undefined,
        cssEntries: undefined,
        appType: 'rax',
      } as unknown as InternalUserDefinedOptions

      const patcher = createTailwindcssPatcherFromContext(ctx)
      expect(patcher).toBe(createdPatchers[0])
      expect(createTailwindcssPatcher).toHaveBeenCalledTimes(1)
      expect(createTailwindcssPatcher).toHaveBeenCalledWith(expect.objectContaining({
        tailwindcss: expect.objectContaining({
          v4: expect.objectContaining({
            cssEntries: [globalEntry],
          }),
        }),
      }))
      expect(ctx.cssEntries).toEqual([globalEntry])
    }
    finally {
      rmSync(tempRoot, { recursive: true, force: true })
    }
  })

  it('infers cssEntries from package.json when appType is missing but project depends on rax', async () => {
    const createTailwindcssPatcher = vi.fn((options: CreateTailwindcssPatcherOptions) => {
      const stub: TailwindcssPatcherLike = {
        packageInfo: { version: '4.1.0' } as any,
        majorVersion: 4,
        options: options as any,
        patch: vi.fn(async () => ({})),
        getClassSet: vi.fn(async () => new Set(['foo'])),
        extract: vi.fn(async () => ({
          classList: ['foo'],
          classSet: new Set(['foo']),
        })),
      }
      return stub
    })

    vi.resetModules()
    vi.doMock('@/tailwindcss/patcher', () => ({ createTailwindcssPatcher }))

    const { createTailwindcssPatcherFromContext } = await import('@/context/tailwindcss')
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'weapp-tw-rax-auto-'))
    const projectRoot = path.join(tempRoot, 'rax-auto')
    mkdirSync(path.join(projectRoot, 'src'), { recursive: true })
    const globalEntry = path.join(projectRoot, 'src', 'global.css')
    writeFileSync(globalEntry, '@import "tailwindcss";')
    writeFileSync(path.join(projectRoot, 'package.json'), JSON.stringify({
      name: 'auto-rax',
      version: '0.0.1',
      dependencies: {
        rax: '^1.0.0',
      },
    }))

    try {
      const ctx = {
        tailwindcssBasedir: projectRoot,
        supportCustomLengthUnitsPatch: undefined,
        tailwindcss: undefined,
        tailwindcssPatcherOptions: undefined,
        cssEntries: undefined,
        appType: undefined,
      } as unknown as InternalUserDefinedOptions

      createTailwindcssPatcherFromContext(ctx)
      expect(ctx.cssEntries).toEqual([globalEntry])
    }
    finally {
      rmSync(tempRoot, { recursive: true, force: true })
    }
  })
})
