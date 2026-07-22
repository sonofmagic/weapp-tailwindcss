import type { ViteFrameworkCssPipelineStrategy } from '../../shared/framework-strategy'
import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { hasTailwindApplyDirective } from '@/bundlers/shared/generator-css/directives'
import { viteStyleInjectorDelegates } from '@/style-injector/internal'
import { isUniAppXHarmonyOutDir, isUniAppXNativeAppOutDir } from '@/uni-app-x/harmony'
import { isUniAppXHarmonyBundle } from '@/uni-app-x/style-asset'
import { createUniAppXPlugins } from '@/uni-app-x/vite'
import { withUniAppXWebPreflightReset } from '@/uni-app-x/web-preflight-reset'
import { resolveUniUtsPlatform } from '@/utils'
import { createViteFrameworkPlugins } from '../../shared/create-framework-plugins'
import { resolveUniAppXNativeCssHandlerOptions } from '../../uni-app-x-css-options'

function isUniAppXNativeAppStyleTarget(context?: Parameters<NonNullable<ViteFrameworkCssPipelineStrategy['isNativeAppStyleTarget']>>[0]) {
  return resolveUniUtsPlatform().isApp
    || isUniAppXNativeAppOutDir(context?.resolvedConfig?.build?.outDir)
    || isUniAppXNativeAppOutDir(context?.resolvedConfig?.root)
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

export const uniAppXCssPipelineStrategy: ViteFrameworkCssPipelineStrategy = {
  getCssHandlerExtraOptions(context) {
    return resolveUniAppXNativeCssHandlerOptions(context.opts)
  },
  isNativeAppStyleTarget(context) {
    return isUniAppXNativeAppStyleTarget(context)
  },
  isHarmonyAppStyleTarget(context) {
    return isUniAppXHarmonyAppStyleTarget(context)
  },
  shouldPreserveStyleOutputExtension(context) {
    return isUniAppXNativeAppStyleTarget(context)
      || isUniAppXHarmonyAppStyleTarget(context)
  },
  shouldKeepRootMiniProgramStyleAsImportShell() {
    return true
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
    adaptWatchCssBeforeFrameworkCache: true,
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
