import type { UserDefinedOptions } from '@/types'
import { BaseTemplateWebpackPluginV4, BaseTemplateWebpackPluginV5 } from '@/base'

/**
 * @deprecated
 */
export class UniAppWeappTailwindcssWebpackPluginV4 extends BaseTemplateWebpackPluginV4 {
  constructor(options: UserDefinedOptions = {}) {
    super(options, 'uni-app')
  }
}
// https://github.com/dcloudio/uni-app/issues/3723
/**
 * @deprecated
 */
export class UniAppWeappTailwindcssWebpackPluginV5 extends BaseTemplateWebpackPluginV5 {
  constructor(options: UserDefinedOptions = {}) {
    super(options, 'uni-app')
  }
}
