import type { Rule } from 'postcss'
import type { IStyleHandlerOptions } from '../../types'

// normalizeSelectorList 将 root/universal 替换配置规范化为数组
function normalizeSelectorList(value?: string | string[] | false) {
  if (value === undefined || value === false) {
    return []
  }
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

// 读取 preset-env 设置的 specificityMatchingName，供后续清理使用
function getSpecificityMatchingName(options: IStyleHandlerOptions) {
  const feature = options.cssPresetEnv?.features?.['is-pseudo-class']
  if (feature && typeof feature === 'object' && 'specificityMatchingName' in feature) {
    const specificityName = (feature as { specificityMatchingName?: string }).specificityMatchingName
    return typeof specificityName === 'string' && specificityName.length > 0 ? specificityName : undefined
  }
  return undefined
}

// createRootSpecificityCleaner 用于删除 root 选择器上多余的 :not() 包裹
export function createRootSpecificityCleaner(options: IStyleHandlerOptions) {
  const specificityMatchingName = getSpecificityMatchingName(options)
  const selectors = normalizeSelectorList(options.cssSelectorReplacement?.root)

  if (!specificityMatchingName || selectors.length === 0) {
    return undefined
  }

  const suffix = `:not(.${specificityMatchingName})`
  const targets = selectors
    .map(selector => selector?.trim())
    .filter((selector): selector is string => Boolean(selector?.length))
    .map(selector => ({
      match: `${selector}${suffix}`,
      spacedMatch: `${selector} ${suffix}`,
      replacement: selector,
    }))

  if (!targets.length) {
    return undefined
  }

  return (rule: Rule) => {
    if (!rule.selectors || rule.selectors.length === 0) {
      return
    }

    const next = rule.selectors.map((selector) => {
      let updated = selector
      for (const target of targets) {
        if (updated.includes(target.match)) {
          updated = updated.split(target.match).join(target.replacement)
        }
        if (updated.includes(target.spacedMatch)) {
          updated = updated.split(target.spacedMatch).join(target.replacement)
        }
      }
      return updated
    })

    rule.selectors = next
  }
}
