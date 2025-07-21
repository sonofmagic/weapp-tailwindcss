import type { ImportToken } from '@/js/NodePathWalker'
import fs from 'fs-extra'
import MagicString from 'magic-string'
import path from 'pathe'
import { parse } from '@/babel'
import { analyzeSource } from '@/js/babel'

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
        tokens: [] as ImportToken[],
        imports: {},
        analysis: {} as ReturnType<typeof analyzeSource>,
      }
    }
    // const base = '.'
    const sp = {
      'a.js': init(getCase('import/a.js')),
      'shared.js': init(getCase('import/shared.js')),
      'shared2.js': init(getCase('import/shared2.js')),
    }

    {
      // dirname
      const { exportDeclarations, walker } = analyzeSource(sp['a.js'].ast, {
        ignoreCallExpressionIdentifiers,
      })
      expect(exportDeclarations.size).toBe(0)
      expect(walker.imports.size).toBe(3)
    }

    {
      const { exportDeclarations, walker } = analyzeSource(sp['shared.js'].ast, {
        ignoreCallExpressionIdentifiers,
      })
      expect(exportDeclarations.size).toBe(5)
      expect(walker.imports.size).toBe(0)
      // const exportWalker = new NodePathWalker()
    }

    {
      const { exportDeclarations, walker } = analyzeSource(sp['shared2.js'].ast, {
        ignoreCallExpressionIdentifiers,
      })
      expect(exportDeclarations.size).toBe(2)
      expect(walker.imports.size).toBe(0)
    }
  })

  it('all code 1', () => {
    function init(code: string) {
      return {
        ms: new MagicString(code),
        ast: babelParse(code),
        tokens: [] as ImportToken[],
        imports: {},
        analysis: {} as ReturnType<typeof analyzeSource>,
      }
    }
    // const base = '.'
    const sp = {
      'a.js': init(getCase('import/a.js')),
      'shared.js': init(getCase('import/shared.js')),
      'shared2.js': init(getCase('import/shared2.js')),
    }

    for (const [, entry] of Object.entries(sp)) {
      entry.analysis = analyzeSource(entry.ast, {
        ignoreCallExpressionIdentifiers,
      })
    }

    for (const [, entry] of Object.entries(sp)) {
      entry.imports = Array.from(
        entry.analysis.walker.imports,
      ).reduce<Record<string, ImportToken[]>>(
        (acc, token) => {
          // entry.tokens.push(token)
          if (Array.isArray(acc[token.source])) {
            acc[token.source].push(token)
          }
          else {
            acc[token.source] = [token]
          }
          for (const [x, xx] of Object.entries(sp)) {
            // @ts-ignore
            if (`${token.source}.js` === `./${x}`) {
              xx.tokens.push(token)
            }
          }

          return acc
        },
        {},
      )
    }
    expect(sp).toBeTruthy()

    // expect(ms.toString()).toBe(`import { a as bb } from './shared'\n\ncn(bb, "__", "yy")`)
    // expect(walker.imports.size).toBe(3)
  })
})
