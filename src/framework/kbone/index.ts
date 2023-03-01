import { BaseTemplateWebpackPluginV4 } from '@/base'
import type { UserDefinedOptions } from '@/types'

/**
 * @deprecated 感觉 Kbone 这个框架，已经不行了，所以停止维护
 */
export class KboneWeappTailwindcssWebpackPluginV4 extends BaseTemplateWebpackPluginV4 {
  constructor(options: UserDefinedOptions = {}) {
    super(options, 'kbone')
  }
}
