import type { UserDefinedOptions } from '@/types'
import { BaseTemplateUnplugin } from '@/base'
/**
 * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/6
 */

export function NativeUnpluginWebpack(options: UserDefinedOptions = {}) {
  return BaseTemplateUnplugin(options, 'native')
}
