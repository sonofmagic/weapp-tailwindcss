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

export const tagWithEitherClassAndHoverClassRegexp = /<[a-z][a-z-]*[a-z]*\s+[^>]*?(?:hover-)?class="[^"]*"[^>]*?\/?>/g

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
export function createTemplateHandlerMatchRegexp(tag: string | RegExp, attrs: ItemOrItemArray<string | RegExp>, options: ICreateRegexpOptions = {}) {
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
        tagRegexp: createTemplateHandlerMatchRegexp(k, v),
        attrRegexp: createTemplateClassRegexp(v),
        tag: getSourceString(k),
        attrs: v
      }
    })
  }
}

export const variableRegExp = /{{(.*?)}}/gs

export const wxsTagRegexp = /<wxs\s*(?:[a-z][a-z-]*[a-z]*(?:\s*=\s*".*?")?)*\s*>(.*?)<\/wxs>/gs
