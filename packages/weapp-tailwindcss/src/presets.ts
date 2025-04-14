import type { UserDefinedOptions } from './types'
import { defuOverrideArray } from '@/utils'

export interface UniAppXOptions {
  base: string
  rem2rpx?: UserDefinedOptions['rem2rpx']
  rawOptions?: UserDefinedOptions
}

export function uniAppX(options: UniAppXOptions) {
  return defuOverrideArray<
    Partial<UserDefinedOptions>,
    Partial<UserDefinedOptions>[]
  >(
    options.rawOptions!,
    {
      uniAppX: true,
      // 安卓
      // ios
      rem2rpx: options.rem2rpx,
      tailwindcssBasedir: options.base,
      tailwindcssPatcherOptions: {
        patch: {
          tailwindcss: {
            v3: {
              cwd: options.base,
            },
            v4: {
              base: options.base,
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
