import type { IStyleHandlerOptions } from './types'

export function getDefaultOptions(): Partial<IStyleHandlerOptions> {
  return {
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
    cssSelectorReplacement: {
      root: 'page',
      universal: ['view', 'text'],
    },
  }
}
