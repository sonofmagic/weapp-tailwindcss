import type { ViteFrameworkCssPipelineStrategy } from '../../shared/framework-strategy'
import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { hasTailwindApplyDirective } from '@/bundlers/shared/generator-css/directives'
import { viteStyleInjectorDelegates } from '@/style-injector/internal'
import { isUniAppXHarmonyOutDir } from '@/uni-app-x/harmony'
import { isUniAppXHarmonyBundle } from '@/uni-app-x/style-asset'
import { createUniAppXPlugins } from '@/uni-app-x/vite'
import { withUniAppXWebPreflightReset } from '@/uni-app-x/web-preflight-reset'
import { resolveUniUtsPlatform } from '@/utils'
import { createViteFrameworkPlugins } from '../../shared/create-framework-plugins'
import { resolveUniAppXNativeCssHandlerOptions } from '../../uni-app-x-css-options'

function isUniAppXNativeAppStyleTarget() {
  return resolveUniUtsPlatform().isApp
}

function isUniAppXHarmonyAppStyleTarget(context: Parameters<NonNullable<ViteFrameworkCssPipelineStrategy['isHarmonyAppStyleTarget']>>[0]) {
  const uniUtsPlatform = resolveUniUtsPlatform()
  const canInferHarmonyAppStyleTarget = !uniUtsPlatform.normalized || uniUtsPlatform.isApp
  return uniUtsPlatform.isAppHarmony || (
    canInferHarmonyAppStyleTarget
    && (
      (context.bundle != null && isUniAppXHarmonyBundle(context.bundle))
      || isUniAppXHarmonyOutDir(context.resolvedConfig?.build?.outDir)
    )
  )
}

const uniAppXCssPipelineStrategy: ViteFrameworkCssPipelineStrategy = {
  getCssHandlerExtraOptions(context) {
    return resolveUniAppXNativeCssHandlerOptions(context.opts)
  },
  isNativeAppStyleTarget() {
    return isUniAppXNativeAppStyleTarget()
  },
  isHarmonyAppStyleTarget(context) {
    return isUniAppXHarmonyAppStyleTarget(context)
  },
  shouldPreserveStyleOutputExtension(context) {
    return isUniAppXNativeAppStyleTarget()
      || isUniAppXHarmonyAppStyleTarget(context)
  },
  shouldDeferEmptyScopedCssSource(context) {
    if (!context.cssHandlerOptions.isMainChunk && hasTailwindApplyDirective(context.generatorCode)) {
      return false
    }
    return true
  },
  transformGeneratedCss(css, context) {
    const webCss = context.shouldApplyWebCssCompat
      ? context.defaultWebCssCompat(css)
      : css
    return withUniAppXWebPreflightReset(
      context.removeScopedPreflight(webCss),
      context.currentGeneratorBranch.isWeb,
    )
  },
}

export function createUniAppXVitePlugins(options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
  return createViteFrameworkPlugins(options, {
    frameworkName: 'uni-app-x',
    cssPipelineStrategy: uniAppXCssPipelineStrategy,
    getExtraPluginPlatform: () => ({
      isIosPlatform: resolveUniUtsPlatform().isAppIos,
    }),
    styleInjectorDelegate: viteStyleInjectorDelegates.uniApp,
    isRuntimeClassSetFeatureEnabled: () => true,
    createExtraPlugins: context => createUniAppXPlugins({
      appType: 'uni-app-x',
      customAttributesEntities: context.customAttributesEntities,
      disabledDefaultTemplateHandler: context.disabledDefaultTemplateHandler,
      ensureRuntimeClassSet: context.ensureRuntimeClassSet,
      generateCss: context.generateCss,
      getResolvedConfig: context.getResolvedConfig,
      isEnabled: context.isEnabled,
      isIosPlatform: context.isIosPlatform,
      jsHandler: context.jsHandler,
      mainCssChunkMatcher: context.mainCssChunkMatcher,
      runtimeState: context.runtimeState,
      styleHandler: context.styleHandler,
      uniAppX: context.uniAppX,
    }),
  })
}
