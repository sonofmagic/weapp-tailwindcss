import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { readPnpmVersion } from '../../pnpm-version.mjs'

describe('pnpm manifest contract', () => {
  it.each(['\n', '\r\n'])('reads the supplied manifest independently of cwd with %j newlines', (newline) => {
    const dir = mkdtempSync(path.join(tmpdir(), 'pnpm 版本 & space-'))
    const file = path.join(dir, 'package.json')
    try {
      for (const version of ['11.25.0', '12.3.4', '13.0.0-rc.1']) {
        for (const suffix of ['', '+sha512.aabbcc']) {
          writeFileSync(file, JSON.stringify({ packageManager: `pnpm@${version}${suffix}` }, null, 2).replaceAll('\n', newline))
          expect(readPnpmVersion(file)).toBe(version)
          expect(readPnpmVersion(pathToFileURL(file))).toBe(version)
        }
      }
      for (const packageManager of [undefined, null, 12, 'npm@12.3.4', 'pnpm@latest', 'pnpm@^12.3.4', 'pnpm@12', 'pnpm@12.3.4+sha512.invalid']) {
        writeFileSync(file, JSON.stringify({ packageManager }))
        expect(() => readPnpmVersion(file)).toThrow(`${file}: packageManager must pin an exact pnpm version`)
      }
      writeFileSync(file, '{invalid')
      expect(() => readPnpmVersion(file)).toThrow()
      expect(() => readPnpmVersion(path.join(dir, 'missing.json'))).toThrow()
    }
    finally { rmSync(dir, { recursive: true, force: true }) }
  })
})
