import type { Plugin } from 'vite'
import type { WebpackObjectPluginInstance, WebpackWeappStyleInjectorOptions } from 'weapp-style-injector/webpack'
import type { WeappTailwindcssStyleInjectorUserOptions } from './options'
import { weappStyleInjector } from 'weapp-style-injector/vite'
import { StyleInjector as TaroViteStyleInjector } from 'weapp-style-injector/vite/taro'
import { StyleInjector as UniAppViteStyleInjector } from 'weapp-style-injector/vite/uni-app'
import { weappStyleInjectorWebpack } from 'weapp-style-injector/webpack'
import { StyleInjector as MpxWebpackStyleInjector } from 'weapp-style-injector/webpack/mpx'
import { StyleInjector as TaroWebpackStyleInjector } from 'weapp-style-injector/webpack/taro'
import { StyleInjector as UniAppWebpackStyleInjector } from 'weapp-style-injector/webpack/uni-app'
import { normalizeStyleInjectorOptions } from './options'

type VitePluginResult = Plugin | Plugin[]
type ViteHookContext = ThisParameterType<NonNullable<Plugin['buildStart']>>
export type ViteStyleInjectorDelegateFactory = (options: NonNullable<ReturnType<typeof normalizeStyleInjectorOptions>>) => Plugin[]
export type WebpackStyleInjectorDelegateFactory = (
  options: NonNullable<ReturnType<typeof normalizeWebpackStyleInjectorOptions>>,
) => WebpackObjectPluginInstance

function toPluginArray(pluginOrPlugins: VitePluginResult): Plugin[] {
  return Array.isArray(pluginOrPlugins) ? pluginOrPlugins : [pluginOrPlugins]
}

function normalizeWebpackStyleInjectorOptions(
  options: WeappTailwindcssStyleInjectorUserOptions | undefined,
): WebpackWeappStyleInjectorOptions | undefined {
  const normalized = normalizeStyleInjectorOptions(options)
  if (!normalized) {
    return undefined
  }
  const {
    generateSubpackageStyle,
    loadSubpackageTargetStyle,
    ...rest
  } = normalized
  const webpackOptions: WebpackWeappStyleInjectorOptions = {
    ...rest,
  }
  if (generateSubpackageStyle) {
    webpackOptions.generateSubpackageStyle = (context) => {
      const generated = generateSubpackageStyle(context)
      if (generated && typeof (generated as Promise<unknown>).then === 'function') {
        throw new TypeError('[weapp-style-injector] Webpack subpackage style generators must return synchronously.')
      }
      return generated as string | Uint8Array | null | undefined
    }
  }
  if (loadSubpackageTargetStyle) {
    webpackOptions.loadSubpackageTargetStyle = (fileName, sourceAbsolutePath) => {
      const loaded = loadSubpackageTargetStyle(fileName, sourceAbsolutePath)
      if (loaded && typeof (loaded as Promise<unknown>).then === 'function') {
        throw new TypeError('[weapp-style-injector] Webpack subpackage target style loaders must return synchronously.')
      }
      return loaded as string | Uint8Array | null | undefined
    }
  }
  return webpackOptions
}

function getTransformHandler(hook: Plugin['transform'] | undefined) {
  if (typeof hook === 'function') {
    return hook
  }
  if (hook && typeof hook === 'object' && typeof hook.handler === 'function') {
    return hook.handler
  }
  return undefined
}

function getGenerateBundleHandler(hook: Plugin['generateBundle'] | undefined) {
  if (typeof hook === 'function') {
    return hook
  }
  if (hook && typeof hook === 'object' && typeof hook.handler === 'function') {
    return hook.handler
  }
  return undefined
}

export const viteStyleInjectorDelegates = {
  generic: (options => [weappStyleInjector(options)]) satisfies ViteStyleInjectorDelegateFactory,
  taro: (options => toPluginArray(TaroViteStyleInjector(options))) satisfies ViteStyleInjectorDelegateFactory,
  uniApp: (options => toPluginArray(UniAppViteStyleInjector(options))) satisfies ViteStyleInjectorDelegateFactory,
}

export const webpackStyleInjectorDelegates = {
  generic: (options => weappStyleInjectorWebpack(options)) satisfies WebpackStyleInjectorDelegateFactory,
  mpx: (options => MpxWebpackStyleInjector(options)) satisfies WebpackStyleInjectorDelegateFactory,
  taro: (options => TaroWebpackStyleInjector(options)) satisfies WebpackStyleInjectorDelegateFactory,
  uniApp: (options => UniAppWebpackStyleInjector(options)) satisfies WebpackStyleInjectorDelegateFactory,
}

export function createBuiltinViteStyleInjectorPlugins(
  options: WeappTailwindcssStyleInjectorUserOptions | undefined,
  getDelegateFactory: () => ViteStyleInjectorDelegateFactory,
): Plugin[] {
  const normalized = normalizeStyleInjectorOptions(options)
  if (!normalized) {
    return []
  }

  let config: Parameters<NonNullable<Plugin['configResolved']>>[0] | undefined
  let delegates: Plugin[] | undefined
  let delegatesConfigured = false
  let delegatesBuildStarted = false

  const resolveDelegates = () => {
    if (delegates) {
      return delegates
    }
    delegates = getDelegateFactory()(normalized)
    return delegates
  }

  const configureDelegates = async () => {
    if (delegatesConfigured || !config) {
      return
    }
    delegatesConfigured = true
    for (const plugin of resolveDelegates()) {
      if (typeof plugin.configResolved === 'function') {
        await plugin.configResolved(config)
      }
    }
  }

  const startDelegates = async (context: ViteHookContext) => {
    if (delegatesBuildStarted) {
      return
    }
    await configureDelegates()
    delegatesBuildStarted = true
    for (const plugin of resolveDelegates()) {
      if (typeof plugin.buildStart === 'function') {
        await plugin.buildStart.call(context, {})
      }
    }
  }

  return [
    {
      name: 'weapp-tailwindcss:style-injector-pre',
      apply: 'build',
      enforce: 'pre',
      configResolved(resolvedConfig) {
        config = resolvedConfig
      },
      async buildStart() {
        await startDelegates(this)
      },
      async load(id, options) {
        await configureDelegates()
        for (const plugin of resolveDelegates()) {
          if (typeof plugin.load !== 'function') {
            continue
          }
          const result = await plugin.load.call(this, id, options)
          if (result != null) {
            return result
          }
        }
      },
      async transform(code, id, options) {
        await configureDelegates()
        let currentCode = code
        let changed = false
        for (const plugin of resolveDelegates()) {
          const handler = getTransformHandler(plugin.transform)
          if (!handler) {
            continue
          }
          const result = await handler.call(this, currentCode, id, options)
          if (!result) {
            continue
          }
          if (typeof result === 'string') {
            currentCode = result
            changed = true
          }
          else if (typeof result === 'object' && typeof result.code === 'string') {
            currentCode = result.code
            changed = true
          }
        }
        if (changed) {
          return {
            code: currentCode,
            map: null,
          }
        }
      },
    },
    {
      name: 'weapp-tailwindcss:style-injector',
      apply: 'build',
      enforce: 'post',
      configResolved(resolvedConfig) {
        config = resolvedConfig
      },
      async generateBundle(outputOptions, bundle, isWrite) {
        await configureDelegates()
        for (const plugin of resolveDelegates()) {
          const handler = getGenerateBundleHandler(plugin.generateBundle)
          if (!handler) {
            continue
          }
          await handler.call(this, outputOptions, bundle, isWrite)
        }
      },
    },
  ]
}

export function createBuiltinWebpackStyleInjectorPlugin(
  options: WeappTailwindcssStyleInjectorUserOptions | undefined,
  delegateFactory: WebpackStyleInjectorDelegateFactory,
): WebpackObjectPluginInstance | undefined {
  const normalized = normalizeWebpackStyleInjectorOptions(options)
  if (!normalized) {
    return undefined
  }
  return delegateFactory(normalized)
}

export type { WeappTailwindcssStyleInjectorOptions, WeappTailwindcssStyleInjectorUserOptions } from './options'
