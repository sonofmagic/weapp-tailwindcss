import { readFileSync } from 'node:fs'

export function tryReadJson<T extends Record<string, any>>(file: string): T | undefined {
  try {
    const content = readFileSync(file, 'utf8')
    return JSON.parse(content) as T
  }
  catch {
    return undefined
  }
}
