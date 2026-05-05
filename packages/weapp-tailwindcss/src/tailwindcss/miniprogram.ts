import postcss from 'postcss'

const DEFAULT_WEAPP_VARIABLE_SCOPE = 'page,.tw-root,wx-root-portal-content,:host'
const CLASS_SELECTOR_RE = /(?:^|[^\w-])\.[_a-z\u00A0-\uFFFF\\-]/i

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

  root.walkRules((rule) => {
    if (hasClassSelector(rule.selector)) {
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
