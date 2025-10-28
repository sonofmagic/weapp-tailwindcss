import type { ParseError, ParseResult, ParserOptions } from '@babel/parser'
import type { NodePath, TraverseOptions } from '@babel/traverse'
import type { CallExpression, ExportDeclaration, File, ImportDeclaration, Node, StringLiteral, TemplateElement } from '@babel/types'
import type { IJsHandlerOptions, JsHandlerResult } from '../types'
import type { JsToken } from './types'
import { jsStringEscape } from '@ast-core/escape'
import { LRUCache } from 'lru-cache'
import MagicString from 'magic-string'
import { parse, traverse } from '@/babel'
import { createNameMatcher } from '@/utils/nameMatcher'
import { replaceHandleValue } from './handlers'
import { JsTokenUpdater } from './JsTokenUpdater'
import { JsModuleGraph } from './ModuleGraph'
import { NodePathWalker } from './NodePathWalker'

/**
 * Describes the data collected during AST traversal that is required for the
 * subsequent source transformation phase.
 */
export interface SourceAnalysis {
  ast: ParseResult<File>
  walker: NodePathWalker
  jsTokenUpdater: JsTokenUpdater
  targetPaths: NodePath<StringLiteral | TemplateElement>[]
  importDeclarations: Set<NodePath<ImportDeclaration>>
  exportDeclarations: Set<NodePath<ExportDeclaration>>
  requireCallPaths: NodePath<StringLiteral>[]
  ignoredPaths: WeakSet<NodePath<StringLiteral | TemplateElement>>
}

type EvalHandler = (source: string, opts: IJsHandlerOptions) => JsHandlerResult

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

function createModuleSpecifierReplacementToken(
  path: NodePath<StringLiteral>,
  replacement: string,
): JsToken | undefined {
  const node = path.node
  if (node.value === replacement) {
    return undefined
  }

  if (typeof node.start !== 'number' || typeof node.end !== 'number') {
    return undefined
  }

  const start = node.start + 1
  const end = node.end - 1
  if (start >= end) {
    return undefined
  }

  return {
    start,
    end,
    value: replacement,
    path,
  }
}

function collectModuleSpecifierReplacementTokens(
  analysis: SourceAnalysis,
  replacements: Record<string, string>,
) {
  const tokens: JsToken[] = []

  const applyReplacement = (path: NodePath<StringLiteral>) => {
    const replacement = replacements[path.node.value]
    if (!replacement) {
      return
    }
    const token = createModuleSpecifierReplacementToken(path, replacement)
    if (token) {
      tokens.push(token)
    }
  }

  for (const importPath of analysis.importDeclarations) {
    const source = importPath.get('source')
    if (source.isStringLiteral()) {
      applyReplacement(source)
    }
  }

  for (const exportPath of analysis.exportDeclarations) {
    if (exportPath.isExportNamedDeclaration() || exportPath.isExportAllDeclaration()) {
      const source = exportPath.get('source')
      if (source && !Array.isArray(source) && source.isStringLiteral()) {
        applyReplacement(source)
      }
    }
  }

  for (const literalPath of analysis.requireCallPaths) {
    applyReplacement(literalPath)
  }

  for (const token of analysis.walker.imports) {
    const replacement = replacements[token.source]
    if (replacement) {
      token.source = replacement
    }
  }

  return tokens
}

function handleEvalStringLiteral(
  path: NodePath<StringLiteral>,
  options: IJsHandlerOptions,
  updater: JsTokenUpdater,
  handler: EvalHandler,
) {
  const { code } = handler(path.node.value, {
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

function handleEvalTemplateElement(
  path: NodePath<TemplateElement>,
  options: IJsHandlerOptions,
  updater: JsTokenUpdater,
  handler: EvalHandler,
) {
  const { code } = handler(path.node.value.raw, {
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
function walkEvalExpression(
  path: NodePath<CallExpression>,
  options: IJsHandlerOptions,
  updater: JsTokenUpdater,
  handler: EvalHandler,
) {
  path.traverse({
    StringLiteral(innerPath) {
      handleEvalStringLiteral(innerPath, options, updater, handler)
    },
    TemplateElement(innerPath) {
      handleEvalTemplateElement(innerPath, options, updater, handler)
    },
  })
}

export function analyzeSource(
  ast: ParseResult<File>,
  options: IJsHandlerOptions,
  handler?: EvalHandler,
): SourceAnalysis {
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

  const isIgnoredTaggedTemplate = createNameMatcher(options.ignoreTaggedTemplateExpressionIdentifiers, { exact: true })

  const targetPaths: NodePath<StringLiteral | TemplateElement>[] = []
  const importDeclarations = new Set<NodePath<ImportDeclaration>>()
  const exportDeclarations = new Set<NodePath<ExportDeclaration>>()
  const requireCallPaths: NodePath<StringLiteral>[] = []
  // eslint-disable-next-line ts/no-use-before-define -- default handler references exported jsHandler defined later
  const evalHandler = handler ?? jsHandler

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
                && isIgnoredTaggedTemplate(tagPath.node.name)
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
          walkEvalExpression(p, options, jsTokenUpdater, evalHandler)
          return
        }

        const calleePath = p.get('callee')
        if (
          calleePath.isIdentifier({ name: 'require' })
          && !p.scope.hasBinding('require')
        ) {
          const args = p.get('arguments')
          if (Array.isArray(args) && args.length > 0) {
            const first = args[0]
            if (first?.isStringLiteral()) {
              requireCallPaths.push(first)
            }
          }
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
    requireCallPaths,
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

  if (options.moduleSpecifierReplacements) {
    replacementTokens.push(
      ...collectModuleSpecifierReplacementTokens(analysis, options.moduleSpecifierReplacements),
    )
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
  const analysis = analyzeSource(ast, options, jsHandler)
  const ms = processUpdatedSource(rawSource, options, analysis)

  const result: JsHandlerResult = {
    code: ms.toString(),
    get map() {
      return ms.generateMap()
    },
  }

  if (options.moduleGraph && options.filename) {
    const graph = new JsModuleGraph(
      {
        filename: options.filename,
        source: rawSource,
        analysis,
        handlerOptions: options,
      },
      options.moduleGraph,
    )

    const linked = graph.build()
    if (Object.keys(linked).length > 0) {
      result.linked = linked
    }
  }

  return result
}
