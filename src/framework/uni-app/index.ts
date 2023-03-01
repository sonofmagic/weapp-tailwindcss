import type { UserDefinedOptions } from '@/types'
import { BaseTemplateUnplugin } from '@/base'

export function UniAppUnpluginWebpack(options: UserDefinedOptions = {}) {
  return BaseTemplateUnplugin(options, 'uni-app')
}
