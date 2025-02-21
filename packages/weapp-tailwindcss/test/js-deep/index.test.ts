import type { ParseResult } from '@babel/parser'
import type t from '@babel/types'
import { parse, traverse } from '@/babel'
import { JsTokenUpdater } from '@/js/JsTokenUpdater'
import { escape, isAllowedClassName } from '@weapp-core/escape'
import fs from 'fs-extra'
import MagicString from 'magic-string'
import path from 'pathe'

const ignoreCallExpressionIdentifiers = ['cn']

function handle(ast: ParseResult<t.File>): JsTokenUpdater {
  const jsTokenUpdater = new JsTokenUpdater({ ignoreCallExpressionIdentifiers })

  traverse(ast, {
    // StringLiteral
    CallExpression(path) {
      // 检查是否是 cn 函数调用
      jsTokenUpdater.walkCallExpression(path)
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
    expect(ms.toString()).toBe('const b = \'after:xx\';const a = \'bg-_h123456_\' + \' bb\' + `${b} text-_h123456_`;cn(a,"xx","yy")')
  })

  it('parse js case 4', () => {
    const ms = new MagicString(getCase('4.js'))
    doEscape(ms)
    // eslint-disable-next-line no-template-curly-in-string
    expect(ms.toString()).toBe('const b = \'after:xx\';const a = `${b} text-_h123456_`;cn(a,"xx","yy")')
  })

  it('parse js case 5', () => {
    const ms = new MagicString(getCase('5.js'))
    doEscape(ms)
    // eslint-disable-next-line no-template-curly-in-string
    expect(ms.toString()).toBe('const b = \'_h3232_\';const a = `${b} text-_h123456_`;cn(a,`${b} bg-[#123]`,"yy")')
  })
})
