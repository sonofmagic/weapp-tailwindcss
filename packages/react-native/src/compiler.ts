/* eslint-disable style/max-statements-per-line, regexp/no-super-linear-backtracking */

import type { AtRule, Declaration, Root, Rule } from 'postcss'
import type {
  CompileNativeStylesheetOptions,
  NativeCompilerWarning,
  NativePlatform,
  NativeStyleManifest,
  NativeStyleRule,
} from './types'
import postcss from 'postcss'

const CLASS_SELECTOR_RE = /\.((?:\\.|[^\s.#:[>+~])+)/g
const COLOR_PROPERTIES = new Set(['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'shadowColor', 'textDecorationColor'])
const NUMERIC_PROPERTIES = new Set([
  'aspectRatio',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderRadius',
  'borderRightWidth',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopWidth',
  'borderWidth',
  'bottom',
  'elevation',
  'flex',
  'flexBasis',
  'flexGrow',
  'flexShrink',
  'fontSize',
  'gap',
  'height',
  'left',
  'letterSpacing',
  'lineHeight',
  'margin',
  'marginBottom',
  'marginHorizontal',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginVertical',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'opacity',
  'padding',
  'paddingBottom',
  'paddingHorizontal',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingVertical',
  'right',
  'top',
  'width',
  'zIndex',
])
const SHORTHANDS: Record<string, string[]> = {
  margin: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
  padding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
}
const UNSUPPORTED_PROPERTIES = new Set([
  'filter',
  'backdropFilter',
  'animation',
  'transition',
  'textShadow',
  'backgroundImage',
  'appearance',
  'content',
  'cursor',
  'userSelect',
  'whiteSpace',
  'objectFit',
  'listStyleType',
  'outline',
])

function decodeCssIdentifier(value: string) {
  return value
    .replace(/\\([0-9a-f]{1,6})\s?/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/\\(.)/g, '$1')
}

function propertyName(property: string) {
  const logical = {
    'padding-inline': 'paddingHorizontal',
    'padding-inline-start': 'paddingLeft',
    'padding-inline-end': 'paddingRight',
    'padding-block': 'paddingVertical',
    'padding-block-start': 'paddingTop',
    'padding-block-end': 'paddingBottom',
    'margin-inline': 'marginHorizontal',
    'margin-inline-start': 'marginLeft',
    'margin-inline-end': 'marginRight',
    'margin-block': 'marginVertical',
    'margin-block-start': 'marginTop',
    'margin-block-end': 'marginBottom',
  } as Record<string, string>
  return logical[property] ?? property.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

function splitValue(value: string) {
  return value.trim().split(/\s+/).filter(Boolean)
}

function parseNumber(value: string, variables: Record<string, string>) {
  const resolved = resolveVariables(value, variables)
  const calculated = resolved.match(/^calc\(\s*(-?(?:\d+\.\d+|\d+|\.\d+))(px|rem|em|%)?\s*\*\s*(-?(?:\d+\.\d+|\d+|\.\d+))\s*\)$/)
  if (calculated) {
    const base = parseNumber(`${calculated[1]}${calculated[2] ?? ''}`, variables)
    return typeof base === 'number' ? base * Number(calculated[3]) : undefined
  }
  const match = resolved.match(/^(-?(?:\d+\.\d+|\d+|\.\d+))(px|rem|em|%)?$/)
  if (!match) { return undefined }
  const number = Number(match[1])
  if (match[2] === '%') { return `${number}%` }
  if (match[2] === 'rem' || match[2] === 'em') { return number * 16 }
  return number
}

function resolveVariables(value: string, variables: Record<string, string>) {
  return value.replace(/var\((--[\w-]+)(?:,\s*([^)]*))?\)/g, (_, key: string, fallback: string | undefined) => variables[key] ?? fallback ?? `var(${key})`)
}

function isColor(value: string) {
  return /^(?:#[\da-f]{3,8}|(?:rgb|rgba|hsl|hsla|oklch|oklab)\([^)]*\)|[a-z]+)$/i.test(value)
}

function oklchToHex(value: string) {
  const match = value.match(/^oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:\s+\/\s*([\d.]+))?\s*\)$/i)
  if (!match) { return undefined }
  const lightness = Number(match[1]) > 1 ? Number(match[1]) / 100 : Number(match[1])
  const chroma = Number(match[2])
  const hue = Number(match[3]) * Math.PI / 180
  const alpha = match[4] === undefined ? 1 : Number(match[4])
  const a = chroma * Math.cos(hue)
  const b = chroma * Math.sin(hue)
  const l = lightness + 0.3963377774 * a + 0.2158037573 * b
  const m = lightness - 0.1055613458 * a - 0.0638541728 * b
  const s = lightness - 0.0894841775 * a - 1.291485548 * b
  const linear = (channel: number) => channel ** 3
  const red = 4.0767416621 * linear(l) - 3.3077115913 * linear(m) + 0.2309699292 * linear(s)
  const green = -1.2684380046 * linear(l) + 2.6097574011 * linear(m) - 0.3413193965 * linear(s)
  const blue = -0.0041960863 * linear(l) - 0.7034186147 * linear(m) + 1.7076147010 * linear(s)
  const toByte = (channel: number) => Math.round(Math.max(0, Math.min(1, channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055)) * 255)
  const hex = [red, green, blue].map(channel => toByte(channel).toString(16).padStart(2, '0')).join('')
  return alpha < 1 ? `#${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}` : `#${hex}`
}

function normalizeColor(value: string) {
  return /^oklch\(/i.test(value) ? oklchToHex(value) : value
}

function parseTransform(value: string, variables: Record<string, string>) {
  const transform: Array<Record<string, unknown>> = []
  for (const match of value.matchAll(/(translateX|translateY|translate|scaleX|scaleY|scale|rotate|skewX|skewY)\(([^)]*)\)/g)) {
    const name = match[1]
    const values = splitValue(resolveVariables(match[2] ?? '', variables).replace(',', ' '))
    if (!name || !values.length) { continue }
    if (name.startsWith('scale')) {
      const number = Number(values[0] ?? '')
      if (Number.isFinite(number)) { transform.push({ [name]: number }) }
      continue
    }
    if (name === 'translate') {
      const x = parseNumber(values[0] ?? '', variables)
      const y = parseNumber(values[1] ?? '0', variables)
      if (x !== undefined && y !== undefined) { transform.push({ translateX: x }, { translateY: y }) }
      continue
    }
    const property = name.replace(/^translate$/, 'translateX')
    const parsed = name.startsWith('rotate') || name.startsWith('skew')
      ? values[0]
      : parseNumber(values[0] ?? '', variables)
    if (parsed !== undefined) { transform.push({ [property]: parsed }) }
  }
  return transform.length ? transform : undefined
}

function parseShadow(value: string, variables: Record<string, string>) {
  const resolved = resolveVariables(value, variables)
  const color = resolved.match(/(?:rgba?|hsla?)\([^)]*\)|#[\da-f]{3,8}/i)?.[0]
  const parts = splitValue(color ? resolved.replace(color, '') : resolved)
  const lengths = parts.filter(part => parseNumber(part, variables) !== undefined).slice(0, 3)
  if (lengths.length < 2) { return undefined }
  const [x = '0', y = '0', blur = '0'] = lengths
  const shadowColor = normalizeColor(color ?? parts.find(part => isColor(part)) ?? '#000000') ?? '#000000'
  const opacity = /rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/i.exec(shadowColor)?.[1]
  return {
    shadowOffset: { width: parseNumber(x, variables), height: parseNumber(y, variables) },
    shadowRadius: parseNumber(blur, variables),
    shadowColor,
    ...(opacity ? { shadowOpacity: Number(opacity) } : {}),
  }
}

function parseValue(property: string, value: string, variables: Record<string, string>) {
  const trimmed = value.trim()
  if (UNSUPPORTED_PROPERTIES.has(property)) { return undefined }
  if (trimmed.includes('linear-gradient(') || trimmed.includes('url(')) { return undefined }
  if (COLOR_PROPERTIES.has(property)) {
    const color = resolveVariables(trimmed, variables)
    return isColor(color) ? normalizeColor(color) : undefined
  }
  if (NUMERIC_PROPERTIES.has(property)) { return parseNumber(trimmed, variables) }
  if (property === 'transform') { return parseTransform(trimmed, variables) }
  if (property === 'boxShadow') { return parseShadow(trimmed, variables) }
  if (property === 'display' && !['flex', 'none'].includes(trimmed)) { return undefined }
  return trimmed
}

function expandDeclaration(property: string, value: string, variables: Record<string, string>) {
  if (property === 'margin' || property === 'padding') {
    const parts = splitValue(value).map(item => parseNumber(item, variables))
    if (parts.includes(undefined)) { return undefined }
    const values = parts as number[]
    const [top, right = top, bottom = top, left = right] = values
    return Object.fromEntries(SHORTHANDS[property].map((key, index) => [key, [top, right, bottom, left][index]]))
  }
  if (property === 'border') {
    const width = splitValue(value).find(item => /^\d/.test(item))
    const color = splitValue(value).find(item => isColor(item))
    return {
      ...(width ? { borderWidth: parseNumber(width, variables) } : {}),
      ...(color ? { borderColor: color } : {}),
    }
  }
  if (property === 'boxShadow') {
    const shadow = parseShadow(value, variables)
    return shadow
  }
  const parsed = parseValue(property, value, variables)
  return parsed === undefined ? undefined : { [property]: parsed }
}

function walkClasses(selector: string) {
  const classes: string[] = []
  for (const match of selector.matchAll(CLASS_SELECTOR_RE)) {
    const token = decodeCssIdentifier(match[1])
    if (token && !classes.includes(token)) { classes.push(token) }
  }
  return classes
}

function variantForClass(className: string): Pick<NativeStyleRule, 'colorScheme' | 'platform'> {
  const result: Pick<NativeStyleRule, 'colorScheme' | 'platform'> = {}
  for (const variant of className.split(':').slice(0, -1)) {
    if (variant === 'dark') { result.colorScheme = 'dark' }
    if (variant === 'ios' || variant === 'android' || variant === 'native') { result.platform = variant as NativePlatform }
  }
  return result
}

function atRuleVariant(node: AtRule | undefined): Pick<NativeStyleRule, 'colorScheme' | 'platform'> {
  if (!node) { return {} }
  const params = node.params.toLowerCase()
  if (params.includes('prefers-color-scheme') && params.includes('dark')) { return { colorScheme: 'dark' } }
  if (params.includes('platform') && params.includes('ios')) { return { platform: 'ios' } }
  if (params.includes('platform') && params.includes('android')) { return { platform: 'android' } }
  return {}
}

export function addNativeVariantRules(manifest: NativeStyleManifest, candidates: Iterable<string>) {
  for (const candidate of candidates) {
    const parts = candidate.split(':')
    if (parts.length < 2) { continue }
    const base = parts.at(-1)
    if (!base || manifest.rules[candidate] || !manifest.rules[base]) { continue }
    const variant = variantForClass(candidate)
    if (!variant.colorScheme && !variant.platform) { continue }
    manifest.rules[candidate] = manifest.rules[base].map(rule => ({
      ...rule,
      ...variant,
      style: { ...rule.style },
    }))
    manifest.classSet.push(candidate)
  }
}

function ancestors(node: Rule | Declaration) {
  const result: AtRule[] = []
  let current = node.parent
  while (current && current.type !== 'root') {
    if (current.type === 'atrule') { result.unshift(current) }
    current = current.parent
  }
  return result
}

function collectVariables(root: Root) {
  const variables: Record<string, string> = {}
  root.walkDecls((decl) => {
    if (decl.prop.startsWith('--')) { variables[decl.prop] = decl.value.trim() }
  })
  return variables
}

function addWarning(warnings: NativeCompilerWarning[], warning: NativeCompilerWarning) {
  if (!warnings.some(item => item.message === warning.message && item.property === warning.property && item.className === warning.className)) { warnings.push(warning) }
}

function compileRule(rule: Rule, className: string, variables: Record<string, string>, warnings: NativeCompilerWarning[]) {
  const style: Record<string, unknown> = {}
  rule.walkDecls((decl) => {
    if (decl.prop.startsWith('--')) { return }
    const property = propertyName(decl.prop)
    const expanded = expandDeclaration(property, decl.value, variables)
    if (!expanded || Object.values(expanded).includes(undefined)) {
      const variableReference = /var\((--[\w-]+)/.exec(decl.value)?.[1]
      if (!variableReference || !variables[variableReference]) {
        addWarning(warnings, { className, property, message: `不支持将 ${decl.prop}: ${decl.value} 编译为 React Native style` })
      }
      return
    }
    Object.assign(style, expanded)
  })
  if (Object.keys(style).length === 0) { return undefined }
  return {
    style,
    ...variantForClass(className),
    ...ancestors(rule).reduce((result, node) => ({ ...result, ...atRuleVariant(node) }), {}),
  } satisfies NativeStyleRule
}

export function compileNativeStylesheet(css: string, options: CompileNativeStylesheetOptions = {}): NativeStyleManifest {
  const root = postcss.parse(css)
  const variables = collectVariables(root)
  const allowed = options.classSet ? new Set(options.classSet) : undefined
  const rules: Record<string, NativeStyleRule[]> = {}
  const warnings: NativeCompilerWarning[] = []

  root.walkRules((rule) => {
    if (options.ignorePreflight !== false && (rule.selector.includes(':root') || rule.selector.includes('*') || rule.selector.includes('::'))) { return }
    for (const selector of rule.selectors) {
      for (const className of walkClasses(selector)) {
        if (allowed && !allowed.has(className)) { continue }
        const compiled = compileRule(rule, className, variables, warnings)
        if (compiled) {
          const existing = rules[className] ??= []
          if (!existing.some(item => item.colorScheme === compiled.colorScheme
            && item.platform === compiled.platform
            && JSON.stringify(item.style) === JSON.stringify(compiled.style))) {
            existing.push(compiled)
          }
        }
      }
    }
  })

  return {
    version: 1,
    classSet: Object.keys(rules),
    rules,
    variables,
    warnings,
  }
}
