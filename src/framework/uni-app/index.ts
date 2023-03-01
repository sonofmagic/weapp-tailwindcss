import type { UserDefinedOptions } from '@/types'
import { BaseTemplateWebpackPluginV4, BaseTemplateWebpackPluginV5, BaseTemplateUnplugin } from '@/base'

export class UniAppWeappTailwindcssWebpackPluginV4 extends BaseTemplateWebpackPluginV4 {
  constructor(options: UserDefinedOptions = {}) {
    super(options, 'uni-app')
  }
}
// https://github.com/dcloudio/uni-app/issues/3723
export class UniAppWeappTailwindcssWebpackPluginV5 extends BaseTemplateWebpackPluginV5 {
  constructor(options: UserDefinedOptions = {}) {
    super(options, 'uni-app')
  }
}

export function UniAppUnpluginWebpack(options: UserDefinedOptions = {}) {
  return BaseTemplateUnplugin(options, 'uni-app')
}
