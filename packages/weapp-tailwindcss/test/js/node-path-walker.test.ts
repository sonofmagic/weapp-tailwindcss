import type { NodePath } from '@babel/traverse'
import type { ImportSpecifier, StringLiteral } from '@babel/types'
import { describe, expect, it } from 'vitest'
import { parse, traverse } from '@/babel'
import { NodePathWalker } from '@/js/NodePathWalker'

describe('NodePathWalker', () => {
  it('recursively walks bindings and collects import metadata', () => {
    const source = `
      import defaultCls, { cls as alias, type TypeOnly } from './mod'

      const literal = 'w-[100px]'
      const other = 'flex'
      const template = \`prefix-\${literal}\`
      const object = { alias: literal, nested: { value: literal } }
      const array = [literal, object.nested.value]
      const sum = literal + alias
      const guard = literal && alias
      const dataset = { value: literal }

      function run(input = literal) {
        const local = input || defaultCls
        return cn(
          literal,
          template,
          sum,
          guard,
          array,
          object,
          dataset.value,
          ['shadow', literal],
        )
      }

      run()
      other(literal)

      export const exported = literal
      export { alias as exportedAlias }
      export default defaultCls
      export * from './utils'
    `

    const ast = parse(source, {
      sourceType: 'module',
      plugins: ['typescript'] as any,
    })
    const visited: string[] = []
    const walker = new NodePathWalker({
      ignoreCallExpressionIdentifiers: ['cn'],
      callback(path) {
        if (path.isStringLiteral()) {
          visited.push(`S:${path.node.value}`)
        }
        else if (path.isTemplateElement()) {
          visited.push(`T:${path.node.value.raw}`)
        }
      },
    })

    let literalPath: NodePath<StringLiteral> | undefined
    let typeImportPath: NodePath<ImportSpecifier> | undefined

    traverse(ast, {
      CallExpression(path) {
        walker.walkCallExpression(path)
      },
      ExportDeclaration(path) {
        walker.walkExportDeclaration(path)
      },
      StringLiteral(path) {
        if (!literalPath && path.node.value === 'w-[100px]') {
          literalPath = path
        }
      },
      ImportSpecifier(path) {
        if (path.node.importKind === 'type') {
          typeImportPath = path
        }
      },
    })

    expect(visited.includes('S:w-[100px]')).toBe(true)
    expect(visited.some(item => item.startsWith('T:prefix-'))).toBe(true)

    expect(literalPath).toBeDefined()
    expect(typeImportPath).toBeDefined()

    const before = visited.length
    walker.walkNode(literalPath!)
    const afterFirst = visited.length
    walker.walkNode(literalPath!)
    expect(visited.length).toBe(afterFirst)
    expect(afterFirst).toBeGreaterThanOrEqual(before)

    walker.walkNode(typeImportPath!)

    const importTokens = Array.from(walker.imports)

    expect(importTokens.some(token => token.type === 'ImportDefaultSpecifier' && token.source === './mod')).toBe(true)
    expect(importTokens.some(token => token.type === 'ImportSpecifier' && token.imported === 'cls')).toBe(true)
    expect(importTokens.some(token => token.type === 'ExportAllDeclaration' && token.source === './utils')).toBe(true)
    expect(importTokens.some(token => token.type === 'ImportSpecifier' && token.specifier.node.importKind === 'type')).toBe(false)
  })

  it('falls back to a noop callback when none is provided', () => {
    const ast = parse('const demo = "noop"', { sourceType: 'module' })
    const walker = new NodePathWalker()
    let literalPath: NodePath<StringLiteral> | undefined

    traverse(ast, {
      StringLiteral(path) {
        literalPath = path
        path.stop()
      },
    })

    expect(literalPath).toBeDefined()
    expect(() => walker.walkStringLiteral(literalPath!)).not.toThrow()
  })
})
