import { postcss } from '@weapp-tailwindcss/postcss'
import { removeTailwindSourceDirectives } from '@/bundlers/shared/generator-css/directives'

function normalizeSelector(selector: string) {
  return selector.replace(/\s+/g, ' ').trim()
}

function atRuleKey(name: string, params: string) {
  return `${name.toLowerCase()}\0${params.replace(/\s+/g, ' ').trim()}`
}

/**
 * `@apply` 只应把声明带回作者样式，不能把 Tailwind 根入口的 preflight、
 * utilities 和 property 注册复制进 scoped style 模块。
 */
export function retainUniAppXAuthorApplyCss(generatedCss: string, authorCss: string) {
  try {
    const authorRoot = postcss.parse(removeTailwindSourceDirectives(authorCss, { importFallback: true }))
    const authorSelectors = new Set<string>()
    const authorAtRules = new Set<string>()
    authorRoot.walkRules((rule) => {
      for (const selector of rule.selectors ?? [rule.selector]) {
        authorSelectors.add(normalizeSelector(selector))
      }
    })
    authorRoot.walkAtRules((atRule) => {
      if (atRule.name !== 'apply' && atRule.name !== 'reference') {
        authorAtRules.add(atRuleKey(atRule.name, atRule.params))
      }
    })

    const root = postcss.parse(generatedCss)
    let changed = false
    root.walkRules((rule) => {
      const selectors = rule.selectors ?? [rule.selector]
      if (selectors.every(selector => authorSelectors.has(normalizeSelector(selector)))) {
        return
      }
      rule.remove()
      changed = true
    })
    root.walkAtRules((atRule) => {
      if (authorAtRules.has(atRuleKey(atRule.name, atRule.params))) {
        return
      }
      if (atRule.nodes?.some(node => node.type === 'rule' || node.type === 'atrule')) {
        return
      }
      atRule.remove()
      changed = true
    })
    root.walkComments((comment) => {
      if (/tailwindcss v\d|weapp-tailwindcss (?:vite-generated-css|layer|uni-app-x web preflight reset)/i.test(comment.text)) {
        comment.remove()
        changed = true
      }
    })
    return changed ? root.toString().trim() : generatedCss
  }
  catch {
    return generatedCss
  }
}
