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
  // postcss-preset-env 包含 autoprefixer，几乎所有 CSS 都可能需要它添加厂商前缀，
  // 因此 hasPresetEnvFeatures 始终为 true，仅通过 hasModernColorFunction 控制
  // color-functional-fallback 插件的裁剪。
  const hasPresetEnvFeatures = true

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
