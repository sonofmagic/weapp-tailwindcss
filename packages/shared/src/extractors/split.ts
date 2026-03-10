// 参考链接：https://github.com/tailwindlabs/tailwindcss/blob/master/src/lib/regex.js
// eslint-disable-next-line regexp/no-obscure-range
export const validateFilterRE = /[\w\u00A0-\uFFFF%-?]/

export function isValidSelector(selector = ''): selector is string {
  return validateFilterRE.test(selector)
}

// 可选实现：export const splitCode = (code: string) => [...new Set(code.split(/\\?[\s'"`;={}]+/g))].filter(isValidSelector)

/**
 * splitCode 结果缓存，避免对相同字符串重复分割和过滤。
 * 使用两个独立缓存分别对应 allowDoubleQuotes 的两种取值。
 */
const splitCacheDefault = new Map<string, string[]>()
const splitCacheAllowQuotes = new Map<string, string[]>()
const SPLIT_CACHE_LIMIT = 8192

/** 预编译的分割正则，避免每次调用都创建 */
const SPLITTER_DEFAULT = /\s+|"/
const SPLITTER_ALLOW_QUOTES = /\s+/

export function splitCode(code: string, allowDoubleQuotes = false) {
  const cache = allowDoubleQuotes ? splitCacheAllowQuotes : splitCacheDefault
  const cached = cache.get(code)
  if (cached) {
    return cached
  }

  // 把压缩产物中的转义空白字符(\n \r \t)先还原成空格，避免被粘连到类名上
  const normalized = code.includes('\\') ? code.replace(/\\[nrt]/g, ' ') : code

  const splitter = allowDoubleQuotes ? SPLITTER_ALLOW_QUOTES : SPLITTER_DEFAULT
  const result = normalized.split(splitter).filter(element => isValidSelector(element))

  // 防止缓存无限增长
  if (cache.size >= SPLIT_CACHE_LIMIT) {
    cache.clear()
  }
  cache.set(code, result)

  return result
}
