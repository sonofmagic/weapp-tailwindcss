import { UserDefinedOptions } from '@/types'
import { BaseJsxWebpackPluginV5 } from './BaseJsxPlugin/v5'
import { BaseTemplateWebpackPluginV5 } from './BaseTemplatePlugin/v5'
export class MpxWeappTailwindcssWebpackPluginV5 extends BaseTemplateWebpackPluginV5 {
  constructor(options: UserDefinedOptions = {}) {
    super(options, 'mpx')
  }
}

export class NativeWeappTailwindcssWebpackPluginV5 extends BaseTemplateWebpackPluginV5 {
  constructor(options: UserDefinedOptions = {}) {
    super(options, 'native')
  }
}

export class RaxTailwindcssWebpackPluginV5 extends BaseJsxWebpackPluginV5 {
  constructor(options: UserDefinedOptions = { framework: 'react' }) {
    super(options, 'rax')
  }
}

export class TaroWeappTailwindcssWebpackPluginV5 extends BaseJsxWebpackPluginV5 {
  constructor(options: UserDefinedOptions = { framework: 'react' }) {
    super(options, 'taro')
  }
}

// https://github.com/dcloudio/uni-app/issues/3723
export class UniAppWeappTailwindcssWebpackPluginV5 extends BaseTemplateWebpackPluginV5 {
  constructor(options: UserDefinedOptions = {}) {
    super(options, 'uni-app')
  }
}
