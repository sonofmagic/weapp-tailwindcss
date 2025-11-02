import type { IJsHandlerOptions } from '@/types'
import fs from 'fs-extra'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { jsHandler } from '@/js'

const fixturesDir = path.resolve(import.meta.dirname, '../js-deep/fixtures/import')

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

describe('js module graph', () => {
  it('follows imports and re-exports across files', () => {
    const entryFile = path.resolve(fixturesDir, 'a.js')
    const source = fs.readFileSync(entryFile, 'utf8')
    const classNameSet = new Set(['bg-[#123456]'])

    const options: IJsHandlerOptions = {
      classNameSet,
      babelParserOptions: {
        sourceType: 'module',
      },
      ignoreCallExpressionIdentifiers: ['cn'],
      filename: entryFile,
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

    const result = jsHandler(source, options)

    expect(result.code).toBe(source)
    expect(result.linked).toBeDefined()

    const linked = result.linked!
    const shared = path.resolve(fixturesDir, 'shared.js')
    const shared2 = path.resolve(fixturesDir, 'shared2.js')
    expect(Object.keys(linked)).toEqual(expect.arrayContaining([shared, shared2]))
    expect(linked[shared].code).toMatch(/bg-_b_h123456_B/)
    expect(linked[shared2].code).toMatch(/bg-_b_h123456_B/)
  })
})
