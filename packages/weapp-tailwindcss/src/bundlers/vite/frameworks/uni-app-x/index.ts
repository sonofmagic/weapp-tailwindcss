import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { viteStyleInjectorDelegates } from '@/style-injector/internal'
import { createUniAppXPlugins } from '@/uni-app-x/vite'
import { createViteFrameworkPlugins } from '../../shared/create-framework-plugins'

export function createUniAppXVitePlugins(options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
  return createViteFrameworkPlugins(options, {
    frameworkName: 'uni-app-x',
    styleInjectorDelegate: viteStyleInjectorDelegates.uniApp,
    uniAppXRuntimeEnabled: true,
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
