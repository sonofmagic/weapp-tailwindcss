import type { AtRule, Result as PostcssResult, Rule } from 'postcss'
import type { IStyleHandlerOptions, UniAppXUnsupportedMode } from '../types'
import postcssCalc from '@weapp-tailwindcss/postcss-calc'
import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'
import valueParser from 'postcss-value-parser'
import { normalizeTailwindcssV4Declaration } from './tailwindcss-v4'
import { consumeUniAppXSystemRootTheme } from './uni-app-x-uvue/theme'

const ALLOWED_DISPLAY_VALUES = new Set(['flex', 'none'])
const FALLBACK_CLASS_RE = /\.((?:\\.|[\w-])+)/g
const IMPORTANT_SUFFIX_RE = /\s*!important$/i
const MINI_PROGRAM_PREFLIGHT_SELECTORS = new Set(['view', 'text', '::after', '::before'])
const TRANSFORM_PROPERTIES = new Set(['transform', '-webkit-transform'])
const TAILWIND_VERSION_COMMENT_RE = /tailwindcss v\d/i
const UVUE_SCOPED_STYLE_REQUEST_RE = /\?(?:[^#]*&)?(?:vue(?:=[^&]*)?&)?type=style(?:&|$)/
const VUE_SCOPED_ATTR_RE = /\[data-v-[^\]]+\]/gi
const VUE_SCOPED_CLASS_RE = /\.data-v-[\w-]+/gi

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

function hasCalcFunction(value: string) {
  const parsed = valueParser(value)
  let found = false
  parsed.walk((node) => {
    if (node.type === 'function' && node.value.toLowerCase() === 'calc') {
      found = true
    }
  })
  return found
}

function normalizeUniAppXTransformValue(value: string) {
  if (!value.toLowerCase().includes('translate(') || !value.includes(',')) {
    return value
  }

  const parsed = valueParser(value)
  let changed = false

  parsed.walk((node) => {
    if (node.type !== 'function' || node.value.toLowerCase() !== 'translate') {
      return
    }

    for (const child of node.nodes) {
      if (child.type !== 'div' || child.value !== ',') {
        continue
      }

      child.value = ' '
      child.before = ''
      child.after = ''
      changed = true
    }
  })

  return changed ? parsed.toString() : value
}

function getSourceFile(rule: Rule, result: PostcssResult) {
  return rule.source?.input.from ?? result.opts.from ?? 'unknown source'
}

function hasVueScopedAttr(value: string) {
  VUE_SCOPED_ATTR_RE.lastIndex = 0
  VUE_SCOPED_CLASS_RE.lastIndex = 0
  const matched = VUE_SCOPED_ATTR_RE.test(value) || VUE_SCOPED_CLASS_RE.test(value)
  VUE_SCOPED_ATTR_RE.lastIndex = 0
  VUE_SCOPED_CLASS_RE.lastIndex = 0
  return matched
}

function normalizeCssSignatureValue(value: string) {
  return value
    .replace(VUE_SCOPED_ATTR_RE, '')
    .replace(VUE_SCOPED_CLASS_RE, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([>+~])\s*/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim()
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

function isScopedSfcStyleRequest(result: PostcssResult) {
  const source = result.opts.from
  if (typeof source !== 'string' || source.length === 0) {
    return false
  }
  return UVUE_SCOPED_STYLE_REQUEST_RE.test(source) && /(?:^|[?&])scoped(?:=|&|$)/.test(source)
}

function isLikelyTailwindGlobalSelector(selector: string) {
  const normalized = normalizeCssSignatureValue(selector)
  return normalized === '*'
    || normalized.startsWith('::')
    || normalized.startsWith(':root')
    || normalized.startsWith(':host')
    || /^(?:html|body|hr|abbr|h1|h2|h3|h4|h5|h6|a|b|strong|code|kbd|samp|small|sub|sup|table|button|input|select|optgroup|textarea|summary|blockquote|dl|dd|fieldset|legend|ol|ul|menu|dialog|progress|video|audio|canvas|embed|iframe|img|object|svg|details|template|[uo]ni-progress)(?:$|[:,[\s>+~.#])/.test(normalized)
}

function hasClassSelector(selector: string) {
  return /(?:^|[^\\])\.[_a-z\u00A0-\uFFFF-]/i.test(normalizeCssSignatureValue(selector))
}

function isLikelyTailwindGlobalRule(rule: Rule) {
  return (rule.selectors ?? [rule.selector]).every(selector =>
    !hasClassSelector(selector) && isLikelyTailwindGlobalSelector(selector),
  )
}

function isLikelyTailwindPropertyAtRule(atRule: AtRule) {
  return typeof atRule.name === 'string'
    && atRule.name.toLowerCase() === 'property'
    && normalizeCssSignatureValue(atRule.params).startsWith('--tw-')
}

function isMiniProgramTailwindPreflightDeclaration(prop: string) {
  return prop.startsWith('--tw-') || prop === 'box-sizing' || prop === 'margin' || prop === 'padding' || prop === 'border'
}

function isUnscopedMiniProgramTailwindPreflightRule(rule: Rule) {
  const selectors = rule.selectors ?? [rule.selector]
  if (
    selectors.length === 0
    || !selectors.every((selector) => {
      const normalized = normalizeCssSignatureValue(selector)
      return !hasVueScopedAttr(selector) && MINI_PROGRAM_PREFLIGHT_SELECTORS.has(normalized)
    })
  ) {
    return false
  }
  const declarations = rule.nodes?.filter((node): node is postcss.Declaration => node.type === 'decl') ?? []
  return declarations.length > 0 && declarations.every(decl => isMiniProgramTailwindPreflightDeclaration(decl.prop))
}

function isScopedMiniProgramTailwindContentInitRule(rule: Rule) {
  const selectors = rule.selectors ?? [rule.selector]
  if (
    selectors.length === 0
    || !selectors.every((selector) => {
      const normalized = normalizeCssSignatureValue(selector)
      return hasVueScopedAttr(selector) && MINI_PROGRAM_PREFLIGHT_SELECTORS.has(normalized)
    })
  ) {
    return false
  }
  const declarations = rule.nodes?.filter((node): node is postcss.Declaration => node.type === 'decl') ?? []
  return declarations.length > 0 && declarations.every(decl => decl.prop === '--tw-content')
}

function stripScopedTailwindNoise(root: postcss.Root) {
  let changed = false
  root.walkComments((comment) => {
    if (!TAILWIND_VERSION_COMMENT_RE.test(comment.text)) {
      return
    }
    comment.remove()
    changed = true
  })
  root.walkRules((rule) => {
    if (
      isLikelyTailwindGlobalRule(rule)
      || isUnscopedMiniProgramTailwindPreflightRule(rule)
      || isScopedMiniProgramTailwindContentInitRule(rule)
    ) {
      rule.remove()
      changed = true
    }
  })
  root.walkAtRules((atRule) => {
    if (isLikelyTailwindPropertyAtRule(atRule)) {
      atRule.remove()
      changed = true
      return
    }
    if ((atRule.nodes?.length ?? 0) === 0) {
      atRule.remove()
      changed = true
    }
  })
  return changed
}

function getUnsupportedDeclarationReason(prop: string, value: string) {
  const normalizedProp = prop.trim().toLowerCase()
  const normalizedValue = normalizeValue(value)

  if (hasCalcFunction(value)) {
    return `${normalizedProp}: ${value}`
  }

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
  options?: Pick<
    IStyleHandlerOptions,
    'customPropertyValues' | 'uniAppX' | 'uniAppXCssTarget' | 'uniAppXUnsupported'
  >,
) {
  if (!isUniAppXUvueTarget(options)) {
    return result
  }

  const mode = normalizeUnsupportedMode(options?.uniAppXUnsupported)
  const warningCache = new Set<string>()
  const scopedSfcStyleRequest = isScopedSfcStyleRequest(result)

  let root = result.root
  let calcMessages: PostcssResult['messages'] = []

  consumeUniAppXSystemRootTheme(root, options?.customPropertyValues)
  if (root.type === 'root' && Array.isArray(root.nodes) && typeof root.walkDecls === 'function') {
    root.walkDecls((decl) => {
      normalizeTailwindcssV4Declaration(decl)
      if (TRANSFORM_PROPERTIES.has(decl.prop.toLowerCase())) {
        decl.value = normalizeUniAppXTransformValue(decl.value)
      }
    })
    const calcResult = postcss([postcssCalc()]).process(root, result.opts).sync()
    root = calcResult.root
    calcMessages = calcResult.messages
  }

  if (scopedSfcStyleRequest) {
    stripScopedTailwindNoise(root)
  }

  root.walkRules((rule) => {
    if (!scopedSfcStyleRequest && !hasOnlyClassSelectors(rule)) {
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

  root.walkAtRules((atRule) => {
    if (isLikelyTailwindPropertyAtRule(atRule) || atRule.name?.toLowerCase() === 'property') {
      atRule.remove()
      return
    }
    if ((atRule.nodes?.length ?? 0) === 0) {
      atRule.remove()
    }
  })

  const nextResult = root.toResult(result.opts)
  nextResult.messages.push(...result.messages)
  nextResult.messages.push(...calcMessages)
  return nextResult
}
