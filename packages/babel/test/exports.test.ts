import { describe, expect, it } from 'vitest'
import { parse, parseExpression, traverse } from '../src/index'

describe('Babel 8 exports', () => {
  it('parses and traverses a real module', () => {
    const ast = parse('const answer = 42', { sourceType: 'module' })
    const identifiers: string[] = []

    traverse(ast, {
      Identifier(path) {
        identifiers.push(path.node.name)
      },
    })

    expect(identifiers).toEqual(['answer'])
    expect(parseExpression('answer + 1').type).toBe('BinaryExpression')
  })
})
