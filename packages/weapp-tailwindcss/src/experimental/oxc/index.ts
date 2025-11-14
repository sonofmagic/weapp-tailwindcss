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
import MagicString from 'magic-string'
import { createNameMatcher, createToken, transformLiteralText } from '../shared'

interface Oxcast {
  [key: string]: any
}

const WRAP_PREFIX = '(\n'
const WRAP_SUFFIX = '\n)'

function tryRequire<T = any>(id: string): T | undefined {
  try {
    // eslint-disable-next-line ts/no-require-imports
    return require(id)
  }
  catch {
    return undefined
  }
}

function parseWithOxc(code: string): Oxcast {
  // Order: native > wasm > fallback
  const oxcNode = tryRequire<any>('@oxc-parser/node')
  if (oxcNode?.parseSync) {
    return oxcNode.parseSync(code, {
      sourceType: 'module',
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
      allowImportExportEverywhere: true,
      babelCompat: true,
      // collectComments: true, // if supported by the binding
    })
  }
  const oxcWasm = tryRequire<any>('@oxc-parser/wasm') ?? tryRequire<any>('oxc-parser')
  if (oxcWasm?.parseSync) {
    return oxcWasm.parseSync(code, {
      sourceType: 'module',
      babelCompat: true,
    })
  }
  throw new Error('No OXC parser binding found. Install @oxc-parser/node or @oxc-parser/wasm to use this POC.')
}

function getIdentifierName(node: any): string | undefined {
  if (!node || typeof node !== 'object') {
    return undefined
  }
  if (node.type === 'Identifier') {
    return node.name
  }
  if (typeof node.name === 'string') {
    return node.name
  }
  return undefined
}

function getSpan(node: any): { start: number, end: number } | undefined {
  const span = node?.span
  if (!span) {
    return undefined
  }
  const start = typeof span.start === 'number' ? span.start : undefined
  const end = typeof span.end === 'number' ? span.end : undefined
  if (typeof start === 'number' && typeof end === 'number') {
    return { start, end }
  }
  return undefined
}

function isStringLiteral(node: any): node is { type: string, value: string } {
  return node?.type === 'StringLiteral' && typeof node?.value === 'string'
}

function isTemplateLiteral(node: any): boolean {
  return node?.type === 'TemplateLiteral'
}

function getTemplateQuasis(node: any): any[] {
  if (Array.isArray(node?.quasis)) {
    return node.quasis
  }
  return []
}

function getTplElementRaw(elem: any): string | undefined {
  if (typeof elem?.value?.raw === 'string') {
    return elem.value.raw
  }
  if (typeof elem?.raw === 'string') {
    return elem.raw
  }
  return undefined
}

function isTaggedTemplate(node: any): boolean {
  return node?.type === 'TaggedTemplateExpression'
}
function getTaggedTemplateTag(node: any): any {
  return node?.tag
}
function isCallExpression(node: any): boolean {
  return node?.type === 'CallExpression'
}
function getCallCallee(node: any): any {
  return node?.callee
}
function getCallArguments(node: any): any[] {
  const args = node?.arguments
  if (Array.isArray(args)) {
    return args
  }
  return []
}
function isImportDeclaration(node: any): boolean {
  return node?.type === 'ImportDeclaration'
}
function isExportAllDeclaration(node: any): boolean {
  return node?.type === 'ExportAllDeclaration'
}
function getImportSourceLiteral(node: any): any | undefined {
  const src = node?.source
  if (src && typeof src === 'object') {
    return src
  }
  return undefined
}

function sliceStringLiteralText(code: string, node: any): { start: number, end: number, text: string } | undefined {
  const span = getSpan(node)
  if (!span) {
    return undefined
  }
  const start = span.start + 1
  const end = span.end - 1
  if (start >= end) {
    return undefined
  }
  const text = code.slice(start, end)
  return { start, end, text }
}
function sliceTplElementText(code: string, elem: any): { start: number, end: number, text: string } | undefined {
  const span = getSpan(elem)
  if (!span) {
    return undefined
  }
  const { start, end } = span
  if (start >= end) {
    return undefined
  }
  const text = code.slice(start, end)
  return { start, end, text }
}

function maybePushModuleSpecifierReplacement(
  tokens: ReturnType<typeof createToken>[],
  code: string,
  nodeWithSource: any,
  replacements: Record<string, string> | undefined,
) {
  if (!replacements) {
    return
  }
  const src = getImportSourceLiteral(nodeWithSource)
  if (!src || !isStringLiteral(src)) {
    return
  }
  const slice = sliceStringLiteralText(code, src)
  if (!slice) {
    return
  }
  const replacement = replacements[src.value]
  if (!replacement || replacement === src.value) {
    return
  }
  tokens.push(createToken(slice.start, slice.end, replacement))
}

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
