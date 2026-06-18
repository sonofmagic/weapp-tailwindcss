import { describe, expect, it } from 'vitest'
import { resolveRuntimeBranch, shouldUseMiniProgramCssBranch, shouldUseNativeAppCssBranch } from '@/runtime-branch'
import { createMiniProgramRuntimeBranch } from '@/runtime-branch/mini-program'
import { createNativeAppRuntimeBranch } from '@/runtime-branch/native-app'
import { createTailwindRuntimeBranch } from '@/runtime-branch/tailwind'
import { createWebRuntimeBranch } from '@/runtime-branch/web'
import { resolveUniUtsPlatform } from '@/utils'

function createBranchBase(overrides: Parameters<typeof resolveRuntimeBranch>[0]) {
  return {
    context: overrides,
    tailwindcssVersion: overrides.tailwindcssMajorVersion === 4 ? 4 as const : 3 as const,
    uniUtsPlatform: typeof overrides.uniUtsPlatform === 'object' && overrides.uniUtsPlatform !== null
      ? overrides.uniUtsPlatform
      : resolveUniUtsPlatform(overrides.uniUtsPlatform),
  }
}

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

describe('runtime branch files', () => {
  it('creates web branch from the dedicated web file', () => {
    expect(createWebRuntimeBranch(createBranchBase({
      generatorTarget: 'web',
      tailwindcssMajorVersion: 4,
      uniUtsPlatform: 'h5',
    }))).toMatchObject({
      platformFamily: 'web',
      isWeb: true,
      platform: 'h5',
    })
  })

  it('creates mini-program branch from the dedicated mini-program file', () => {
    expect(createMiniProgramRuntimeBranch(createBranchBase({
      generatorTarget: 'weapp',
      tailwindcssMajorVersion: 3,
      uniUtsPlatform: 'mp-weixin',
    }))).toMatchObject({
      platformFamily: 'mini-program',
      isMiniProgram: true,
      platform: 'mp-weixin',
    })
  })

  it('creates native app branch from the dedicated native-app file', () => {
    expect(createNativeAppRuntimeBranch(createBranchBase({
      appType: 'uni-app-x',
      generatorTarget: 'weapp',
      tailwindcssMajorVersion: 4,
      uniAppX: true,
      uniUtsPlatform: 'app-harmony',
    }))).toMatchObject({
      platformFamily: 'native-app',
      isNativeApp: true,
      nativeAppPlatform: 'harmony',
      platform: 'app-harmony',
    })
  })

  it('creates tailwind passthrough branch from the dedicated tailwind file', () => {
    expect(createTailwindRuntimeBranch(createBranchBase({
      generatorTarget: 'tailwind',
      platform: 'mp-weixin',
      tailwindcssMajorVersion: 4,
    }))).toMatchObject({
      platformFamily: 'tailwind',
      isTailwindV4: true,
      platform: 'mp-weixin',
    })
  })
})
