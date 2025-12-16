import type { PackageResolvingOptions } from 'local-pkg'
import type { UserDefinedOptions } from '@/types'
import process from 'node:process'
import { logger } from '@/logger'
import { defuOverrideArray } from '@/utils'
import { normalizeCssEntries } from './shared'

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
  const cssEntries = normalizeCssEntries(options.cssEntries)
  return defuOverrideArray<
    Partial<UserDefinedOptions>,
    Partial<UserDefinedOptions>[]
  >(
    options.rawOptions ?? {},
    {
      uniAppX: isApp,
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
            cssEntries,
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
