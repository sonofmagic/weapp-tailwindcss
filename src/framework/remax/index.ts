import { BaseJsxUnplugin, BaseJsxWebpackPluginV4 } from '@/base'
import type { UserDefinedOptions } from '@/types'

// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/4
export class RemaxWeappTailwindcssWebpackPluginV4 extends BaseJsxWebpackPluginV4 {
  constructor(options: UserDefinedOptions) {
    super(
      {
        ...options,
        framework: 'react'
      },
      'remax'
    )
  }
}

export function RemaxUnpluginWebpack(options: UserDefinedOptions = {}) {
  return BaseJsxUnplugin(
    {
      ...options,
      framework: 'react'
    },
    'remax'
  )
}
