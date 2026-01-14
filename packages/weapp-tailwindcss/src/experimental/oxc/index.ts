/**
 * OXC-based JS handler POC.
 *
 * Similar to the SWC POC but using an OXC parser binding. We attempt to load
 * one of the known JS bindings. You must install one of:
 *   - @oxc-parser/node
 *   - @oxc-parser/wasm
 *   - oxc-parser
 *
 * Features: same subset as swcJsHandler.
 */
import type { IJsHandlerOptions, JsHandlerResult } from '../../types'
import type { Oxcast } from './ast-utils'
import MagicString from 'magic-string'
import { createNameMatcher, createToken, transformLiteralText } from '../shared'
import {
  getCallArguments,
  getCallCallee,
  getIdentifierName,
  getTaggedTemplateTag,
  getTemplateQuasis,
  getTplElementRaw,
  isCallExpression,
  isExportAllDeclaration,
  isImportDeclaration,
  isStringLiteral,
  isTaggedTemplate,
  isTemplateLiteral,

  parseWithOxc,
  sliceStringLiteralText,
  sliceTplElementText,
} from './ast-utils'
import { maybePushModuleSpecifierReplacement } from './module-specifiers'

const WRAP_PREFIX = '(\n'
const WRAP_SUFFIX = '\n)'

export function oxcJsHandler(rawSource: string, options: IJsHandlerOptions): JsHandlerResult {
  const shouldWrapExpression = Boolean(options.wrapExpression)
  const source = shouldWrapExpression ? `${WRAP_PREFIX}${rawSource}${WRAP_SUFFIX}` : rawSource

  let ast: Oxcast
  try {
    ast = parseWithOxc(source)
  }
  catch (error) {
    return { code: rawSource, error: error as any }
  }

  const tokens: ReturnType<typeof createToken>[] = []
  const isIgnoredTag = createNameMatcher(options.ignoreTaggedTemplateExpressionIdentifiers, true)

  interface Frame { node: any, skipTpl?: boolean }
  const stack: Frame[] = [{ node: ast, skipTpl: false }]

  while (stack.length) {
    const { node, skipTpl } = stack.pop() as Frame
    if (!node || typeof node !== 'object') {
      continue
    }

    if (isStringLiteral(node)) {
      const slice = sliceStringLiteralText(source, node)
      if (slice) {
        const updated = transformLiteralText(slice.text, options)
        if (updated !== undefined && updated !== slice.text) {
          const value = options.needEscaped ? JSON.stringify(updated).slice(1, -1) : updated
          tokens.push(createToken(slice.start, slice.end, value))
        }
      }
    }
    if (!skipTpl && isTemplateLiteral(node)) {
      const quasis = getTemplateQuasis(node)
      for (const q of quasis) {
        const slice = sliceTplElementText(source, q)
        if (!slice) {
          continue
        }
        const raw = getTplElementRaw(q) ?? slice.text
        const updated = transformLiteralText(raw, { ...options, needEscaped: false })
        if (updated !== undefined && updated !== raw) {
          tokens.push(createToken(slice.start, slice.end, updated))
        }
      }
    }

    if (isImportDeclaration(node) || isExportAllDeclaration(node)) {
      maybePushModuleSpecifierReplacement(tokens, source, node, options.moduleSpecifierReplacements)
    }

    if (isCallExpression(node)) {
      const callee = getCallCallee(node)
      const calleeName = getIdentifierName(callee)
      const args = getCallArguments(node)
      if (calleeName === 'eval') {
        for (const a of args) {
          if (isStringLiteral(a)) {
            const argSlice = sliceStringLiteralText(source, a)
            if (!argSlice) {
              continue
            }
            const { code } = oxcJsHandler(a.value, { ...options, needEscaped: false, generateMap: false })
            if (code && code !== a.value) {
              const value = JSON.stringify(code).slice(1, -1)
              tokens.push(createToken(argSlice.start, argSlice.end, value))
            }
          }
          else if (isTemplateLiteral(a)) {
            const quasis = getTemplateQuasis(a)
            for (const q of quasis) {
              const slice = sliceTplElementText(source, q)
              if (!slice) {
                continue
              }
              const raw = getTplElementRaw(q) ?? slice.text
              const { code } = oxcJsHandler(raw, { ...options, needEscaped: false, generateMap: false })
              if (code && code !== raw) {
                tokens.push(createToken(slice.start, slice.end, code))
              }
            }
          }
        }
      }
      else if (calleeName === 'require' && args.length > 0) {
        const a0 = args[0]
        if (isStringLiteral(a0)) {
          maybePushModuleSpecifierReplacement(tokens, source, { source: a0 }, options.moduleSpecifierReplacements)
        }
      }
    }

    if (isTaggedTemplate(node)) {
      const tag = getTaggedTemplateTag(node)
      const tagName = getIdentifierName(tag)
      const skip = tagName ? isIgnoredTag(tagName) : false
      const quasi = node.quasi
      if (quasi) {
        stack.push({ node: quasi, skipTpl: skip })
      }
      if (tag) {
        stack.push({ node: tag, skipTpl: false })
      }
      continue
    }

    for (const key of Object.keys(node)) {
      if (key === 'span') {
        continue
      }
      const child = (node as any)[key]
      if (!child) {
        continue
      }
      if (Array.isArray(child)) {
        for (let i = child.length - 1; i >= 0; i--) {
          const c = child[i]
          if (c && typeof c === 'object') {
            stack.push({ node: c, skipTpl })
          }
        }
      }
      else if (typeof child === 'object') {
        stack.push({ node: child, skipTpl })
      }
    }
  }

  if (tokens.length === 0) {
    return { code: rawSource }
  }

  const ms = new MagicString(source)
  for (const t of tokens) {
    ms.update(t.start, t.end, t.value)
  }
  if (shouldWrapExpression) {
    const start = 0
    const end = source.length
    ms.remove(start, start + WRAP_PREFIX.length)
    ms.remove(end - WRAP_SUFFIX.length, end)
  }
  const result: JsHandlerResult = { code: ms.toString() }
  if (options.generateMap) {
    Object.defineProperty(result, 'map', {
      enumerable: true,
      get() {
        return ms.generateMap()
      },
    })
  }
  return result
}
