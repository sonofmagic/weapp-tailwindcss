import { TaroWeappTailwindcssWebpackPluginV4 } from '../taro/index'
import type { UserDefinedOptions } from '../types'

// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/4
export class RemaxWeappTailwindcssWebpackPluginV4 extends TaroWeappTailwindcssWebpackPluginV4 {
  constructor (options: UserDefinedOptions) {
    super({
      ...options,
      framework: 'react'
    })
  }
}
