import { afterEach, describe, expect, it, vi } from 'vitest'
import { setupEnvSandbox } from './helpers'

const getTailwindcssPackageInfoMock = vi.fn()

vi.mock('@/tailwindcss', () => ({
  getTailwindcssPackageInfo: getTailwindcssPackageInfoMock,
}))

describe('uni-app-x preset', () => {
  const env = setupEnvSandbox()
  const originalUtsPlatform = process.env.UNI_UTS_PLATFORM
  const originalUniPlatform = process.env.UNI_PLATFORM

  afterEach(() => {
    env.restore()
    getTailwindcssPackageInfoMock.mockReset()
    if (originalUtsPlatform === undefined) {
      delete process.env.UNI_UTS_PLATFORM
    }
    else {
      process.env.UNI_UTS_PLATFORM = originalUtsPlatform
    }
    if (originalUniPlatform === undefined) {
      delete process.env.UNI_PLATFORM
    }
    else {
      process.env.UNI_PLATFORM = originalUniPlatform
    }
  })

  it('exposes unitsToPx config', async () => {
    env.clearBaseEnv()
    process.env.UNI_UTS_PLATFORM = 'app-android'
    getTailwindcssPackageInfoMock.mockReturnValue(undefined)
    const { uniAppX } = await import('@/presets')
    const result = uniAppX({
      base: '/Users/foo/uni-app-x',
      unitsToPx: {
        unitPrecision: 4,
      },
    })

    expect(result.appType).toBe('uni-app-x')
    expect(result.unitsToPx).toEqual({
      unitPrecision: 4,
    })
  })

  it('exposes generator config for tailwind v4 output control', async () => {
    env.clearBaseEnv()
    getTailwindcssPackageInfoMock.mockReturnValue({
      version: '4.2.2',
    })
    const { uniAppX } = await import('@/presets')
    const result = uniAppX({
      base: '/repo/uni-app-x',
    })

    expect(result.generator).toBeUndefined()
  })

  it('records installed tailwind major version into patcher options', async () => {
    env.clearBaseEnv()
    getTailwindcssPackageInfoMock.mockReturnValue({
      version: '3.4.19',
    })
    const { uniAppX } = await import('@/presets')

    const result = uniAppX({
      base: '/repo/uni-app-x',
      resolve: { paths: ['/repo/uni-app-x'] },
    })

    expect(result.tailwindcssPatcherOptions?.tailwindcss).toMatchObject({
      version: 3,
      packageName: 'tailwindcss',
      postcssPlugin: 'tailwindcss',
      resolve: {
        paths: ['/repo/uni-app-x/node_modules', '/repo/uni-app-x'],
      },
    })
    expect(result.tailwindcss).toMatchObject({
      version: 3,
      packageName: 'tailwindcss',
      postcssPlugin: 'tailwindcss',
      resolve: {
        paths: ['/repo/uni-app-x/node_modules', '/repo/uni-app-x'],
      },
    })
  })

  it('uses base dir as default resolve path and tailwind v4 postcss plugin', async () => {
    env.clearBaseEnv()
    getTailwindcssPackageInfoMock.mockReturnValue({
      version: '4.2.2',
    })
    const { uniAppX } = await import('@/presets')

    const result = uniAppX({
      base: '/repo/uni-app-x',
    })

    expect(result.tailwindcssPatcherOptions?.tailwindcss).toMatchObject({
      version: 4,
      packageName: 'tailwindcss',
      postcssPlugin: '@tailwindcss/postcss',
      resolve: {
        paths: ['/repo/uni-app-x/node_modules', '/repo/uni-app-x'],
      },
    })
  })

  it('skips installed tailwind defaults for unparsable or unsupported versions', async () => {
    env.clearBaseEnv()
    const { uniAppX } = await import('@/presets')

    getTailwindcssPackageInfoMock.mockReturnValueOnce({
      version: 'next',
    })
    const unparsable = uniAppX({
      base: '/repo/uni-app-x',
    })
    expect(unparsable.tailwindcssPatcherOptions?.tailwindcss?.version).toBeUndefined()
    expect(unparsable.tailwindcss?.version).toBeUndefined()

    getTailwindcssPackageInfoMock.mockReturnValueOnce({
      version: '5.0.0',
    })
    const unsupported = uniAppX({
      base: '/repo/uni-app-x',
    })
    expect(unsupported.tailwindcssPatcherOptions?.tailwindcss?.version).toBeUndefined()
    expect(unsupported.tailwindcss?.version).toBeUndefined()
  })

  it('enables component local styles by default in preset output', async () => {
    env.clearBaseEnv()
    process.env.UNI_UTS_PLATFORM = 'app-android'
    getTailwindcssPackageInfoMock.mockReturnValue(undefined)
    const { uniAppX } = await import('@/presets')

    const result = uniAppX({
      base: '/repo/uni-app-x',
    })

    expect(result.uniAppX).toEqual({
      enabled: true,
      componentLocalStyles: {
        enabled: true,
        onlyWhenStyleIsolationVersion2: true,
      },
      uvueUnsupported: 'warn',
    })
  })

  it('allows boolean uniAppX shortcut to override resolved enabled state', async () => {
    env.clearBaseEnv()
    process.env.UNI_UTS_PLATFORM = 'app-android'
    getTailwindcssPackageInfoMock.mockReturnValue(undefined)
    const { uniAppX } = await import('@/presets')

    const result = uniAppX({
      base: '/repo/uni-app-x',
      uniAppX: false,
    })

    expect(result.uniAppX?.enabled).toBe(false)
    expect(result.uniAppX?.componentLocalStyles).toEqual({
      enabled: true,
      onlyWhenStyleIsolationVersion2: true,
    })
  })

  it('allows disabling component local styles from preset options', async () => {
    env.clearBaseEnv()
    process.env.UNI_UTS_PLATFORM = 'app-android'
    getTailwindcssPackageInfoMock.mockReturnValue(undefined)
    const { uniAppX } = await import('@/presets')

    const result = uniAppX({
      base: '/repo/uni-app-x',
      componentLocalStyles: false,
    })

    expect(result.uniAppX).toEqual({
      enabled: true,
      componentLocalStyles: {
        enabled: false,
        onlyWhenStyleIsolationVersion2: true,
      },
      uvueUnsupported: 'warn',
    })
  })

  it('allows fine-grained uniAppX preset overrides', async () => {
    env.clearBaseEnv()
    process.env.UNI_UTS_PLATFORM = 'app-android'
    getTailwindcssPackageInfoMock.mockReturnValue(undefined)
    const { uniAppX } = await import('@/presets')

    const result = uniAppX({
      base: '/repo/uni-app-x',
      uniAppX: {
        componentLocalStyles: {
          onlyWhenStyleIsolationVersion2: false,
        },
        uvueUnsupported: 'silent',
      },
    })

    expect(result.uniAppX).toEqual({
      enabled: true,
      componentLocalStyles: {
        enabled: true,
        onlyWhenStyleIsolationVersion2: false,
      },
      uvueUnsupported: 'silent',
    })
  })
})
