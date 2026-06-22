// Tailwind CSS v4 兼容性相关的辅助方法，集中复用特殊处理逻辑
import type { AtRule, Declaration as PostcssDeclaration, Root, Rule } from 'postcss'
import { rule as createRule, Declaration } from 'postcss'
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
const GRADIENT_BACKGROUND_RE = /^(linear|radial|conic)-gradient\(/i
const GRADIENT_STOPS_VAR_RE = /^(?:linear|radial|conic)-gradient\(\s*var\(\s*--tw-gradient-stops\b/i
const SIMPLE_CLASS_SELECTOR_RE = /^\.([_a-z\u00A0-\uFFFF\\-][\w\u00A0-\uFFFF\\-]*)$/i
const COLOR_VAR_RE = /^var\(\s*(--color-[\w-]+)\s*\)$/i
const GRADIENT_DIRECTION_CLASS_RE = /^(?:-?bg-linear|bg-gradient-to-|-?bg-conic|bg-radial)/

// 用于 normalizeTailwindcssV4Declaration 的正则
const RADIUS_VALUE_RE = /\b([+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?)\s*(r?px)\b/gi
const SCIENTIFIC_NOTATION_RE = /e/i
const TW_VAR_FUNCTION_RE = /var\(\s*(--tw-[\w-]+)\b/g
const TW_CONTENT_VAR_RE = /var\(\s*--tw-content\b/
const TW_GRADIENT_POSITION_PROPS = new Set([
  '--tw-gradient-from-position',
  '--tw-gradient-via-position',
  '--tw-gradient-to-position',
])
const UNSUPPORTED_CUSTOM_PROPERTY_DEFAULT_PROPS = new Set([
  '--tw-gradient-via-stops',
])
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

export function isTailwindcssV4(options?: { majorVersion?: 4 }) {
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

// Tailwind v4 的变量默认值只为当前 CSS 实际使用到的变量补齐，避免全量变量串入
export function createUsedCssVarsV4Nodes(usedProps: ReadonlySet<string>) {
  return cssVarsV4
    .filter(def => usedProps.has(def.prop) && !UNSUPPORTED_CUSTOM_PROPERTY_DEFAULT_PROPS.has(def.prop))
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
    .filter(def => usedProps.has(def.prop) && !scopedProps.has(def.prop) && !UNSUPPORTED_CUSTOM_PROPERTY_DEFAULT_PROPS.has(def.prop))
    .map(def => new Declaration({
      prop: def.prop,
      value: def.value,
    }))
}

function collectTailwindcssV4ThemeVariables(root: Root) {
  const variables = new Map<string, string>()
  root.walkRules((rule) => {
    if (!testIfRootHostForV4(rule) && !rule.selector.includes('page') && !rule.selector.includes('.tw-root')) {
      return
    }
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--color-')) {
        variables.set(decl.prop, decl.value)
      }
    })
  })
  return variables
}

function resolveTailwindcssV4GradientColor(value: string, themeVariables: ReadonlyMap<string, string>) {
  const trimmed = value.trim()
  const match = COLOR_VAR_RE.exec(trimmed)
  if (!match) {
    return trimmed
  }
  return themeVariables.get(match[1]!) ?? trimmed
}

function getSingleClassSelector(selector: string) {
  const match = SIMPLE_CLASS_SELECTOR_RE.exec(selector.trim())
  return match ? match[1] : undefined
}

function normalizeDeclarationValue(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeTailwindcssV4GradientPosition(value: string) {
  return value
    .replace(/calc\(\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:deg|grad|rad|turn))\s*\*\s*-1\s*\)/gi, '-$1')
    .replace(/^in\s+(?:oklab|oklch|hsl|srgb)(?:\s+(?:longer|shorter|increasing|decreasing)\s+hue)?$/i, '')
    .replace(/\s+in\s+(?:oklab|oklch|hsl|srgb)(?:\s+(?:longer|shorter|increasing|decreasing)\s+hue)?\s*$/i, '')
    .replace(/\s+(?:longer|shorter|increasing|decreasing)\s*$/i, '')
    .trim()
}

function normalizeTailwindcssV4GradientDirectionDeclaration(rule: Rule, decl: Declaration) {
  const normalized = normalizeTailwindcssV4GradientPosition(decl.value)
  if (normalized) {
    return normalized
  }
  const backgroundImageDecl = rule.nodes.find((node): node is PostcssDeclaration => {
    return node.type === 'decl' && node.prop === 'background-image'
  })
  if (!backgroundImageDecl) {
    return normalized
  }
  if (/^radial-gradient\(/i.test(backgroundImageDecl.value)) {
    return 'at center'
  }
  if (/^conic-gradient\(/i.test(backgroundImageDecl.value)) {
    return 'from 0deg'
  }
  return normalized
}

function appendStopPosition(color: string, position?: string) {
  const normalizedPosition = position?.trim()
  return normalizedPosition ? `${color} ${normalizedPosition}` : color
}

function getGradientStopsFallback(value: string) {
  if (!value.includes('var(') || !value.includes('--tw-gradient-stops')) {
    return undefined
  }
  const parsed = valueParser(value)
  let fallback: string | undefined
  parsed.walk((node) => {
    if (fallback || node.type !== 'function' || node.value.toLowerCase() !== 'var') {
      return
    }
    const firstCommaIndex = node.nodes.findIndex(child => child.type === 'div' && child.value === ',')
    const firstArg = node.nodes.find(child => child.type !== 'space')
    if (firstArg?.type !== 'word' || firstArg.value !== '--tw-gradient-stops' || firstCommaIndex < 0) {
      return
    }
    fallback = valueParser.stringify(node.nodes.slice(firstCommaIndex + 1)).trim()
  })
  return fallback
}

function isTailwindcssV4GradientDirectionRule(rule: Rule) {
  const classSelector = getSingleClassSelector(rule.selector)
  if (!classSelector || !GRADIENT_DIRECTION_CLASS_RE.test(classSelector)) {
    return false
  }
  return rule.nodes.some((node) => {
    return node.type === 'decl'
      && (
        node.prop === '--tw-gradient-position'
        || (node.prop === 'background-image' && node.value.includes('linear-gradient('))
      )
  })
}

function reorderTailwindcssV4GradientDirectionRule(rule: Rule) {
  const gradientPositionDecls: PostcssDeclaration[] = []
  const gradientBackgroundDecls: PostcssDeclaration[] = []
  for (const node of rule.nodes) {
    if (node.type !== 'decl') {
      continue
    }
    if (node.prop === '--tw-gradient-position') {
      gradientPositionDecls.push(node)
    }
    else if (node.prop === 'background-image' && node.value.includes('linear-gradient(')) {
      gradientBackgroundDecls.push(node)
    }
  }
  if (gradientPositionDecls.length === 0 || gradientBackgroundDecls.length === 0) {
    return
  }

  const anchor = rule.nodes.find((node) => {
    return node.type === 'decl'
      && (
        node.prop === '--tw-gradient-position'
        || (node.prop === 'background-image' && node.value.includes('linear-gradient('))
      )
  })
  if (!anchor) {
    return
  }

  const ordered = [...gradientPositionDecls, ...gradientBackgroundDecls]
  const orderedClones = ordered.map(decl => decl.clone())
  anchor.replaceWith(...orderedClones)
  for (const decl of ordered) {
    if (decl.parent) {
      decl.remove()
    }
  }
}

// Tailwind v4 会把渐变方向和 background-image 拆到普通规则 / @supports 规则里，小程序端需要收敛为一条规则。
export function mergeTailwindcssV4GradientDirectionRules(root: Root) {
  const seen = new Map<string, Rule>()

  root.walkRules((rule) => {
    if (!isTailwindcssV4GradientDirectionRule(rule)) {
      return
    }
    const selector = rule.selector.trim()
    const previous = seen.get(selector)
    if (!previous || previous.parent !== rule.parent) {
      seen.set(selector, rule)
      return
    }

    for (const node of [...rule.nodes]) {
      if (node.type !== 'decl') {
        continue
      }
      if (node.prop !== '--tw-gradient-position' && node.prop !== 'background-image') {
        continue
      }
      previous.append(node.clone())
    }
    reorderTailwindcssV4GradientDirectionRule(previous)
    rule.remove()
  })
}

interface GradientBaseRule {
  classSelector: string
  order: number
  position: string
  type: 'conic' | 'linear' | 'radial'
}

interface GradientColorRule {
  classSelector: string
  color: string
  order: number
  position?: string
}

function createTailwindcssV4MiniProgramGradientValue(
  gradient: GradientBaseRule,
  from: GradientColorRule,
  to: GradientColorRule,
  via?: GradientColorRule,
) {
  const stops = [
    gradient.position,
    appendStopPosition(from.color, from.position),
  ]
  if (via) {
    stops.push(appendStopPosition(via.color, via.position))
  }
  stops.push(appendStopPosition(to.color, to.position))
  return `${gradient.type}-gradient(${stops.filter(Boolean).join(', ')})`
}

// 微信开发者工具对 gradient 内嵌多层 CSS 变量支持不完整，这里为实际生成的 v4 渐变组合补字面量兜底。
export function appendTailwindcssV4MiniProgramGradientRules(root: Root) {
  const themeVariables = collectTailwindcssV4ThemeVariables(root)
  const gradients: GradientBaseRule[] = []
  const fromColors = new Map<string, GradientColorRule>()
  const viaColors = new Map<string, GradientColorRule>()
  const toColors = new Map<string, GradientColorRule>()
  const fromPositions: Array<{ classSelector: string, position: string }> = []
  const viaPositions: Array<{ classSelector: string, position: string }> = []
  const toPositions: Array<{ classSelector: string, position: string }> = []
  const directBackgroundImages: Array<{ selector: string, value: string }> = []
  const existingBackgroundImages = new Map<string, Set<string>>()
  const ruleOrder = new Map<string, number>()
  let order = 0

  root.walkRules((rule) => {
    const classSelector = getSingleClassSelector(rule.selector)
    const currentOrder = order++
    if (classSelector) {
      ruleOrder.set(classSelector, currentOrder)
    }
    rule.walkDecls('background-image', (decl) => {
      const selector = rule.selector.trim()
      const values = existingBackgroundImages.get(selector)
      if (values) {
        values.add(normalizeDeclarationValue(decl.value))
      }
      else {
        existingBackgroundImages.set(selector, new Set([normalizeDeclarationValue(decl.value)]))
      }
    })
    if (classSelector) {
      const gradientPositionDecl = rule.nodes.find((node): node is PostcssDeclaration => {
        return node.type === 'decl' && node.prop === '--tw-gradient-position'
      })
      const gradientBackgroundDecl = rule.nodes.find((node): node is PostcssDeclaration => {
        return node.type === 'decl' && node.prop === 'background-image' && GRADIENT_BACKGROUND_RE.test(node.value)
      })
      if (gradientPositionDecl && gradientBackgroundDecl) {
        const gradientType = GRADIENT_BACKGROUND_RE.exec(gradientBackgroundDecl.value)?.[1] as GradientBaseRule['type'] | undefined
        if (gradientType) {
          gradients.push({
            classSelector,
            order: currentOrder,
            position: normalizeTailwindcssV4GradientDirectionDeclaration(rule, gradientPositionDecl),
            type: gradientType,
          })
          const fallback = GRADIENT_STOPS_VAR_RE.test(gradientBackgroundDecl.value)
            ? getGradientStopsFallback(gradientBackgroundDecl.value)
            : undefined
          if (fallback) {
            directBackgroundImages.push({
              selector: rule.selector.trim(),
              value: `${gradientType}-gradient(${fallback})`,
            })
          }
        }
      }
      rule.walkDecls((decl) => {
        if (decl.prop === '--tw-gradient-from') {
          fromColors.set(classSelector, {
            classSelector,
            color: resolveTailwindcssV4GradientColor(decl.value, themeVariables),
            order: currentOrder,
          })
        }
        else if (decl.prop === '--tw-gradient-from-position') {
          fromPositions.push({ classSelector, position: decl.value })
        }
        else if (decl.prop === '--tw-gradient-via') {
          viaColors.set(classSelector, {
            classSelector,
            color: resolveTailwindcssV4GradientColor(decl.value, themeVariables),
            order: currentOrder,
          })
        }
        else if (decl.prop === '--tw-gradient-via-position') {
          viaPositions.push({ classSelector, position: decl.value })
        }
        else if (decl.prop === '--tw-gradient-to') {
          toColors.set(classSelector, {
            classSelector,
            color: resolveTailwindcssV4GradientColor(decl.value, themeVariables),
            order: currentOrder,
          })
        }
        else if (decl.prop === '--tw-gradient-to-position') {
          toPositions.push({ classSelector, position: decl.value })
        }
      })
    }
  })

  const fromVariants: GradientColorRule[] = []
  const viaVariants: GradientColorRule[] = []
  const toVariants: GradientColorRule[] = []
  const positionedFromVariants: GradientColorRule[] = []
  const positionedViaVariants: GradientColorRule[] = []
  const positionedToVariants: GradientColorRule[] = []
  for (const color of fromColors.values()) {
    fromVariants.push(color)
    for (const position of fromPositions) {
      positionedFromVariants.push({
        ...color,
        classSelector: `${color.classSelector}.${position.classSelector}`,
        order: Math.max(color.order, ruleOrder.get(position.classSelector) ?? color.order),
        position: position.position,
      })
    }
  }
  for (const color of viaColors.values()) {
    viaVariants.push(color)
    for (const position of viaPositions) {
      positionedViaVariants.push({
        ...color,
        classSelector: `${color.classSelector}.${position.classSelector}`,
        order: Math.max(color.order, ruleOrder.get(position.classSelector) ?? color.order),
        position: position.position,
      })
    }
  }
  for (const color of toColors.values()) {
    toVariants.push(color)
    for (const position of toPositions) {
      positionedToVariants.push({
        ...color,
        classSelector: `${color.classSelector}.${position.classSelector}`,
        order: Math.max(color.order, ruleOrder.get(position.classSelector) ?? color.order),
        position: position.position,
      })
    }
  }

  function appendGradientRule(selector: string, value: string) {
    const normalizedValue = normalizeDeclarationValue(value)
    if (existingBackgroundImages.get(selector)?.has(normalizedValue)) {
      return
    }
    existingBackgroundImages.set(selector, new Set([
      ...(existingBackgroundImages.get(selector) ?? []),
      normalizedValue,
    ]))
    root.append(createRule({
      selector,
      nodes: [
        new Declaration({
          prop: 'background-image',
          value,
        }),
      ],
    }))
  }

  for (const { selector, value } of directBackgroundImages) {
    appendGradientRule(selector, value)
  }

  function appendGradientCombinations(
    gradient: GradientBaseRule,
    fromRules: GradientColorRule[],
    viaRules: GradientColorRule[],
    toRules: GradientColorRule[],
  ) {
    for (const from of fromRules) {
      for (const to of toRules) {
        appendGradientRule(
          `.${gradient.classSelector}.${from.classSelector}.${to.classSelector}`,
          createTailwindcssV4MiniProgramGradientValue(gradient, from, to),
        )
        for (const via of viaRules) {
          appendGradientRule(
            `.${gradient.classSelector}.${from.classSelector}.${via.classSelector}.${to.classSelector}`,
            createTailwindcssV4MiniProgramGradientValue(gradient, from, to, via),
          )
        }
      }
    }
  }

  for (const gradient of gradients) {
    if (gradient.position.includes(',') || /^var\(/i.test(gradient.position)) {
      continue
    }
    appendGradientCombinations(gradient, fromVariants, viaVariants, toVariants)
    appendGradientCombinations(gradient, positionedFromVariants, positionedViaVariants, positionedToVariants)
  }
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
      || lastArg?.type !== 'div'
      || lastArg.value !== ','
      || node.after === ' '
    ) {
      return
    }

    node.after = ' '
    changed = true
  })

  return changed ? parsed.toString() : value
}

function normalizeTailwindcssV4GradientStopsFallback(value: string) {
  if (!value.includes('var(') || !value.includes('--tw-gradient-via-stops')) {
    return value
  }

  const parsed = valueParser(value)
  let changed = false

  function normalizeNodes(nodes: valueParser.Node[]) {
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index]
      if (!node) {
        continue
      }
      if (node.type === 'function' && node.value.toLowerCase() !== 'var') {
        normalizeNodes(node.nodes)
        continue
      }
      if (node.type !== 'function') {
        continue
      }

      const args = node.nodes.filter(child => child.type !== 'space')
      const firstArg = args[0]
      if (
        firstArg?.type !== 'word'
        || firstArg.value !== '--tw-gradient-via-stops'
      ) {
        normalizeNodes(node.nodes)
        continue
      }

      const firstCommaIndex = node.nodes.findIndex(child => child.type === 'div' && child.value === ',')
      if (firstCommaIndex < 0) {
        continue
      }

      const fallbackNodes = node.nodes.slice(firstCommaIndex + 1)
      const splitIndex = fallbackNodes.findIndex(child => child.type === 'div' && child.value === ',')
      if (splitIndex < 0) {
        continue
      }

      const viaFallbackNodes = fallbackNodes.slice(0, splitIndex)
      const stopNodes = fallbackNodes.slice(splitIndex)
      const nextVarNode = {
        ...node,
        nodes: [
          { type: 'word', value: '--tw-gradient-via-stops' },
          { type: 'div', value: ',', before: '', after: ' ' },
          ...viaFallbackNodes,
        ],
        sourceEndIndex: undefined,
        sourceIndex: undefined,
      }
      nodes.splice(index, 1, nextVarNode, ...stopNodes)
      changed = true
      index += stopNodes.length
    }
  }

  normalizeNodes(parsed.nodes)

  return changed ? parsed.toString() : value
}

function normalizeTailwindcssV4GradientPositionFallback(value: string) {
  if (!value.includes('var(') || !value.includes('--tw-gradient-')) {
    return value
  }

  const parsed = valueParser(value)
  let changed = false

  parsed.walk((node) => {
    if (node.type !== 'function' || node.value.toLowerCase() !== 'var') {
      return
    }

    const args = node.nodes.filter(child => child.type !== 'space')
    const firstArg = args[0]
    if (
      firstArg?.type !== 'word'
      || !TW_GRADIENT_POSITION_PROPS.has(firstArg.value)
    ) {
      return
    }
    const commaIndex = args.findIndex(child => child.type === 'div' && child.value === ',')
    const comma = commaIndex === -1 ? undefined : args[commaIndex]
    if (comma) {
      const hasFallback = args.slice(commaIndex + 1).some(child => child.type !== 'space')
      if (!hasFallback && node.after !== ' ') {
        node.after = ' '
        changed = true
      }
      return
    }

    node.nodes.push({
      type: 'div',
      value: ',',
      before: '',
      after: '',
    })
    node.after = ' '
    changed = true
  })

  return changed ? parsed.toString() : value
}

// 对 Tailwind v4 生成的声明做兼容处理，返回是否发生变更
export function normalizeTailwindcssV4Declaration(decl: Declaration): boolean {
  let changed = false
  if (decl.prop === '--tw-gradient-via-stops' && decl.value.trim() === 'initial') {
    decl.remove()
    return true
  }
  const normalizedEmptyVarFallback = normalizeTailwindcssV4EmptyVarFallback(decl.value)
  if (normalizedEmptyVarFallback !== decl.value) {
    decl.value = normalizedEmptyVarFallback
    changed = true
  }
  const normalizedGradientStopsFallback = normalizeTailwindcssV4GradientStopsFallback(decl.value)
  if (normalizedGradientStopsFallback !== decl.value) {
    decl.value = normalizedGradientStopsFallback
    changed = true
  }
  const normalizedGradientPositionFallback = normalizeTailwindcssV4GradientPositionFallback(decl.value)
  if (normalizedGradientPositionFallback !== decl.value) {
    decl.value = normalizedGradientPositionFallback
    changed = true
  }

  if (decl.prop === '--tw-gradient-position' && decl.value.endsWith(OKLAB_SUFFIX)) {
    const nextValue = decl.parent?.type === 'rule'
      ? normalizeTailwindcssV4GradientDirectionDeclaration(decl.parent, decl)
      : normalizeTailwindcssV4GradientPosition(decl.value)
    decl.value = nextValue
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
