import postcss from 'postcss'
import { normalizeMiniProgramPrefixedDeclaration, removeUnsupportedMiniProgramPrefixedAtRule } from '../mini-program-prefixes'
import { removeUnsupportedCascadeLayers } from './at-rules'
import {
  isCustomPropertyRule,
  isEmptyTwContentDeclaration,
  isMiniProgramPreflightRule,
  isMiniProgramThemeVariableRule,
  isPseudoContentInitRule,
  usesTwContentVariable,
} from './predicates'
import { removeUnsupportedModernColorDeclarations } from './root-cleanups'
import { getRuleSelectors } from './selectors'

const DEFAULT_WEAPP_VARIABLE_SCOPE = 'page,.tw-root,wx-root-portal-content,:host'
const DEFAULT_WEAPP_ELEMENT_VARIABLE_SCOPE = 'view,text,:before,:after'
const CLASS_SELECTOR_RE = /(?:^|[^\w-])\.[_a-z\u00A0-\uFFFF\\-]/i
const MINI_PROGRAM_ELEMENT_VARIABLE_SCOPE_SELECTORS = new Set(['view', 'text', ':before', ':after', '::before', '::after'])

export interface PruneMiniProgramGeneratedCssOptions {
  preservePreflight?: boolean
  preserveConditionalComments?: boolean
}

function isConditionalCompilationComment(text: string) {
  return /#(?:ifn?def|endif)\b/.test(text)
}

function hasClassSelector(selector: string) {
  return CLASS_SELECTOR_RE.test(selector)
}

function removeEmptyContentInitDeclarations(rule: postcss.Rule) {
  rule.walkDecls((decl) => {
    if (isEmptyTwContentDeclaration(decl)) {
      decl.remove()
    }
  })
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

/**
 * 裁剪 Tailwind 生成 CSS 中面向浏览器的 classless 规则。
 */
export function pruneMiniProgramGeneratedCss(
  css: string,
  options: PruneMiniProgramGeneratedCssOptions = {},
) {
  const root = postcss.parse(css)
  const shouldPreserveContentInit = options.preservePreflight || usesTwContentVariable(root)

  root.walkComments((comment) => {
    if (options.preserveConditionalComments && isConditionalCompilationComment(comment.text)) {
      return
    }
    comment.remove()
  })

  removeUnsupportedCascadeLayers(root)
  removeUnsupportedModernColorDeclarations(root)

  root.walkAtRules('supports', (atRule) => {
    atRule.remove()
  })
  root.walkAtRules((atRule) => {
    removeUnsupportedMiniProgramPrefixedAtRule(atRule)
  })
  root.walkDecls((decl) => {
    normalizeMiniProgramPrefixedDeclaration(decl)
  })

  root.walkRules((rule) => {
    if (isKeyframesRule(rule)) {
      return
    }

    if (isCustomPropertyRule(rule) && isMiniProgramElementVariableScopeRule(rule)) {
      rule.selector = DEFAULT_WEAPP_ELEMENT_VARIABLE_SCOPE
      return
    }

    if (isMiniProgramThemeVariableRule(rule)) {
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
