// 通用工具：处理选择器转义与 :is 伪类组合
import type { InternalCssSelectorReplacerOptions } from './types'
import { escape, MappingChars2String } from '@weapp-core/escape'
// css 中，要多加一个 '\' 来转义
// 用于原始 CSS 选择器的实现
// export function cssSelectorReplacer(selector: string, escapeEntries = MappingChars2StringEntries) {
//   return escape(selector, true, escapeEntries).replace(/\\2c /g, dic[','])
// }

const escapeOptionsCache = new WeakMap<Record<string, string>, { map: Record<string, string> }>()

function getEscapeOptions(escapeMap: Record<string, string>) {
  let cached = escapeOptionsCache.get(escapeMap)
  if (!cached) {
    cached = { map: escapeMap }
    escapeOptionsCache.set(escapeMap, cached)
  }
  return cached
}

// internalCssSelectorReplacer 对传入的选择器执行小程序兼容的字符转义
export function internalCssSelectorReplacer(
  selectors: string,
  options?: InternalCssSelectorReplacerOptions,
) {
  const escapeMap = options?.escapeMap
  if (escapeMap === undefined || escapeMap === MappingChars2String) {
    return escape(selectors)
  }

  return escape(selectors, getEscapeOptions(escapeMap))
}

// composeIsPseudo 将字符串数组包装成 :is(...)，保持选择器语义一致
export function composeIsPseudo(strs: string | string[]) {
  if (typeof strs === 'string') {
    return strs
  }
  if (strs.length > 1) {
    return `:is(${strs.join(',')})`
  }
  return strs.join('')
}
