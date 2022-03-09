import { BaseTemplateWebpackPluginV4 } from '@/base'
import type { UserDefinedOptions } from '@/types'
export class KboneWeappTailwindcssWebpackPluginV4 extends BaseTemplateWebpackPluginV4 {
  constructor (options: UserDefinedOptions = {}) {
    super(options, 'uni-app')
  }
}
