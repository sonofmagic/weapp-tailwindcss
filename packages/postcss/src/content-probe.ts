/**
 * CSS 内容特征探测模块
 *
 * 通过正则和字符串匹配快速判断 CSS 是否包含特定特征，
 * 用于在构建流水线前决定哪些插件可以跳过。
 * 仅使用字符串方法和正则表达式，不引入 AST 解析开销。
 */

/**
 * CSS 内容特征信号，表示哪些特征存在于当前 CSS 中
 */
export interface FeatureSignal {
  /** CSS 中是否包含现代颜色函数语法（如 rgb(r g b / a) 空格分隔写法） */
  hasModernColorFunction: boolean
  /** CSS 中是否包含需要 postcss-preset-env 处理的特征 */
  hasPresetEnvFeatures: boolean
}

/**
 * 所有标志均为 true 的默认信号（回退值）
 */
export const FULL_SIGNAL: FeatureSignal = {
  hasModernColorFunction: true,
  hasPresetEnvFeatures: true,
}

/**
 * 所有标志均为 false 的空信号
 */
export const EMPTY_SIGNAL: FeatureSignal = {
  hasModernColorFunction: false,
  hasPresetEnvFeatures: false,
}

/**
 * 检测 rgb(r g b / a) 空格分隔写法的正则
 * 匹配 rgb 或 rgba 后跟空格分隔的参数和 `/` 分隔符
 */
const MODERN_COLOR_RE = /rgb\w*\s*\([^),][^\s),]*\s[^),][^\s),]*\s[^),][^),/]*\/[^)]+\)/i

/**
 * 需要 postcss-preset-env 处理的特征关键字列表
 * 采用宽松匹配策略：宁可误报，不可漏报
 *
 * 包含以下类别：
 * - 伪类选择器：:is()、:where()、:not()（复杂参数需要 preset-env 展开）
 * - :root 选择器（pre 插件会包裹为 :is()，需要 preset-env 展平）
 * - 现代颜色函数：oklab()、oklch()、color-mix()、color()
 * - Cascade Layers：@layer
 * - 逻辑属性：margin-block、margin-inline、padding-inline、padding-block、
 *   border-inline、border-block、border-start-*-radius、border-end-*-radius、
 *   inset-inline、inset-block
 * - CSS 嵌套：& 选择器
 * - 通配符选择器 *（pre 插件会包裹为 :is(view,text)，需要 preset-env 展平）
 */
const PRESET_ENV_KEYWORDS = [
  ':is(',
  ':where(',
  ':not(',
  ':root',
  'oklab(',
  'oklch(',
  'color-mix(',
  '@layer ',
  'color(',
  'padding-inline',
  'padding-block',
  'margin-inline',
  'margin-block',
  'border-inline',
  'border-block',
  'border-start-start-radius',
  'border-start-end-radius',
  'border-end-start-radius',
  'border-end-end-radius',
  'inset-inline',
  'inset-block',
] as const

/**
 * 检测 CSS 嵌套语法的正则（& 后跟选择器字符）
 */
const NESTING_RE = /&\s*[>+~.:[\w]/

/**
 * 检测通配符选择器的正则（独立的 * 选择器，非属性选择器中的 *）
 */
const UNIVERSAL_SELECTOR_RE = /(?:^|[,{\s])\*\s*[,{:]/

/**
 * 检测 4 位或 8 位十六进制颜色值（带 alpha 通道，需要 preset-env 转换为 rgba）
 */
const HEX_ALPHA_RE = /#[\da-f]{4}(?:[\da-f]{4})?(?=[;\s,)}])/i

/**
 * 探测 CSS 内容特征，返回 FeatureSignal
 *
 * @param css - 待探测的 CSS 字符串
 * @returns 特征信号对象
 */
export function probeFeatures(css: string): FeatureSignal {
  if (!css) {
    return { ...EMPTY_SIGNAL }
  }

  const hasModernColorFunction = MODERN_COLOR_RE.test(css)
  // 现代颜色函数语法同时需要 preset-env 的 color-functional-notation 特性处理，
  // 因此 hasModernColorFunction 为 true 时 hasPresetEnvFeatures 也必须为 true
  const hasPresetEnvFeatures = hasModernColorFunction
    || PRESET_ENV_KEYWORDS.some(keyword => css.includes(keyword))
    || NESTING_RE.test(css)
    || UNIVERSAL_SELECTOR_RE.test(css)
    || HEX_ALPHA_RE.test(css)

  return {
    hasModernColorFunction,
    hasPresetEnvFeatures,
  }
}

/**
 * 将 FeatureSignal 序列化为缓存键片段
 *
 * @param signal - 特征信号对象
 * @returns 缓存键字符串
 */
export function signalToCacheKey(signal: FeatureSignal): string {
  return `signal:${signal.hasPresetEnvFeatures ? 1 : 0},${signal.hasModernColorFunction ? 1 : 0}`
}
