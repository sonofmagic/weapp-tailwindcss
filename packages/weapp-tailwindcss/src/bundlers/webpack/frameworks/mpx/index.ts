import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { setupMpxTailwindcssRedirect } from '@/shared/mpx'
import { webpackStyleInjectorDelegates } from '@/style-injector/internal'
import { WebpackFrameworkPlugin } from '../../shared/create-framework-plugin'
import { createMpxLoaderAnchorFinders } from '../../shared/loader-anchors'

export class MpxWebpackPlugin extends WebpackFrameworkPlugin {
  constructor(options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
    super(options, {
      frameworkName: 'mpx',
      loaderAnchorFinders: createMpxLoaderAnchorFinders(),
      mpxCssImportRewrite: true,
      setupCssImportRewriteRedirect: packageDir => setupMpxTailwindcssRedirect(packageDir, true),
      styleInjectorDelegate: webpackStyleInjectorDelegates.mpx,
    })
  }
}
