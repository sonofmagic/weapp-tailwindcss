import type { StringLiteral, TemplateElement } from '@babel/types'
import MagicString from 'magic-string'
import type { IJsHandlerOptions } from '@/types'
import { replaceWxml } from '@/wxml/shared'
import { escapeStringRegexp } from '@/reg'
import { splitCode } from '@/extractors/split'
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String
// const usualEscapeSequences = {
//   '0': '\0',
//   "'": "'",
//   '"': '"',
//   b: '\b',
//   f: '\f',
//   n: '\n',
//   r: '\r',
//   t: '\t',
//   v: '\v',
//   '\\': '\\'
// }
// const usualEscapeSequencesEntries = Object.entries(usualEscapeSequences)

// export function escapeMagicString(str: string) {
//   for (const [key, value] of usualEscapeSequencesEntries) {
//     str = str.replaceAll(value, '\\' + key)
//   }
//   return str
// }
// https://github.com/joliss/js-string-escape
// 用来加 \, 这是因为 babel 和 magic string 配合使用导致的结果
export function jsStringEscape(str: unknown) {
  return ('' + str).replaceAll(/[\n\r"'\\\u2028\u2029]/g, (character) => {
    // Escape all characters not included in SingleStringCharacters and
    // DoubleStringCharacters on
    // http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
    switch (character) {
      case '"':
      case "'":
      case '\\': {
        return '\\' + character
      }
      // Four possible LineTerminator characters need to be escaped:
      case '\n': {
        return '\\n'
      }
      case '\r': {
        return '\\r'
      }
      case '\u2028': {
        return '\\u2028'
      }
      case '\u2029': {
        return '\\u2029'
      }
      default: {
        return character
      }
    }
  })
}

export function regenerateHandleValue(str: string, node: StringLiteral | TemplateElement, options: IJsHandlerOptions) {
  const set = options.classNameSet
  const escapeMap = options.escapeMap
  const allowDoubleQuotes = options.arbitraryValues?.allowDoubleQuotes
  const ctx = options.mangleContext
  const jsPreserveClass = options.jsPreserveClass
  const arr = splitCode(str, allowDoubleQuotes) // .split(/\s/).filter((x) => x) // splitCode(n.value) // .split(/\s/).filter((x) => x)
  let rawStr = str
  for (const v of arr) {
    if (set.has(v) && !jsPreserveClass?.(v)) {
      let ignoreFlag = false
      if (Array.isArray(node.leadingComments)) {
        ignoreFlag = node.leadingComments.findIndex((x) => x.value.includes('weapp-tw') && x.value.includes('ignore')) > -1
      }

      if (!ignoreFlag) {
        if (ctx) {
          rawStr = ctx.jsHandler(rawStr)
        }

        rawStr = rawStr.replaceAll(
          new RegExp(escapeStringRegexp(v), 'g'),
          replaceWxml(v, {
            escapeMap
          })
        )
      }
    }
  }
  return rawStr
}

export function replaceHandleValue(str: string, node: StringLiteral | TemplateElement, options: IJsHandlerOptions, ms: MagicString, offset = 0, needEscaped = false) {
  const set = options.classNameSet
  const escapeMap = options.escapeMap
  const allowDoubleQuotes = options.arbitraryValues?.allowDoubleQuotes
  const ctx = options.mangleContext
  const jsPreserveClass = options.jsPreserveClass
  const arr = splitCode(str, allowDoubleQuotes) // .split(/\s/).filter((x) => x) // splitCode(n.value) // .split(/\s/).filter((x) => x)
  let rawStr = str
  for (const v of arr) {
    if (set.has(v) && !jsPreserveClass?.(v)) {
      let ignoreFlag = false
      if (Array.isArray(node.leadingComments)) {
        ignoreFlag = node.leadingComments.findIndex((x) => x.value.includes('weapp-tw') && x.value.includes('ignore')) > -1
      }

      if (!ignoreFlag) {
        if (ctx) {
          rawStr = ctx.jsHandler(rawStr)
        }

        rawStr = rawStr.replaceAll(
          new RegExp(escapeStringRegexp(v), 'g'),
          replaceWxml(v, {
            escapeMap
          })
        )
      }
    }
  }

  if (typeof node.start === 'number' && typeof node.end === 'number') {
    const start = node.start + offset
    const end = node.end - offset
    if (start < end) {
      ms.update(node.start + offset, node.end - offset, needEscaped ? jsStringEscape(rawStr) : rawStr) // escapeMagicString(rawStr))
    }
  }

  return rawStr
}
