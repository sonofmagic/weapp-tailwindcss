// import type { StringLiteral, TemplateElement, Comment } from '@babel/types'
import MagicString from 'magic-string'
import type { IJsHandlerOptions } from '@/types'
import { replaceWxml } from '@/wxml/shared'
import { escapeStringRegexp } from '@weapp-core/regex'
import { splitCode } from '@weapp-tailwindcss/shared/extractors'
import { jsStringEscape } from '@/escape'
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String

interface ReplaceNode {
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

function decodeUnicode(s: string) {
  return unescape(s.replaceAll(/\\(u[\dA-Fa-f]{4})/gm, '%$1'))
}

export function replaceHandleValue(str: string, node: ReplaceNode, options: IJsHandlerOptions, ms: MagicString, offset = 0) {
  const { classNameSet: set, escapeMap, needEscaped = false, jsPreserveClass, arbitraryValues, always, unescapeUnicode } = options

  const allowDoubleQuotes = arbitraryValues?.allowDoubleQuotes

  const arr = splitCode(str, allowDoubleQuotes)
  let rawStr = str
  let needDecodeUnicode = false
  if (unescapeUnicode && rawStr.includes('\\')) {
    rawStr = decodeUnicode(rawStr)
    needDecodeUnicode = true
  }
  for (let v of arr) {
    if (needDecodeUnicode && v.includes('\\')) {
      v = decodeUnicode(v)
    }
    if (always || (set && set.has(v) && !jsPreserveClass?.(v))) {
      let ignoreFlag = false
      if (Array.isArray(node.leadingComments)) {
        ignoreFlag = node.leadingComments.findIndex((x) => x.value.includes('weapp-tw') && x.value.includes('ignore')) > -1
      }

      if (!ignoreFlag) {
        rawStr = rawStr.replace(
          new RegExp(escapeStringRegexp(v)),
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

    if (start < end && str !== rawStr) {
      const content = needEscaped ? jsStringEscape(rawStr) : rawStr
      ms.update(start, end, content)
    }
  }

  return rawStr
}
