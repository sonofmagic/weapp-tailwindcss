import type { UserDefinedOptions } from '@/types'
import { BaseTemplateWebpackPluginV5 } from '@/base'
/**
 * @deprecated
 */
export class NativeWeappTailwindcssWebpackPluginV5 extends BaseTemplateWebpackPluginV5 {
  constructor(options: UserDefinedOptions = {}) {
    super(options, 'native')
  }
}
