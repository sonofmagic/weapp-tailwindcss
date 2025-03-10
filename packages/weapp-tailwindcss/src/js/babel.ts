import type { ParseError, ParseResult, ParserOptions } from '@babel/parser'
import type { NodePath, TraverseOptions } from '@babel/traverse'
import type { File, Node, StringLiteral, TemplateElement } from '@babel/types'
import type { IJsHandlerOptions, JsHandlerResult } from '../types'
import type { JsToken } from './types'
import { parse, traverse } from '@/babel'
import { regExpTest } from '@/utils'
import { jsStringEscape } from '@ast-core/escape'
import { LRUCache } from 'lru-cache'
import MagicString from 'magic-string'
import { replaceHandleValue } from './handlers'
import { JsTokenUpdater } from './JsTokenUpdater'
import { NodePathWalker } from './NodePathWalker'

export const parseCache: LRUCache<string, ParseResult<File>> = new LRUCache<string, ParseResult<File>>(
  {
    max: 512,
  },
)

export function babelParse(
  code: string,
  { cache, ...options }: ParserOptions & { cache?: boolean } = {},
) {
  let result: ParseResult<File> | undefined
  if (cache) {
    result = parseCache.get(code)
  }

  if (!result) {
    result = parse(code, options)
    if (cache) {
      parseCache.set(code, result)
    }
  }

  return result
}
export function isEvalPath(p: NodePath<Node>) {
  if (p.isCallExpression()) {
    const calleePath = p.get('callee')
    return calleePath.isIdentifier(
      {
        name: 'eval',
      },
    )
  }
  return false
}

const ignoreFlagMap = new WeakMap()

export function jsHandler(rawSource: string, options: IJsHandlerOptions): JsHandlerResult {
  let ast: ParseResult<File>
  try {
    ast = babelParse(rawSource, options.babelParserOptions)
  }
  catch (error) {
    return {
      code: rawSource,
      error: error as ParseError,
    } as JsHandlerResult
  }
  const ms = new MagicString(rawSource)
  const jsTokenUpdater = new JsTokenUpdater()
  const walker = new NodePathWalker(
    {
      ignoreCallExpressionIdentifiers: options.ignoreCallExpressionIdentifiers,
      callback(path) {
        ignoreFlagMap.set(path, true)
      },
    },
  )

  const targetPaths: NodePath<StringLiteral | TemplateElement>[] = []
  const traverseOptions: TraverseOptions<Node> = {
    StringLiteral: {
      enter(p) {
        if (isEvalPath(p.parentPath)) {
          return
        }
        targetPaths.push(p)
      },
    },
    TemplateElement: {
      enter(p) {
        const pp = p.parentPath
        if (pp.isTemplateLiteral()) {
          const ppp = pp.parentPath
          if (isEvalPath(ppp)) {
            return
          }
          if (ppp.isTaggedTemplateExpression()) {
            const tagPath = ppp.get('tag')
            if (
              (tagPath.isIdentifier()
                && regExpTest(options.ignoreTaggedTemplateExpressionIdentifiers ?? [], tagPath.node.name, { exact: true })
              )
            ) {
              return
            }
          }
        }
        targetPaths.push(p)
      },
    },
    CallExpression: {
      enter(p) {
        if (isEvalPath(p)) {
          p.traverse({
            StringLiteral: {
              enter(path) {
                // ___CSS_LOADER_EXPORT___
                const { code } = jsHandler(path.node.value, {
                  ...options,
                  needEscaped: false,
                  generateMap: false,
                })
                if (code) {
                  const node = path.node
                  if (typeof node.start === 'number' && typeof node.end === 'number') {
                    const start = node.start + 1
                    const end = node.end - 1
                    if (start < end && path.node.value !== code) {
                      jsTokenUpdater.addToken(
                        {
                          start,
                          end,
                          value: jsStringEscape(code),
                          path,
                        },
                      )
                    }
                  }
                }
              },
            },
            TemplateElement: {
              enter(path) {
                const { code } = jsHandler(path.node.value.raw, {
                  ...options,
                  generateMap: false,
                })
                if (code) {
                  const node = path.node
                  if (typeof node.start === 'number' && typeof node.end === 'number') {
                    const start = node.start
                    const end = node.end
                    if (start < end && path.node.value.raw !== code) {
                      jsTokenUpdater.addToken(
                        {
                          start,
                          end,
                          value: code,
                          path,
                        },
                      )
                    }
                  }
                }
              },
            },
          })
          return
        }

        walker.walkCallExpression(p)
      },
    },
  }

  traverse(ast, traverseOptions)

  const tokens = targetPaths.map(
    (p) => {
      if (p.isStringLiteral()) {
        return replaceHandleValue(
          p,
          {
            ...options,
            needEscaped: options.needEscaped ?? true,
          },
        )
      }
      else if (p.isTemplateElement()) {
        return replaceHandleValue(
          p,
          {
            ...options,
            needEscaped: false,
          },
        )
      }
      return undefined
    },
  ).filter(Boolean) as JsToken[]

  jsTokenUpdater.push(
    ...tokens,
  ).filter(
    (x) => {
      return !ignoreFlagMap.get(x.path)
    },
  ).updateMagicString(ms)

  return {
    code: ms.toString(),
    get map() {
      return ms.generateMap()
    },
  }
}
