export const classRegexp = /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^"]+)['"]/gs

export const tagRegexp = /<([a-z][-a-z]*[a-z]*)\s*(([a-z][-a-z]*[a-z]*)(?:\s*=\s*"(.*?)")?)*\s*\/?\s*>/gs

export const tagWithClassRegexp = /<([a-z][-a-z]*[a-z]*)\s+[^>]*?(?:class="([^"]*)")[^>]*?\/?>/g

export const doubleQuoteRegexp = /"([^"]*)"/g

export const variableRegExp = /{{(.*?)}}/gs
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
