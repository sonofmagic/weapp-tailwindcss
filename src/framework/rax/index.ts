// webpack 5
import type { TaroUserDefinedOptions } from '@/types'
import { BaseJsxWebpackPluginV5 } from '@/base'
// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/2
export class RaxTailwindcssWebpackPluginV5 extends BaseJsxWebpackPluginV5 {
  constructor (options: TaroUserDefinedOptions = { framework: 'react' }) {
    super(options, 'rax')
  }
}
