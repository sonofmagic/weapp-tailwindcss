import type { AcceptedPlugin } from '@weapp-tailwindcss/postcss'
import type { InternalUserDefinedOptions } from '@/types'
import { getPostcssPluginName, postcss } from '@weapp-tailwindcss/postcss'

const FRAMEWORK_UNIT_PLUGIN_NAMES = new Set(['postcss-pxtransform'])
const FRAMEWORK_POSTCSS_REGISTRY = Symbol.for('weapp-tailwindcss.framework-postcss-plugins')
const registryHost = globalThis as typeof globalThis & Record<symbol, unknown>
const frameworkPostcssPlugins = (
  registryHost[FRAMEWORK_POSTCSS_REGISTRY]
    ??= new WeakMap<object, AcceptedPlugin[]>()
) as WeakMap<object, AcceptedPlugin[]>

function isPluginEntry(value: unknown): value is { loader?: unknown, options?: unknown } {
  return typeof value === 'object' && value !== null
}

function readPostcssPlugins(value: unknown): unknown[] {
  if (!value || typeof value !== 'object') {
    return []
  }
  const plugins = (value as { plugins?: unknown }).plugins
  return Array.isArray(plugins) ? plugins : Object.values(plugins as Record<string, unknown> ?? {})
}

export function resolveFrameworkPostcssPlugins(plugins: unknown): AcceptedPlugin[] {
  const entries = Array.isArray(plugins)
    ? plugins
    : plugins && typeof plugins === 'object'
      ? Object.values(plugins as Record<string, unknown>)
      : []
  const resolved: AcceptedPlugin[] = []
  const seen = new Set<unknown>()
  for (const plugin of entries) {
    if (!plugin || seen.has(plugin)) {
      continue
    }
    if (FRAMEWORK_UNIT_PLUGIN_NAMES.has(getPostcssPluginName(plugin) ?? '')) {
      seen.add(plugin)
      resolved.push(plugin as AcceptedPlugin)
    }
  }
  return resolved
}

export function collectFrameworkPostcssPluginsFromLoaderEntries(entries: unknown[]): AcceptedPlugin[] {
  const plugins: unknown[] = []
  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }
    if (!isPluginEntry(value)) {
      return
    }
    const entry = value
    const loader = entry.loader
    if (typeof loader === 'string' && loader.includes('postcss-loader')) {
      const options = entry.options
      if (options && typeof options === 'object') {
        const postcssOptions = (options as { postcssOptions?: unknown }).postcssOptions
        plugins.push(...readPostcssPlugins(postcssOptions))
      }
      return
    }
    visit((entry as { rules?: unknown }).rules)
    visit((entry as { oneOf?: unknown }).oneOf)
    visit((entry as { use?: unknown }).use)
  }
  for (const entry of entries) {
    visit(entry)
  }
  return resolveFrameworkPostcssPlugins(plugins)
}

export function captureFrameworkPostcssPlugins(
  owner: InternalUserDefinedOptions,
  plugins: unknown,
) {
  const resolved = resolveFrameworkPostcssPlugins(plugins)
  if (resolved.length === 0) {
    frameworkPostcssPlugins.delete(owner)
    return resolved
  }
  frameworkPostcssPlugins.set(owner, resolved)
  return resolved
}

export async function transformGeneratedCssWithFrameworkPostcss(
  owner: InternalUserDefinedOptions,
  css: string,
  from: string,
) {
  if (!css.includes('px')) {
    return css
  }
  const plugins = frameworkPostcssPlugins.get(owner)
  if (!plugins || plugins.length === 0) {
    return css
  }
  return (await postcss(plugins).process(css, { from })).css
}
