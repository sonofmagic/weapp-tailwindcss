import type { CreateJsHandlerOptions } from '../types'

/** 用于检测源码中是否包含类名相关模式的正则表达式 */
const FAST_JS_TRANSFORM_HINT_RE = /className\b|class\s*=|classList\.|\b(?:twMerge|clsx|classnames|cn|cva)\b|\[["'`]class["'`]\]|text-\[|bg-\[|\b(?:[whpm]|px|py|mx|my|rounded|flex|grid|gap)-/

/** 用于检测源码中是否包含 import/export/require 语句的正则表达式 */
const DEPENDENCY_HINT_RE = /\bimport\s*[("'`{*]|\brequire\s*\(|\bexport\s+\*\s+from\s+["'`]|\bexport\s*\{[^}]*\}\s*from\s+["'`]/

/**
 * 判断是否可以跳过 JS 转换。
 * 通过正则快速检测源码内容，避免不必要的 Babel AST 解析。
 *
 * @param rawSource - 原始 JS 源码字符串
 * @param options - 可选的 JS 处理器配置选项
 * @returns 如果可以跳过转换返回 `true`，否则返回 `false`
 */
export function shouldSkipJsTransform(rawSource: string, options?: CreateJsHandlerOptions): boolean {
  if (process.env.WEAPP_TW_DISABLE_JS_PRECHECK === '1') {
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
  if (DEPENDENCY_HINT_RE.test(rawSource)) {
    return false
  }
  return !FAST_JS_TRANSFORM_HINT_RE.test(rawSource)
}
