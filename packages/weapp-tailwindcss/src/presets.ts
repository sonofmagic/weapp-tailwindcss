import type { PackageResolvingOptions } from 'local-pkg'
import type { UserDefinedOptions } from './types'
import process from 'node:process'
import { resolveTailwindcssBasedir } from '@/context/tailwindcss'
import { defuOverrideArray } from '@/utils'
import { logger } from './logger'

export interface UniAppXOptions {
  base: string
  cssEntries?: string[]
  rem2rpx?: UserDefinedOptions['rem2rpx']
  rawOptions?: UserDefinedOptions
  resolve?: PackageResolvingOptions
  customAttributes?: UserDefinedOptions['customAttributes']
}

export function uniAppX(options: UniAppXOptions) {
  logger.info(`UNI_PLATFORM: ${process.env.UNI_PLATFORM}`)
  const isApp = process.env.UNI_PLATFORM === 'app'
    || process.env.UNI_PLATFORM === 'app-plus'
    || process.env.UNI_PLATFORM === 'app-harmony'
  return defuOverrideArray<
    Partial<UserDefinedOptions>,
    Partial<UserDefinedOptions>[]
  >(
    options.rawOptions ?? {},
    {
      uniAppX: isApp,
      // 安卓
      // ios
      rem2rpx: options.rem2rpx,
      tailwindcssBasedir: options.base,
      tailwindcssPatcherOptions: {
        cwd: options.base,
        tailwind: {
          cwd: options.base,
          resolve: options.resolve,
          v3: {
            cwd: options.base,
          },
          v4: {
            base: options.base,
            cssEntries: options.cssEntries,
          },
        },
      },
      cssPreflight: {
        'border-style': false,
      },
      cssPresetEnv: {
        features: {
          'custom-properties': {
            preserve: false,
          },
        },
      },
      ...(options.customAttributes ? { customAttributes: options.customAttributes } : {}),
    },
  )
}

export interface HBuilderXOptions {
  base?: string
  cssEntries?: string | string[]
  rem2rpx?: UserDefinedOptions['rem2rpx']
  rawOptions?: UserDefinedOptions
  resolve?: PackageResolvingOptions
  customAttributes?: UserDefinedOptions['customAttributes']
}

function toCssEntries(entries?: string | string[]) {
  if (!entries) {
    return undefined
  }
  return Array.isArray(entries) ? entries : [entries]
}

export function hbuilderx(options: HBuilderXOptions = {}) {
  const baseDir = resolveTailwindcssBasedir(options.base)
  const cssEntries = toCssEntries(options.cssEntries)
  const tailwindConfig: NonNullable<UserDefinedOptions['tailwindcss']> = {
    v2: {
      cwd: baseDir,
    },
    v3: {
      cwd: baseDir,
    },
    v4: {
      base: baseDir,
      cssEntries,
    },
  }
  const patchTailwindConfig: NonNullable<UserDefinedOptions['tailwindcss']> = {
    v2: { cwd: baseDir },
    v3: { cwd: baseDir },
    v4: {
      base: baseDir,
      cssEntries,
    },
  }
  if (cssEntries && cssEntries.length > 0) {
    tailwindConfig.version = 4
    patchTailwindConfig.version = 4
  }

  const resolvedTailwind = options.resolve
    ? {
        ...patchTailwindConfig,
        resolve: options.resolve,
      }
    : patchTailwindConfig

  const preset: Partial<UserDefinedOptions> = {
    tailwindcssBasedir: baseDir,
    tailwindcss: tailwindConfig,
    tailwindcssPatcherOptions: {
      cwd: baseDir,
      tailwind: resolvedTailwind,
    },
  }

  if (options.customAttributes) {
    preset.customAttributes = options.customAttributes
  }

  if (options.rem2rpx !== undefined) {
    preset.rem2rpx = options.rem2rpx
  }

  return defuOverrideArray<
    Partial<UserDefinedOptions>,
    Partial<UserDefinedOptions>[]
  >(
    options.rawOptions ?? {},
    preset,
  )
}

// 预留：TaroOptions 接口
//  // rem2rpx?: UserDefinedOptions['rem2rpx']
//  // rawOptions?: UserDefinedOptions

// 预留：taro 预设函数
