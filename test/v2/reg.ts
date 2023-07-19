// #region  deprecated
/** @deprecated */
export const classRegexp = /(?:class|className)=(?:["']\W+\s*\w+\()?["']([^"]+)["']/gs
/** @deprecated */
export const vueTemplateClassRegexp = /(?:hover-)?class=(?:["']\W+\s*\w+\()?["']([^"]+)["']/gs
// TODO: poor perf
/** @deprecated */
export const tagRegexp = /<([a-z][a-z-]*[a-z]*)\s*(([a-z][a-z-]*[a-z]*)(?:\s*=\s*"(.*?)")?)*\s*\/?\s*>/gs
/** @deprecated */
export const tagWithClassRegexp = /<([a-z][a-z-]*[a-z]*)\s+[^>]*?class="([^"]*)"[^>]*?\/?>/g

/** @deprecated */
export function classStringReplace(str: string, replacement: (substring: string, ...args: any[]) => string) {
  return str.replaceAll(classRegexp, replacement)
}
/** @deprecated */
export function tagStringReplace(str: string, replacement: (substring: string, ...args: any[]) => string) {
  return str.replaceAll(tagRegexp, replacement)
}

// #region  test
// '-' 不能单独存在,必须前或者后包含一个字母(不能是 '-'本身)
// 相比来说 '_' 就宽泛多了，这就是选用 '_' 而不是 '-' 进行转义的原因
export const wxmlAllowClassCharsRegExp = /[\w-]*/g

export function createWxmlAllowClassCharsRegExp() {
  return new RegExp(wxmlAllowClassCharsRegExp.source, 'g')
}

export const doubleQuoteRegexp = /"([^"]*)"/g

export function doubleQuoteStringReplace(str: string, replacement: (substring: string, ...args: any[]) => string) {
  return str.replaceAll(doubleQuoteRegexp, replacement)
}
// #endregion
