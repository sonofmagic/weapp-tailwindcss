import type { IJsHandlerOptions } from '../types'
import process from 'node:process'

/** 用于检测源码中是否包含类名相关模式的正则表达式 */
const FAST_JS_TRANSFORM_HINT_RE = /className\b|class\s*=|classList\.|\b(?:twMerge|clsx|classnames|cn|cva)\b|\[["'`]class["'`]\]|text-\[|bg-\[|\b(?:[whpm]|px|py|mx|my|rounded|flex|grid|gap)-/

/** 用于检测源码中是否包含 import/export/require 语句的正则表达式 */
const DEPENDENCY_HINT_RE = /\bimport\s*(?:["'`{]|\*\s+as\b)|\brequire\s*\(|\bexport\s+\*\s+from\s+["'`]|\bexport\s*\{[^}]*\}\s*from\s+["'`]/

/**
 * 判断源码是否可能声明跨模块依赖。
 *
 * 该检查只作为性能预筛：返回 `true` 时必须保守走 AST 模块图分析；
 * 返回 `false` 时源码中没有可被当前模块图消费的静态 import/export/require 形态。
 */
export function hasDependencyHint(rawSource: string): boolean {
  return DEPENDENCY_HINT_RE.test(rawSource)
}

/**
 * 判断是否可以跳过 JS 转换。
 * 通过正则快速检测源码内容，避免不必要的 Babel AST 解析。
 *
 * @param rawSource - 原始 JS 源码字符串
 * @param options - 可选的 JS 处理器配置选项
 * @returns 如果可以跳过转换返回 `true`，否则返回 `false`
 */
export function shouldSkipJsTransform(rawSource: string, options?: IJsHandlerOptions): boolean {
  if (process.env['WEAPP_TW_DISABLE_JS_PRECHECK'] === '1') {
    return false
  }
  if (!rawSource) {
    return true
  }
  if (options?.alwaysEscape) {
    return false
  }
  if (options?.moduleSpecifierReplacements && Object.keys(options.moduleSpecifierReplacements).length > 0) {
    return false
  }
  if (options?.wrapExpression) {
    return false
  }
  if (hasDependencyHint(rawSource)) {
    return false
  }
  return !FAST_JS_TRANSFORM_HINT_RE.test(rawSource)
}
