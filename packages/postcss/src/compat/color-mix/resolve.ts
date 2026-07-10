import type { FunctionNode } from 'postcss-value-parser'
import valueParser from 'postcss-value-parser'
import {
  CURRENT_COLOR_RE,
  CUSTOM_PROPERTY_RE,
  DYNAMIC_ALPHA_RE,
  INTERNAL_TAILWIND_ALPHA_RE,
} from './constants'
import {
  normalizeColorFunctionName,
  normalizeColorFunctionWithDynamicAlpha,
  parseAlphaValue,
  splitArguments,
  splitStopSegments,
  trimNodes,
} from './parse'

function createRgbaWithAlpha(colorSource: string, alphaSource: string, customPropertyValues: ReadonlyMap<string, string>) {
  const alpha = alphaSource.trim()
  const normalizedAlpha = CUSTOM_PROPERTY_RE.test(alpha) ? `var(${alpha})` : alpha
  return normalizeColorFunctionWithDynamicAlpha(colorSource, normalizedAlpha, customPropertyValues)
}

export function tryResolveColorMix(
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
