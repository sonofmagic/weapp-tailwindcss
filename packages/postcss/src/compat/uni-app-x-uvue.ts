import type { Result as PostcssResult, Rule } from 'postcss'
import type { IStyleHandlerOptions, UniAppXUnsupportedMode } from '../types'
import selectorParser from 'postcss-selector-parser'

const ALLOWED_DISPLAY_VALUES = new Set(['flex', 'none'])
const FALLBACK_CLASS_RE = /\.((?:\\.|[\w-])+)/g
const IMPORTANT_SUFFIX_RE = /\s*!important$/i

function isUniAppXUvueTarget(
  options?: Pick<IStyleHandlerOptions, 'uniAppX' | 'uniAppXCssTarget'>,
) {
  return Boolean(options?.uniAppX) && options?.uniAppXCssTarget === 'uvue'
}

function normalizeUnsupportedMode(mode?: UniAppXUnsupportedMode): UniAppXUnsupportedMode {
  return mode ?? 'warn'
}

function normalizeValue(value: string) {
  return value.trim().toLowerCase().replace(IMPORTANT_SUFFIX_RE, '')
}

function getSourceFile(rule: Rule, result: PostcssResult) {
  return rule.source?.input.from ?? result.opts.from ?? 'unknown source'
}

function collectUtilityClassNames(rule: Rule) {
  const classNames = new Set<string>()

  for (const selector of rule.selectors ?? []) {
    try {
      const ast = selectorParser().astSync(selector)
      ast.walkClasses((node) => {
        if (node.value) {
          classNames.add(node.value)
        }
      })
    }
    catch {
      for (const match of selector.matchAll(FALLBACK_CLASS_RE)) {
        if (match[1]) {
          classNames.add(match[1].replaceAll('\\', ''))
        }
      }
    }
  }

  return [...classNames]
}

function hasOnlyClassSelectors(rule: Rule) {
  const selectors = rule.selectors ?? []
  if (selectors.length === 0) {
    return false
  }

  return selectors.every((selector) => {
    try {
      const ast = selectorParser().astSync(selector)
      return ast.nodes.every(node => node.nodes.length > 0 && node.nodes.every(child => child.type === 'class'))
    }
    catch {
      return false
    }
  })
}

function getUnsupportedDeclarationReason(prop: string, value: string) {
  const normalizedProp = prop.trim().toLowerCase()
  const normalizedValue = normalizeValue(value)

  if (normalizedProp === 'display' && !ALLOWED_DISPLAY_VALUES.has(normalizedValue)) {
    return `${normalizedProp}: ${value}`
  }

  if (normalizedProp === 'min-height' && normalizedValue === '100vh') {
    return `${normalizedProp}: ${value}`
  }

  if (
    normalizedProp === 'grid-template-columns'
    || normalizedProp === 'grid-template-rows'
    || normalizedProp === 'grid-auto-columns'
    || normalizedProp === 'grid-auto-rows'
    || normalizedProp === 'grid-auto-flow'
  ) {
    return `${normalizedProp}: ${value}`
  }

  if (normalizedProp === 'gap' || normalizedProp === 'row-gap' || normalizedProp === 'column-gap') {
    return `${normalizedProp}: ${value}`
  }
}

function reportUnsupportedRule(
  rule: Rule,
  result: PostcssResult,
  mode: UniAppXUnsupportedMode,
  warningCache: Set<string>,
  reason: string,
) {
  if (mode === 'silent') {
    return
  }

  const classNames = collectUtilityClassNames(rule)
  const classLabel = classNames.length > 0 ? classNames.join(', ') : rule.selector
  const source = getSourceFile(rule, result)
  const message = `uni-app x uvue unsupported utility: ${classLabel} (${reason}) in ${source}`

  if (mode === 'error') {
    throw rule.error(message)
  }

  if (warningCache.has(message)) {
    return
  }

  warningCache.add(message)
  rule.warn(result, message)
}

export function applyUniAppXUvueCompatibility(
  result: PostcssResult,
  options?: Pick<IStyleHandlerOptions, 'uniAppX' | 'uniAppXCssTarget' | 'uniAppXUnsupported'>,
) {
  if (!isUniAppXUvueTarget(options)) {
    return result
  }

  const mode = normalizeUnsupportedMode(options?.uniAppXUnsupported)
  const warningCache = new Set<string>()

  result.root.walkRules((rule) => {
    if (!hasOnlyClassSelectors(rule)) {
      reportUnsupportedRule(rule, result, mode, warningCache, 'selector must be class-only')
      rule.remove()
      return
    }

    rule.walkDecls((decl) => {
      const reason = getUnsupportedDeclarationReason(decl.prop, decl.value)
      if (!reason) {
        return
      }

      reportUnsupportedRule(rule, result, mode, warningCache, reason)
      decl.remove()
    })

    if ((rule.nodes?.length ?? 0) === 0) {
      rule.remove()
    }
  })

  result.root.walkAtRules((atRule) => {
    if ((atRule.nodes?.length ?? 0) === 0) {
      atRule.remove()
    }
  })

  const nextResult = result.root.toResult(result.opts)
  nextResult.messages.push(...result.messages)
  return nextResult
}
