/* eslint-disable style/max-statements-per-line */
import type { ResultPlugin } from 'postcss-load-config'
import type { IStyleHandlerOptions, LoadedPostcssOptions } from '../types'
import path from 'node:path'
import postcss from 'postcss'
import { compileCssMacroConditionalComments, hasCssMacroTailwindV4CustomVariantConditionalComments, hasCssMacroTailwindV4InternalAtRules, transformCssMacroTailwindV4Source } from './conditions'
import cssMacroPostcssPlugin, { CSS_MACRO_POSTCSS_PLUGIN_NAME } from './postcss'

export const CSS_MACRO_STYLE_OPTIONS_MARKER = '__weappTailwindcssCssMacroEnabled'

type CssMacroStyleOptions = Partial<IStyleHandlerOptions> & {
  [CSS_MACRO_STYLE_OPTIONS_MARKER]?: true
}

function parseCssPluginRequest(params: string) {
  const value = params.trim()
  const quoted = /^(['"])(.*?)\1/.exec(value)
  if (quoted) { return quoted[2] }
  const url = /^url\(\s*(?:(['"])(.*?)\1|([^'")\s]+))\s*\)/.exec(value)
  return url?.[2] ?? url?.[3]
}

function isCssMacroPluginRequest(request: string | undefined) {
  if (request === 'weapp-tailwindcss/css-macro') { return true }
  return Boolean(request?.includes('css-macro') && path.basename(request).startsWith('css-macro'))
}

export function hasCssMacroTailwindV4Directive(css: string | undefined): boolean {
  if (!css?.includes('css-macro')) { return false }
  try {
    let found = false
    postcss.parse(css).walkAtRules('plugin', (rule) => {
      if (isCssMacroPluginRequest(parseCssPluginRequest(rule.params))) { found = true }
    })
    return found
  }
  catch {
    return /@plugin\s+(?:url\(\s*)?["']weapp-tailwindcss\/css-macro["']/.test(css)
  }
}

export function hasCssMacroTailwindV4Source(css: string | undefined): boolean {
  return hasCssMacroTailwindV4Directive(css)
    || hasCssMacroTailwindV4CustomVariantConditionalComments(css)
    || hasCssMacroTailwindV4InternalAtRules(css)
}

function isCssMacroPostcssPlugin(plugin: unknown): boolean {
  if (plugin === cssMacroPostcssPlugin) { return true }
  return Boolean(plugin
    && (typeof plugin === 'function' || typeof plugin === 'object')
    && (plugin as { postcssPlugin?: unknown }).postcssPlugin === CSS_MACRO_POSTCSS_PLUGIN_NAME)
}

function withCssMacroPostcssPlugins(plugins: unknown): LoadedPostcssOptions['plugins'] {
  const macroPlugin = cssMacroPostcssPlugin()
  if (!plugins) { return [macroPlugin] }
  if (Array.isArray(plugins)) { return plugins.some(isCssMacroPostcssPlugin) ? plugins : [...plugins, macroPlugin] }
  if (typeof plugins === 'object') {
    const values = Object.values(plugins as Record<string, unknown>).filter(Boolean) as ResultPlugin[]
    return values.some(isCssMacroPostcssPlugin) ? values : [...values, macroPlugin]
  }
  return [macroPlugin]
}

export function withCssMacroStyleOptions(options: Partial<IStyleHandlerOptions> | undefined): Partial<IStyleHandlerOptions> {
  const postcssOptions = options?.postcssOptions
  return {
    ...options,
    [CSS_MACRO_STYLE_OPTIONS_MARKER]: true,
    postcssOptions: { ...postcssOptions, plugins: withCssMacroPostcssPlugins(postcssOptions?.plugins) },
  } as CssMacroStyleOptions
}

export function hasCssMacroStyleOptions(options: Partial<IStyleHandlerOptions> | undefined): boolean {
  return Boolean((options as CssMacroStyleOptions | undefined)?.[CSS_MACRO_STYLE_OPTIONS_MARKER])
}

export async function transformCssMacroCss(css: string, options?: Pick<IStyleHandlerOptions, 'platform'>): Promise<string> {
  const result = (await postcss([cssMacroPostcssPlugin()]).process(css, { from: undefined })).css
  return compileCssMacroConditionalComments(result, options)
}

export {
  compileCssMacroConditionalComments,
  hasCssMacroTailwindV4CustomVariantConditionalComments,
  hasCssMacroTailwindV4InternalAtRules,
  transformCssMacroTailwindV4Source,
}
