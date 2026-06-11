// Tailwind CSS v4 兼容性相关的辅助方法，集中复用特殊处理逻辑
import type { AtRule, Declaration as PostcssDeclaration, Root, Rule } from 'postcss'
import { Declaration } from 'postcss'
import valueParser from 'postcss-value-parser'
import cssVarsV4 from '../cssVarsV4'
import { createCssVarNodes } from '../utils/css-vars'

const OKLAB_SUFFIX = 'in oklab'
const INFINITY_CALC_REGEXP = /calc\(\s*infinity\s*\*\s*(?:\d+(?:\.\d*)?|\.\d+)r?px/
const RADIUS_THRESHOLD = 100000
const CLAMP_PX = 9999

// 用于 isTailwindcssV4ModernCheck 的正则列表
const MODERN_CHECK_WEBKIT_HYPHENS_RE = /-webkit-hyphens\s*:\s*none/
const MODERN_CHECK_MARGIN_TRIM_RE = /margin-trim\s*:\s*inline/
const MODERN_CHECK_MOZ_ORIENT_RE = /-moz-orient\s*:\s*inline/
const MODERN_CHECK_COLOR_RGB_RE = /color\s*:\s*rgb\(\s*from\s+red\s+r\s+g\s+b\s*\)/
const LINEAR_GRADIENT_LAB_RE = /background-image\s*:\s*linear-gradient\(\s*in\s+lab\s*,\s*red\s*,\s*red\s*\)/
const DISPLAY_P3_COLOR_RE = /color\s*:\s*color\(\s*display-p3\s+0\s+0\s+0%\s*\)/
const DISPLAY_P3_VALUE_RE = /color\(\s*display-p3\b/i
const COLOR_GAMUT_P3_RE = /\(\s*color-gamut\s*:\s*p3\s*\)/i

// 用于 normalizeTailwindcssV4Declaration 的正则
const RADIUS_VALUE_RE = /\b([+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?)\s*(r?px)\b/gi
const SCIENTIFIC_NOTATION_RE = /e/i
const TW_VAR_FUNCTION_RE = /var\(\s*(--tw-[\w-]+)\b/g
const TW_CONTENT_VAR_RE = /var\(\s*--tw-content\b/
const DEFAULT_VARIABLE_SCOPE_SELECTORS = new Set([
  '*',
  ':root',
  ':host',
  'page',
  '.tw-root',
  'wx-root-portal-content',
  'view',
  'text',
  ':before',
  ':after',
  '::before',
  '::after',
  '::backdrop',
])

export function isTailwindcssV4(options?: { majorVersion?: number }) {
  return options?.majorVersion === 4
}

// Tailwind v4 会把 :root 与 :host 组合在一起，这里单独识别
export function testIfRootHostForV4(node: Rule) {
  return node.type === 'rule' && node.selector.includes(':root') && node.selector.includes(':host')
}

// Tailwind CSS v4 默认 CSS 变量映射，参考官方 utilities 定义
export const cssVarsV4Nodes = createCssVarNodes(cssVarsV4)

// 从当前 CSS 中收集实际引用到的 Tailwind v4 变量，用于按需注入默认值
export function collectUsedTailwindcssV4Variables(root: Root) {
  const props = new Set<string>()
  root.walkDecls((decl) => {
    if (decl.prop.startsWith('--tw-')) {
      props.add(decl.prop)
    }
    TW_VAR_FUNCTION_RE.lastIndex = 0
    let match = TW_VAR_FUNCTION_RE.exec(decl.value)
    while (match !== null) {
      const prop = match[1]
      if (prop) {
        props.add(prop)
      }
      match = TW_VAR_FUNCTION_RE.exec(decl.value)
    }
  })
  root.walkAtRules('property', (atRule) => {
    const prop = atRule.params.trim()
    if (prop.startsWith('--tw-')) {
      props.add(prop)
    }
  })
  return props
}

// 判断当前 CSS 是否实际依赖 --tw-content 的默认值
export function usesTailwindcssV4ContentVariable(root: Root) {
  let used = false
  root.walkDecls((decl) => {
    if (TW_CONTENT_VAR_RE.test(decl.value)) {
      used = true
    }
  })
  return used
}

// Tailwind v4 的变量默认值只为当前 CSS 实际使用到的变量补齐，避免 v3/v4 全量变量串入
export function createUsedCssVarsV4Nodes(usedProps: ReadonlySet<string>) {
  return cssVarsV4
    .filter(def => usedProps.has(def.prop))
    .map(def => new Declaration({
      prop: def.prop,
      value: def.value,
    }))
}

function isInsideAtRule(decl: PostcssDeclaration, name: string) {
  let parent = decl.parent
  while (parent) {
    if (parent.type === 'atrule' && parent.name === name) {
      return true
    }
    parent = parent.parent
  }
  return false
}

function isDefaultVariableScopeRule(rule: Rule) {
  if (!rule.selectors.every(selector => DEFAULT_VARIABLE_SCOPE_SELECTORS.has(selector.trim()))) {
    return false
  }
  let hasDeclaration = false
  let onlyCustomProperties = true
  rule.each((node) => {
    if (node.type !== 'decl') {
      return
    }
    hasDeclaration = true
    if (!node.prop.startsWith('--')) {
      onlyCustomProperties = false
    }
  })
  return hasDeclaration && onlyCustomProperties
}

function collectScopedTailwindcssV4DefaultVariables(root: Root) {
  const props = new Set<string>()
  root.walkDecls((decl) => {
    if (!decl.prop.startsWith('--tw-')) {
      return
    }
    if (isInsideAtRule(decl, 'supports')) {
      return
    }
    if (decl.parent?.type === 'rule' && isDefaultVariableScopeRule(decl.parent)) {
      props.add(decl.prop)
    }
  })
  return props
}

// 为会移除 @property 的小程序产物补齐缺失的 Tailwind v4 运行时默认变量
export function createMissingCssVarsV4Nodes(root: Root, usedProps: ReadonlySet<string>) {
  const scopedProps = collectScopedTailwindcssV4DefaultVariables(root)
  return cssVarsV4
    .filter(def => usedProps.has(def.prop) && !scopedProps.has(def.prop))
    .map(def => new Declaration({
      prop: def.prop,
      value: def.value,
    }))
}

// Tailwind v4 的现代检查语句需要特殊处理以恢复具体规则
export function isTailwindcssV4ModernCheck(atRule: AtRule) {
  return atRule.name === 'supports' && [
    MODERN_CHECK_WEBKIT_HYPHENS_RE,
    MODERN_CHECK_MARGIN_TRIM_RE,
    MODERN_CHECK_MOZ_ORIENT_RE,
    MODERN_CHECK_COLOR_RGB_RE,
  ].every(regex => regex.test(atRule.params))
}

// Tailwind v4 的 lab 渐变能力检测在小程序中没有收益，保留基础声明即可
export function isTailwindcssV4LinearGradientSupports(atRule: AtRule) {
  return atRule.name === 'supports' && LINEAR_GRADIENT_LAB_RE.test(atRule.params)
}

// Tailwind v4 的 display-p3 变量分支是浏览器增强，小程序生成产物保留普通 fallback 即可
export function isTailwindcssV4DisplayP3Supports(atRule: AtRule) {
  return atRule.name === 'supports' && DISPLAY_P3_COLOR_RE.test(atRule.params)
}

// 小程序不支持 display-p3 媒体增强分支，保留普通 rgb fallback 即可
export function isTailwindcssV4DisplayP3Media(atRule: AtRule) {
  return atRule.name === 'media' && COLOR_GAMUT_P3_RE.test(atRule.params)
}

// 小程序不支持 display-p3 颜色函数，删除对应声明以回退到前面的 rgb/var 声明
export function isTailwindcssV4DisplayP3Declaration(decl: Declaration) {
  return DISPLAY_P3_VALUE_RE.test(decl.value)
}

function normalizeTailwindcssV4EmptyVarFallback(value: string) {
  if (!value.includes('var(') || !value.includes('--tw-')) {
    return value
  }

  const parsed = valueParser(value)
  let changed = false

  parsed.walk((node) => {
    if (node.type !== 'function' || node.value.toLowerCase() !== 'var') {
      return
    }

    const firstArg = node.nodes.find(child => child.type !== 'space')
    const lastArg = node.nodes.findLast(child => child.type !== 'space')
    if (
      firstArg?.type !== 'word'
      || !firstArg.value.startsWith('--tw-')
    ) {
      return
    }

    // 检查是否有逗号作为最后一个参数（空默认值）
    if (
      lastArg?.type === 'div'
      && lastArg.value === ','
    ) {
      // 在逗号后添加空格
      const spaceNode = {
        type: 'space',
        value: ' ',
      }
      node.nodes.push(spaceNode)
      changed = true
    }
    // 确保 var() 函数后有空格（如果后面还有内容）
    if (node.after !== ' ') {
      node.after = ' '
      changed = true
    }
  })

  return changed ? parsed.toString() : value
}

// 对 Tailwind v4 生成的声明做兼容处理，返回是否发生变更
export function normalizeTailwindcssV4Declaration(decl: Declaration): boolean {
  let changed = false
  const normalizedEmptyVarFallback = normalizeTailwindcssV4EmptyVarFallback(decl.value)
  if (normalizedEmptyVarFallback !== decl.value) {
    decl.value = normalizedEmptyVarFallback
    changed = true
  }

  if (decl.prop === '--tw-gradient-position' && decl.value.endsWith(OKLAB_SUFFIX)) {
    decl.value = decl.value.slice(0, decl.value.length - OKLAB_SUFFIX.length).trimEnd()
    return true
  }

  if (INFINITY_CALC_REGEXP.test(decl.value)) {
    decl.value = `${CLAMP_PX}px`
    return true
  }

  if (decl.prop.includes('radius')) {
    RADIUS_VALUE_RE.lastIndex = 0
    const next = decl.value.replace(
      RADIUS_VALUE_RE,
      (m, num) => {
        const n = Number(num)
        if (!Number.isFinite(n)) {
          return `${CLAMP_PX}px`
        }
        if (SCIENTIFIC_NOTATION_RE.test(String(num)) || n > RADIUS_THRESHOLD) {
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

  return changed
}
