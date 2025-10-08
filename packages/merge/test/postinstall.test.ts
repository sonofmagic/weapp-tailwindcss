import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const fsMock = {
  existsSync: vi.fn(),
  copyFileSync: vi.fn(),
}

const getPackageInfoSyncMock = vi.fn()
const satisfiesMock = vi.fn()

vi.mock('node:fs', () => ({
  default: fsMock,
  ...fsMock,
}))

vi.mock('local-pkg', () => ({
  getPackageInfoSync: getPackageInfoSyncMock,
}))

vi.mock('semver/functions/satisfies.js', () => ({
  default: satisfiesMock,
}))

async function runPostinstall() {
  await import('@/postinstall')
}

describe('postinstall script', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.resetModules()
    fsMock.existsSync.mockReset()
    fsMock.copyFileSync.mockReset()
    getPackageInfoSyncMock.mockReset()
    satisfiesMock.mockReset()
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  it('skips when dist directory does not exist', async () => {
    fsMock.existsSync.mockReturnValue(false)

    await runPostinstall()

    expect(fsMock.existsSync).toHaveBeenCalledTimes(1)
    expect(getPackageInfoSyncMock).not.toHaveBeenCalled()
    expect(fsMock.copyFileSync).not.toHaveBeenCalled()
    expect(consoleWarnSpy).not.toHaveBeenCalled()
  })

  it('warns when tailwindcss package is missing', async () => {
    fsMock.existsSync.mockReturnValue(true)
    getPackageInfoSyncMock.mockReturnValue(undefined)

    await runPostinstall()

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'tailwindcss not found in the project. Skipping swicth version of tailwind-merge.',
    )
    expect(fsMock.copyFileSync).not.toHaveBeenCalled()
  })

  it('copies v2 bundle for tailwindcss v3 projects', async () => {
    fsMock.existsSync.mockReturnValue(true)
    getPackageInfoSyncMock.mockReturnValue({ version: '3.4.0' })
    satisfiesMock.mockReturnValue(false)

    await runPostinstall()

    expect(satisfiesMock).toHaveBeenCalledWith('3.4.0', '^4.0.0')
    expect(fsMock.copyFileSync).toHaveBeenCalledTimes(4)
    const sources = fsMock.copyFileSync.mock.calls.map(([source]) => path.basename(String(source)))
    expect(sources).toEqual(expect.arrayContaining([
      'v3.cjs',
      'v3.d.cts',
      'v3.d.ts',
      'v3.js',
    ]))
    const targets = fsMock.copyFileSync.mock.calls.map(([, target]) => path.basename(String(target)))
    expect(targets).toEqual(expect.arrayContaining([
      'index.cjs',
      'index.d.cts',
      'index.d.ts',
      'index.js',
    ]))
    expect(consoleLogSpy).toHaveBeenCalledWith('Switch version of tailwind-merge to v2.')
  })

  it('copies v3 bundle for tailwindcss v4 projects', async () => {
    fsMock.existsSync.mockReturnValue(true)
    getPackageInfoSyncMock.mockReturnValue({ version: '4.0.1' })
    satisfiesMock.mockReturnValue(true)

    await runPostinstall()

    expect(satisfiesMock).toHaveBeenCalledWith('4.0.1', '^4.0.0')
    expect(fsMock.copyFileSync).toHaveBeenCalledTimes(4)
    const sources = fsMock.copyFileSync.mock.calls.map(([source]) => path.basename(String(source)))
    expect(sources).toEqual(expect.arrayContaining([
      'v4.cjs',
      'v4.d.cts',
      'v4.d.ts',
      'v4.js',
    ]))
    expect(consoleLogSpy).toHaveBeenCalledWith('Switch version of tailwind-merge to v3.')
  })
})
