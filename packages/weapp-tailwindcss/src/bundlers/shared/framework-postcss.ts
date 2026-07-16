import type { AcceptedPlugin } from '@weapp-tailwindcss/postcss'
import type { IStyleHandlerOptions, LoadedPostcssOptions } from '@weapp-tailwindcss/postcss/types'
import type { GenerateCssByGeneratorResult } from './generator-css'
import type { InternalUserDefinedOptions } from '@/types'
import { postcss, removeTailwindPostcssPlugins } from '@weapp-tailwindcss/postcss'
import { finalizeMiniProgramGeneratorCss } from './generator-css/generation-helpers'

const FRAMEWORK_POSTCSS_REGISTRY = Symbol.for('weapp-tailwindcss.framework-postcss-options')
const registryHost = globalThis as typeof globalThis & Record<symbol, unknown>
const frameworkPostcssOptions = (
  registryHost[FRAMEWORK_POSTCSS_REGISTRY]
    ??= new WeakMap<object, LoadedPostcssOptions>()
) as WeakMap<object, LoadedPostcssOptions>

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizePlugins(plugins: unknown): AcceptedPlugin[] {
  const entries = Array.isArray(plugins)
    ? plugins
    : isObject(plugins)
      ? Object.values(plugins)
      : []
  const resolved = [...new Set(entries.filter(Boolean))] as AcceptedPlugin[]
  removeTailwindPostcssPlugins(resolved)
  return resolved
}

export function resolveFrameworkPostcssOptions(value: unknown): LoadedPostcssOptions | undefined {
  if (!isObject(value)) {
    return undefined
  }
  const plugins = normalizePlugins(value['plugins'])
  const options = Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== 'plugins' && key !== 'config'),
  )
  if (plugins.length === 0 && Object.keys(options).length === 0) {
    return undefined
  }
  return {
    plugins: plugins as NonNullable<LoadedPostcssOptions['plugins']>,
    options,
  }
}

function mergeFrameworkPostcssOptions(
  left: LoadedPostcssOptions | undefined,
  right: LoadedPostcssOptions | undefined,
): LoadedPostcssOptions | undefined {
  if (!left) {
    return right
  }
  if (!right) {
    return left
  }
  return {
    plugins: [...new Set([
      ...normalizePlugins(left.plugins),
      ...normalizePlugins(right.plugins),
    ])] as NonNullable<LoadedPostcssOptions['plugins']>,
    options: {
      ...(left.options ?? {}),
      ...(right.options ?? {}),
    },
  }
}

export function collectFrameworkPostcssOptionsFromLoaderEntries(
  entries: unknown[],
  loaderContext?: unknown,
): LoadedPostcssOptions | undefined {
  let resolved: LoadedPostcssOptions | undefined
  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }
    if (!isObject(value)) {
      return
    }
    const loader = value['loader']
    if (typeof loader === 'string' && loader.includes('postcss-loader')) {
      const loaderOptions = value['options']
      const rawOptions = isObject(loaderOptions) ? loaderOptions['postcssOptions'] : undefined
      const options = typeof rawOptions === 'function'
        ? rawOptions(loaderContext)
        : rawOptions
      resolved = mergeFrameworkPostcssOptions(resolved, resolveFrameworkPostcssOptions(options))
      return
    }
    visit(value['rules'])
    visit(value['oneOf'])
    visit(value['use'])
  }
  entries.forEach(visit)
  return resolved
}

export function captureFrameworkPostcssOptions(
  owner: InternalUserDefinedOptions,
  options: unknown,
): LoadedPostcssOptions | undefined {
  const resolved = resolveFrameworkPostcssOptions(options)
  if (!resolved) {
    frameworkPostcssOptions.delete(owner)
    return undefined
  }
  frameworkPostcssOptions.set(owner, resolved)
  return resolved
}

export function captureResolvedFrameworkPostcssOptions(
  owner: InternalUserDefinedOptions,
  options: LoadedPostcssOptions | undefined,
): LoadedPostcssOptions | undefined {
  if (!options) {
    frameworkPostcssOptions.delete(owner)
    return undefined
  }
  frameworkPostcssOptions.set(owner, options)
  return options
}

export function hasFrameworkPostcssOptions(owner: InternalUserDefinedOptions): boolean {
  return frameworkPostcssOptions.has(owner)
}

function createGeneratedCssHandlerOptions(
  owner: InternalUserDefinedOptions,
  options: IStyleHandlerOptions,
  from: string,
): IStyleHandlerOptions {
  const frameworkOptions = frameworkPostcssOptions.get(owner)
  const merged = mergeFrameworkPostcssOptions(options.postcssOptions, frameworkOptions)
  return {
    ...options,
    postcssOptions: {
      ...(merged ?? {}),
      options: {
        ...(merged?.options ?? {}),
        from,
      },
    },
  }
}

export async function adaptGeneratedCssWithFrameworkPipeline(
  owner: InternalUserDefinedOptions,
  generated: GenerateCssByGeneratorResult,
  options: {
    cssHandlerOptions: IStyleHandlerOptions
    file: string
    majorVersion: number
    styleHandler: InternalUserDefinedOptions['styleHandler']
  },
): Promise<string> {
  const handled = await options.styleHandler(
    generated.css,
    createGeneratedCssHandlerOptions(owner, options.cssHandlerOptions, options.file),
  )
  const preflightMode = generated.metadata?.preflightMode
  const injectPreflight = preflightMode?.inject ?? options.cssHandlerOptions.isMainChunk
  const preservePreflight = preflightMode?.preserve ?? options.cssHandlerOptions.isMainChunk
  return finalizeMiniProgramGeneratorCss(
    handled.css,
    generated.target,
    options.majorVersion,
    owner.cssPreflight,
    {
      ...(injectPreflight === undefined ? {} : { injectPreflight }),
      ...(preservePreflight === undefined ? {} : { preservePreflight }),
      styleOptions: options.cssHandlerOptions,
    },
  )
}

export async function adaptGeneratedCssWithFrameworkRootPipeline(
  owner: InternalUserDefinedOptions,
  generated: GenerateCssByGeneratorResult,
  options: {
    cssHandlerOptions: IStyleHandlerOptions
    file: string
    majorVersion: number
    styleHandler: InternalUserDefinedOptions['styleHandler']
  },
): Promise<string> {
  const handlerOptions = createGeneratedCssHandlerOptions(owner, options.cssHandlerOptions, options.file)
  const handled = typeof options.styleHandler.transformRoot === 'function'
    ? await options.styleHandler.transformRoot(
        postcss.parse(generated.css, handlerOptions.postcssOptions?.options),
        handlerOptions,
      )
    : await options.styleHandler(generated.css, handlerOptions)
  const preflightMode = generated.metadata?.preflightMode
  const injectPreflight = preflightMode?.inject ?? options.cssHandlerOptions.isMainChunk
  const preservePreflight = preflightMode?.preserve ?? options.cssHandlerOptions.isMainChunk
  return finalizeMiniProgramGeneratorCss(
    handled.css,
    generated.target,
    options.majorVersion,
    owner.cssPreflight,
    {
      ...(injectPreflight === undefined ? {} : { injectPreflight }),
      ...(preservePreflight === undefined ? {} : { preservePreflight }),
      styleOptions: options.cssHandlerOptions,
    },
  )
}
