import type { NodePath } from '@babel/traverse'
import type { StringLiteral, TemplateElement } from '@babel/types'
import type { IJsHandlerOptions } from '../types'
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String
import type { JsToken } from './types'
import { jsStringEscape } from '@ast-core/escape'
import { escapeStringRegexp } from '@weapp-core/regex'
import { splitCode } from '@weapp-tailwindcss/shared/extractors'
import { decodeUnicode2 } from '../utils/decode'
import { replaceWxml } from '../wxml/shared'

export function replaceHandleValue(
  path: NodePath<StringLiteral | TemplateElement>,
  options: IJsHandlerOptions,
): JsToken | undefined {
  const {
    classNameSet,
    escapeMap,
    mangleContext: ctx,
    needEscaped = false,
    jsPreserveClass,
    arbitraryValues,
    alwaysEscape,
    unescapeUnicode,
  } = options

  const allowDoubleQuotes = arbitraryValues?.allowDoubleQuotes
  const offset = path.isStringLiteral() ? 1 : 0
  const str = path.isStringLiteral() ? path.node.value : path.isTemplateElement() ? path.node.value.raw : ''
  let rawStr = str
  let needUpdate = false
  if (unescapeUnicode && rawStr.includes('\\u')) {
    rawStr = decodeUnicode2(rawStr)
  }
  const node = path.node
  const arr = splitCode(rawStr, allowDoubleQuotes)
  for (const v of arr) {
    if (alwaysEscape || (classNameSet && classNameSet.has(v) && !jsPreserveClass?.(v))) {
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
      const value = needEscaped ? jsStringEscape(rawStr) : rawStr

      return {
        start,
        end,
        value,
        path,
      }
    }
  }
}
