import type { StringLiteral, TemplateElement } from '@babel/types'
import MagicString from 'magic-string'
import type { IJsHandlerOptions } from '@/types'
import { replaceWxml } from '@/wxml/shared'
import { escapeStringRegexp } from '@/reg'
import { splitCode } from '@/extractors/split'
import { jsStringEscape } from '@/escape'
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String

export function replaceHandleValue(str: string, node: StringLiteral | TemplateElement, options: IJsHandlerOptions, ms: MagicString, offset = 0, needEscaped = false) {
  const set = options.classNameSet
  const escapeMap = options.escapeMap
  const allowDoubleQuotes = options.arbitraryValues?.allowDoubleQuotes
  const ctx = options.mangleContext
  const jsPreserveClass = options.jsPreserveClass
  const arr = splitCode(str, allowDoubleQuotes)
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
