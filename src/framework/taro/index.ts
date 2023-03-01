import type { UserDefinedOptions } from '@/types'
import { BaseJsxUnplugin } from '@/base'
/**
 * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/5
 */
export function TaroUnpluginWebpack(options: UserDefinedOptions = { framework: 'react' }) {
  return BaseJsxUnplugin(options, 'taro')
}
