export const classRegexp = /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^"]+)['"]/gs

export const tagRegexp = /<([a-z][-a-z]*[a-z]*)\s*(([a-z][-a-z]*[a-z]*)(?:\s*=\s*"(.*?)")?)*\s*\/?\s*>/gs

export const tagWithClassRegexp = /<([a-z][-a-z]*[a-z]*)\s+[^>]*?(?:class="([^"]*)")[^>]*?\/?>/g

export const doubleQuoteRegexp = /"([^"]*)"/g

export const variableRegExp = /{{(.*?)}}/gs

// '-' 不能单独存在,必须前或者后包含一个字母(不能是 '-'本身)
// 相比来说 '_' 就宽泛多了，这就是选用 '_' 而不是 '-' 进行转义的原因
export const wxmlAllowClassCharsRegExp = /[a-zA-Z0-9_-]*/g

export function createWxmlAllowClassCharsRegExp () {
  return new RegExp(wxmlAllowClassCharsRegExp.source, 'g')
}
// /[\r\n\s]*<(?:\/)?([^ =>]+)([^>]*?)(?:\/)?>/gim

// export const noClosedTagRegexp = /[\r\n\s]*<([^ =>]+)([^>]*?)(?:\/)?>/gim

export function classStringReplace (str: string, replacement: (substring: string, ...args: any[]) => string) {
  return str.replace(classRegexp, replacement)
}

export function tagStringReplace (str: string, replacement: (substring: string, ...args: any[]) => string) {
  return str.replace(tagRegexp, replacement)
}

export function doubleQuoteStringReplace (str: string, replacement: (substring: string, ...args: any[]) => string) {
  return str.replace(doubleQuoteRegexp, replacement)
}

export function variableMatch (original: string) {
  return variableRegExp.exec(original)
}
