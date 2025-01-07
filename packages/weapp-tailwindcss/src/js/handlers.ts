import type MagicString from 'magic-string'
import type { IJsHandlerOptions } from '../types'
import { jsStringEscape } from '@ast-core/escape'
import { escapeStringRegexp } from '@weapp-core/regex'
import { splitCode } from '../extractors/split'
import { decodeUnicode2 } from '../utils/decode'
import { replaceWxml } from '../wxml/shared'
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String

export interface ReplaceNode {
  leadingComments?: { value: string }[] | null | undefined
  start?: number | null
  end?: number | null
}

export function toUnicodeEscapedString(str: string) {
  return str
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0)
      // String.fromCharCode(31)
      if (code <= 31) {
        const hexCode = code.toString(16).padStart(4, '0')
        return `\\u${hexCode}`
      }
      return char
    })
    .join('')
}

// export function toUnicodeEscapedString2(str: string) {
//   return escape(str).replace(/%u/g, '\\u').replace(/%/g, '\\u00')
// }

export function replaceHandleValue(
  str: string,
  node: ReplaceNode,
  options: IJsHandlerOptions,
  ms: MagicString,
  offset = 0,
) {
  const {
    classNameSet: set,
    escapeMap,
    mangleContext: ctx,
    needEscaped = false,
    jsPreserveClass,
    arbitraryValues,
    always,
    unescapeUnicode,
  } = options

  const allowDoubleQuotes = arbitraryValues?.allowDoubleQuotes

  let rawStr = str
  let needUpdate = false
  if (unescapeUnicode && rawStr.includes('\\u')) {
    rawStr = decodeUnicode2(rawStr)
  }
  const arr = splitCode(rawStr, allowDoubleQuotes)
  for (const v of arr) {
    if (always || (set && set.has(v) && !jsPreserveClass?.(v))) {
      let ignoreFlag = false
      if (Array.isArray(node.leadingComments)) {
        ignoreFlag
          = node.leadingComments.findIndex(x => x.value.includes('weapp-tw') && x.value.includes('ignore')) > -1
      }

      if (!ignoreFlag) {
        if (ctx) {
          rawStr = ctx.jsHandler(rawStr)
        }

        rawStr = rawStr.replace(
          new RegExp(escapeStringRegexp(v)),
          replaceWxml(v, {
            escapeMap,
          }),
        )
        needUpdate = true
      }
    }
  }

  if (needUpdate && typeof node.start === 'number' && typeof node.end === 'number') {
    const start = node.start + offset
    const end = node.end - offset

    if (start < end && str !== rawStr) {
      const content = needEscaped ? jsStringEscape(rawStr) : rawStr
      ms.update(start, end, content)
    }
  }

  return rawStr
}
