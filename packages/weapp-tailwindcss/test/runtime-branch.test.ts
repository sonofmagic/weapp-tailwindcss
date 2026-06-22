import { describe, expect, it } from 'vitest'
import { resolveRuntimeBranch, shouldUseMiniProgramCssBranch, shouldUseNativeAppCssBranch } from '@/runtime-branch'
import { generatorTargetEnvKeys, inferGeneratorTargetFromEnv } from '@/runtime-branch/generator-target-env'
import { createMiniProgramRuntimeBranch } from '@/runtime-branch/mini-program'
import { createNativeAppRuntimeBranch } from '@/runtime-branch/native-app'
import { createWebRuntimeBranch } from '@/runtime-branch/web'
import { resolveUniUtsPlatform } from '@/utils'

function withGeneratorTargetEnv(
  env: Partial<Record<typeof generatorTargetEnvKeys[number], string>>,
  callback: () => void,
) {
  const originalEnvValues = new Map<string, string | undefined>(
    generatorTargetEnvKeys.map(key => [key, process.env[key]]),
  )

  for (const key of generatorTargetEnvKeys) {
    if (env[key] === undefined) {
      delete process.env[key]
    }
    else {
      process.env[key] = env[key]
    }
  }

  try {
    callback()
  }
  finally {
    for (const [key, value] of originalEnvValues) {
      if (value === undefined) {
        delete process.env[key]
      }
      else {
        process.env[key] = value
      }
    }
  }
}

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
  ] as const)('routes Tailwind CSS %s mini-program output through the v4 generator branch', (tailwindcssMajorVersion) => {
    const branch = resolveRuntimeBranch({
      generatorTarget: 'weapp',
      tailwindcssMajorVersion,
      uniUtsPlatform: 'mp-weixin',
    })

    expect(branch).toMatchObject({
      tailwindcssVersion: 4,
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
  ] as const)('routes Tailwind CSS %s web output through the v4 generator branch', (tailwindcssMajorVersion) => {
    const branch = resolveRuntimeBranch({
      generatorTarget: 'web',
      tailwindcssMajorVersion,
      uniUtsPlatform: 'web',
    })

    expect(branch).toMatchObject({
      tailwindcssVersion: 4,
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

describe('inferGeneratorTargetFromEnv', () => {
  it('keeps mini-program as the fallback branch target', () => {
    withGeneratorTargetEnv({}, () => {
      expect(inferGeneratorTargetFromEnv()).toBe('weapp')
    })
  })

  it.each([
    [{ UNI_PLATFORM: 'h5' }, 'uni-app H5'],
    [{ UNI_UTS_PLATFORM: 'web' }, 'uni-app x Web'],
    [{ UNI_UTS_PLATFORM: 'web-desktop' }, 'uni-app x desktop Web'],
    [{ MPX_CLI_MODE: 'web' }, 'Mpx Web'],
    [{ MPX_CURRENT_TARGET_MODE: 'web' }, 'Mpx target Web'],
    [{ TARO_ENV: 'h5' }, 'Taro H5'],
    [{ UNI_PLATFORM: 'app' }, 'uni-app App WebView'],
    [{ UNI_PLATFORM: 'app-plus' }, 'uni-app app-plus WebView'],
  ] as const)('infers web branch target from %s', (env) => {
    withGeneratorTargetEnv(env, () => {
      expect(inferGeneratorTargetFromEnv()).toBe('web')
    })
  })

  it.each([
    [{ UNI_UTS_PLATFORM: 'app-android' }, 'uni-app x Android'],
    [{ UNI_PLATFORM: 'app', UNI_UTS_PLATFORM: 'app-ios' }, 'uni-app x iOS'],
    [{ UNI_PLATFORM: 'app', UNI_UTS_PLATFORM: 'app-harmony' }, 'uni-app x Harmony'],
    [{ MPX_CLI_MODE: 'mp', MPX_CURRENT_TARGET_MODE: 'wx' }, 'Mpx mini-program'],
  ] as const)('keeps %s on the mini-program/native-app output family', (env) => {
    withGeneratorTargetEnv(env, () => {
      expect(inferGeneratorTargetFromEnv()).toBe('weapp')
    })
  })

  it('honors explicit branch target env before framework env', () => {
    withGeneratorTargetEnv({ UNI_PLATFORM: 'h5', TARO_ENV: 'h5', WEAPP_TW_TARGET: 'weapp' }, () => {
      expect(inferGeneratorTargetFromEnv()).toBe('weapp')
    })

    withGeneratorTargetEnv({ WEAPP_TAILWINDCSS_TARGET: 'tailwind' }, () => {
      expect(inferGeneratorTargetFromEnv()).toBe('weapp')
    })
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

})
