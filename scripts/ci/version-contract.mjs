import { readFile } from 'node:fs/promises'

export async function readPackageJson(file) {
  return JSON.parse(await readFile(file, 'utf8'))
}

export function declaredPackageManager(manifest) {
  const match = /^(?<name>[^@]+)@(?<version>.+)$/.exec(String(manifest.packageManager ?? ''))
  if (!match) {
    throw new Error(`Invalid packageManager: ${manifest.packageManager}`)
  }
  return match.groups
}
