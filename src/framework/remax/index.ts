import { BaseJsxWebpackPluginV4 } from '@/base'
import type { UserDefinedOptions } from '@/types'

/**
 * @deprecated
 */
export class RemaxWeappTailwindcssWebpackPluginV4 extends BaseJsxWebpackPluginV4 {
  constructor(options: UserDefinedOptions) {
    super(
      {
        ...options,
        framework: 'react'
      },
      'remax'
    )
  }
}
