import { normalizeModernColorValue } from '@weapp-tailwindcss/postcss'
import postcss from 'postcss'
import { removeUnsupportedCascadeLayers } from './remove-unsupported-css'

const DEFAULT_WEAPP_VARIABLE_SCOPE = 'page,.tw-root,wx-root-portal-content,:host'
const DEFAULT_WEAPP_ELEMENT_VARIABLE_SCOPE = 'view,text,:before,:after'
const CLASS_SELECTOR_RE = /(?:^|[^\w-])\.[_a-z\u00A0-\uFFFF\\-]/i
const PSEUDO_CONTENT_SELECTOR_RE = /^(?:::before|::after|:before|:after)(?:,(?:::before|::after|:before|:after))*$/
const MINI_PROGRAM_THEME_SCOPE_SELECTORS = new Set([':root', ':host', 'page', '.tw-root', 'wx-root-portal-content'])
const MINI_PROGRAM_ELEMENT_VARIABLE_SCOPE_SELECTORS = new Set(['view', 'text', ':before', ':after', '::before', '::after'])
const MINI_PROGRAM_PREFLIGHT_SELECTORS = new Set([
  '*',
  'view',
  'text',
  ':before',
  ':after',
  '::before',
  '::after',
])
const PREFLIGHT_RESET_PROPS = new Set([
  'box-sizing',
  'border',
  'border-width',
  'border-style',
  'border-color',
  'margin',
  'padding',
])
const CONTENT_VAR_RE = /var\(\s*--tw-content\b/

interface PruneMiniProgramGeneratedCssOptions {
  preservePreflight?: boolean
}

function hasClassSelector(selector: string) {
  return CLASS_SELECTOR_RE.test(selector)
}

function normalizeSelector(selector: string) {
  return selector.trim().replace(/\s+/g, '')
}

function getRuleSelectors(rule: postcss.Rule) {
  return rule.selector
    .split(',')
    .map(normalizeSelector)
    .filter(Boolean)
}

function isCustomPropertyRule(rule: postcss.Rule) {
  let hasDeclaration = false
  let allCustomProperties = true

  rule.walkDecls((decl) => {
    hasDeclaration = true
    if (!decl.prop.startsWith('--')) {
      allCustomProperties = false
    }
  })

  return hasDeclaration && allCustomProperties
}

function isEmptyContentInitDeclaration(decl: postcss.Declaration) {
  return decl.prop === '--tw-content' && (decl.value === '""' || decl.value === '\'\'')
}

function removeEmptyContentInitDeclarations(rule: postcss.Rule) {
  rule.walkDecls((decl) => {
    if (isEmptyContentInitDeclaration(decl)) {
      decl.remove()
    }
  })
}

function usesTwContentVariable(root: postcss.Root) {
  let used = false
  root.walkDecls((decl) => {
    if (CONTENT_VAR_RE.test(decl.value)) {
      used = true
    }
  })
  return used
}

function isPseudoContentInitRule(rule: postcss.Rule) {
  const selector = rule.selector.replace(/\s+/g, '')
  if (!PSEUDO_CONTENT_SELECTOR_RE.test(selector)) {
    return false
  }

  let hasDeclaration = false
  let onlyContentVariable = true
  rule.walkDecls((decl) => {
    hasDeclaration = true
    if (decl.prop !== '--tw-content') {
      onlyContentVariable = false
    }
  })

  return hasDeclaration && onlyContentVariable
}

function isMiniProgramPreflightRule(rule: postcss.Rule) {
  const selectors = getRuleSelectors(rule)
  if (
    selectors.length === 0
    || !selectors.every(selector => MINI_PROGRAM_PREFLIGHT_SELECTORS.has(selector))
    || !selectors.some(selector => selector === '*' || selector === ':before' || selector === ':after' || selector === '::before' || selector === '::after')
  ) {
    return false
  }

  let hasTailwindVariable = false
  let hasResetProp = false
  rule.walkDecls((decl) => {
    if (decl.prop.startsWith('--tw-')) {
      hasTailwindVariable = true
    }
    if (PREFLIGHT_RESET_PROPS.has(decl.prop)) {
      hasResetProp = true
    }
  })
  return hasTailwindVariable || hasResetProp
}

function isMiniProgramThemeScopeRule(rule: postcss.Rule) {
  const selectors = getRuleSelectors(rule)
  return selectors.length > 0
    && selectors.every(selector => MINI_PROGRAM_THEME_SCOPE_SELECTORS.has(selector))
}

function isMiniProgramElementVariableScopeRule(rule: postcss.Rule) {
  const selectors = getRuleSelectors(rule)
  return selectors.length > 0
    && selectors.every(selector => MINI_PROGRAM_ELEMENT_VARIABLE_SCOPE_SELECTORS.has(selector))
}

function isTailwindV4GradientRuntimeDeclaration(decl: postcss.Declaration) {
  return decl.prop.startsWith('--tw-gradient-')
}

function moveTailwindV4GradientRuntimeDeclarations(rule: postcss.Rule) {
  const gradientDeclarations: postcss.Declaration[] = []

  rule.walkDecls((decl) => {
    if (isTailwindV4GradientRuntimeDeclaration(decl)) {
      gradientDeclarations.push(decl.clone())
      decl.remove()
    }
  })

  if (gradientDeclarations.length > 0) {
    rule.before(new postcss.Rule({
      selector: DEFAULT_WEAPP_ELEMENT_VARIABLE_SCOPE,
      nodes: gradientDeclarations,
    }))
  }

  if (rule.nodes.length === 0) {
    rule.remove()
  }
}

function isKeyframesRule(rule: postcss.Rule) {
  let parent = rule.parent as postcss.Container | undefined
  while (parent) {
    if (parent.type === 'atrule' && (parent as postcss.AtRule).name.endsWith('keyframes')) {
      return true
    }
    parent = parent.parent as postcss.Container | undefined
  }
  return false
}

function removeDeclarationAndEmptyRule(decl: postcss.Declaration) {
  const parent = decl.parent
  decl.remove()
  if (parent?.type === 'rule' && parent.nodes.length === 0) {
    parent.remove()
  }
}

function normalizeMiniProgramColorValues(root: postcss.Root) {
  const customPropertyValues = new Map<string, string>()
  root.walkDecls((decl) => {
    if (decl.prop.startsWith('--')) {
      customPropertyValues.set(decl.prop, decl.value.trim())
    }
  })

  root.walkDecls((decl) => {
    const normalized = normalizeModernColorValue(decl.value, customPropertyValues)
    if (normalized.changed) {
      decl.value = normalized.value
      if (decl.prop.startsWith('--')) {
        customPropertyValues.set(decl.prop, decl.value.trim())
      }
    }
    if (normalized.hasUnsupported) {
      removeDeclarationAndEmptyRule(decl)
    }
  })
}

/**
 * 裁剪 Tailwind 生成 CSS 中面向浏览器的 classless 规则。
 *
 * 生成模式面向小程序时只需要保留业务 utility 与 Tailwind 变量初始化；
 * 浏览器元素 reset、表单伪元素等 classless 规则不适合直接输出到小程序。
 */
export function pruneMiniProgramGeneratedCss(
  css: string,
  options: PruneMiniProgramGeneratedCssOptions = {},
) {
  const root = postcss.parse(css)
  const shouldPreserveContentInit = options.preservePreflight || usesTwContentVariable(root)

  root.walkComments((comment) => {
    comment.remove()
  })

  removeUnsupportedCascadeLayers(root)
  normalizeMiniProgramColorValues(root)

  root.walkAtRules('supports', (atRule) => {
    atRule.remove()
  })

  root.walkRules((rule) => {
    if (isKeyframesRule(rule)) {
      return
    }

    if (isCustomPropertyRule(rule) && isMiniProgramElementVariableScopeRule(rule)) {
      rule.selector = DEFAULT_WEAPP_ELEMENT_VARIABLE_SCOPE
      return
    }

    if (isCustomPropertyRule(rule) && isMiniProgramThemeScopeRule(rule)) {
      moveTailwindV4GradientRuntimeDeclarations(rule)
      if (!rule.parent) {
        return
      }
      rule.selector = DEFAULT_WEAPP_VARIABLE_SCOPE
      return
    }

    if (hasClassSelector(rule.selector)) {
      return
    }

    if (!shouldPreserveContentInit) {
      removeEmptyContentInitDeclarations(rule)
    }

    if (isPseudoContentInitRule(rule)) {
      if (!shouldPreserveContentInit) {
        rule.remove()
      }
      return
    }

    if (options.preservePreflight && isMiniProgramPreflightRule(rule)) {
      return
    }

    if (isCustomPropertyRule(rule)) {
      moveTailwindV4GradientRuntimeDeclarations(rule)
      if (!rule.parent) {
        return
      }
      rule.selector = DEFAULT_WEAPP_VARIABLE_SCOPE
      return
    }

    rule.remove()
  })

  root.walkAtRules((atRule) => {
    if (!atRule.nodes || atRule.nodes.length === 0) {
      atRule.remove()
    }
  })

  return root.toString()
}
