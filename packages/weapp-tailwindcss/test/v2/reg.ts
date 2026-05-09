/* eslint-disable regexp/no-super-linear-backtracking */
export const classRegexp = /(?:class|className)=(?:["']\W+\w+\()?["']([^"]+)["']/g
export const vueTemplateClassRegexp = /(?:hover-)?class=(?:["']\W+\w+\()?["']([^"]+)["']/g
// TODO: poor perf
export const tagRegexp = /<([a-z][a-z-]*)\s*(?:(([a-z][a-z-]*)(?:\s*=\s*"(.*?)")?)+\s*)?\/?\s*>/g
export const tagWithClassRegexp = /<([a-z][a-z-]*)\s[^>]*?class="([^"]*)"[^>]*?\/?>/g

export function classStringReplace(str: string, replacement: (substring: string, ...args: any[]) => string) {
  return str.replaceAll(classRegexp, replacement)
}
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
