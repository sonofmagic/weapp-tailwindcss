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

    expect(result.unitsToPx).toEqual({
      unitPrecision: 4,
    })
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
        paths: ['/repo/uni-app-x'],
      },
    })
    expect(result.tailwindcss).toMatchObject({
      version: 3,
      packageName: 'tailwindcss',
      postcssPlugin: 'tailwindcss',
      resolve: {
        paths: ['/repo/uni-app-x'],
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
        paths: ['/repo/uni-app-x'],
      },
    })
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
