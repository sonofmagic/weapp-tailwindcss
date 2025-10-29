// 默认配置生成逻辑，集中维护小程序环境下的基础能力开关
import type { IStyleHandlerOptions } from './types'

// getDefaultOptions 会根据用户传入的部分配置动态补全剩余字段
export function getDefaultOptions(options?: Partial<IStyleHandlerOptions>): Partial<IStyleHandlerOptions> {
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
        'custom-properties': options?.cssPresetEnv?.features?.['custom-properties'] ?? options?.cssCalc
          ? { preserve: true }
          : false,
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
