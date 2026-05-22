import type { ColorData } from '@csstools/css-color-parser'
import type { FunctionNode, Node } from 'postcss-value-parser'
import { color as parseColor, serializeRGB } from '@csstools/css-color-parser'
import { parseComponentValue } from '@csstools/css-parser-algorithms'
import { tokenize } from '@csstools/css-tokenizer'
import postcss from 'postcss'
import valueParser from 'postcss-value-parser'

export interface DynamicColorMixAlphaProtection {
  css: string
  restore: (css: string) => string
}

const COLOR_MIX_NAME = 'color-mix'
const PLACEHOLDER_PREFIX = '__weapp_tw_color_mix_'
const DYNAMIC_ALPHA_RE = /\b(?:var|env)\(|--[\w-]+\b/
const INTERNAL_TAILWIND_ALPHA_RE = /var\(\s*--tw-[^)]+-alpha\s*\)/
const TRANSPARENT_COLOR_RE = /^transparent$/i
const CURRENT_COLOR_RE = /^currentcolor$/i
const CSS_WIDE_KEYWORD_RE = /^(?:inherit|initial|unset|revert|revert-layer)$/i
const CUSTOM_PROPERTY_RE = /^--[\w-]+$/

function splitArguments(nodes: Node[]) {
  const args: Node[][] = []
  let current: Node[] = []

  for (const node of nodes) {
    if (node.type === 'div' && node.value === ',') {
      args.push(current)
      current = []
      continue
    }
    current.push(node)
  }

  args.push(current)
  return args
}

function splitStopSegments(nodes: Node[]) {
  const segments: Node[][] = []
  let current: Node[] = []

  for (const node of nodes) {
    if (node.type === 'space') {
      if (current.length > 0) {
        segments.push(current)
        current = []
      }
      continue
    }
    current.push(node)
  }

  if (current.length > 0) {
    segments.push(current)
  }
  return segments
}

function trimNodes(nodes: Node[]) {
  let start = 0
  let end = nodes.length

  while (start < end && nodes[start]?.type === 'space') {
    start += 1
  }

  while (end > start && nodes[end - 1]?.type === 'space') {
    end -= 1
  }

  return nodes.slice(start, end)
}

function getParsedColorData(colorSource: string) {
  try {
    const parsed = parseComponentValue(tokenize({ css: colorSource }))
    return parseColor(parsed)
  }
  catch {
    return false
  }
}

function parseAlphaValue(alphaSource: string) {
  const parsed = Number.parseFloat(alphaSource)
  if (Number.isFinite(parsed)) {
    return alphaSource.trim().endsWith('%') ? parsed / 100 : parsed
  }
  return undefined
}

function resolveVarColor(
  colorSource: string,
  customPropertyValues: ReadonlyMap<string, string>,
  depth = 0,
): ColorData | undefined {
  if (depth > 5) {
    return undefined
  }

  const parsed = valueParser(colorSource.trim())
  const node = parsed.nodes.length === 1 ? parsed.nodes[0] : undefined
  if (node?.type !== 'function' || node.value.toLowerCase() !== 'var') {
    return undefined
  }

  const args = splitArguments(node.nodes)
  const propertyName = valueParser.stringify(trimNodes(args[0] ?? [])).trim()
  if (!CUSTOM_PROPERTY_RE.test(propertyName)) {
    return undefined
  }

  const resolved = customPropertyValues.get(propertyName)
  if (!resolved) {
    const fallback = args[1] ? valueParser.stringify(trimNodes(args[1])).trim() : undefined
    return fallback ? resolveColorData(fallback, customPropertyValues, depth + 1) : undefined
  }

  return resolveColorData(resolved, customPropertyValues, depth + 1)
}

function resolveColorData(
  colorSource: string,
  customPropertyValues: ReadonlyMap<string, string>,
  depth = 0,
): ColorData | undefined {
  if (typeof colorSource !== 'string') {
    return undefined
  }
  const trimmed = colorSource.trim()
  if (TRANSPARENT_COLOR_RE.test(trimmed)) {
    const parsed = getParsedColorData(trimmed)
    return parsed || undefined
  }
  if (CURRENT_COLOR_RE.test(trimmed) || CSS_WIDE_KEYWORD_RE.test(trimmed)) {
    return undefined
  }

  const resolvedVar = resolveVarColor(trimmed, customPropertyValues, depth)
  if (resolvedVar) {
    return resolvedVar
  }

  return getParsedColorData(trimmed) || undefined
}

function normalizeColorFunctionName(
  colorSource: string,
  alpha: number,
  customPropertyValues: ReadonlyMap<string, string>,
) {
  const resolvedColor = resolveColorData(colorSource, customPropertyValues)
  if (!resolvedColor) {
    return undefined
  }

  resolvedColor.alpha = alpha
  return serializeRGB(resolvedColor).toString()
}

function createRgbaWithAlpha(colorSource: string, alphaSource: string, customPropertyValues: ReadonlyMap<string, string>) {
  const resolvedColor = resolveColorData(colorSource, customPropertyValues)
  if (!resolvedColor) {
    return undefined
  }

  const [red, green, blue] = resolvedColor.channels
    .map(channel => Math.round(Math.min(1, Math.max(0, channel)) * 255))
  const alpha = alphaSource.trim()
  const normalizedAlpha = CUSTOM_PROPERTY_RE.test(alpha) ? `var(${alpha})` : alpha

  return `rgba(${red}, ${green}, ${blue}, ${normalizedAlpha})`
}

function tryResolveColorMix(
  node: FunctionNode,
  customPropertyValues: ReadonlyMap<string, string>,
): { value: string, deferred: boolean } | undefined {
  const args = splitArguments(node.nodes)
  if (args.length < 3) {
    return undefined
  }

  const colorStopNodes = splitStopSegments(args[1] ?? [])
  if (colorStopNodes.length < 2) {
    return undefined
  }

  const colorNodes = trimNodes(colorStopNodes[0] ?? [])
  const alphaNodes = trimNodes(colorStopNodes[1] ?? [])
  const trailingNodes = trimNodes(args[2] ?? [])
  if (!colorNodes.length || !alphaNodes.length || valueParser.stringify(trailingNodes).trim().toLowerCase() !== 'transparent') {
    return undefined
  }

  const colorSource = valueParser.stringify(colorNodes).trim()
  const alphaSource = valueParser.stringify(alphaNodes).trim()
  if (!colorSource || !alphaSource || INTERNAL_TAILWIND_ALPHA_RE.test(alphaSource)) {
    return undefined
  }

  if (CURRENT_COLOR_RE.test(colorSource)) {
    return { value: colorSource, deferred: false }
  }

  if (DYNAMIC_ALPHA_RE.test(alphaSource)) {
    const normalized = createRgbaWithAlpha(colorSource, alphaSource, customPropertyValues)
    return normalized
      ? { value: normalized, deferred: true }
      : { value: colorSource, deferred: true }
  }

  const alpha = parseAlphaValue(alphaSource)
  if (alpha === undefined) {
    return undefined
  }

  const normalized = normalizeColorFunctionName(colorSource, alpha, customPropertyValues)
  if (normalized) {
    return { value: normalized, deferred: false }
  }

  return { value: colorSource, deferred: false }
}

function createPlaceholder(index: number) {
  return `${PLACEHOLDER_PREFIX}${index}__`
}

function unwrapProtectedSupports(cssRoot: postcss.Root) {
  cssRoot.walkAtRules('supports', (atRule) => {
    if (!atRule.nodes || !atRule.toString().includes(PLACEHOLDER_PREFIX)) {
      return
    }
    atRule.replaceWith(atRule.nodes)
  })
}

export function protectDynamicColorMixAlpha(css: string): DynamicColorMixAlphaProtection {
  if (!css.includes(COLOR_MIX_NAME)) {
    return {
      css,
      restore: value => value,
    }
  }

  const replacements = new Map<string, string>()
  const root = postcss.parse(css)
  const customPropertyValues = new Map<string, string>()
  let changed = false

  root.walkDecls((decl) => {
    if (decl.prop.startsWith('--') && !decl.value.includes(COLOR_MIX_NAME)) {
      customPropertyValues.set(decl.prop, decl.value.trim())
    }
  })

  root.walkDecls((decl) => {
    if (!decl.value.includes(COLOR_MIX_NAME)) {
      return
    }

    const parsed = valueParser(decl.value)
    let mutated = false

    parsed.walk((node) => {
      if (node.type !== 'function' || node.value.toLowerCase() !== COLOR_MIX_NAME) {
        return
      }
      const resolved = tryResolveColorMix(node, customPropertyValues)
      if (resolved) {
        if (resolved.deferred) {
          const placeholder = createPlaceholder(replacements.size)
          replacements.set(placeholder, resolved.value)
          const mutableNode = node as unknown as Node & { nodes?: Node[] }
          mutableNode.type = 'word'
          mutableNode.value = placeholder
          delete mutableNode.nodes
          mutated = true
          return
        }
        const mutableNode = node as unknown as Node & { nodes?: Node[] }
        mutableNode.type = 'word'
        mutableNode.value = resolved.value
        delete mutableNode.nodes
        mutated = true
      }
    })

    if (mutated) {
      decl.value = parsed.toString()
      changed = true
    }
  })

  if (replacements.size > 0) {
    unwrapProtectedSupports(root)
  }

  return {
    css: changed ? root.toString() : css,
    restore(value) {
      let restored = value
      for (const [placeholder, replacement] of replacements) {
        restored = restored.split(placeholder).join(replacement)
      }
      return restored
    },
  }
}
