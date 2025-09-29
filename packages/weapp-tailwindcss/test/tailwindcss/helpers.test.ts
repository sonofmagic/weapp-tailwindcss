import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const getPackageInfoMock = vi.fn()
const tailwindcssPatcherMock = vi.fn().mockImplementation(function TailwindcssPatcher(options) {
  this.options = options
  this.packageInfo = { version: '3.4.17' }
  this.majorVersion = 4
})

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
    expect(callArgs.cache).toEqual({ dir: path.resolve('/repo', 'cache') })
    expect(callArgs.patch.applyPatches.extendLengthUnits).toBe(false)
    expect(callArgs.patch.basedir).toBe('/repo')
    expect(Array.isArray(callArgs.patch.resolve.paths)).toBe(true)
    expect(patcher.packageInfo.version).toBe('3.4.17')
  })

  it('honours absolute cache directories', async () => {
    const { createTailwindcssPatcher } = await import('@/tailwindcss')

    createTailwindcssPatcher({
      cacheDir: '/global/cache',
    })

    const callArgs = tailwindcssPatcherMock.mock.calls.at(-1)?.[0] as any
    expect(callArgs.cache).toEqual({ dir: '/global/cache' })
  })

  it('falls back to cwd when basedir is not provided', async () => {
    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue('/workspace')
    const { createTailwindcssPatcher } = await import('@/tailwindcss')

    createTailwindcssPatcher({ cacheDir: '.cache' })

    const callArgs = tailwindcssPatcherMock.mock.calls.at(-1)?.[0] as any
    expect(callArgs.cache).toEqual({ dir: path.resolve('/workspace', '.cache') })
    cwdSpy.mockRestore()
  })
})
