import type { SgNode } from '@ast-grep/napi'
import type { ParseError, ParseResult } from '@babel/parser'
import type { NodePath, TraverseOptions } from '@babel/traverse'
import type { File, Node } from '@babel/types'
import type { CreateJsHandlerOptions, IJsHandlerOptions, JsHandlerResult } from '../types'
import MagicString from 'magic-string'
import { parse, traverse } from '../babel'
import { jsStringEscape } from '../escape'
import { defuOverrideArray } from '../utils'
import { replaceHandleValue } from './handlers'

function isEvalPath(p: NodePath<Node>) {
  if (p.isCallExpression()) {
    const calleePath = p.get('callee')
    return calleePath.isIdentifier() && calleePath.node.name === 'eval'
  }
  return false
}

// node.kind()
// node.children()
// node.range()
// function SgNodeTraverse(node: SgNode, cb: (node: SgNode) => void) {
//   cb(node)
//   for (const child of node.children()) {
//     SgNodeTraverse(child, cb)
//   }
// }

async function getAstGrep() {
  try {
    const { js } = await import('@ast-grep/napi')
    return js
  }
  catch (error) {
    console.warn('请先安装 `@ast-grep/napi` , 安装完成后再尝试运行！')
    throw error
  }
}

async function astGrepUpdateString(ast: SgNode, options: IJsHandlerOptions, ms: MagicString) {
  const js = await getAstGrep()
  const nodes = ast.findAll(js.kind('string'))

  for (const node of nodes) {
    const range = node.range()
    const text = node.text()

    replaceHandleValue(
      text.slice(1, -1),
      {
        end: range.end.index - 1,
        start: range.start.index + 1,
      },
      {
        ...options,
        unescapeUnicode: true,
      },
      ms,
      0,
    )
  }

  const templateNodes = ast.findAll(js.kind('template_string'))
  for (const node of templateNodes) {
    const fragments = node.findAll(js.kind('string_fragment'))
    for (const fragment of fragments) {
      const range = fragment.range()
      const text = fragment.text()
      replaceHandleValue(
        text,
        {
          end: range.end.index,
          start: range.start.index,
        },
        {
          ...options,
          unescapeUnicode: true,
        },
        ms,
        0,
      )
    }
  }
}

export function jsHandler(rawSource: string, options: IJsHandlerOptions): JsHandlerResult {
  const ms = new MagicString(rawSource)

  let ast: ParseResult<File>
  try {
    ast = parse(rawSource, options.babelParserOptions)
  }
  catch (error) {
    return {
      code: rawSource,
      error: error as ParseError,
    } as JsHandlerResult
  }

  const traverseOptions: TraverseOptions<Node> = {
    StringLiteral: {
      enter(p) {
        if (isEvalPath(p.parentPath)) {
          return
        }

        const n = p.node
        replaceHandleValue(
          n.value,
          n,
          {
            ...options,
            needEscaped: options.needEscaped ?? true,
          },
          ms,
          1,
        )
      },
      // exit(p) {}
    },
    TemplateElement: {
      enter(p) {
        if (p.parentPath.isTemplateLiteral() && isEvalPath(p.parentPath.parentPath)) {
          return
        }
        const n = p.node
        replaceHandleValue(
          n.value.raw,
          n,
          {
            ...options,
            needEscaped: false,
          },
          ms,
          0,
        )
      },
    },
    CallExpression: {
      enter(p) {
        if (isEvalPath(p)) {
          p.traverse({
            StringLiteral: {
              enter(s) {
                // ___CSS_LOADER_EXPORT___
                const res = jsHandler(s.node.value, {
                  ...options,
                  needEscaped: false,
                  generateMap: false,
                })
                if (res.code) {
                  const node = s.node
                  if (typeof node.start === 'number' && typeof node.end === 'number') {
                    const start = node.start + 1
                    const end = node.end - 1
                    if (start < end && s.node.value !== res.code) {
                      ms.update(start, end, jsStringEscape(res.code))
                      node.value = res.code
                    }
                  }
                }
              },
            },
            TemplateElement: {
              enter(s) {
                const res = jsHandler(s.node.value.raw, {
                  ...options,
                  generateMap: false,
                })
                if (res.code) {
                  const node = s.node
                  if (typeof node.start === 'number' && typeof node.end === 'number') {
                    const start = node.start
                    const end = node.end
                    if (start < end && s.node.value.raw !== res.code) {
                      ms.update(start, end, res.code)
                      s.node.value.raw = res.code
                    }
                  }
                }
              },
            },
          })
        }
      },
    },
  }

  traverse(ast, traverseOptions)

  return {
    code: ms.toString(),
    get map() {
      return ms.generateMap()
    },
  }
}

export async function jsHandlerAsync(rawSource: string, options: IJsHandlerOptions): Promise<JsHandlerResult> {
  const ms = new MagicString(rawSource)
  const js = await getAstGrep()
  let ast: SgNode
  try {
    const root = await js.parseAsync(rawSource)
    ast = root.root()
  }
  catch {
    return {
      code: rawSource,
    } as JsHandlerResult
  }
  await astGrepUpdateString(ast, options, ms)

  return {
    code: ms.toString(),
  }
}

export function createJsHandler(options: CreateJsHandlerOptions) {
  const { mangleContext, arbitraryValues, escapeMap, jsPreserveClass, generateMap, jsAstTool, babelParserOptions }
    = options

  function _jsHandler(rawSource: string, set: Set<string>, options?: CreateJsHandlerOptions) {
    const opts = defuOverrideArray<IJsHandlerOptions, IJsHandlerOptions[]>(options as IJsHandlerOptions, {
      classNameSet: set,
      escapeMap,
      arbitraryValues,
      mangleContext,
      jsPreserveClass,
      generateMap,
      jsAstTool,
      babelParserOptions,
    })
    if (opts.jsAstTool === 'ast-grep') {
      return jsHandlerAsync(rawSource, opts)
    }
    return jsHandler(rawSource, opts)
  }

  function sync(rawSource: string, set: Set<string>, options?: CreateJsHandlerOptions) {
    const opts = defuOverrideArray<IJsHandlerOptions, IJsHandlerOptions[]>(options as IJsHandlerOptions, {
      classNameSet: set,
      escapeMap,
      arbitraryValues,
      mangleContext,
      jsPreserveClass,
      generateMap,
      jsAstTool,
      babelParserOptions,
    })
    return jsHandler(rawSource, opts)
  }

  _jsHandler.sync = sync

  return _jsHandler
}
