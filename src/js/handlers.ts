import type { StringLiteral, TemplateElement } from '@babel/types'
import MagicString from 'magic-string'
import type { IJsHandlerOptions } from '@/types'
import { replaceWxml } from '@/wxml/shared'
import { escapeStringRegexp } from '@/reg'
import { splitCode } from '@/extractors/split'

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

export function replaceHandleValue(str: string, node: StringLiteral | TemplateElement, options: IJsHandlerOptions, ms: MagicString, offset = 1) {
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
      ms.update(node.start + offset, node.end - offset, rawStr)
    }
  }

  return rawStr
}
