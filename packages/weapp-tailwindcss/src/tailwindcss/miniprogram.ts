import postcss from 'postcss'
import { removeUnsupportedCascadeLayers } from './remove-unsupported-css'

const DEFAULT_WEAPP_VARIABLE_SCOPE = 'page,.tw-root,wx-root-portal-content,:host'
const CLASS_SELECTOR_RE = /(?:^|[^\w-])\.[_a-z\u00A0-\uFFFF\\-]/i
const PSEUDO_CONTENT_SELECTOR_RE = /^(?:::before|::after|:before|:after)(?:,(?:::before|::after|:before|:after))*$/

function hasClassSelector(selector: string) {
  return CLASS_SELECTOR_RE.test(selector)
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

function isKeyframesRule(rule: postcss.Rule) {
  let parent = rule.parent
  while (parent) {
    if (parent.type === 'atrule' && parent.name.endsWith('keyframes')) {
      return true
    }
    parent = parent.parent
  }
  return false
}

/**
 * 裁剪 Tailwind 生成 CSS 中面向浏览器的 classless 规则。
 *
 * 生成模式面向小程序时只需要保留业务 utility 与 Tailwind 变量初始化；
 * 浏览器元素 reset、表单伪元素等 classless 规则不适合直接输出到小程序。
 */
export function pruneMiniProgramGeneratedCss(css: string) {
  const root = postcss.parse(css)

  root.walkComments((comment) => {
    comment.remove()
  })

  removeUnsupportedCascadeLayers(root)

  root.walkAtRules('supports', (atRule) => {
    atRule.remove()
  })

  root.walkRules((rule) => {
    if (isKeyframesRule(rule)) {
      return
    }

    if (hasClassSelector(rule.selector)) {
      return
    }

    if (isPseudoContentInitRule(rule)) {
      return
    }

    if (isCustomPropertyRule(rule)) {
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
