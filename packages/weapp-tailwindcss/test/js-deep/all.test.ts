import { parse } from '@/babel'
import { analyzeSource } from '@/js/babel'
import fs from 'fs-extra'
import MagicString from 'magic-string'
import path from 'pathe'

function getCase(name: string) {
  return fs.readFileSync(path.resolve(import.meta.dirname, './fixtures', name), 'utf8')
}

const ignoreCallExpressionIdentifiers = ['cn']

function babelParse(code: string) {
  return parse(
    code,
    {
      sourceType: 'unambiguous',
    },
  )
}

describe('all', () => {
  it('all code 0', () => {
    function init(code: string) {
      return {
        ms: new MagicString(code),
        ast: babelParse(code),
      }
    }
    const sp = {
      'a.js': init(getCase('import/a.js')),
      'shared.js': init(getCase('import/shared.js')),
      'shared2.js': init(getCase('import/shared2.js')),
    }

    {
      const { exportDeclarations, walker } = analyzeSource(sp['a.js'].ast, {
        ignoreCallExpressionIdentifiers,
      })
      expect(exportDeclarations.size).toBe(0)
      expect(walker.imports.size).toBe(3)

      // for (const importee of walker.imports) {

      // }
    }

    {
      const { exportDeclarations, walker } = analyzeSource(sp['shared.js'].ast, {
        ignoreCallExpressionIdentifiers,
      })
      expect(exportDeclarations.size).toBe(5)
      expect(walker.imports.size).toBe(0)
    }

    {
      const { exportDeclarations, walker } = analyzeSource(sp['shared2.js'].ast, {
        ignoreCallExpressionIdentifiers,
      })
      expect(exportDeclarations.size).toBe(2)
      expect(walker.imports.size).toBe(0)
    }

    // expect(ms.toString()).toBe(`import { a as bb } from './shared'\n\ncn(bb, "__", "yy")`)
    // expect(walker.imports.size).toBe(3)
  })
})
