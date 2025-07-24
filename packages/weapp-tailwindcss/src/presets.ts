import type { PackageResolvingOptions } from 'local-pkg'
import type { UserDefinedOptions } from './types'
import process from 'node:process'
import { defuOverrideArray } from '@/utils'
import { logger } from './logger'

export interface UniAppXOptions {
  base: string
  cssEntries?: string[]
  rem2rpx?: UserDefinedOptions['rem2rpx']
  rawOptions?: UserDefinedOptions
  resolve?: PackageResolvingOptions
}

export function uniAppX(options: UniAppXOptions) {
  logger.info(`UNI_PLATFORM: ${process.env.UNI_PLATFORM}`)
  const isApp = process.env.UNI_PLATFORM === 'app' || process.env.UNI_PLATFORM === 'app-plus'
  return defuOverrideArray<
    Partial<UserDefinedOptions>,
    Partial<UserDefinedOptions>[]
  >(
    options.rawOptions!,
    {
      uniAppX: isApp,
      // 安卓
      // ios
      rem2rpx: options.rem2rpx,
      tailwindcssBasedir: options.base,
      tailwindcssPatcherOptions: {
        patch: {
          cwd: options.base,
          resolve: options.resolve,
          tailwindcss: {
            // @ts-ignore
            cwd: options.base,
            v3: {
              cwd: options.base,
            },
            v4: {
              base: options.base,
              cssEntries: options.cssEntries,
            },
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
    },
  )
}

// export function taro() {

// }
