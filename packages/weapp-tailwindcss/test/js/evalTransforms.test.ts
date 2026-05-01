import type { NodePath } from '@babel/traverse'
import type { CallExpression, Node } from '@babel/types'
import type { IJsHandlerOptions, JsHandlerResult } from '@/types'
import MagicString from 'magic-string'
import { describe, expect, it, vi } from 'vitest'
import { parse, traverse } from '@/babel'
import { isEvalPath, walkEvalExpression } from '@/js/evalTransforms'
import { JsTokenUpdater } from '@/js/JsTokenUpdater'

function getEvalCall(code: string): NodePath<CallExpression> {
  const ast = parse(code, {
    sourceType: 'module',
  })
  let evalPath: NodePath<CallExpression> | undefined

  traverse(ast, {
    CallExpression(path) {
      if (path.get('callee').isIdentifier({ name: 'eval' })) {
        evalPath = path
        path.stop()
      }
    },
  })

  if (!evalPath) {
    throw new Error('Expected eval call expression in test source')
  }

  return evalPath
}

describe('evalTransforms', () => {
  const baseOptions: IJsHandlerOptions = {}

  it('rewrites string literals discovered inside eval calls', () => {
    const source = 'eval("foo")'
    const updater = new JsTokenUpdater()
    const handler = (input: string): JsHandlerResult => ({ code: input.toUpperCase() })

    walkEvalExpression(getEvalCall(source), baseOptions, updater, handler)

    const rewritten = updater.updateMagicString(new MagicString(source)).toString()
    expect(rewritten).toBe('eval("FOO")')
  })

  it('rewrites template literals discovered inside eval calls', () => {
    const source = 'eval(`foo`);'
    const updater = new JsTokenUpdater()
    const handler = (input: string): JsHandlerResult => ({ code: `${input} bar` })

    walkEvalExpression(getEvalCall(source), baseOptions, updater, handler)

    const rewritten = updater.updateMagicString(new MagicString(source)).toString()
    expect(rewritten).toBe('eval(`foo bar`);')
  })

  it('reuses cached handler options for repeated eval string literals', () => {
    const source = 'eval("foo", "bar")'
    const updater = new JsTokenUpdater()
    const handler = vi.fn((input: string): JsHandlerResult => ({ code: input.toUpperCase() }))

    walkEvalExpression(getEvalCall(source), baseOptions, updater, handler)

    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler.mock.calls[0]?.[1]).toBe(handler.mock.calls[1]?.[1])
    expect(handler.mock.calls[0]?.[1]).toMatchObject({
      needEscaped: false,
      generateMap: false,
    })
  })

  it('detects eval calls via isEvalPath helper', () => {
    const ast = parse('eval("foo"); other("bar")', { sourceType: 'module' as const })
    const calls: NodePath<CallExpression>[] = []

    traverse(ast, {
      CallExpression(path) {
        calls.push(path)
      },
    })

    expect(calls).toHaveLength(2)
    expect(isEvalPath(calls[0])).toBe(true)
    expect(isEvalPath(calls[1])).toBe(false)

    let identifierPath: NodePath<Node> | undefined
    traverse(parse('const value = 1', { sourceType: 'module' as const }), {
      Identifier(path) {
        identifierPath = path as unknown as NodePath<Node>
        path.stop()
      },
    })

    if (!identifierPath) {
      throw new Error('Expected identifier path for negative isEvalPath assertion')
    }

    expect(isEvalPath(identifierPath)).toBe(false)
  })

  it('skips updates when handler returns empty or identical content', () => {
    const stringSource = 'eval("noop")'
    const templateSource = 'eval(`noop`);'
    const noopUpdater = new JsTokenUpdater()
    const identicalUpdater = new JsTokenUpdater()
    const emptyTemplateUpdater = new JsTokenUpdater()

    walkEvalExpression(
      getEvalCall(stringSource),
      baseOptions,
      noopUpdater,
      () => ({ code: '' }),
    )

    walkEvalExpression(
      getEvalCall(templateSource),
      baseOptions,
      identicalUpdater,
      () => ({ code: 'noop' }),
    )

    walkEvalExpression(
      getEvalCall(templateSource),
      baseOptions,
      emptyTemplateUpdater,
      () => ({ code: '' }),
    )

    expect(noopUpdater.updateMagicString(new MagicString(stringSource)).toString()).toBe(stringSource)
    expect(identicalUpdater.updateMagicString(new MagicString(templateSource)).toString()).toBe(templateSource)
    expect(emptyTemplateUpdater.updateMagicString(new MagicString(templateSource)).toString()).toBe(templateSource)
  })

  it('drops tokens when replacement metadata is incomplete', () => {
    const source = 'eval("noop")'
    const updater = new JsTokenUpdater()
    const callPath = {
      traverse(visitor: any) {
        const stubPath = {
          node: {
            start: undefined,
            end: undefined,
          },
          isStringLiteral: () => true,
          isTemplateElement: () => false,
        }
        visitor.StringLiteral?.(stubPath)
      },
    } as unknown as NodePath<CallExpression>

    walkEvalExpression(callPath, baseOptions, updater, () => ({ code: 'updated' }))
    expect(() => updater.updateMagicString(new MagicString(source))).not.toThrow()
    expect(updater.updateMagicString(new MagicString(source)).toString()).toBe(source)
  })

  it('ignores tokens when computed range collapses or node type is unexpected', () => {
    const source = 'eval("noop")'
    const updater = new JsTokenUpdater()
    const callPath = {
      traverse(visitor: any) {
        const stubPath = {
          node: {
            start: 0,
            end: 0,
          },
          isStringLiteral: () => false,
          isTemplateElement: () => false,
        }
        visitor.StringLiteral?.(stubPath)
      },
    } as unknown as NodePath<CallExpression>

    walkEvalExpression(callPath, baseOptions, updater, () => ({ code: 'updated' }))
    expect(updater.updateMagicString(new MagicString(source)).toString()).toBe(source)
  })

  it('falls back to manual argument traversal when NodePath traversal has no scope', () => {
    const source = 'eval("foo", `bar`);'
    const updater = new JsTokenUpdater()
    const callPath = {
      traverse() {
        throw new Error('You must pass a scope and parentPath unless traversing a Program/File')
      },
      get(key: string) {
        if (key !== 'arguments') {
          return undefined
        }
        return [
          {
            node: {
              type: 'StringLiteral',
              value: 'foo',
              start: 5,
              end: 10,
            },
            isStringLiteral: () => true,
            isTemplateLiteral: () => false,
          },
          {
            node: {
              type: 'TemplateLiteral',
            },
            isStringLiteral: () => false,
            isTemplateLiteral: () => true,
            get(quasiKey: string) {
              if (quasiKey !== 'quasis') {
                return []
              }
              return [
                {
                  node: {
                    type: 'TemplateElement',
                    value: { raw: 'bar' },
                    start: 13,
                    end: 16,
                  },
                  isStringLiteral: () => false,
                  isTemplateElement: () => true,
                },
              ]
            },
          },
        ]
      },
    } as unknown as NodePath<CallExpression>

    walkEvalExpression(callPath, baseOptions, updater, input => ({ code: input.toUpperCase() }))

    expect(updater.updateMagicString(new MagicString(source)).toString()).toBe('eval("FOO", `BAR`);')
  })

  it('rethrows traversal errors that are not scope related', () => {
    const callPath = {
      traverse() {
        throw new Error('unexpected traversal failure')
      },
    } as unknown as NodePath<CallExpression>

    expect(() => walkEvalExpression(callPath, baseOptions, new JsTokenUpdater(), input => ({ code: input })))
      .toThrow('unexpected traversal failure')
  })

  it('handles node-only eval call stubs', () => {
    const source = 'eval("foo", `bar`);'
    const updater = new JsTokenUpdater()
    const callPath = {
      node: {
        arguments: [
          {
            type: 'StringLiteral',
            value: 'foo',
            start: 5,
            end: 10,
          },
          {
            type: 'TemplateLiteral',
            quasis: [
              {
                type: 'TemplateElement',
                value: { raw: 'bar' },
                start: 13,
                end: 16,
              },
            ],
          },
        ],
      },
    } as unknown as NodePath<CallExpression>

    walkEvalExpression(callPath, baseOptions, updater, input => ({ code: input.toUpperCase() }))

    expect(updater.updateMagicString(new MagicString(source)).toString()).toBe('eval("FOO", `BAR`);')
  })

  it('keeps template handler options untouched when source maps are already disabled', () => {
    const source = 'eval(`foo`, `bar`);'
    const updater = new JsTokenUpdater()
    const handler = vi.fn((input: string): JsHandlerResult => ({ code: input.toUpperCase() }))
    const options: IJsHandlerOptions = {
      generateMap: false,
    }

    walkEvalExpression(getEvalCall(source), options, updater, handler)

    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler.mock.calls[0]?.[1]).toBe(options)
    expect(handler.mock.calls[1]?.[1]).toBe(options)
    expect(updater.updateMagicString(new MagicString(source)).toString()).toBe('eval(`FOO`, `BAR`);')
  })
})
