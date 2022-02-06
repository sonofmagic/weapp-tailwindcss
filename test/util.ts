import fs from 'fs/promises'
import path from 'path'

export function resolve (...args: string[]) {
  return path.resolve(...args)
}

export const jsxCasePath = resolve(__dirname, 'fixtures/jsx')
export const cssCasePath = resolve(__dirname, 'fixtures/css')

export async function readFile (filepath: string) {
  return await fs.readFile(filepath, {
    encoding: 'utf-8'
  })
}
