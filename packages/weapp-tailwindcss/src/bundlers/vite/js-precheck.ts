import type { CreateJsHandlerOptions } from '@/types'

const FAST_JS_TRANSFORM_HINT_RE = /className\b|class\s*=|classList\.|\b(?:twMerge|clsx|classnames|cn|cva)\b|\[["'`]class["'`]\]|text-\[|bg-\[|\b(?:[whpm]|px|py|mx|my|rounded|flex|grid|gap)-/
const DEPENDENCY_HINT_RE = /\bimport\s*[("'`{*]|\brequire\s*\(|\bexport\s+\*\s+from\s+["'`]|\bexport\s*\{[^}]*\}\s*from\s+["'`]/

export function shouldSkipViteJsTransform(rawSource: string, options?: CreateJsHandlerOptions) {
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
