import replace from 'regexp-replace'

export const classRegexp = /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^"]+)['"]/gim

export const tagRegexp = /<[a-z][-a-z]*[a-z]* *([a-z][-a-z]*[a-z]*(?: *= *"(.*?)")?)* *\/? *>/gim

// /[\r\n\s]*<(?:\/)?([^ =>]+)([^>]*?)(?:\/)?>/gim

// export const noClosedTagRegexp = /[\r\n\s]*<([^ =>]+)([^>]*?)(?:\/)?>/gim

export function classStringReplace (str: string, replacement: (string: string, arr?: RegExpExecArray, index?: number, lastIndex?: number) => string) {
  return replace(str, classRegexp, replacement)
}

export function tagStringRegexp (str: string, replacement: (string: string, arr?: RegExpExecArray, index?: number, lastIndex?: number) => string) {
  return replace(str, tagRegexp, replacement)
}

export const variableRegExp = /{{([^{}]*)}}/g

export function variableMatch (original: string) {
  return variableRegExp.exec(original)
}
