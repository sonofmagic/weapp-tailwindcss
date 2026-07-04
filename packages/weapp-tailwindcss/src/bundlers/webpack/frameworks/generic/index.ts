import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { webpackStyleInjectorDelegates } from '@/style-injector/internal'
import { WebpackFrameworkPlugin } from '../../shared/create-framework-plugin'
import { createDefaultLoaderAnchorFinders } from '../../shared/loader-anchors'

export class GenericWebpackPlugin extends WebpackFrameworkPlugin {
  constructor(options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
    super(options, {
      frameworkName: 'generic',
      loaderAnchorFinders: createDefaultLoaderAnchorFinders(),
      styleInjectorDelegate: webpackStyleInjectorDelegates.generic,
    })
  }
}
