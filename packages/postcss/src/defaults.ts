import type { IStyleHandlerOptions } from './types'

export function getDefaultOptions(): Partial<IStyleHandlerOptions> {
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
        'custom-properties': false,
      },
      autoprefixer: {
        add: false,
      },
    },
    cssRemoveProperty: true,
    // cssRemoveAtSupports: true,
    // cssRemoveAtMedia: true,
    cssSelectorReplacement: {
      root: 'page',
      universal: ['view', 'text'],
    },
  }
}
