import { describe, expect, it, vi } from 'vitest'
import { IgnoredExportsTracker } from '@/js/module-graph/ignored-exports'

function identifier(name: string) {
  return {
    isIdentifier: () => true,
    isStringLiteral: () => false,
    node: { name },
  }
}

function stringLiteral(value: string) {
  return {
    isIdentifier: () => false,
    isStringLiteral: () => true,
    node: { value },
  }
}

function exportSpecifier(local: any, exported: any) {
  return {
    isExportSpecifier: () => true,
    get(key: string) {
      return key === 'local' ? local : exported
    },
  }
}

function ignoredSpecifier() {
  return {
    isExportSpecifier: () => false,
  }
}

function namedExport(options: {
  source?: string
  declaration?: any
  specifiers?: any[]
}) {
  return {
    node: options.source ? { source: { value: options.source } } : {},
    isExportDefaultDeclaration: () => false,
    isExportNamedDeclaration: () => true,
    isExportAllDeclaration: () => false,
    get(key: string) {
      if (key === 'specifiers') {
        return options.specifiers ?? []
      }
      if (key === 'declaration') {
        return options.declaration ?? { isVariableDeclaration: () => false }
      }
      throw new Error(`unexpected key ${key}`)
    },
  }
}

function defaultExport() {
  return {
    isExportDefaultDeclaration: () => true,
    isExportNamedDeclaration: () => false,
    isExportAllDeclaration: () => false,
  }
}

function exportAll(source: string) {
  return {
    node: { source: { value: source } },
    isExportDefaultDeclaration: () => false,
    isExportNamedDeclaration: () => false,
    isExportAllDeclaration: () => true,
  }
}

describe('IgnoredExportsTracker', () => {
  it('walks ignored local exports and propagates re-exports', () => {
    const modules = new Map<string, any>()
    const resolve = vi.fn((specifier: string, importer: string) => `${importer}:${specifier}`)
    const tracker = new IgnoredExportsTracker({
      resolve,
      modules,
    })
    const walker = {
      walkExportDefaultDeclaration: vi.fn(),
      walkVariableDeclarator: vi.fn(),
      walkNode: vi.fn(),
    }
    const variableDeclarator = {
      get: () => identifier('localVar'),
    }
    const declaration = {
      isVariableDeclaration: () => true,
      get: () => [variableDeclarator],
    }

    tracker.addIgnoredExport('/entry.js', '')
    tracker.addIgnoredExport('/entry.js', 'default')
    tracker.addIgnoredExport('/entry.js', 'localVar')
    tracker.addIgnoredExport('/entry.js', 'namedAlias')
    tracker.addIgnoredExport('/entry.js', 'remoteAlias')
    tracker.addIgnoredExport('/entry.js', 'fromAll')

    tracker.applyIgnoredExportsToAnalysis('/entry.js', {
      walker,
      exportDeclarations: [
        defaultExport(),
        namedExport({ declaration }),
        namedExport({
          specifiers: [
            ignoredSpecifier(),
            exportSpecifier(identifier('localName'), identifier('namedAlias')),
          ],
        }),
        namedExport({
          source: './remote',
          specifiers: [
            exportSpecifier(stringLiteral('remoteLocal'), stringLiteral('remoteAlias')),
          ],
        }),
        exportAll('./all'),
      ],
    } as any)

    expect(walker.walkExportDefaultDeclaration).toHaveBeenCalledTimes(1)
    expect(walker.walkVariableDeclarator).toHaveBeenCalledWith(variableDeclarator)
    expect(walker.walkNode).toHaveBeenCalledTimes(1)
    expect(resolve).toHaveBeenCalledWith('./remote', '/entry.js')
    expect(resolve).toHaveBeenCalledWith('./all', '/entry.js')
  })

  it('applies pending ignored exports when a module analysis is already registered', () => {
    const walker = {
      walkExportDefaultDeclaration: vi.fn(),
      walkVariableDeclarator: vi.fn(),
      walkNode: vi.fn(),
    }
    const modules = new Map<string, any>([
      ['/dep.js', {
        analysis: {
          walker,
          exportDeclarations: [defaultExport()],
        },
      }],
    ])
    const tracker = new IgnoredExportsTracker({
      resolve: vi.fn(),
      modules,
    })

    tracker.registerIgnoredExportsFromTokens('/dep.js', [
      { type: 'ImportDefaultSpecifier' },
      { type: 'ImportSpecifier', imported: 'named' },
    ] as any)

    expect(walker.walkExportDefaultDeclaration).toHaveBeenCalledTimes(1)
  })

  it('keeps propagated names pending when resolution or filters reject the target', () => {
    const tracker = new IgnoredExportsTracker({
      resolve: vi.fn(() => '/blocked.js'),
      filter: vi.fn(() => false),
      modules: new Map(),
    })

    tracker.addIgnoredExport('/entry.js', 'remote')
    tracker.applyIgnoredExportsToAnalysis('/entry.js', {
      walker: {
        walkExportDefaultDeclaration: vi.fn(),
        walkVariableDeclarator: vi.fn(),
        walkNode: vi.fn(),
      },
      exportDeclarations: [
        namedExport({
          source: './remote',
          specifiers: [exportSpecifier(identifier('remote'), identifier('remote'))],
        }),
      ],
    } as any)

    expect(() => tracker.applyIgnoredExportsToAnalysis('/entry.js', {
      walker: {
        walkExportDefaultDeclaration: vi.fn(),
        walkVariableDeclarator: vi.fn(),
        walkNode: vi.fn(),
      },
      exportDeclarations: [],
    } as any)).not.toThrow()
  })
})
