import type { UserDefinedOptions } from '../types'
import { BaseWebpackPluginV5 } from '../BaseTemplatePlugin'
/**
 * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/6
 */
export class NativeWeappTailwindcssWebpackPluginV5 extends BaseWebpackPluginV5 {
  constructor (options: UserDefinedOptions = {}) {
    super(options, 'native')
  }
}
