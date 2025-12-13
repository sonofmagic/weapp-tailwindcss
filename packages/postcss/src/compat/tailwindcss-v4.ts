// Tailwind CSS v4 兼容性相关的辅助方法，集中复用特殊处理逻辑
import type { AtRule, Declaration, Rule } from 'postcss'
import cssVarsV4 from '../cssVarsV4'
import { createCssVarNodes } from '../utils/css-vars'

const OKLAB_SUFFIX = 'in oklab'
const INFINITY_CALC_REGEXP = /calc\(\s*infinity\s*\*\s*(?:\d+(?:\.\d*)?|\.\d+)r?px/
const RADIUS_THRESHOLD = 100000
const CLAMP_PX = 9999

export function isTailwindcssV4(options?: { majorVersion?: number }) {
  return options?.majorVersion === 4
}

// Tailwind v4 会把 :root 与 :host 组合在一起，这里单独识别
export function testIfRootHostForV4(node: Rule) {
  return node.type === 'rule' && node.selector.includes(':root') && node.selector.includes(':host')
}

// Tailwind CSS v4 默认 CSS 变量映射，参考官方 utilities 定义
export const cssVarsV4Nodes = createCssVarNodes(cssVarsV4)

// Tailwind v4 的现代检查语句需要特殊处理以恢复具体规则
export function isTailwindcssV4ModernCheck(atRule: AtRule) {
  return atRule.name === 'supports' && [
    /-webkit-hyphens\s*:\s*none/,
    /margin-trim\s*:\s*inline/,
    /-moz-orient\s*:\s*inline/,
    /color\s*:\s*rgb\(\s*from\s+red\s+r\s+g\s+b\s*\)/,
  ].every(regex => regex.test(atRule.params))
}

// 对 Tailwind v4 生成的声明做兼容处理，返回是否发生变更
export function normalizeTailwindcssV4Declaration(decl: Declaration): boolean {
  if (decl.prop === '--tw-gradient-position' && decl.value.endsWith(OKLAB_SUFFIX)) {
    decl.value = decl.value.slice(0, decl.value.length - OKLAB_SUFFIX.length)
    return true
  }

  if (INFINITY_CALC_REGEXP.test(decl.value)) {
    decl.value = `${CLAMP_PX}px`
    return true
  }

  if (decl.prop.includes('radius')) {
    const next = decl.value.replace(
      /\b([+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?)\s*(r?px)\b/gi,
      (m, num) => {
        const n = Number(num)
        if (!Number.isFinite(n)) {
          return `${CLAMP_PX}px`
        }
        if (/e/i.test(String(num)) || n > RADIUS_THRESHOLD) {
          return `${CLAMP_PX}px`
        }
        return m
      },
    )
    if (next !== decl.value) {
      decl.value = next
      return true
    }
  }

  return false
}
