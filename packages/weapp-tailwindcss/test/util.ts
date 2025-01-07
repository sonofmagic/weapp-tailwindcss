import fs from 'node:fs/promises'
import path from 'node:path'
import * as htmlparser2 from 'htmlparser2'
import MagicString from 'magic-string'

export { format } from './helpers/wxml'

export function removeWxmlId(html: string) {
  const ms = new MagicString(html)
  const parser = new htmlparser2.Parser({
    onattribute(name) {
      if (name === 'data-sid' || name === 'id') {
        ms.update(parser.startIndex - 1, parser.endIndex, '')
      }
    },
  })
  parser.write(html)
  parser.end()
  return ms.toString()
}

export function resolve(...args: string[]) {
  return path.resolve(...args)
}

export const rootPath = resolve(__dirname, '..')
export const distPath = resolve(rootPath, 'dist')
export const demoPath = resolve(rootPath, 'demo')
export const configPath = resolve(__dirname, 'config')
export const fixturesRootPath = resolve(__dirname, 'fixtures')
export const jsxCasePath = resolve(__dirname, 'fixtures/jsx')
export const jsCasePath = resolve(__dirname, 'fixtures/js')
export const tsCasePath = resolve(__dirname, 'fixtures/ts')
export const cssCasePath = resolve(__dirname, 'fixtures/css')
export const wxmlCasePath = resolve(__dirname, 'fixtures/wxml')
export const wxsCasePath = resolve(__dirname, 'fixtures/wxs')
export const loaderCasePath = resolve(__dirname, 'fixtures/loader')
export const tailwindcssCasePath = resolve(__dirname, 'fixtures/tailwindcss')
export const webpack5CasePath = resolve(__dirname, 'fixtures/webpack/v5')
export const gulpCasePath = resolve(__dirname, 'fixtures/gulp')
export const unicodeCasePath = resolve(__dirname, 'fixtures/unicode')

export function readFile(filepath: string) {
  return fs.readFile(filepath, {
    encoding: 'utf8',
  })
}

export function writeFile(filepath: string, data: string) {
  return fs.writeFile(filepath, data, {
    encoding: 'utf8',
  })
}

export function createGetCase(casePath: string) {
  return function getCase(casename: string) {
    return readFile(resolve(casePath, casename))
  }
}

export function createPutCase(casePath: string) {
  return function putCase(casename: string, data: string) {
    return writeFile(resolve(casePath, casename), data)
  }
}

export function isWebpackPlugin(constructor: new () => object) {
  return typeof constructor.prototype.apply === 'function'
}

export function matchAll(regex: RegExp, str: string) {
  const arr = []
  let res
  do {
    res = regex.exec(str)
    if (res) {
      arr.push(res)
    }
  } while (res !== null)
  return arr
}

export function switch2relative(p: string): string {
  let str = p
  if (path.isAbsolute(p)) {
    str = path.relative(__dirname, p)
  }
  return str.replaceAll('\\', '/')
}
