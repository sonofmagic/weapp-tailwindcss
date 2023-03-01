// webpack 5
import type { UserDefinedOptions } from '@/types'
import { BaseJsxUnplugin } from '@/base'
// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/2

export function RaxUnpluginWebpack(options: UserDefinedOptions = { framework: 'react' }) {
  return BaseJsxUnplugin(options, 'rax')
}
