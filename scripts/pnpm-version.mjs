import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

export function readPnpmVersion(manifestFile = new URL('../package.json', import.meta.url)) {
  const { packageManager } = JSON.parse(readFileSync(manifestFile, 'utf8'))
  const version = typeof packageManager === 'string'
    ? packageManager.match(/^pnpm@(\d+\.\d+\.\d+(?:-[0-9a-z.-]+)?)(?:\+sha(?:224|256|384|512)\.[a-f\d]+)?$/i)?.[1]
    : undefined
  assert.ok(version, `${manifestFile}: packageManager must pin an exact pnpm version`)
  return version
}
