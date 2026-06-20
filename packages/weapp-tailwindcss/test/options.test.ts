import path from 'node:path'
import { vi } from 'vitest'
import { getCompilerContext } from '@/context'
import { TAILWIND_V3_CSS_PREFLIGHT, TAILWIND_V4_CSS_PREFLIGHT } from '@/defaults'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { generatorTargetEnvKeys } from '@/runtime-branch/generator-target-env'
import { defu } from '@/utils'

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

function sanitizeSnapshotOptions(options: ReturnType<typeof getCompilerContext>) {
  const clone = { ...options }
  const cwd = process.cwd()
  if (typeof clone.tailwindcssBasedir === 'string') {
    clone.tailwindcssBasedir = clone.tailwindcssBasedir.replace(cwd, '<cwd>')
  }
  clone.cache = '<cache>' as unknown as typeof clone.cache
  return clone
}

describe('get options', () => {
  it('default options', () => {
    const options = sanitizeSnapshotOptions(getCompilerContext({}))
    // @ts-ignore
    delete options.tailwindRuntime
    // @ts-ignore
    delete options.refreshTailwindcssRuntime
    // @ts-ignore
    delete options.tailwindRuntime
    expect(options).toMatchSnapshot()
  })

  it('default cache exposes lru compatible operations', () => {
    const { cache } = getCompilerContext({})
    expect(cache.instance).toMatchObject({
      get: expect.any(Function),
      has: expect.any(Function),
      set: expect.any(Function),
      delete: expect.any(Function),
    })
  })

  it('default matcher', () => {
    const { cssMatcher, jsMatcher, mainCssChunkMatcher, htmlMatcher } = getCompilerContext()
    expect(cssMatcher('a.css')).toBe(true)
    expect(jsMatcher('a.js')).toBe(true)
    expect(jsMatcher('node_modules/a.js')).toBe(false)
    expect(mainCssChunkMatcher('app.wxss', 'native')).toBe(false)
    expect(htmlMatcher('a.wxml')).toBe(true)
  })

  it('uses mainCssChunkMatcher as the public main css matcher', () => {
    const mainCssChunkMatcher = vi.fn((name: string, appType) => name === 'shell.acss' && appType === 'taro')
    const options = getCompilerContext({
      mainCssChunkMatcher,
    })

    expect(options.mainCssChunkMatcher('shell.acss', 'taro')).toBe(true)
    expect(mainCssChunkMatcher).toHaveBeenCalledWith('shell.acss', 'taro')
  })

  it('disables generator import fallback by default', () => {
    expect(normalizeWeappTailwindcssGeneratorOptions(undefined).importFallback).toBe(false)
    expect(normalizeWeappTailwindcssGeneratorOptions({}).importFallback).toBe(false)
    expect(normalizeWeappTailwindcssGeneratorOptions({ importFallback: true }).importFallback).toBe(true)
  })

  it('keeps weapp as generator target without framework web env', () => {
    withGeneratorTargetEnv({}, () => {
      expect(normalizeWeappTailwindcssGeneratorOptions(undefined).target).toBe('weapp')
      expect(normalizeWeappTailwindcssGeneratorOptions({}).tailwindcssV3Compatibility).toBe(true)
    })
  })

  it('infers web generator target from uni-app, uni-app x, Mpx and Taro H5 env', () => {
    withGeneratorTargetEnv({ UNI_PLATFORM: 'h5' }, () => {
      expect(normalizeWeappTailwindcssGeneratorOptions(undefined).target).toBe('web')
      expect(normalizeWeappTailwindcssGeneratorOptions({}).tailwindcssV3Compatibility).toBe(false)
    })

    withGeneratorTargetEnv({ UNI_UTS_PLATFORM: 'web' }, () => {
      expect(normalizeWeappTailwindcssGeneratorOptions({}).target).toBe('web')
    })

    withGeneratorTargetEnv({ UNI_UTS_PLATFORM: 'web-desktop' }, () => {
      expect(normalizeWeappTailwindcssGeneratorOptions({}).target).toBe('web')
    })

    withGeneratorTargetEnv({ MPX_CLI_MODE: 'web' }, () => {
      expect(normalizeWeappTailwindcssGeneratorOptions({}).target).toBe('web')
    })

    withGeneratorTargetEnv({ MPX_CURRENT_TARGET_MODE: 'web' }, () => {
      expect(normalizeWeappTailwindcssGeneratorOptions({}).target).toBe('web')
    })

    withGeneratorTargetEnv({ TARO_ENV: 'h5' }, () => {
      expect(normalizeWeappTailwindcssGeneratorOptions({}).target).toBe('web')
    })
  })

  it('infers web generator target from plain uni-app App WebView env', () => {
    withGeneratorTargetEnv({ UNI_PLATFORM: 'app' }, () => {
      expect(normalizeWeappTailwindcssGeneratorOptions(undefined).target).toBe('web')
      expect(normalizeWeappTailwindcssGeneratorOptions({}).tailwindcssV3Compatibility).toBe(false)
    })

    withGeneratorTargetEnv({ UNI_PLATFORM: 'app-plus' }, () => {
      expect(normalizeWeappTailwindcssGeneratorOptions({}).target).toBe('web')
    })
  })

  it('does not infer web generator target from uni-app x and Mpx non-web env', () => {
    withGeneratorTargetEnv({ UNI_UTS_PLATFORM: 'app-android' }, () => {
      expect(normalizeWeappTailwindcssGeneratorOptions({}).target).toBe('weapp')
    })

    withGeneratorTargetEnv({ UNI_PLATFORM: 'app', UNI_UTS_PLATFORM: 'app-ios' }, () => {
      expect(normalizeWeappTailwindcssGeneratorOptions({}).target).toBe('weapp')
    })

    withGeneratorTargetEnv({ UNI_PLATFORM: 'app', UNI_UTS_PLATFORM: 'app-harmony' }, () => {
      expect(normalizeWeappTailwindcssGeneratorOptions({}).target).toBe('weapp')
    })

    withGeneratorTargetEnv({ MPX_CLI_MODE: 'mp', MPX_CURRENT_TARGET_MODE: 'wx' }, () => {
      expect(normalizeWeappTailwindcssGeneratorOptions({}).target).toBe('weapp')
    })
  })

  it('resolves generator runtime branch from Tailwind version and platform context', () => {
    const miniProgramOptions = normalizeWeappTailwindcssGeneratorOptions({}, {
      tailwindcssMajorVersion: 3,
      uniUtsPlatform: 'mp-alipay',
    })
    expect(miniProgramOptions.branch).toMatchObject({
      tailwindcssVersion: 3,
      platformFamily: 'mini-program',
      platform: 'mp-alipay',
    })

    const nativeOptions = normalizeWeappTailwindcssGeneratorOptions({}, {
      appType: 'uni-app-x',
      tailwindcssMajorVersion: 4,
      uniAppX: true,
      uniUtsPlatform: 'app-ios',
    })
    expect(nativeOptions.branch).toMatchObject({
      tailwindcssVersion: 4,
      platformFamily: 'native-app',
      nativeAppPlatform: 'ios',
      platform: 'app-ios',
    })

    const webOptions = normalizeWeappTailwindcssGeneratorOptions({ target: 'web' }, {
      tailwindcssMajorVersion: 4,
      uniUtsPlatform: 'h5',
    })
    expect(webOptions.branch).toMatchObject({
      tailwindcssVersion: 4,
      platformFamily: 'web',
    })
  })

  it('keeps explicit generator target before env inference', () => {
    withGeneratorTargetEnv({ UNI_PLATFORM: 'h5', TARO_ENV: 'h5' }, () => {
      expect(normalizeWeappTailwindcssGeneratorOptions({ target: 'weapp' }).target).toBe('weapp')
      expect(normalizeWeappTailwindcssGeneratorOptions({ target: 'weapp' }).tailwindcssV3Compatibility).toBe(true)
    })
  })

  it('honors explicit generator target env overrides', () => {
    withGeneratorTargetEnv({ WEAPP_TW_TARGET: 'web' }, () => {
      expect(normalizeWeappTailwindcssGeneratorOptions({}).target).toBe('web')
    })

    withGeneratorTargetEnv({ UNI_PLATFORM: 'h5', WEAPP_TAILWINDCSS_TARGET: 'weapp' }, () => {
      expect(normalizeWeappTailwindcssGeneratorOptions({}).target).toBe('weapp')
    })
  })

  // it.skip('glob matcher', () => {
  //   const { cssMatcher, jsMatcher, mainCssChunkMatcher, htmlMatcher } = getCompilerContext({
  //     cssMatcher: '*.xxss',
  //     jsMatcher: '*.abcd',
  //     mainCssChunkMatcher: '*.main',
  //     htmlMatcher: ['*.wxmm', '*.plmm']
  //   })
  //   expect(cssMatcher('a.xxss')).toBe(true)
  //   expect(jsMatcher('a.abcd')).toBe(true)
  //   expect(mainCssChunkMatcher('app.main', 'native')).toBe(true)
  //   expect(htmlMatcher('a.wxmm')).toBe(true)
  //   expect(htmlMatcher('a.plmm')).toBe(true)
  // })

  it('cssPreflight false', () => {
    const config = getCompilerContext({
      cssPreflight: false,
    })
    expect(config.cssPreflight).toBe(false)
  })

  it('cssPreflight partial', () => {
    const cssPreflight = {
      'border-color': false,
      'box-sizing': 'content-box',
      'border-style': 0,
    }
    const config = getCompilerContext({
      cssPreflight,
    })
    expect(config.cssPreflight).toStrictEqual({
      'border-color': false,
      'border-style': 0,
      'border-width': '0',
      'box-sizing': 'content-box',
    })
  })

  it('uses Tailwind v4 cssPreflight defaults for tailwindcss v4 runtime', () => {
    const config = getCompilerContext({
      tailwindcss: {
        packageName: 'tailwindcss4',
      },
    })
    expect(config.tailwindRuntime.majorVersion).toBe(4)
    expect(config.cssPreflight).toStrictEqual(TAILWIND_V4_CSS_PREFLIGHT)
  })

  it('uses Tailwind v3 cssPreflight defaults for tailwindcss v3 runtime', () => {
    const config = getCompilerContext()
    expect(config.tailwindRuntime.majorVersion).toBe(3)
    expect(config.cssPreflight).toStrictEqual(TAILWIND_V3_CSS_PREFLIGHT)
  })

  // it('supportCustomLengthUnits boolean', () => {
  //   const o0 = getCompilerContext()
  //   expect(o0.supportCustomLengthUnits).toEqual(defaultOptions.supportCustomLengthUnits)
  //   const o1 = getCompilerContext({
  //     supportCustomLengthUnits: true
  //   })
  //   expect(o1.supportCustomLengthUnits).toEqual(defaultOptions.supportCustomLengthUnits)
  //   const o2 = getCompilerContext({
  //     supportCustomLengthUnits: false
  //   })
  //   expect(o2.supportCustomLengthUnits).toEqual(false)
  //   const o0o = getCompilerContext({
  //     supportCustomLengthUnits: {
  //       units: ['upx', 'xxem']
  //     }
  //   })
  //   expect(typeof o0o.supportCustomLengthUnits === 'object').toBe(true)
  //   expect(o0o.supportCustomLengthUnits).toEqual({
  //     units: ['upx', 'xxem', 'rpx'],
  //     // @ts-ignore
  //     dangerousOptions: defaultOptions.supportCustomLengthUnits.dangerousOptions
  //   })
  // })

  it('arbitraryValues options', () => {
    let arbitraryValues: ReturnType<typeof getCompilerContext>['arbitraryValues'] = getCompilerContext().arbitraryValues
    expect(typeof arbitraryValues === 'object').toBe(true)
    expect(arbitraryValues.allowDoubleQuotes).toBeDefined()
    expect(arbitraryValues.allowDoubleQuotes).toBe(false)
    expect(arbitraryValues.bareArbitraryValues).toBe(false)
    arbitraryValues = getCompilerContext({
      arbitraryValues: {},
    }).arbitraryValues
    expect(typeof arbitraryValues === 'object').toBe(true)
    expect(arbitraryValues.allowDoubleQuotes).toBeDefined()
    expect(arbitraryValues.allowDoubleQuotes).toBe(false)
    expect(arbitraryValues.bareArbitraryValues).toBe(false)
    arbitraryValues = getCompilerContext({
      arbitraryValues: {
        allowDoubleQuotes: true,
        bareArbitraryValues: true,
      },
    }).arbitraryValues
    expect(typeof arbitraryValues === 'object').toBe(true)
    expect(arbitraryValues.allowDoubleQuotes).toBeDefined()
    expect(arbitraryValues.allowDoubleQuotes).toBe(true)
    expect(arbitraryValues.bareArbitraryValues).toBe(true)
  })

  it('customAttributes defu merge', () => {
    // const { customAttributes } = getCompilerContext()

    const customAttributes = {
      '*': [/[A-Za-z-]*[Cc]lass/],
    }
    const t = defu(customAttributes, {
      '*': ['class', 'hover-class'],
    })
    expect(t['*'].length).toBe(3)
  })

  it('mpx should have unique cache dir', () => {
    let config = getCompilerContext({

    })
    let cacheOptions = config.tailwindRuntime.options?.cache
    expect(cacheOptions?.enabled).toBe(true)
    // TailwindcssRuntime 内部可能将路径转为 posix 格式，统一用 path.normalize 比较
    const expectedDefaultCacheDir = path.join(process.cwd(), 'node_modules', '.cache', '@tailwindcss-mangle', 'engine')
    expect(path.normalize(String(cacheOptions?.dir))).toBe(path.normalize(expectedDefaultCacheDir))
    config = getCompilerContext({
      appType: 'mpx',
    })
    cacheOptions = config.tailwindRuntime.options?.cache
    expect(path.normalize(String(cacheOptions?.dir))).toBe(path.normalize(path.join(process.cwd(), 'node_modules', '.cache', '@tailwindcss-mangle', 'engine')))
  })

  describe('px2rpx options', () => {
    it('defaults to undefined', () => {
      expect(getCompilerContext().px2rpx).toBeUndefined()
    })

    it.each([
      ['enabled as boolean', true],
      ['disabled as boolean', false],
      ['custom options object', { selectorBlackList: ['van-'] }],
    ] as const)('preserves px2rpx when %s', (_label, px2rpx) => {
      const config = getCompilerContext({ px2rpx })
      expect(config.px2rpx).toEqual(px2rpx)
    })
  })

  // it('customAttributes map defu merge', () => {
  //   // const { customAttributes } = getCompilerContext()

  //   const customAttributes = new Map<string, RegExp[]>()
  //   customAttributes.set('*', [/[A-Za-z]?[A-Za-z-]*[Cc]lass/])

  //   const t = defu(customAttributes, {
  //     '*': ['class', 'hover-class']
  //   })
  //   expect(isMap(t)).toBe(true)
  //   expect(t.get('*')).toBe(3)
  //   //  expect(t['*']).toBe(2)
  //   // expect(t.get('*')).toBe(1)
  //   // expect(t['*']).toBe(2)
  // })
})
