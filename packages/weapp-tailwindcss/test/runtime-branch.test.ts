import { describe, expect, it } from 'vitest'
import { resolveRuntimeBranch, shouldUseMiniProgramCssBranch, shouldUseNativeAppCssBranch } from '@/runtime-branch'

describe('resolveRuntimeBranch', () => {
  it.each([
    [3, 'v3'],
    [4, 'v4'],
  ] as const)('routes Tailwind CSS %s mini-program output independently', (tailwindcssMajorVersion) => {
    const branch = resolveRuntimeBranch({
      generatorTarget: 'weapp',
      tailwindcssMajorVersion,
      uniUtsPlatform: 'mp-weixin',
    })

    expect(branch).toMatchObject({
      tailwindcssVersion: tailwindcssMajorVersion,
      platformFamily: 'mini-program',
      platform: 'mp-weixin',
      isMiniProgram: true,
      isNativeApp: false,
      isWeb: false,
    })
    expect(shouldUseMiniProgramCssBranch(branch)).toBe(true)
    expect(shouldUseNativeAppCssBranch(branch)).toBe(false)
  })

  it.each([
    [3, 'v3'],
    [4, 'v4'],
  ] as const)('routes Tailwind CSS %s web output independently', (tailwindcssMajorVersion) => {
    const branch = resolveRuntimeBranch({
      generatorTarget: 'web',
      tailwindcssMajorVersion,
      uniUtsPlatform: 'web',
    })

    expect(branch).toMatchObject({
      tailwindcssVersion: tailwindcssMajorVersion,
      platformFamily: 'web',
      platform: 'web',
      isMiniProgram: false,
      isNativeApp: false,
      isWeb: true,
    })
    expect(shouldUseMiniProgramCssBranch(branch)).toBe(false)
    expect(shouldUseNativeAppCssBranch(branch)).toBe(false)
  })

  it.each([
    ['app-android', 'android'],
    ['app-ios', 'ios'],
    ['app-harmony', 'harmony'],
  ] as const)('routes uni-app x %s through the native app branch', (uniUtsPlatform, nativeAppPlatform) => {
    const branch = resolveRuntimeBranch({
      appType: 'uni-app-x',
      generatorTarget: 'weapp',
      tailwindcssMajorVersion: 4,
      uniAppX: true,
      uniUtsPlatform,
    })

    expect(branch).toMatchObject({
      tailwindcssVersion: 4,
      platformFamily: 'native-app',
      platform: uniUtsPlatform,
      nativeAppPlatform,
      isMiniProgram: false,
      isNativeApp: true,
      isWeb: false,
    })
    expect(shouldUseMiniProgramCssBranch(branch)).toBe(true)
    expect(shouldUseNativeAppCssBranch(branch)).toBe(true)
  })

  it('keeps disabled uni-app x app builds out of the native app branch', () => {
    const branch = resolveRuntimeBranch({
      appType: 'uni-app-x',
      generatorTarget: 'weapp',
      tailwindcssMajorVersion: 4,
      uniAppX: { enabled: false },
      uniUtsPlatform: 'app-android',
    })

    expect(branch.platformFamily).toBe('mini-program')
    expect(branch.nativeAppPlatform).toBeUndefined()
    expect(shouldUseNativeAppCssBranch(branch)).toBe(false)
  })

  it('honors explicit style platform over env-derived platform', () => {
    const branch = resolveRuntimeBranch({
      generatorTarget: 'weapp',
      platform: 'mp-alipay',
      tailwindcssMajorVersion: 3,
      uniUtsPlatform: 'mp-weixin',
    })

    expect(branch.platformFamily).toBe('mini-program')
    expect(branch.platform).toBe('mp-alipay')
  })
})
