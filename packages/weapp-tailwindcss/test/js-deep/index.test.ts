import type { ParseResult } from '@babel/parser'
import { parse, traverse } from '@/babel'
import { JsTokenUpdater } from '@/js/JsTokenUpdater'
import t from '@babel/types'
import { escape, isAllowedClassName } from '@weapp-core/escape'
import MagicString from 'magic-string'

const ignoreCallExpressionIdentifiers = ['cn']

function handle(ast: ParseResult<t.File>): JsTokenUpdater {
  const jsTokenUpdater = new JsTokenUpdater()

  traverse(ast, {
    // StringLiteral
    CallExpression(path) {
      // 检查是否是 cn 函数调用
      if (
        t.isIdentifier(path.node.callee)
        && ignoreCallExpressionIdentifiers
          .includes(path.node.callee.name)) {
        for (const arg of path.node.arguments) {
          if (t.isIdentifier(arg)) {
            const binding = path.scope.getBinding(arg.name)
            if (binding) {
              const bindingNode = binding.path.node

              if (t.isVariableDeclarator(bindingNode)) {
                if (t.isStringLiteral(bindingNode.init)) {
                  jsTokenUpdater.addStringLiteral(bindingNode.init)
                }
                else if (t.isBinaryExpression(bindingNode.init)) {
                  jsTokenUpdater.addBinaryExpression(bindingNode.init)
                }
                else if (t.isTemplateLiteral(bindingNode.init)) {
                  jsTokenUpdater.addTemplateLiteral(bindingNode.init)
                }
              }
            }
          }
        }
      }
    },
  })
  return jsTokenUpdater
}

function doEscape(ms: MagicString) {
  handle(parse(ms.original)).filter((x) => {
    return !isAllowedClassName(x.value)
  }).map((x) => {
    return {
      ...x,
      value: escape(x.value),
    }
  }).updateMagicString(ms)
}

describe('js-deep', () => {
  it('parse js StringLiteral case 0', () => {
    const ms = new MagicString('const a = \'bg-[#123456]\';cn(a,"xx","yy")')
    doEscape(ms)
    expect(ms.toString()).toBe('const a = \'bg-_h123456_\';cn(a,"xx","yy")')
  })

  it('parse js TemplateLiteral case 1', () => {
    const ms = new MagicString('const a = ` text-[#123456]`;cn(a,"xx","yy")')
    doEscape(ms)
    expect(ms.toString()).toBe('const a = ` text-_h123456_`;cn(a,"xx","yy")')
  })

  it('parse js case 2', () => {
    const ms = new MagicString('const a = \'bg-[#123456]\' + \' bb\' + ` text-[#123456]`;cn(a,"xx","yy")')
    doEscape(ms)
    expect(ms.toString()).toBe('const a = \'bg-_h123456_\' + \' bb\' + ` text-_h123456_`;cn(a,"xx","yy")')
  })
})
