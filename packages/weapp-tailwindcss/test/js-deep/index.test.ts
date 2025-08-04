import type { ParseResult } from '@babel/parser'
import type t from '@babel/types'
import { escape, isAllowedClassName } from '@weapp-core/escape'
import fs from 'fs-extra'
import MagicString from 'magic-string'
import path from 'pathe'
import { parse, traverse } from '@/babel'
import { JsTokenUpdater } from '@/js/JsTokenUpdater'
import { NodePathWalker } from '@/js/NodePathWalker'

const ignoreCallExpressionIdentifiers = ['cn']

function handle(ast: ParseResult<t.File>) {
  const jsTokenUpdater = new JsTokenUpdater()
  const walker = new NodePathWalker({
    ignoreCallExpressionIdentifiers,
    callback(path) {
      if (path.isStringLiteral()) {
        const { node } = path
        if (node.start && node.end) {
          jsTokenUpdater.addToken({
            start: node.start + 1,
            end: node.end - 1,
            value: node.value,
            path,
          })
        }
      }
      else if (path.isTemplateElement()) {
        const { node } = path
        if (node.start && node.end && node.value.cooked) {
          jsTokenUpdater.addToken({
            start: node.start,
            end: node.end,
            value: node.value.cooked,
            path,
          })
        }
      }
    },
  })
  traverse(ast, {
    // StringLiteral
    CallExpression(path) {
      // 检查是否是 cn 函数调用
      walker.walkCallExpression(path)
    },
  })
  return {
    jsTokenUpdater,
    walker,
  }
}

function babelParse(code: string) {
  return parse(
    code,
    {
      sourceType: 'unambiguous',
    },
  )
}

function doEscape(ms: MagicString) {
  const { jsTokenUpdater, walker } = handle(
    babelParse(
      ms.original,
    ),
  )

  jsTokenUpdater.filter(
    (x) => {
      return !isAllowedClassName(x.value)
    },
  ).map(
    (x) => {
      return {
        ...x,
        value: escape(x.value),
      }
    },
  )
  jsTokenUpdater.updateMagicString(ms)

  return {
    jsTokenUpdater,
    magicString: ms,
    walker,
  }
}

function getCase(name: string) {
  return fs.readFileSync(path.resolve(import.meta.dirname, './fixtures', name), 'utf8')
}

describe('js-deep', () => {
  it('parse js StringLiteral case 0', () => {
    const ms = new MagicString(getCase('0.js'))
    doEscape(ms)
    expect(ms.toString()).toBe('const a = \'bg-_h123456_\';cn(a,"xx","yy")')
  })

  it('parse js TemplateLiteral case 1', () => {
    const ms = new MagicString(getCase('1.js'))
    doEscape(ms)
    expect(ms.toString()).toBe('const a = ` text-_h123456_`;cn(a,"xx","yy")')
  })

  it('parse js case 2', () => {
    const ms = new MagicString(getCase('2.js'))
    doEscape(ms)
    expect(ms.toString()).toBe('const a = \'bg-_h123456_\' + \' bb\' + ` text-_h123456_`;cn(a,"xx","yy")')
  })

  it('parse js case 3', () => {
    const ms = new MagicString(getCase('3.js'))
    doEscape(ms)
    // eslint-disable-next-line no-template-curly-in-string
    expect(ms.toString()).toBe('const b = \'aftercxx\';const a = \'bg-_h123456_\' + \' bb\' + `${b} text-_h123456_`;cn(a,"xx","yy")')
  })

  it('parse js case 4', () => {
    const ms = new MagicString(getCase('4.js'))
    doEscape(ms)
    // eslint-disable-next-line no-template-curly-in-string
    expect(ms.toString()).toBe('const b = \'aftercxx\';const a = `${b} text-_h123456_`;cn(a,"xx","yy")')
  })

  it('parse js case 5', () => {
    const ms = new MagicString(getCase('5.js'))
    doEscape(ms)
    // eslint-disable-next-line no-template-curly-in-string
    expect(ms.toString()).toBe('const b = \'_h3232_\';const a = `${b} text-_h123456_`;cn(a,`${b} bg-_h123_`,"yy")')
  })

  it('import case 0', () => {
    const ms = new MagicString(getCase('import/a.js'))
    const { walker } = doEscape(ms)

    // expect(ms.toString()).toBe(`import { a as bb } from './shared'\n\ncn(bb, "__", "yy")`)
    expect(walker.imports.size).toBe(3)
  })
})
