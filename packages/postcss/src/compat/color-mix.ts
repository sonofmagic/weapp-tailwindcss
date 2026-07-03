import type { Node } from 'postcss-value-parser'
import postcss from 'postcss'
import valueParser from 'postcss-value-parser'
import { COLOR_MIX_NAME, MODERN_COLOR_FUNCTION_NAMES, PLACEHOLDER_PREFIX } from './color-mix/constants'
import { hasUnsupportedModernColorFunction, isDisplayP3ColorFunction, isModernColorSyntaxFunction } from './color-mix/modern'
import { normalizeStandaloneColorFunction } from './color-mix/parse'
import { tryResolveColorMix } from './color-mix/resolve'

export interface DynamicColorMixAlphaProtection {
  css: string
  restore: (css: string) => string
}

export interface DynamicColorMixAlphaProtectionOptions {
  customPropertyValues?: ReadonlyMap<string, string> | undefined
}

export interface ModernColorValueNormalization {
  value: string
  changed: boolean
  hasUnsupported: boolean
}

export function normalizeModernColorValue(
  value: string,
  customPropertyValues: ReadonlyMap<string, string> = new Map(),
): ModernColorValueNormalization {
  if (!hasUnsupportedModernColorFunction(value)) {
    return {
      value,
      changed: false,
      hasUnsupported: false,
    }
  }

  const parsed = valueParser(value)
  let changed = false

  parsed.walk((node) => {
    if (node.type !== 'function') {
      return
    }

    const name = node.value.toLowerCase()
    const source = valueParser.stringify(node)
    let normalized: string | undefined
    if (
      MODERN_COLOR_FUNCTION_NAMES.has(name)
      || (name === 'color' && isDisplayP3ColorFunction(source))
      || isModernColorSyntaxFunction(source)
    ) {
      normalized = normalizeStandaloneColorFunction(source)
    }
    else if (name === COLOR_MIX_NAME) {
      normalized = tryResolveColorMix(node, customPropertyValues)?.value
    }

    if (!normalized) {
      return
    }

    const mutableNode = node as unknown as Node & { nodes?: Node[] }
    mutableNode.type = 'word'
    mutableNode.value = normalized
    delete mutableNode.nodes
    changed = true
  })

  const nextValue = changed ? parsed.toString() : value
  return {
    value: nextValue,
    changed,
    hasUnsupported: hasUnsupportedModernColorFunction(nextValue),
  }
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

export function protectDynamicColorMixAlpha(
  css: string,
  options: DynamicColorMixAlphaProtectionOptions = {},
): DynamicColorMixAlphaProtection {
  if (!css.includes(COLOR_MIX_NAME)) {
    return {
      css,
      restore: value => value,
    }
  }

  const replacements = new Map<string, string>()
  const root = postcss.parse(css)
  const customPropertyValues = new Map(options.customPropertyValues)
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
