import type { TaroUserDefinedOptions } from '@/types'
import { BaseJsxWebpackPluginV4 } from '@/base'
/**
 * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/5
 */
export class TaroWeappTailwindcssWebpackPluginV4 extends BaseJsxWebpackPluginV4 {
  constructor (options: TaroUserDefinedOptions = { framework: 'react' }) {
    super(options, 'taro')
  }
}
