import type { UserDefinedOptions } from '@/types'
import { BaseTemplateUnplugin } from '@/base'

export function MpxUnpluginWebpack(options: UserDefinedOptions = {}) {
  return BaseTemplateUnplugin(options, 'mpx')
}
