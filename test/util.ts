import fs from 'fs/promises'
import path from 'path'

export function resolve (...args: string[]) {
  return path.resolve(...args)
}

export const jsxCasePath = resolve(__dirname, 'fixtures/jsx')
export const cssCasePath = resolve(__dirname, 'fixtures/css')
export const wxmlCasePath = resolve(__dirname, 'fixtures/wxml')

export function readFile (filepath: string) {
  return fs.readFile(filepath, {
    encoding: 'utf-8'
  })
}

export function writeFile (filepath: string, data: string) {
  return fs.writeFile(filepath, data, {
    encoding: 'utf-8'
  })
}

export function createGetCase (casePath: string) {
  return function getCase (casename: string) {
    return readFile(resolve(casePath, casename))
  }
}

export function createPutCase (casePath: string) {
  return function putCase (casename: string, data: string) {
    return writeFile(resolve(casePath, casename), data)
  }
}

export function isWebpackPlugin (constructor: new () => {}) {
  return typeof constructor.prototype.apply === 'function'
}
