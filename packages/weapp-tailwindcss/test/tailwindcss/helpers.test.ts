import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const getPackageInfoMock = vi.fn()
const tailwindcssPatcherMock = vi.fn(function TailwindcssPatcher(this: any, options: any) {
  this.options = options
  this.packageInfo = { version: '3.4.17' }
  this.majorVersion = 4
})
const loggerWarnMock = vi.fn()

vi.mock('@weapp-tailwindcss/logger', () => ({
  logger: {
    warn: loggerWarnMock,
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
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

vi.mock('tailwindcss-patch', () => ({
  TailwindcssPatcher: tailwindcssPatcherMock,
}))

describe('tailwindcss helpers', () => {
  beforeEach(() => {
    getPackageInfoMock.mockReset()
    tailwindcssPatcherMock.mockClear()
    loggerWarnMock.mockClear()
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

    expect(tailwindcssPatcherMock).toHaveBeenCalledTimes(1)
    const callArgs = tailwindcssPatcherMock.mock.calls[0][0] as any
    expect(callArgs.cache).toMatchObject({ dir: path.resolve('/repo', 'cache') })
    expect(callArgs.cache?.driver).toBe('memory')
    expect(callArgs.features?.extendLengthUnits).toBe(false)
    expect(callArgs.cwd).toBe('/repo')
    expect(Array.isArray(callArgs.tailwind?.resolve?.paths)).toBe(true)
    expect(patcher.packageInfo.version).toBe('3.4.17')
  })

  it('honours absolute cache directories', async () => {
    const { createTailwindcssPatcher } = await import('@/tailwindcss')

    createTailwindcssPatcher({
      cacheDir: '/global/cache',
    })

    const lastCall = tailwindcssPatcherMock.mock.calls[tailwindcssPatcherMock.mock.calls.length - 1]
    const callArgs = lastCall?.[0] as any
    expect(callArgs.cache).toEqual({ dir: '/global/cache', driver: 'memory' })
  })

  it('enables extendLengthUnits patch by default', async () => {
    const { createTailwindcssPatcher } = await import('@/tailwindcss')

    createTailwindcssPatcher()

    const lastCall = tailwindcssPatcherMock.mock.calls[tailwindcssPatcherMock.mock.calls.length - 1]
    const callArgs = lastCall?.[0] as any
    expect(callArgs.features?.extendLengthUnits).toEqual({ enabled: true })
  })

  it('falls back to cwd when basedir is not provided', async () => {
    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue('/workspace')
    const { createTailwindcssPatcher } = await import('@/tailwindcss')

    createTailwindcssPatcher({ cacheDir: '.cache' })

    const lastCall = tailwindcssPatcherMock.mock.calls[tailwindcssPatcherMock.mock.calls.length - 1]
    const callArgs = lastCall?.[0] as any
    expect(callArgs.cache).toEqual({ dir: path.resolve('/workspace', '.cache'), driver: 'memory' })
    cwdSpy.mockRestore()
  })

  it('defaults cache directory to package root node_modules cache', async () => {
    const { createTailwindcssPatcher } = await import('@/tailwindcss')
    const repoRoot = path.resolve(__dirname, '../../../..')
    const basedir = path.join(repoRoot, 'packages', 'weapp-tailwindcss', 'src')

    createTailwindcssPatcher({ basedir })

    const lastCall = tailwindcssPatcherMock.mock.calls[tailwindcssPatcherMock.mock.calls.length - 1]
    const callArgs = lastCall?.[0] as any
    expect(callArgs.cache?.dir).toBe(
      path.join(repoRoot, 'packages', 'weapp-tailwindcss', 'node_modules', '.cache', 'tailwindcss-patch'),
    )
  })

  it('gracefully falls back when tailwindcss is missing', async () => {
    tailwindcssPatcherMock.mockImplementationOnce(() => {
      throw new Error('tailwindcss not found')
    })

    const { createTailwindcssPatcher } = await import('@/tailwindcss')

    const patcher = createTailwindcssPatcher()

    expect(loggerWarnMock).toHaveBeenCalled()
    expect(patcher.packageInfo.version).toBeUndefined()
    await expect(patcher.getClassSet()).resolves.toEqual(new Set())
    await expect(patcher.extract()).resolves.toEqual({
      classList: [],
      classSet: new Set<string>(),
    })
  })

  it('resolves tailwindcss postcss plugin from basedir node_modules', async () => {
    const { createTailwindcssPatcher } = await import('@/tailwindcss')
    const repoRoot = path.resolve(__dirname, '../../../..')

    createTailwindcssPatcher({
      basedir: repoRoot,
    })

    const lastCall = tailwindcssPatcherMock.mock.calls[tailwindcssPatcherMock.mock.calls.length - 1]
    const callArgs = lastCall?.[0] as any
    expect(callArgs.tailwind?.postcssPlugin).toBeDefined()
    expect(typeof callArgs.tailwind?.postcssPlugin).toBe('string')
    expect(path.isAbsolute(callArgs.tailwind?.postcssPlugin)).toBe(true)
  })

  it('falls back to default tailwind config when project has none', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'wtw-tailwind-no-config-'))
    const { createTailwindcssPatcher } = await import('@/tailwindcss')

    try {
      createTailwindcssPatcher({
        basedir: tempDir,
      })
      const lastCall = tailwindcssPatcherMock.mock.calls[tailwindcssPatcherMock.mock.calls.length - 1]
      const callArgs = lastCall?.[0] as any
      expect(callArgs.tailwind?.config).toBeDefined()
      expect(typeof callArgs.tailwind?.config).toBe('string')
      expect(path.isAbsolute(callArgs.tailwind?.config)).toBe(true)
    }
    finally {
      await rm(tempDir, { recursive: true, force: true })
    }
  })
})
