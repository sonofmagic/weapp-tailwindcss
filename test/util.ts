import fs from 'fs/promises'
import path from 'path'

export function resolve (...args: string[]) {
  return path.resolve(...args)
}

export const jsxCasePath = resolve(__dirname, 'fixtures/jsx')
export const cssCasePath = resolve(__dirname, 'fixtures/css')

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
