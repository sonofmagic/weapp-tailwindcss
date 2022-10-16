import type { ICustomRegexp, ItemOrItemArray } from '@/types'
import { isRegexp } from '@/shared'
// https://github.com/sindresorhus/escape-string-regexp
export function escapeStringRegexp (str: string) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string')
  }
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}

export const classRegexp = /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^"]+)['"]/gs

export const vueTemplateClassRegexp = /(?:(?:hover-)?class)=(?:["']\W+\s*(?:\w+)\()?["']([^"]+)['"]/gs

export const templateClassExactRegexp = /(?:(?<=^|\s)(?:hover-)?class)=(?:["']\W+\s*(?:\w+)\()?["']([^"]+)['"]/gs
// TODO: poor perf
export const tagRegexp = /<([a-z][-a-z]*[a-z]*)\s*(([a-z][-a-z]*[a-z]*)(?:\s*=\s*"(.*?)")?)*\s*\/?\s*>/gs

export const tagWithClassRegexp = /<([a-z][-a-z]*[a-z]*)\s+[^>]*?(?:class="([^"]*)")[^>]*?\/?>/g

export const tagWithEitherClassAndHoverClassRegexp = /<(?:[a-z][-a-z]*[a-z]*)\s+[^>]*?(?:(?:hover-)?class="(?:[^"]*)")[^>]*?\/?>/g

interface ICreateRegexpOptions {
  exact?: boolean
}

export function handleRegexp (reg: RegExp): string {
  return `(?:${reg.source})`
}

export function getSourceString (input: string | RegExp) {
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

export function makePattern (arr: ItemOrItemArray<string | RegExp>): string {
  let pattern: string = ''
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
export function createTempleteHandlerMatchRegexp (tag: string | RegExp, attrs: ItemOrItemArray<string | RegExp>, options: ICreateRegexpOptions = {}) {
  const { exact = true } = options
  const prefix = exact ? '(?<=^|\\s)' : ''
  const pattern = makePattern(attrs)
  const source = `<(${tag})\\s+[^>]*?(?:${prefix}(${pattern})="(?:[^"]*)")[^>]*?\\/?>`
  return new RegExp(source, 'g')
}

export function createTemplateClassRegexp (attrs: ItemOrItemArray<string | RegExp>, options: ICreateRegexpOptions = {}) {
  const { exact = true } = options
  const prefix = exact ? '(?<=^|\\s)' : ''
  const pattern = makePattern(attrs)
  const source = `(?:${prefix}${pattern})=(?:["']\\W+\\s*(?:\\w+)\\()?["']([^"]+)['"]`
  return new RegExp(source, 'gs')
}

export function makeCustomAttributes (entries: [string | RegExp, ItemOrItemArray<string | RegExp>][]): ICustomRegexp[] {
  return entries.map(([k, v]) => {
    return {
      tagRegexp: createTempleteHandlerMatchRegexp(k, v),
      attrRegexp: createTemplateClassRegexp(v),
      tag: getSourceString(k),
      attrs: v
    }
  })
}

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
