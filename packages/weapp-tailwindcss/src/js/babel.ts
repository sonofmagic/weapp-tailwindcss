import type { ParseError, ParseResult, ParserOptions } from '@babel/parser'
import type { NodePath, TraverseOptions } from '@babel/traverse'
import type { ExportDeclaration, File, ImportDeclaration, Node, StringLiteral, TemplateElement } from '@babel/types'
import type { IJsHandlerOptions, JsHandlerResult } from '../types'
import type { EvalHandler } from './evalTransforms'
import type { SourceAnalysis } from './sourceAnalysis'
import type { JsToken } from './types'
import { LRUCache } from 'lru-cache'
import MagicString from 'magic-string'
import { parse, traverse } from '@/babel'
import { createNameMatcher } from '@/utils/nameMatcher'
import { isEvalPath, walkEvalExpression } from './evalTransforms'
import { replaceHandleValue } from './handlers'
import { JsTokenUpdater } from './JsTokenUpdater'
import { JsModuleGraph } from './ModuleGraph'
import { NodePathWalker } from './NodePathWalker'
import { collectModuleSpecifierReplacementTokens } from './sourceAnalysis'
import { createTaggedTemplateIgnore } from './taggedTemplateIgnore'

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
  const taggedTemplateIgnore = createTaggedTemplateIgnore({
    matcher: isIgnoredTaggedTemplate,
    names: options.ignoreTaggedTemplateExpressionIdentifiers,
  })

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
            const tagPath = ppp.get('tag') as NodePath<Node>
            if (taggedTemplateIgnore.shouldIgnore(tagPath)) {
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

export { isEvalPath } from './evalTransforms'
export type { SourceAnalysis } from './sourceAnalysis'
