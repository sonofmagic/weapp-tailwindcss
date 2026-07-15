import type { Plugin, ResolvedConfig } from 'vite'
import type { ViteFrameworkName } from '../../framework-selector'
import type { createViteRuntimeClassSet } from '../runtime-class-set'
import type { ViteFrameworkCssPipelineStrategy, ViteFrameworkExtraPluginPlatform, ViteFrameworkRuntimeFeatureContext } from './framework-strategy'
import type { getCompilerContext } from '@/context'
import type { toCustomAttributesEntities } from '@/context/custom-attributes'
import type { ViteStyleInjectorDelegateFactory } from '@/style-injector/internal'
import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { createViteFrameworkPlugins as createRuntimeViteFrameworkPlugins } from './create-framework-plugins-runtime'

export interface WeappTailwindcssVitePlugin {
  name: string
  [hook: string]: any
}

export interface ViteFrameworkBranchContext {
  frameworkName: ViteFrameworkName
  adaptWatchCssBeforeFrameworkCache?: boolean
  createExtraPlugins?: (context: ViteFrameworkExtraPluginContext) => Plugin[]
  cssPipelineStrategy?: ViteFrameworkCssPipelineStrategy
  getExtraPluginPlatform?: () => ViteFrameworkExtraPluginPlatform
  styleInjectorDelegate: ViteStyleInjectorDelegateFactory
  isRuntimeClassSetFeatureEnabled?: (context: ViteFrameworkRuntimeFeatureContext) => boolean
}

export interface ViteFrameworkExtraPluginContext {
  customAttributesEntities: ReturnType<typeof toCustomAttributesEntities>
  disabledDefaultTemplateHandler: boolean | undefined
  ensureRuntimeClassSet: (...args: any[]) => Promise<Set<string>>
  generateCss: (...args: any[]) => Promise<string | undefined>
  getResolvedConfig: () => ResolvedConfig | undefined
  isEnabled: () => boolean
  isIosPlatform: boolean
  jsHandler: ReturnType<typeof getCompilerContext>['jsHandler']
  mainCssChunkMatcher: ReturnType<typeof getCompilerContext>['mainCssChunkMatcher']
  runtimeState: ReturnType<typeof createViteRuntimeClassSet>['runtimeState']
  styleHandler: ReturnType<typeof getCompilerContext>['styleHandler']
  uniAppX: ReturnType<typeof getCompilerContext>['uniAppX']
}

export function createViteFrameworkPlugins(
  options: UserDefinedOptions | InternalUserDefinedOptions = {},
  frameworkBranch: ViteFrameworkBranchContext,
): WeappTailwindcssVitePlugin[] | undefined {
  return createRuntimeViteFrameworkPlugins(options, frameworkBranch)
}
