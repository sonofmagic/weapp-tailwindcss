import type { NodePath } from '@babel/traverse'
import type { CallExpression, Node } from '@babel/types'
import type { IJsHandlerOptions, JsHandlerResult } from '@/types'
import MagicString from 'magic-string'
import { describe, expect, it } from 'vitest'
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
})
