import type { ParseError, ParseResult, ParserOptions } from '@babel/parser'
import type { NodePath, TraverseOptions } from '@babel/traverse'
import type { CallExpression, ExportDeclaration, File, ImportDeclaration, Node, StringLiteral, TemplateElement } from '@babel/types'
import type { IJsHandlerOptions, JsHandlerResult } from '../types'
import type { JsToken } from './types'
import { jsStringEscape } from '@ast-core/escape'
import { LRUCache } from 'lru-cache'
import MagicString from 'magic-string'
import { parse, traverse } from '@/babel'
import { regExpTest } from '@/utils'
import { replaceHandleValue } from './handlers'
import { JsTokenUpdater } from './JsTokenUpdater'
import { NodePathWalker } from './NodePathWalker'

/**
 * Describes the data collected during AST traversal that is required for the
 * subsequent source transformation phase.
 */
interface SourceAnalysis {
  ast: ParseResult<File>
  walker: NodePathWalker
  jsTokenUpdater: JsTokenUpdater
  targetPaths: NodePath<StringLiteral | TemplateElement>[]
  importDeclarations: Set<NodePath<ImportDeclaration>>
  exportDeclarations: Set<NodePath<ExportDeclaration>>
  ignoredPaths: WeakSet<NodePath<StringLiteral | TemplateElement>>
}

export const parseCache: LRUCache<string, ParseResult<File>> = new LRUCache<string, ParseResult<File>>(
  {
    max: 512,
  },
)

export function genCacheKey(source: string, options: any): string {
  return (
    source
    + JSON.stringify(options, (_, val) =>
      typeof val === 'function' ? val.toString() : val)
  )
}

export function babelParse(
  code: string,
  { cache, ...options }: ParserOptions & { cache?: boolean } = {},
) {
  const cacheKey = genCacheKey(code, options)
  let result: ParseResult<File> | undefined
  if (cache) {
    result = parseCache.get(cacheKey)
  }

  if (!result) {
    result = parse(code, options)
    if (cache) {
      parseCache.set(cacheKey, result)
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

/**
 * Normalises replacement metadata for literals discovered inside `eval` calls.
 */
function createEvalReplacementToken(
  path: NodePath<StringLiteral | TemplateElement>,
  updated: string,
): JsToken | undefined {
  const node = path.node

  let offset = 0
  let original: string
  if (path.isStringLiteral()) {
    offset = 1
    original = path.node.value
  }
  else if (path.isTemplateElement()) {
    original = path.node.value.raw
  }
  else {
    original = ''
  }

  if (typeof node.start !== 'number' || typeof node.end !== 'number') {
    return undefined
  }

  const start = node.start + offset
  const end = node.end - offset
  if (start >= end) {
    return undefined
  }

  if (original === updated) {
    return undefined
  }

  const value = path.isStringLiteral() ? jsStringEscape(updated) : updated

  return {
    start,
    end,
    value,
    path,
  }
}

function handleEvalStringLiteral(path: NodePath<StringLiteral>, options: IJsHandlerOptions, updater: JsTokenUpdater) {
  const { code } = jsHandler(path.node.value, {
    ...options,
    needEscaped: false,
    generateMap: false,
  })

  if (!code) {
    return
  }

  const token = createEvalReplacementToken(path, code)
  if (token) {
    updater.addToken(token)
  }
}

function handleEvalTemplateElement(path: NodePath<TemplateElement>, options: IJsHandlerOptions, updater: JsTokenUpdater) {
  const { code } = jsHandler(path.node.value.raw, {
    ...options,
    generateMap: false,
  })

  if (!code) {
    return
  }

  const token = createEvalReplacementToken(path, code)
  if (token) {
    updater.addToken(token)
  }
}

/**
 * Recursively analyse string-like nodes that sit inside `eval` calls so that we
 * can rewrite them while keeping their offsets intact.
 */
function walkEvalExpression(path: NodePath<CallExpression>, options: IJsHandlerOptions, updater: JsTokenUpdater) {
  path.traverse({
    StringLiteral(innerPath) {
      handleEvalStringLiteral(innerPath, options, updater)
    },
    TemplateElement(innerPath) {
      handleEvalTemplateElement(innerPath, options, updater)
    },
  })
}

export function analyzeSource(ast: ParseResult<File>, options: IJsHandlerOptions): SourceAnalysis {
  const jsTokenUpdater = new JsTokenUpdater()
  const ignoredPaths = new WeakSet<NodePath<StringLiteral | TemplateElement>>()
  const walker = new NodePathWalker(
    {
      ignoreCallExpressionIdentifiers: options.ignoreCallExpressionIdentifiers,
      callback(path) {
        if (path.isStringLiteral() || path.isTemplateElement()) {
          ignoredPaths.add(path)
        }
      },
    },
  )

  const targetPaths: NodePath<StringLiteral | TemplateElement>[] = []
  const importDeclarations = new Set<NodePath<ImportDeclaration>>()
  const exportDeclarations = new Set<NodePath<ExportDeclaration>>()

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
          walkEvalExpression(p, options, jsTokenUpdater)
          return
        }

        walker.walkCallExpression(p)
      },
    },
    ImportDeclaration: {
      enter(p) {
        importDeclarations.add(p)
      },
    },
    ExportDeclaration: {
      enter(p) {
        exportDeclarations.add(p)
      },
    },
  }

  traverse(ast, traverseOptions)

  return {
    walker,
    jsTokenUpdater,
    ast,
    targetPaths,
    importDeclarations,
    exportDeclarations,
    ignoredPaths,
  }
}

export function processUpdatedSource(
  rawSource: string,
  options: IJsHandlerOptions,
  analysis: SourceAnalysis,
) {
  const ms = new MagicString(rawSource)
  const { targetPaths, jsTokenUpdater, ignoredPaths } = analysis

  // Build replacement tokens for every string-like node collected earlier.
  const replacementTokens: JsToken[] = []
  for (const path of targetPaths) {
    if (ignoredPaths.has(path)) {
      continue
    }

    const token = replaceHandleValue(
      path,
      {
        ...options,
        needEscaped: path.isStringLiteral() ? options.needEscaped ?? true : false,
      },
    )

    if (token) {
      replacementTokens.push(token)
    }
  }

  jsTokenUpdater
    .push(...replacementTokens)
    .filter(token => !ignoredPaths.has(token.path))
    .updateMagicString(ms)
  return ms
}

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
  const analysis = analyzeSource(ast, options)
  const ms = processUpdatedSource(rawSource, options, analysis)

  return {
    code: ms.toString(),
    get map() {
      return ms.generateMap()
    },
  }
}
