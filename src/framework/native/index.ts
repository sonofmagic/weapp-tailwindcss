import type { UserDefinedOptions } from '@/types'
import { BaseTemplateWebpackPluginV5 } from '@/base'
/**
 * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/6
 */
export class NativeWeappTailwindcssWebpackPluginV5 extends BaseTemplateWebpackPluginV5 {
  constructor (options: UserDefinedOptions = {}) {
    super(options, 'native')
  }
}
