import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const getPackageInfoMock = vi.fn()
const loggerWarnMock = vi.fn()
const loggerErrorMock = vi.fn()

vi.mock('@weapp-tailwindcss/logger', () => ({
  logger: {
    warn: loggerWarnMock,
    success: vi.fn(),
    info: vi.fn(),
    error: loggerErrorMock,
    debug: vi.fn(),
  },
  pc: new Proxy(() => '', {
    apply() {
      return ''
    },
    get() {
      return () => ''
    },
  }),
}))

vi.mock('local-pkg', () => ({
  getPackageInfoSync: getPackageInfoMock,
}))

describe('tailwindcss helpers', () => {
  beforeEach(() => {
    getPackageInfoMock.mockReset()
    loggerWarnMock.mockClear()
    loggerErrorMock.mockClear()
    vi.resetModules()
  })

  it('returns undefined when tailwind package is missing', async () => {
    getPackageInfoMock.mockReturnValueOnce(undefined)

    const { getTailwindcssPackageInfo } = await import('@/tailwindcss')

    expect(getTailwindcssPackageInfo()).toBeUndefined()
    expect(getPackageInfoMock).toHaveBeenCalledWith('tailwindcss', undefined)
  })

  it('forwards resolving options to local-pkg', async () => {
    const pkg = {
      name: 'tailwindcss',
      version: '3.4.0',
      rootPath: '/tmp/tailwindcss',
      packageJsonPath: '/tmp/tailwindcss/package.json',
      packageJson: { name: 'tailwindcss' },
    }
    getPackageInfoMock.mockReturnValueOnce(pkg)

    const { getTailwindcssPackageInfo } = await import('@/tailwindcss')

    const result = getTailwindcssPackageInfo({ paths: ['/repo'] })

    expect(result).toBe(pkg)
    expect(getPackageInfoMock).toHaveBeenCalledWith('tailwindcss', { paths: ['/repo'] })
  })

  it('creates tailwindcss patcher with resolved cache directory', async () => {
    const { createTailwindcssPatcher } = await import('@/tailwindcss')

    const patcher = createTailwindcssPatcher({
      basedir: '/repo',
      cacheDir: 'cache',
      supportCustomLengthUnitsPatch: false,
    }) as any

    const callArgs = patcher.options as any
    expect(callArgs.cache).toMatchObject({ dir: path.resolve('/repo', 'cache') })
    expect(callArgs.cache?.driver).toBe('memory')
    expect(callArgs.apply?.extendLengthUnits).toBe(false)
    // 源码使用 path.resolve(basedir) 得到平台原生路径
    expect(callArgs.projectRoot).toBe(path.resolve('/repo'))
    expect(Array.isArray(callArgs.tailwindcss?.resolve?.paths)).toBe(true)
  })

  it('honours absolute cache directories', async () => {
    const { createTailwindcssPatcher } = await import('@/tailwindcss')

    const patcher = createTailwindcssPatcher({
      cacheDir: '/global/cache',
    })

    const callArgs = patcher.options as any
    expect(callArgs.cache).toEqual({ dir: '/global/cache', driver: 'memory', enabled: true })
  })

  it('enables extendLengthUnits patch by default', async () => {
    const { createTailwindcssPatcher } = await import('@/tailwindcss')

    const patcher = createTailwindcssPatcher()

    const callArgs = patcher.options as any
    expect(callArgs.apply?.extendLengthUnits).toEqual({ enabled: true })
  })

  it('falls back to cwd when basedir is not provided', async () => {
    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue('/workspace')
    const { createTailwindcssPatcher } = await import('@/tailwindcss')

    const patcher = createTailwindcssPatcher({ cacheDir: '.cache' })

    const callArgs = patcher.options as any
    expect(callArgs.cache).toEqual({ dir: path.resolve('/workspace', '.cache'), driver: 'memory', enabled: true })
    cwdSpy.mockRestore()
  })

  it('defaults cache directory to package root node_modules cache', async () => {
    const { createTailwindcssPatcher } = await import('@/tailwindcss')
    const repoRoot = path.resolve(__dirname, '../../../..')
    const basedir = path.join(repoRoot, 'packages', 'weapp-tailwindcss', 'src')

    const patcher = createTailwindcssPatcher({ basedir })

    const callArgs = patcher.options as any
    expect(callArgs.cache?.dir).toBe(
      path.join(repoRoot, 'packages', 'weapp-tailwindcss', 'node_modules', '.cache', '@tailwindcss-mangle', 'engine'),
    )
  })

  it('creates inert metadata when tailwindcss package is missing', async () => {
    const { createTailwindcssPatcher } = await import('@/tailwindcss')

    const patcher = createTailwindcssPatcher({
      tailwindcss: {
        packageName: 'missing-tailwindcss',
      },
    })

    expect(loggerWarnMock).not.toHaveBeenCalled()
    expect(patcher.packageInfo.version).toBeUndefined()
    expect(patcher.packageInfo.name).toBe('missing-tailwindcss')
    expect(patcher.majorVersion).toBe(4)
    expect(patcher.getClassSet).toBeDefined()
    expect(patcher.extract).toBeDefined()
  })

  it('resolves tailwindcss postcss plugin from basedir node_modules', async () => {
    const { createTailwindcssPatcher } = await import('@/tailwindcss')
    const repoRoot = path.resolve(__dirname, '../../../..')

    const patcher = createTailwindcssPatcher({
      basedir: repoRoot,
    })

    const callArgs = patcher.options as any
    expect(callArgs.tailwindcss?.postcssPlugin).toBeDefined()
    expect(typeof callArgs.tailwindcss?.postcssPlugin).toBe('string')
    expect(path.isAbsolute(callArgs.tailwindcss?.postcssPlugin)).toBe(true)
  })

  it('uses tailwindcss package as postcss plugin when packageName points to v4 package without explicit version', async () => {
    const { createTailwindcssPatcher } = await import('@/tailwindcss')

    const patcher = createTailwindcssPatcher({
      basedir: '/repo',
      tailwindcss: {
        packageName: '@tailwindcss/postcss',
      },
    })

    const callArgs = patcher.options as any
    const postcssPlugin = String(callArgs.tailwindcss?.postcssPlugin).replaceAll('\\', '/')
    expect(postcssPlugin).toContain('/tailwindcss/')
    expect(postcssPlugin).not.toContain('@tailwindcss/postcss')
  })

  it('resolves postcss plugin strings after legacy patcher options merge', async () => {
    const { createTailwindcssPatcher } = await import('@/tailwindcss')

    const patcher = createTailwindcssPatcher({
      basedir: path.resolve(__dirname, '../../../..'),
      tailwindcssPatcherOptions: {
        tailwindcss: {
          postcssPlugin: 'tailwindcss',
        },
      },
    })

    const callArgs = patcher.options as any
    expect(path.isAbsolute(callArgs.tailwindcss?.postcssPlugin)).toBe(true)
  })

  it('keeps custom resolve paths while appending default lookup paths', async () => {
    const { createTailwindcssPatcher } = await import('@/tailwindcss')
    const repoRoot = path.resolve(__dirname, '../../../..')
    const appRoot = path.join(repoRoot, 'templates', 'demo')
    const customNodeModules = path.join(appRoot, 'node_modules')

    const patcher = createTailwindcssPatcher({
      basedir: appRoot,
      tailwindcss: {
        packageName: '@tailwindcss/postcss',
        resolve: {
          paths: [customNodeModules],
        },
      },
    })

    const callArgs = patcher.options as any
    const resolvePaths = callArgs.tailwindcss?.resolve?.paths ?? []
    expect(resolvePaths[0]).toBe(customNodeModules)
    expect(resolvePaths).toContain(path.join(repoRoot, 'node_modules'))
    const postcssPlugin = String(callArgs.tailwindcss?.postcssPlugin).replaceAll('\\', '/')
    expect(postcssPlugin).toContain('/tailwindcss/')
    expect(postcssPlugin).not.toContain('@tailwindcss/postcss')
  })

  it('falls back to default tailwind config when project has none', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'wtw-tailwind-no-config-'))
    const { createTailwindcssPatcher } = await import('@/tailwindcss')

    try {
      const patcher = createTailwindcssPatcher({
        basedir: tempDir,
      })
      const callArgs = patcher.options as any
      expect(callArgs.tailwindcss?.config).toBeDefined()
      expect(typeof callArgs.tailwindcss?.config).toBe('string')
      expect(path.isAbsolute(callArgs.tailwindcss?.config)).toBe(true)
    }
    finally {
      await rm(tempDir, { recursive: true, force: true })
    }
  })

  it('sets cwd from discovered tailwind config when cwd is not provided', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'wtw-tailwind-config-cwd-'))
    const { createTailwindcssPatcher } = await import('@/tailwindcss')

    try {
      await writeFile(path.join(tempDir, 'tailwind.config.js'), 'export default {}')
      const patcher = createTailwindcssPatcher({
        tailwindcss: {
          resolve: {
            paths: [path.join(tempDir, 'node_modules')],
          },
        },
      })
      const callArgs = patcher.options as any
      expect(callArgs.tailwindcss?.config).toBe(path.join(tempDir, 'tailwind.config.js'))
      expect(callArgs.tailwindcss?.cwd).toBe(tempDir)
    }
    finally {
      await rm(tempDir, { recursive: true, force: true })
    }
  })

  it('keeps missing package names in resolved options', async () => {
    const { createTailwindcssPatcher } = await import('@/tailwindcss')

    const patcher = createTailwindcssPatcher({
      tailwindcss: {
        packageName: 'missing-tailwindcss',
      },
    })

    expect(patcher.options?.tailwindcss?.packageName).toBe('missing-tailwindcss')
    expect(loggerErrorMock).not.toHaveBeenCalled()
  })
})
