import type { UserDefinedOptions } from '@/types'
import { BaseTemplateWebpackPluginV5, BaseTemplateUnplugin } from '@/base'

export class MpxWeappTailwindcssWebpackPluginV5 extends BaseTemplateWebpackPluginV5 {
  constructor(options: UserDefinedOptions = {}) {
    super(options, 'mpx')
  }
}

export function MpxUnpluginWebpack(options: UserDefinedOptions = {}) {
  return BaseTemplateUnplugin(options, 'mpx')
}
