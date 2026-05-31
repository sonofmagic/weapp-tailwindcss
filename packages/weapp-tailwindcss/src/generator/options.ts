import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { WeappTailwindcssGeneratorTarget } from './types'
import process from 'node:process'

const explicitGeneratorTargetEnvKeys = [
  'WEAPP_TW_TARGET',
  'WEAPP_TAILWINDCSS_TARGET',
] as const

const uniWebPlatformEnvKeys = [
  'UNI_PLATFORM',
  'UNI_UTS_PLATFORM',
] as const

const mpxWebPlatformEnvKeys = [
  'MPX_CLI_MODE',
  'MPX_CURRENT_TARGET_MODE',
] as const

function getEnvValue(key: string): string | undefined {
  return typeof process === 'undefined' ? undefined : process.env[key]
}

function normalizeGeneratorTargetValue(value: string | undefined): WeappTailwindcssGeneratorTarget | undefined {
  return value === 'weapp' || value === 'web' || value === 'tailwind' ? value : undefined
}

function isUniWebPlatform(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase()
  return normalized === 'h5' || normalized?.startsWith('web') === true
}

function isUniAppWebViewPlatform(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase()
  return normalized === 'app' || normalized === 'app-plus'
}

function isUniNativeAppPlatform(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase()
  return normalized?.startsWith('app-') === true
}

function isMpxWebPlatform(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'web'
}

function inferGeneratorTargetFromEnv(): WeappTailwindcssGeneratorTarget {
  for (const key of explicitGeneratorTargetEnvKeys) {
    const target = normalizeGeneratorTargetValue(getEnvValue(key))
    if (target !== undefined) {
      return target
    }
  }

  if (
    uniWebPlatformEnvKeys.some(key => isUniWebPlatform(getEnvValue(key)))
    || (
      isUniAppWebViewPlatform(getEnvValue('UNI_PLATFORM'))
      && !isUniNativeAppPlatform(getEnvValue('UNI_UTS_PLATFORM'))
    )
    || mpxWebPlatformEnvKeys.some(key => isMpxWebPlatform(getEnvValue(key)))
    || getEnvValue('TARO_ENV') === 'h5'
  ) {
    return 'web'
  }

  return 'weapp'
}

export interface WeappTailwindcssGeneratorOptions {
  /**
   * 生成目标。小程序构建默认使用 `weapp`，H5/Web 与普通 uni-app App WebView 默认使用 `web`。
   *
   * @remarks
   * `target` 表示 CSS 输出形态，不是平台枚举。uni-app x Android/iOS 这类原生 App 目标继续使用 `weapp` 输出族，
   * 并通过 `uniAppX`、`platform` 与单位转换配置处理 App 差异。
   */
  target?: WeappTailwindcssGeneratorTarget | undefined
  /**
   * Tailwind 配置文件路径，兼容原 Tailwind PostCSS 插件的 `config` 选项。
   */
  config?: string | undefined
  /**
   * 传给小程序 CSS 兼容转换器的额外配置。
   */
  styleOptions?: Partial<IStyleHandlerOptions> | undefined
  /**
   * 将 `@import "weapp-tailwindcss"` 作为 Tailwind CSS v4 生成入口的兜底别名。
   *
   * 适用于框架无法把 `@import "tailwindcss"` 改写到 `weapp-tailwindcss` 包入口的场景，默认开启。
   */
  importFallback?: boolean | undefined
  /**
   * Tailwind CSS v4 小程序生成模式默认注入 v3 默认值兼容层，保持升级前的视觉行为。
   *
   * 设为 `false` 时，完全使用 Tailwind CSS v4 原生默认值。
   */
  tailwindcssV3Compatibility?: boolean | undefined
}

export type WeappTailwindcssGeneratorUserOptions = WeappTailwindcssGeneratorOptions

export interface NormalizedWeappTailwindcssGeneratorOptions {
  target: WeappTailwindcssGeneratorTarget
  config?: string | undefined
  styleOptions?: Partial<IStyleHandlerOptions> | undefined
  importFallback: boolean
  tailwindcssV3Compatibility: boolean
}

export function normalizeWeappTailwindcssGeneratorOptions(
  options: WeappTailwindcssGeneratorUserOptions | undefined,
): NormalizedWeappTailwindcssGeneratorOptions {
  const target = options?.target ?? inferGeneratorTargetFromEnv()

  if (options == null) {
    return {
      target,
      importFallback: true,
      tailwindcssV3Compatibility: target === 'weapp',
    }
  }

  return {
    target,
    config: options.config,
    styleOptions: options.styleOptions,
    importFallback: options.importFallback ?? true,
    tailwindcssV3Compatibility: options.tailwindcssV3Compatibility ?? target === 'weapp',
  }
}
