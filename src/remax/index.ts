import { BaseJsxWebpackPluginV4 } from '../BaseJsxPlugin'
import type { UserDefinedOptions } from '../types'

// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/4
export class RemaxWeappTailwindcssWebpackPluginV4 extends BaseJsxWebpackPluginV4 {
  constructor (options: UserDefinedOptions) {
    super(
      {
        ...options,
        framework: 'react'
      },
      'remax'
    )
  }
}
