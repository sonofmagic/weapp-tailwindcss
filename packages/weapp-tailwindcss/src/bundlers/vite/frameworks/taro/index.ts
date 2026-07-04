import type { ViteFrameworkCssPipelineStrategy } from '../../shared/framework-strategy'
import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { viteStyleInjectorDelegates } from '@/style-injector/internal'
import { createViteFrameworkPlugins } from '../../shared/create-framework-plugins'

const taroCssPipelineStrategy: ViteFrameworkCssPipelineStrategy = {
  shouldKeepRootMiniProgramStyleAsImportShell() {
    return true
  },
  shouldMoveRootMiniProgramStyleToImportShellOrigin() {
    return true
  },
  shouldNormalizeRootMiniProgramImportShell() {
    return true
  },
}

export function createTaroVitePlugins(options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
  return createViteFrameworkPlugins(options, {
    frameworkName: 'taro',
    cssPipelineStrategy: taroCssPipelineStrategy,
    styleInjectorDelegate: viteStyleInjectorDelegates.taro,
  })
}
