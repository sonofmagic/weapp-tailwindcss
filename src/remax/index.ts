import { TaroWeappTailwindcssWebpackPluginV4 } from '../taro/index'
import type { UserDefinedOptions } from '../types'
export class RemaxWeappTailwindcssWebpackPluginV4 extends TaroWeappTailwindcssWebpackPluginV4 {
  constructor (options: UserDefinedOptions) {
    super({
      ...options,
      framework: 'react'
    })
  }
}
