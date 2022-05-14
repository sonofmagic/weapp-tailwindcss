import replace from 'regexp-replace'

export const classRegexp = /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^"]+)['"]/gims

export const tagRegexp = /<[a-z][-a-z]*[a-z]* *([a-z][-a-z]*[a-z]*(?: *= *"(.*?)")?)* *\/? *>/gims

// /[\r\n\s]*<(?:\/)?([^ =>]+)([^>]*?)(?:\/)?>/gim

// export const noClosedTagRegexp = /[\r\n\s]*<([^ =>]+)([^>]*?)(?:\/)?>/gim

export function classStringReplace (str: string, replacement: (string: string, arr: RegExpExecArray, index?: number, lastIndex?: number) => string) {
  return replace(str, classRegexp, replacement)
}

export function tagStringReplace (str: string, replacement: (string: string, arr: RegExpExecArray, index?: number, lastIndex?: number) => string) {
  return replace(str, tagRegexp, replacement)
}

export const doubleQuoteRegexp = /"(.*?)"/gms

export function doubleQuoteStringReplace (str: string, replacement: (string: string, arr: RegExpExecArray, index?: number, lastIndex?: number) => string) {
  return replace(str, doubleQuoteRegexp, replacement)
}

export const variableRegExp = /{{(.*?)}}/gms

export function variableMatch (original: string) {
  return variableRegExp.exec(original)
}
