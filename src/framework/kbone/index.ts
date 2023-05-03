import { BaseTemplateWebpackPluginV4 } from '@/base'
import type { UserDefinedOptions } from '@/types'
/**
 * @deprecated
 */
export class KboneWeappTailwindcssWebpackPluginV4 extends BaseTemplateWebpackPluginV4 {
  constructor(options: UserDefinedOptions = {}) {
    super(options, 'kbone')
  }
}
