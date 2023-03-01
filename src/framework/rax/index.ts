// webpack 5
import type { UserDefinedOptions } from '@/types'
import { BaseJsxWebpackPluginV5, BaseJsxUnplugin } from '@/base'
// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/2
export class RaxTailwindcssWebpackPluginV5 extends BaseJsxWebpackPluginV5 {
  constructor(options: UserDefinedOptions = { framework: 'react' }) {
    super(options, 'rax')
  }
}

export function RaxUnpluginWebpack(options: UserDefinedOptions = { framework: 'react' }) {
  return BaseJsxUnplugin(options, 'rax')
}
