import type { IStyleHandlerOptions, LoadedPostcssOptions } from '@weapp-tailwindcss/postcss/types'
import type { AcceptedPlugin } from 'postcss'
import postcss from 'postcss'
import cssMacroPostcssPlugin, { CSS_MACRO_POSTCSS_PLUGIN_NAME } from './postcss'

export const CSS_MACRO_PLUGIN_MARKER = '__weappTailwindcssCssMacro'
export const CSS_MACRO_STYLE_OPTIONS_MARKER = '__weappTailwindcssCssMacroEnabled'

interface CssMacroMarkedPlugin {
  [CSS_MACRO_PLUGIN_MARKER]?: true
}

type CssMacroStyleOptions = Partial<IStyleHandlerOptions> & {
  [CSS_MACRO_STYLE_OPTIONS_MARKER]?: true
}

export function markCssMacroPlugin<T extends object>(value: T): T {
  Object.defineProperty(value, CSS_MACRO_PLUGIN_MARKER, {
    configurable: false,
    enumerable: false,
    value: true,
  })
  return value
}

export function isCssMacroTailwindPlugin(value: unknown): boolean {
  return Boolean(
    value
    && (typeof value === 'function' || typeof value === 'object')
    && (value as CssMacroMarkedPlugin)[CSS_MACRO_PLUGIN_MARKER] === true,
  )
}

export function hasCssMacroTailwindPlugin(plugins: unknown): boolean {
  if (!plugins) {
    return false
  }

  if (Array.isArray(plugins)) {
    return plugins.some(isCssMacroTailwindPlugin)
  }

  if (typeof plugins === 'object') {
    return Object.values(plugins as Record<string, unknown>).some(isCssMacroTailwindPlugin)
  }

  return false
}

function parseCssPluginRequest(params: string) {
  const value = params.trim()
  const quoted = /^(['"])(.*?)\1/.exec(value)
  if (quoted) {
    return quoted[2]
  }

  const url = /^url\(\s*(?:(['"])(.*?)\1|([^'")\s]+))\s*\)/.exec(value)
  return url?.[2] ?? url?.[3]
}

function isCssMacroPluginRequest(request: string | undefined) {
  return request === 'weapp-tailwindcss/css-macro'
}

export function hasCssMacroTailwindV4Directive(css: string | undefined): boolean {
  if (!css?.includes('css-macro')) {
    return false
  }

  try {
    let found = false
    postcss.parse(css).walkAtRules('plugin', (rule) => {
      if (isCssMacroPluginRequest(parseCssPluginRequest(rule.params))) {
        found = true
      }
    })
    return found
  }
  catch {
    return /@plugin\s+(?:url\(\s*)?["']weapp-tailwindcss\/css-macro["']/.test(css)
  }
}

function isCssMacroPostcssPlugin(plugin: unknown): boolean {
  if (plugin === cssMacroPostcssPlugin) {
    return true
  }
  return Boolean(
    plugin
    && (typeof plugin === 'function' || typeof plugin === 'object')
    && (plugin as { postcssPlugin?: unknown }).postcssPlugin === CSS_MACRO_POSTCSS_PLUGIN_NAME,
  )
}

function withCssMacroPostcssPlugins(plugins: unknown): LoadedPostcssOptions['plugins'] {
  const macroPlugin = cssMacroPostcssPlugin()

  if (!plugins) {
    return [macroPlugin]
  }

  if (Array.isArray(plugins)) {
    return plugins.some(isCssMacroPostcssPlugin)
      ? plugins
      : [...plugins, macroPlugin]
  }

  if (typeof plugins === 'object') {
    if (Object.values(plugins as Record<string, unknown>).some(isCssMacroPostcssPlugin)) {
      return plugins
    }
    return {
      ...(plugins as Record<string, AcceptedPlugin | false | null | undefined>),
      [CSS_MACRO_POSTCSS_PLUGIN_NAME]: macroPlugin,
    } as LoadedPostcssOptions['plugins']
  }

  return [macroPlugin]
}

export function withCssMacroStyleOptions(
  options: Partial<IStyleHandlerOptions> | undefined,
): Partial<IStyleHandlerOptions> {
  const postcssOptions = options?.postcssOptions
  return {
    ...options,
    [CSS_MACRO_STYLE_OPTIONS_MARKER]: true,
    postcssOptions: {
      ...postcssOptions,
      plugins: withCssMacroPostcssPlugins(postcssOptions?.plugins),
    },
  } as CssMacroStyleOptions
}

export function hasCssMacroStyleOptions(options: Partial<IStyleHandlerOptions> | undefined): boolean {
  return Boolean((options as CssMacroStyleOptions | undefined)?.[CSS_MACRO_STYLE_OPTIONS_MARKER])
}

export async function transformCssMacroCss(css: string): Promise<string> {
  return (await postcss([cssMacroPostcssPlugin()]).process(css, {
    from: undefined,
  })).css
}
