import type { IStyleHandlerOptions, LoadedPostcssOptions } from '@weapp-tailwindcss/postcss/types'
import type { ResultPlugin } from 'postcss-load-config'
import process from 'node:process'
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

type ConditionalValue = boolean | undefined

const PLATFORM_ENV_KEYS = [
  'WEAPP_TW_TARGET',
  'WEAPP_TAILWINDCSS_TARGET',
  'UNI_PLATFORM',
  'UNI_UTS_PLATFORM',
  'TARO_ENV',
  'MPX_CLI_MODE',
  'MPX_CURRENT_TARGET_MODE',
] as const

const CONDITIONAL_END_RE = /^\s*#endif\s*$/

function readEnvValue(key: string): string | undefined {
  return typeof process === 'undefined' ? undefined : process.env[key]
}

function normalizePlatformToken(value: string | undefined): string | undefined {
  const normalized = value?.trim().replaceAll('_', '-').toUpperCase()
  return normalized || undefined
}

function resolveCssMacroPlatform(options: Pick<IStyleHandlerOptions, 'platform'> | undefined): string | undefined {
  const explicit = normalizePlatformToken(options?.platform)
  if (explicit) {
    return explicit
  }

  for (const key of PLATFORM_ENV_KEYS) {
    const value = normalizePlatformToken(readEnvValue(key))
    if (value) {
      return value
    }
  }

  return undefined
}

function createPlatformTokenSet(platform: string | undefined) {
  const normalized = normalizePlatformToken(platform)
  const tokens = new Set<string>()
  if (!normalized) {
    return tokens
  }

  tokens.add(normalized)
  if (normalized.startsWith('MP-')) {
    tokens.add('MP')
  }
  if (normalized === 'WEAPP' || normalized === 'WEIXIN' || normalized === 'WX') {
    tokens.add('MP')
    tokens.add('MP-WEIXIN')
  }
  if (normalized === 'MP-WEIXIN') {
    tokens.add('WEAPP')
    tokens.add('WEIXIN')
    tokens.add('WX')
  }
  if (normalized === 'H5') {
    tokens.add('WEB')
  }
  if (normalized === 'WEB') {
    tokens.add('H5')
  }
  if (normalized === 'APP') {
    tokens.add('APP-PLUS')
  }
  if (normalized.startsWith('APP-')) {
    tokens.add('APP')
  }
  if (normalized.startsWith('QUICKAPP-WEBVIEW')) {
    tokens.add('QUICKAPP-WEBVIEW')
  }
  return tokens
}

function combineAnd(values: ConditionalValue[]): ConditionalValue {
  if (values.includes(false)) {
    return false
  }
  return values.every(value => value === true) ? true : undefined
}

function combineOr(values: ConditionalValue[]): ConditionalValue {
  if (values.includes(true)) {
    return true
  }
  return values.every(value => value === false) ? false : undefined
}

function evaluatePlatformExpression(expression: string, platformTokens: ReadonlySet<string>): ConditionalValue {
  const orParts = expression.split(/\s*\|\|\s*/)
  const orValues = orParts.map((orPart) => {
    const andParts = orPart.split(/\s*&&\s*/)
    return combineAnd(andParts.map((part) => {
      const token = normalizePlatformToken(part)
      if (!token || /[<>=!()]/.test(token)) {
        return undefined
      }
      return platformTokens.has(token)
    }))
  })
  return combineOr(orValues)
}

function negateConditionalValue(value: ConditionalValue): ConditionalValue {
  return value === undefined ? undefined : !value
}

function getActiveConditionalValue(stack: ConditionalValue[]): ConditionalValue {
  if (stack.includes(false)) {
    return false
  }
  return stack.includes(undefined) ? undefined : true
}

function parseConditionalStart(text: string) {
  const normalized = text.trim()
  if (!normalized.startsWith('#')) {
    return undefined
  }

  const body = normalized.slice(1).trimStart()
  const directives = ['ifndef', 'ifdef'] as const
  for (const directive of directives) {
    if (!body.startsWith(directive)) {
      continue
    }
    const expression = body.slice(directive.length).trim()
    if (expression.length === 0) {
      return undefined
    }
    return {
      directive,
      expression,
    }
  }

  return undefined
}

export function compileCssMacroConditionalComments(
  css: string,
  options?: Pick<IStyleHandlerOptions, 'platform'>,
): string {
  const platform = resolveCssMacroPlatform(options)
  const platformTokens = createPlatformTokenSet(platform)
  if (platformTokens.size === 0 || !css.includes('#if')) {
    return css
  }

  try {
    const root = postcss.parse(css)
    const transformContainer = (container: postcss.Container) => {
      const stack: ConditionalValue[] = []
      for (const node of [...container.nodes ?? []]) {
        if (node.type === 'comment') {
          const start = parseConditionalStart(node.text)
          if (start) {
            const value = start.directive === 'ifndef'
              ? negateConditionalValue(evaluatePlatformExpression(start.expression, platformTokens))
              : evaluatePlatformExpression(start.expression, platformTokens)
            const parentActive = getActiveConditionalValue(stack)
            stack.push(value)
            if (parentActive !== undefined && value !== undefined) {
              node.remove()
            }
            continue
          }

          if (CONDITIONAL_END_RE.test(node.text)) {
            const value = stack.pop()
            const parentActive = getActiveConditionalValue(stack)
            if (parentActive !== undefined && value !== undefined) {
              node.remove()
            }
            continue
          }
        }

        if (getActiveConditionalValue(stack) === false) {
          node.remove()
          continue
        }

        if ('nodes' in node && node.nodes) {
          transformContainer(node)
        }
      }
    }
    transformContainer(root)
    return root.toString()
  }
  catch {
    return css
  }
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
    const values = Object.values(plugins as Record<string, unknown>).filter(Boolean) as ResultPlugin[]
    if (values.some(isCssMacroPostcssPlugin)) {
      return values
    }
    return [...values, macroPlugin]
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

export async function transformCssMacroCss(
  css: string,
  options?: Pick<IStyleHandlerOptions, 'platform'>,
): Promise<string> {
  const result = (await postcss([cssMacroPostcssPlugin()]).process(css, {
    from: undefined,
  })).css
  return compileCssMacroConditionalComments(result, options)
}
