import fs from 'fs/promises'
import path from 'path'
export { format } from './helpers/wxml'
export function resolve(...args: string[]) {
  return path.resolve(...args)
}

export const jsxCasePath = resolve(__dirname, 'fixtures/jsx')
export const cssCasePath = resolve(__dirname, 'fixtures/css')
export const wxmlCasePath = resolve(__dirname, 'fixtures/wxml')
export const loaderCasePath = resolve(__dirname, 'fixtures/loader')

export function readFile(filepath: string) {
  return fs.readFile(filepath, {
    encoding: 'utf-8'
  })
}

export function writeFile(filepath: string, data: string) {
  return fs.writeFile(filepath, data, {
    encoding: 'utf-8'
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

export function isWebpackPlugin(constructor: new () => {}) {
  return typeof constructor.prototype.apply === 'function'
}

export const matchAll = (regex: RegExp, str: string) => {
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
  return str.replace(/\\/g, '/')
}
