import type { FunctionNode, Node } from 'postcss-value-parser'
import postcss from 'postcss'
import valueParser from 'postcss-value-parser'

export interface DynamicColorMixAlphaProtection {
  css: string
  restore: (css: string) => string
}

const COLOR_MIX_NAME = 'color-mix'
const PLACEHOLDER_PREFIX = '__weapp_tw_dynamic_color_mix_'
const DYNAMIC_ALPHA_RE = /\b(?:var|env)\(|--[\w-]+\b/
const INTERNAL_TAILWIND_ALPHA_RE = /var\(\s*--tw-[^)]+-alpha\s*\)/

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

function hasDynamicStopAlpha(nodes: Node[]) {
  const segments = splitStopSegments(nodes)
  if (segments.length < 2) {
    return false
  }

  const alpha = valueParser.stringify(segments[segments.length - 1]).trim()
  if (INTERNAL_TAILWIND_ALPHA_RE.test(alpha)) {
    return false
  }
  return DYNAMIC_ALPHA_RE.test(alpha)
}

function shouldProtectColorMix(node: FunctionNode) {
  const args = splitArguments(node.nodes)
  return args.slice(1).some(hasDynamicStopAlpha)
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
      if (!shouldProtectColorMix(node)) {
        return
      }

      const placeholder = createPlaceholder(replacements.size)
      replacements.set(placeholder, valueParser.stringify(node))
      const mutableNode = node as unknown as Node & { nodes?: Node[] }
      mutableNode.type = 'word'
      mutableNode.value = placeholder
      delete mutableNode.nodes
      mutated = true
    })

    if (mutated) {
      decl.value = parsed.toString()
    }
  })

  if (replacements.size === 0) {
    return {
      css,
      restore: value => value,
    }
  }
  unwrapProtectedSupports(root)

  return {
    css: root.toString(),
    restore(value) {
      let restored = value
      for (const [placeholder, original] of replacements) {
        restored = restored.split(placeholder).join(original)
      }
      return restored
    },
  }
}
