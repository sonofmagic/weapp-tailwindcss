import type { Plugin, ResolvedConfig } from 'vite'
import type { ViteFrameworkName } from '../../framework-selector'
import type { createViteRuntimeClassSet } from '../runtime-class-set'
import type { ViteFrameworkCssPipelineStrategy, ViteFrameworkExtraPluginPlatform, ViteFrameworkRuntimeFeatureContext } from './framework-strategy'
import type { getCompilerContext } from '@/context'
import type { toCustomAttributesEntities } from '@/context/custom-attributes'
import type { ViteStyleInjectorDelegateFactory } from '@/style-injector/internal'
import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import {
  createViteSourceOutputRelationOwner,
  withViteSourceOutputRelationOwner,
} from '../source-output-relations'
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

function wrapPluginHook(
  hook: unknown,
  before: (...args: any[]) => void,
) {
  if (typeof hook === 'function') {
    return function wrappedHook(this: unknown, ...args: any[]) {
      before(...args)
      return hook.apply(this, args)
    }
  }
  if (hook && typeof hook === 'object' && 'handler' in hook && typeof hook.handler === 'function') {
    return {
      ...hook,
      handler(this: unknown, ...args: any[]) {
        before(...args)
        return hook.handler.apply(this, args)
      },
    }
  }
  return hook
}

function wrapPluginCloseBundle(hook: unknown, dispose: () => void) {
  if (typeof hook === 'function') {
    return async function wrappedCloseBundle(this: unknown, ...args: any[]) {
      try {
        return await hook.apply(this, args)
      }
      finally {
        dispose()
      }
    }
  }
  if (hook && typeof hook === 'object' && 'handler' in hook && typeof hook.handler === 'function') {
    return {
      ...hook,
      async handler(this: unknown, ...args: any[]) {
        try {
          return await hook.handler.apply(this, args)
        }
        finally {
          dispose()
        }
      },
    }
  }
  return dispose
}

export function createViteFrameworkPlugins(
  options: UserDefinedOptions | InternalUserDefinedOptions = {},
  frameworkBranch: ViteFrameworkBranchContext,
): WeappTailwindcssVitePlugin[] | undefined {
  const relationOwner = createViteSourceOutputRelationOwner()
  const plugins = withViteSourceOutputRelationOwner(
    relationOwner,
    () => createRuntimeViteFrameworkPlugins(options, frameworkBranch),
  )
  if (!plugins) {
    relationOwner.dispose()
    return undefined
  }
  const wrappedPlugins = plugins.map(plugin => ({
    ...plugin,
    watchChange: wrapPluginHook(plugin.watchChange, (id: string, change: { event?: string } | undefined) => {
      if (change?.event === 'delete') {
        relationOwner.removeSource(id)
      }
      else {
        relationOwner.observeSource(id)
      }
    }),
    handleHotUpdate: wrapPluginHook(plugin.handleHotUpdate, (context: { file?: string } | undefined) => {
      if (context?.file) {
        relationOwner.observeSource(context.file)
      }
    }),
  }))
  const cleanupPlugin = wrappedPlugins.at(-1)
  if (cleanupPlugin) {
    cleanupPlugin.closeBundle = wrapPluginCloseBundle(cleanupPlugin.closeBundle, relationOwner.dispose)
  }
  return wrappedPlugins
}
