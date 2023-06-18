import type { ICustomRegexp, ItemOrItemArray } from '@/types'
import { isRegexp } from '@/utils'
// https://github.com/sindresorhus/escape-string-regexp
export function escapeStringRegexp(str: string) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string')
  }
  return str.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&').replaceAll('-', '\\x2d')
}

export const templateClassExactRegexp = /(?<=^|\s)(?:hover-)?class=(?:["']\W+\s*\w+\()?["']([^"]+)["']/gs

export const tagWithEitherClassAndHoverClassRegexp = /<[a-z][a-z-]*[a-z]*\s+[^>]*?(?:hover-)?clas{2}="[^"]*"[^>]*?\/?>/g

interface ICreateRegexpOptions {
  exact?: boolean
}

export function handleRegexp(reg: RegExp): string {
  return `(?:${reg.source})`
}

export function getSourceString(input: string | RegExp) {
  let result
  if (typeof input === 'string') {
    result = input
  } else if (isRegexp(input)) {
    result = input.source
  } else {
    result = input.toString()
  }
  return result
}

export function makePattern(arr: ItemOrItemArray<string | RegExp>): string {
  let pattern = ''
  if (Array.isArray(arr)) {
    pattern = arr
      .reduce<string[]>((acc, cur) => {
        if (typeof cur === 'string') {
          acc.push(cur)
        } else if (isRegexp(cur)) {
          acc.push(handleRegexp(cur))
        }
        return acc
      }, [])
      .join('|')
  } else if (typeof arr === 'string') {
    pattern = arr
  } else if (isRegexp(arr)) {
    pattern = handleRegexp(arr)
  }

  return pattern
}

// try match tag
export function createTempleteHandlerMatchRegexp(tag: string | RegExp, attrs: ItemOrItemArray<string | RegExp>, options: ICreateRegexpOptions = {}) {
  const { exact = true } = options
  const prefix = exact ? '(?<=^|\\s)' : ''
  const pattern = makePattern(attrs)
  let tagPattern = getSourceString(tag)
  if (tagPattern === '*') {
    tagPattern = '[a-z][-a-z]*[a-z]*'
  }
  const source = `<(${tagPattern})\\s+[^>]*?(?:${prefix}(${pattern})="(?:[^"]*)")[^>]*?\\/?>`
  return new RegExp(source, 'g')
}

export function createTemplateClassRegexp(attrs: ItemOrItemArray<string | RegExp>, options: ICreateRegexpOptions = {}) {
  const { exact = true } = options
  const prefix = exact ? '(?<=^|\\s)' : ''
  const pattern = makePattern(attrs)
  const source = `(?:${prefix}${pattern})=(?:["']\\W+\\s*(?:\\w+)\\()?["']([^"]+)['"]`
  return new RegExp(source, 'gs')
}

export function makeCustomAttributes(entries?: [string | RegExp, ItemOrItemArray<string | RegExp>][]): ICustomRegexp[] | undefined {
  if (Array.isArray(entries)) {
    return entries.map(([k, v]) => {
      return {
        tagRegexp: createTempleteHandlerMatchRegexp(k, v),
        attrRegexp: createTemplateClassRegexp(v),
        tag: getSourceString(k),
        attrs: v
      }
    })
  }
}

export const variableRegExp = /{{(.*?)}}/gs

export function variableMatch(original: string) {
  return variableRegExp.exec(original)
}

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

export const wxsTagRegexp = /<wxs\s*(?:[a-z][a-z-]*[a-z]*(?:\s*=\s*".*?")?)*\s*>(.*?)<\/wxs>/gs
// /[\r\n\s]*<(?:\/)?([^ =>]+)([^>]*?)(?:\/)?>/gim

// export const noClosedTagRegexp = /[\r\n\s]*<([^ =>]+)([^>]*?)(?:\/)?>/gim
// #endregion

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
