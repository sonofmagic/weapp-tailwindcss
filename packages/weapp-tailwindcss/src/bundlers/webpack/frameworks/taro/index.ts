import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { webpackStyleInjectorDelegates } from '@/style-injector/internal'
import { WebpackFrameworkPlugin } from '../../shared/create-framework-plugin'
import { createDefaultLoaderAnchorFinders } from '../../shared/loader-anchors'

export class TaroWebpackPlugin extends WebpackFrameworkPlugin {
  constructor(options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
    super(options, {
      frameworkName: 'taro',
      loaderAnchorFinders: createDefaultLoaderAnchorFinders(),
      styleInjectorDelegate: webpackStyleInjectorDelegates.taro,
    })
  }
}
