// webpack 5
import type { UserDefinedOptions } from '@/types'
import { BaseJsxWebpackPluginV5 } from '@/base'

/**
 * @deprecated
 */
export class RaxTailwindcssWebpackPluginV5 extends BaseJsxWebpackPluginV5 {
  constructor(options: UserDefinedOptions = { framework: 'react' }) {
    super(options, 'rax')
  }
}
