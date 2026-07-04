import type { ViteFrameworkCssPipelineStrategy } from '../../shared/framework-strategy'
import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { transformWebCssCompat, transformWebCssSafeSelectors } from '@weapp-tailwindcss/postcss'
import { viteStyleInjectorDelegates } from '@/style-injector/internal'
import { createViteFrameworkPlugins } from '../../shared/create-framework-plugins'

function isUniAppWebviewStylePlatform(platform: string | undefined) {
  return platform === 'app' || platform === 'app-plus'
}

const uniAppCssPipelineStrategy: ViteFrameworkCssPipelineStrategy = {
  getServeJsHandlerOptions(context) {
    return isUniAppWebviewStylePlatform(context.resolveStylePlatform())
      ? { needEscaped: true }
      : undefined
  },
  shouldApplyWebCssCompat(context) {
    return isUniAppWebviewStylePlatform(context.resolveStylePlatform())
  },
  shouldTransformServeJs(context) {
    return !context.currentGeneratorBranch.isWeb
      || isUniAppWebviewStylePlatform(context.resolveStylePlatform())
  },
  transformGeneratedCss(css, context) {
    const webCss = context.shouldApplyWebCssCompat
      ? transformWebCssCompat(
          css,
          context.currentGeneratorBranch.isWeb
            ? context.currentGeneratorOptions.webCompat
            : context.currentGeneratorOptions.webCompat ?? true,
        )
      : css
    const safeCss = isUniAppWebviewStylePlatform(context.resolveStylePlatform())
      ? transformWebCssSafeSelectors(webCss, { escapeMap: context.opts.escapeMap })
      : webCss
    return context.removeScopedPreflight(safeCss)
  },
}

export function createUniAppVitePlugins(options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
  return createViteFrameworkPlugins(options, {
    frameworkName: 'uni-app',
    cssPipelineStrategy: uniAppCssPipelineStrategy,
    styleInjectorDelegate: viteStyleInjectorDelegates.uniApp,
  })
}
