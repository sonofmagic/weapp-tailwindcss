import type { UserDefinedOptions } from '../types'
import { BaseWebpackPluginV4 } from '../BaseTemplatePlugin'

export class UniAppWeappTailwindcssWebpackPluginV4 extends BaseWebpackPluginV4 {
  constructor (options: UserDefinedOptions = {}) {
    super(options, 'uni-app')
  }
}
