import type { UserDefinedOptions } from '@/types'
import { BaseTemplateWebpackPluginV5 } from '@/base'
/**
 * @deprecated
 */
export class MpxWeappTailwindcssWebpackPluginV5 extends BaseTemplateWebpackPluginV5 {
  constructor(options: UserDefinedOptions = {}) {
    super(options, 'mpx')
  }
}
