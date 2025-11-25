// 参考链接：https://github.com/tailwindlabs/tailwindcss/blob/master/src/lib/regex.js
// eslint-disable-next-line regexp/no-obscure-range
export const validateFilterRE = /[\w\u00A0-\uFFFF%-?]/

export function isValidSelector(selector = ''): selector is string {
  return validateFilterRE.test(selector)
}

// 可选实现：export const splitCode = (code: string) => [...new Set(code.split(/\\?[\s'"`;={}]+/g))].filter(isValidSelector)

export function splitCode(code: string, allowDoubleQuotes = false) {
  // 把压缩产物中的转义空白字符(\n \r \t)先还原成空格，避免被粘连到类名上
  const normalized = code.includes('\\') ? code.replace(/\\[nrt]/g, ' ') : code

  // 参数 onlyWhiteSpace?: boolean
  // const regex = onlyWhiteSpace ? /[\s]+/ : /"|[\s]+/
  // 默认使用 /\s+/
  // 用于处理 Vue 的静态节点
  // 示例：|class="
  const splitter = allowDoubleQuotes ? /\s+/ : /\s+|"/
  return normalized.split(splitter).filter(element => isValidSelector(element))
}
