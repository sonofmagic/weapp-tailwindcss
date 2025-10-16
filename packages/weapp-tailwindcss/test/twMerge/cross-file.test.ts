import type { IJsHandlerOptions } from '@/types'
import fs from 'fs-extra'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { jsHandler } from '@/js'

const fixturesDir = path.resolve(import.meta.dirname, '../fixtures/twMerge/cross')

function resolveModule(specifier: string, importer: string) {
  if (!specifier.startsWith('.')) {
    return undefined
  }
  const base = path.resolve(path.dirname(importer), specifier)
  const withExtension = base.endsWith('.js') ? base : `${base}.js`
  if (fs.existsSync(withExtension)) {
    return withExtension
  }
  if (fs.existsSync(base)) {
    return base
  }
  return undefined
}

function runCase(ignore: string[]) {
  const entry = path.resolve(fixturesDir, 'entry.js')
  const source = fs.readFileSync(entry, 'utf8')
  const classNameSet = new Set(['bg-[#123456]', 'px-[35px]'])

  const options: IJsHandlerOptions = {
    classNameSet,
    ignoreCallExpressionIdentifiers: ignore,
    babelParserOptions: {
      sourceType: 'module',
    },
    filename: entry,
    moduleGraph: {
      resolve: resolveModule,
      load(id) {
        return fs.readFileSync(id, 'utf8')
      },
      filter(id) {
        return id.startsWith(fixturesDir)
      },
    },
  }

  return jsHandler(source, options)
}

describe('twMerge cross file ignore', () => {
  it('hashes inline twMerge arguments when ignoreCallExpressionIdentifiers is empty', () => {
    const result = runCase([])
    expect(result.code).toMatch(/bg-_h[0-9a-z]+_/)
    expect(result.code).not.toContain('bg-[#123456]')
    expect(result.code).toMatchSnapshot('hashed-entry-code')
    expect(result.linked).toBeUndefined()
  })

  it('skips dependency exports when twMerge is ignored', () => {
    const result = runCase(['twMerge'])
    const sharedPath = path.resolve(fixturesDir, 'shared.js')
    expect(result.code).toContain('bg-[#123456]')
    expect(result.code).not.toMatch(/bg-_h[0-9a-z]+_/)
    expect(result.code).toMatchSnapshot('ignored-entry-code')

    const linkedShared = result.linked?.[sharedPath]?.code ?? fs.readFileSync(sharedPath, 'utf8')
    expect(linkedShared).toContain('bg-[#123456]')
    expect(linkedShared).toContain('px-[35px]')
    expect(linkedShared).not.toMatch(/bg-_h[0-9a-z]+_/)
    expect(linkedShared).toMatchSnapshot('ignored-shared-code')
  })
})
