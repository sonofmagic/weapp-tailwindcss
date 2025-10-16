import type { NodePath } from '@babel/traverse'
import type { CallExpression } from '@babel/types'
import * as parser from '@babel/parser'
import { MappingChars2String } from '@weapp-core/escape'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { parse, traverse } from '@/babel'
import * as babel from '@/js/babel'

describe('babel helpers additional coverage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    babel.parseCache.clear()
  })

  it('memoises parsed ASTs when parser caching is enabled', () => {
    const code = 'const value = 1'
    const spy = vi.spyOn(parser, 'parse')
    const parserOptions = { sourceType: 'module' as const, cache: true }
    const first = babel.babelParse(code, parserOptions)
    const second = babel.babelParse(code, parserOptions)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(second).toBe(first)
  })

  it('detects eval call expressions', () => {
    const ast = parse('eval("a"); other("b")', { sourceType: 'module' as const })
    const calls: NodePath<CallExpression>[] = []

    traverse(ast, {
      CallExpression(path) {
        calls.push(path)
      },
    })

    expect(calls).toHaveLength(2)
    expect(babel.isEvalPath(calls[0])).toBe(true)
    expect(babel.isEvalPath(calls[1])).toBe(false)
  })

  it('filters ignored paths when updating the source', () => {
    const code = 'cn("w-[100px]")'
    const options = {
      classNameSet: new Set(['w-[100px]']),
      escapeMap: MappingChars2String,
      ignoreCallExpressionIdentifiers: ['cn'],
      alwaysEscape: true,
    }
    const ast = parse(code, { sourceType: 'module' as const })
    const analysis = babel.analyzeSource(ast, options)
    const [firstTarget] = analysis.targetPaths

    expect(firstTarget).toBeDefined()
    expect(analysis.ignoredPaths.has(firstTarget)).toBe(true)

    analysis.jsTokenUpdater.addToken({
      start: firstTarget.node.start!,
      end: firstTarget.node.end!,
      value: 'should-remove',
      path: firstTarget,
    } as any)

    const ms = babel.processUpdatedSource(code, options, analysis)
    expect(ms.toString()).toBe(code)
  })

  it('returns the original source when parsing fails', () => {
    const raw = 'const = 1'
    const result = babel.jsHandler(raw, {})

    expect(result.code).toBe(raw)
    expect(result.error).toBeTruthy()
  })

  it('collects import/export declarations and exposes lazy source maps', () => {
    const code = `
      import foo from './foo'
      export { foo }
      export default foo
      export * from './utils'
      const cls = "w-[100px]"
    `
    const ast = parse(code, { sourceType: 'module' as const })
    const options = {
      classNameSet: new Set(['w-[100px]']),
      escapeMap: MappingChars2String,
      alwaysEscape: true,
      babelParserOptions: {
        sourceType: 'module' as const,
      },
    }

    const analysis = babel.analyzeSource(ast, options)
    expect(analysis.importDeclarations.size).toBe(1)
    expect(analysis.exportDeclarations.size).toBe(3)

    const handled = babel.jsHandler(code, {
      ...options,
      generateMap: true,
    })

    expect(handled.code).toContain('const cls')
    expect(handled.error).toBeUndefined()
    expect(handled.map).toBeDefined()
  })
})
