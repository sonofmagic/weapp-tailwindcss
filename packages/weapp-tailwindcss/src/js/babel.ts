import type { ParseError, ParseResult } from '@babel/parser'
import type { NodePath, TraverseOptions } from '@babel/traverse'
import type { ExportDeclaration, File, ImportDeclaration, Node, StringLiteral, TemplateElement } from '@babel/types'
import type { IJsHandlerOptions, JsHandlerResult } from '../types'
import type { EvalHandler } from './evalTransforms'
import type { SourceAnalysis } from './sourceAnalysis'
import { traverse } from '@/babel'
import { createNameMatcher } from '@/utils/nameMatcher'
import { babelParse } from './babel/parse'
import { processUpdatedSource } from './babel/process'
import { isEvalPath, walkEvalExpression } from './evalTransforms'
import { JsTokenUpdater } from './JsTokenUpdater'
import { JsModuleGraph } from './ModuleGraph'
import { NodePathWalker } from './NodePathWalker'
import { createTaggedTemplateIgnore } from './taggedTemplateIgnore'

const EXPRESSION_WRAPPER_PREFIX = '(\n'
const EXPRESSION_WRAPPER_SUFFIX = '\n)'

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

export { babelParse, processUpdatedSource }
export { genCacheKey, parseCache } from './babel/parse'
export { isEvalPath } from './evalTransforms'
export type { SourceAnalysis } from './sourceAnalysis'
