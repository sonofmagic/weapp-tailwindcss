import { UserDefinedOptions } from '@/types'
import { BaseJsxWebpackPluginV4 } from './BaseJsxPlugin/v4'
import { BaseTemplateWebpackPluginV4 } from './BaseTemplatePlugin/v4'

export class KboneWeappTailwindcssWebpackPluginV4 extends BaseTemplateWebpackPluginV4 {
  constructor(options: UserDefinedOptions = {}) {
    super(options, 'kbone')
  }
}

export class RemaxWeappTailwindcssWebpackPluginV4 extends BaseJsxWebpackPluginV4 {
  constructor(options: UserDefinedOptions) {
    super(
      {
        ...options,
        framework: 'react'
      },
      'remax'
    )
  }
}

export class TaroWeappTailwindcssWebpackPluginV4 extends BaseJsxWebpackPluginV4 {
  constructor(options: UserDefinedOptions = { framework: 'react' }) {
    super(options, 'taro')
  }
}

export class UniAppWeappTailwindcssWebpackPluginV4 extends BaseTemplateWebpackPluginV4 {
  constructor(options: UserDefinedOptions = {}) {
    super(options, 'uni-app')
  }
}
