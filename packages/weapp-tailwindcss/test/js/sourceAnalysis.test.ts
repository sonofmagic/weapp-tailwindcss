import type { NodePath } from '@babel/traverse'
import type { ImportDeclaration, StringLiteral } from '@babel/types'
import type { SourceAnalysis } from '@/js/babel'
import type { IJsHandlerOptions } from '@/types'
import MagicString from 'magic-string'
import { describe, expect, it } from 'vitest'
import { analyzeSource, babelParse } from '@/js/babel'
import { JsTokenUpdater } from '@/js/JsTokenUpdater'
import { collectModuleSpecifierReplacementTokens } from '@/js/sourceAnalysis'

describe('sourceAnalysis helpers', () => {
  it('collects module specifier replacement tokens across imports, exports and requires', () => {
    const source = `
      import foo from './foo'
      import keepSame from './same'
      import unused from './no-change'
      const lib = require('./foo')
      export * from './foo'
      export { foo as renamed }
    `

    const parserOptions = {
      sourceType: 'module' as const,
    }
    const ast = babelParse(source, parserOptions)
    const options: IJsHandlerOptions = {
      ignoreCallExpressionIdentifiers: [],
    }

    const analysis = analyzeSource(ast, options)

    for (const exportDecl of analysis.exportDeclarations) {
      analysis.walker.walkExportDeclaration(exportDecl)
    }

    const stubStringLiteral = {
      node: {
        value: './foo',
        start: undefined,
        end: undefined,
      },
      isStringLiteral: () => true,
    } as unknown as NodePath<StringLiteral>

    const collapsedStringLiteral = {
      node: {
        value: './foo',
        start: 0,
        end: 0,
      },
      isStringLiteral: () => true,
    } as unknown as NodePath<StringLiteral>

    const stubImportPath = {
      get(prop: string) {
        if (prop === 'source') {
          return stubStringLiteral
        }
        throw new Error(`Unsupported accessor ${prop}`)
      },
    } as unknown as NodePath<ImportDeclaration>

    analysis.importDeclarations.add(stubImportPath)
    analysis.requireCallPaths.push(collapsedStringLiteral)

    const tokens = collectModuleSpecifierReplacementTokens(analysis, {
      './foo': './foo?transformed',
      './same': './same',
    })

    expect(tokens).toHaveLength(3)

    const rewritten = new JsTokenUpdater({ value: tokens })
      .updateMagicString(new MagicString(source))
      .toString()

    expect(rewritten).toContain(`import foo from './foo?transformed'`)
    expect(rewritten).toContain(`const lib = require('./foo?transformed')`)
    expect(rewritten).toContain(`export * from './foo?transformed'`)

    const reExports = [...analysis.walker.imports].filter(token => token.type === 'ExportAllDeclaration')
    expect(reExports).toHaveLength(1)
    expect(reExports[0]!.source).toBe('./foo?transformed')
  })

  it('returns early when no replacement entries are provided', () => {
    const source = `import foo from './foo'`
    const ast = babelParse(source, { sourceType: 'module' as const })
    const analysis = analyzeSource(ast, {})
    const originalImports = analysis.walker.imports
    const originalImportCount = analysis.walker.imports.size

    const tokens = collectModuleSpecifierReplacementTokens(analysis, {})

    expect(tokens).toEqual([])
    expect(analysis.walker.imports).toBe(originalImports)
    expect(analysis.walker.imports.size).toBe(originalImportCount)
  })

  it('returns early when there are no module specifiers to rewrite', () => {
    const imports = {
      size: 0,
      [Symbol.iterator]() {
        throw new Error('should not iterate imports')
      },
    }

    const analysis = {
      ast: {} as SourceAnalysis['ast'],
      walker: {
        imports,
      } as unknown as SourceAnalysis['walker'],
      jsTokenUpdater: new JsTokenUpdater(),
      targetPaths: [],
      importDeclarations: new Set(),
      exportDeclarations: new Set(),
      requireCallPaths: [],
      ignoredPaths: new WeakSet(),
    } satisfies SourceAnalysis

    expect(collectModuleSpecifierReplacementTokens(analysis, { './foo': './bar' })).toEqual([])
  })
})
