import fs from 'node:fs/promises'

export async function fileExists(file: string) {
  try {
    await fs.access(file)
    return true
  }
  catch {
    return false
  }
}

export async function readUtf8(file: string) {
  return await fs.readFile(file, 'utf8')
}

export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
