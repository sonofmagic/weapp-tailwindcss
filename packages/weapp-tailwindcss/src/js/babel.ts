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

const EXPRESSION_WRAPPER_PREFIX = '(\n'
const EXPRESSION_WRAPPER_SUFFIX = '\n)'

export const parseCache: LRUCache<string, ParseResult<File>> = new LRUCache<string, ParseResult<File>>(
  {
    max: 1024,
  },
)

export function genCacheKey(source: string, options: any): string {
  // 允许调用方传入预先计算好的 cacheKey 字符串，避免重复 JSON.stringify
  if (typeof options === 'string') {
    return source + options
  }
  return source + JSON.stringify(options, (_, val) => (typeof val === 'function' ? val.toString() : val))
}

export function babelParse(
  code: string,
  // 接受可选的 cacheKey，避免每次都对 options 做 JSON.stringify。
  opts: (ParserOptions & { cache?: boolean, cacheKey?: string }) = {},
) {
  const { cache, cacheKey, ...rest } = opts as any
  const cacheKeyString = genCacheKey(code, cacheKey ?? rest)
  let result: ParseResult<File> | undefined
  if (cache) {
    result = parseCache.get(cacheKeyString)
  }

  if (!result) {
    // 传给 @babel/parser 前剔除自定义字段，避免产生意外行为。
    const { cache: _cache, cacheKey: _cacheKey, ...parseOptions } = opts as any
    result = parse(code, parseOptions)
    if (cache) {
      parseCache.set(cacheKeyString, result)
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

  // 仅在需要时才构建作用域信息（例如需要遍历调用表达式的实参）。
  const needScope = Boolean(options.ignoreCallExpressionIdentifiers && options.ignoreCallExpressionIdentifiers.length > 0)

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
          // 若 scope 不存在或无法判断绑定，默认认为未被局部绑定，以便在 noScope 下也能收集 require 字面量。
          && !((p as any)?.scope?.hasBinding?.('require'))
        ) {
          const args = p.get('arguments')
          if (Array.isArray(args) && args.length > 0) {
            const first = args[0]
            if (first?.isStringLiteral()) {
              requireCallPaths.push(first)
            }
          }
        }

        // 遍历调用表达式的实参需要作用域信息；快路径下跳过。
        if (needScope) {
          walker.walkCallExpression(p)
        }
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

  // 使用 `noScope` 避免在常见路径上构建昂贵的作用域数据。
  // 真正需要作用域（遍历调用实参）时，再在局部进行，保持整体遍历轻量。
  traverse(ast, { ...traverseOptions, noScope: !needScope } as any)

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
  const { targetPaths, jsTokenUpdater, ignoredPaths } = analysis

  // 为前面收集到的所有字符串节点生成替换 token。
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

  // 若没有任何待更新的 token，避免不必要的 MagicString 开销。
  if ((jsTokenUpdater.length + replacementTokens.length) === 0) {
    return new MagicString(rawSource)
  }

  const ms = new MagicString(rawSource)
  jsTokenUpdater.push(...replacementTokens).filter(token => !ignoredPaths.has(token.path)).updateMagicString(ms)
  return ms
}

export function jsHandler(rawSource: string, options: IJsHandlerOptions): JsHandlerResult {
  const shouldWrapExpression = Boolean(options.wrapExpression)
  const source = shouldWrapExpression
    ? `${EXPRESSION_WRAPPER_PREFIX}${rawSource}${EXPRESSION_WRAPPER_SUFFIX}`
    : rawSource
  let ast: ParseResult<File>
  try {
    ast = babelParse(source, options.babelParserOptions)
  }
  catch (error) {
    return {
      code: rawSource,
      error: error as ParseError,
    } as JsHandlerResult
  }
  const analysis = analyzeSource(ast, options, jsHandler)
  const ms = processUpdatedSource(source, options, analysis)
  if (shouldWrapExpression) {
    const start = 0
    const end = source.length
    const prefixLength = EXPRESSION_WRAPPER_PREFIX.length
    const suffixLength = EXPRESSION_WRAPPER_SUFFIX.length
    ms.remove(start, start + prefixLength)
    ms.remove(end - suffixLength, end)
  }

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
