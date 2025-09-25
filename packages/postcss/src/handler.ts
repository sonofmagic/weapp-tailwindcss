import type { AcceptedPlugin, ProcessOptions } from 'postcss'
import type { IStyleHandlerOptions } from './types'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import postcss from 'postcss'
import { getDefaultOptions } from './defaults'
import { getPlugins } from './plugins'
import { createInjectPreflight } from './preflight'

function createProcessOptions(options: IStyleHandlerOptions): ProcessOptions {
  return {
    from: undefined,
    ...(options.postcssOptions?.options ?? {}),
  }
}

const pluginCache = new WeakMap<IStyleHandlerOptions, AcceptedPlugin[]>()
const processOptionsCache = new WeakMap<IStyleHandlerOptions, ProcessOptions>()
const processOptionsSourceCache = new WeakMap<IStyleHandlerOptions, unknown>()

function getCachedPlugins(options: IStyleHandlerOptions) {
  let plugins = pluginCache.get(options)
  if (!plugins) {
    plugins = getPlugins(options)
    pluginCache.set(options, plugins)
  }
  return plugins
}

function getCachedProcessOptions(options: IStyleHandlerOptions) {
  const source = options.postcssOptions?.options
  let cached = processOptionsCache.get(options)
  const cachedSource = processOptionsSourceCache.get(options)

  if (!cached || cachedSource !== source) {
    cached = createProcessOptions(options)
    processOptionsCache.set(options, cached)
    processOptionsSourceCache.set(options, source)
  }

  return { ...cached }
}

function styleHandler(rawSource: string, options: IStyleHandlerOptions) {
  const plugins = getCachedPlugins(options)
  const processOptions = getCachedProcessOptions(options)

  return postcss(plugins)
    .process(
      rawSource,
      processOptions,
    )
    .async()
}

export function createStyleHandler(options?: Partial<IStyleHandlerOptions>) {
  const cachedOptions = defuOverrideArray<
    IStyleHandlerOptions,
    Partial<IStyleHandlerOptions>[]
  >(
    options as IStyleHandlerOptions,
    getDefaultOptions(options),
  )

  cachedOptions.cssInjectPreflight = createInjectPreflight(cachedOptions.cssPreflight)
  getCachedPlugins(cachedOptions)
  getCachedProcessOptions(cachedOptions)

  return (rawSource: string, opt?: Partial<IStyleHandlerOptions>) => {
    const resolvedOptions = defuOverrideArray<
      IStyleHandlerOptions,
      Partial<IStyleHandlerOptions>[]
    >(opt as IStyleHandlerOptions, cachedOptions)

    return styleHandler(
      rawSource,
      resolvedOptions,
    )
  }
}
