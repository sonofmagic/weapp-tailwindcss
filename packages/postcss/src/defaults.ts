import type { IStyleHandlerOptions } from './types'

export function getDefaultOptions(_options?: Partial<IStyleHandlerOptions>): Partial<IStyleHandlerOptions> {
  return {
    // https://github.com/postcss/postcss-calc
    cssPresetEnv: {
      features: {
        'cascade-layers': true,
        'is-pseudo-class': {
          specificityMatchingName: 'weapp-tw-ig',
        },
        'oklab-function': true,
        'color-mix': true,
        // 在 calc 下，这个需要开启
        'custom-properties': false,
        //  options?.cssPresetEnv?.features?.['custom-properties'] ?? options?.cssCalc
        //   ? { preserve: false }
        //   : false,
      },
      autoprefixer: {
        add: false,
      },
    },
    // 支付宝小程序不支持，所以默认关闭
    cssRemoveProperty: true,
    // cssRemoveAtSupports: true,
    // cssRemoveAtMedia: true,
    cssSelectorReplacement: {
      root: 'page',
      universal: ['view', 'text'],
    },
  }
}
