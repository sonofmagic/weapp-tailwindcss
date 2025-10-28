import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCompilerContext } from '@/context'
import { analyzeSource, babelParse, parseCache, processUpdatedSource } from '@/js/babel'

const SOURCE = `
import { twMerge } from 'tailwind-merge'
export { twJoin } from 'tailwind-merge'
export { default as cvaCreator } from 'class-variance-authority'
const cva = require('class-variance-authority')
export * from 'tailwind-variants'
`

const INVALID_SOURCE = `
import { twMerge } from 'tailwind-merge'
export { tv } from 'tailwind-variants'
`

describe('module specifier replacements', () => {
  beforeEach(() => {
    parseCache.clear()
  })

  it('keeps original specifiers by default', async () => {
    const { jsHandler } = getCompilerContext()
    const { code } = await jsHandler(SOURCE, new Set())
    expect(code).toContain(`from 'tailwind-merge'`)
    expect(code).toContain(`require('class-variance-authority')`)
    expect(code).toContain(`from 'tailwind-variants'`)
  })

  it('rewrites specifiers when enabled', async () => {
    const { jsHandler } = getCompilerContext({ replaceRuntimePackages: true })
    const { code } = await jsHandler(SOURCE, new Set())
    expect(code).toContain(`from '@weapp-tailwindcss/merge'`)
    expect(code).toContain(`export { twJoin } from '@weapp-tailwindcss/merge'`)
    expect(code).toContain(`require('@weapp-tailwindcss/merge/cva')`)
    expect(code).toContain(`from '@weapp-tailwindcss/merge/variants'`)
  })

  it('supports custom mapping objects', async () => {
    const { jsHandler } = getCompilerContext({
      replaceRuntimePackages: {
        'tailwind-merge': '@custom/weapp-merge',
      },
    })
    const { code } = await jsHandler(SOURCE, new Set())
    expect(code).toContain(`from '@custom/weapp-merge'`)
    expect(code).toContain(`require('class-variance-authority')`)
    expect(code).toContain(`from 'tailwind-variants'`)
  })

  it('ignores mapping entries without valid target', async () => {
    const { jsHandler } = getCompilerContext({
      replaceRuntimePackages: {
        'tailwind-merge': '',
      },
    })
    const { code } = await jsHandler(INVALID_SOURCE, new Set())
    expect(code).toContain(`from 'tailwind-merge'`)
    expect(code).toContain(`from 'tailwind-variants'`)
  })

  it('applies replacements during direct source processing', () => {
    const replacements = { 'tailwind-merge': '@weapp-tailwindcss/merge' }
    const code = `import { twMerge as mergeFn } from 'tailwind-merge'`
    const ast = babelParse(code, { sourceFilename: 'entry.js', sourceType: 'module', cache: false })
    const analysis = analyzeSource(ast, { moduleSpecifierReplacements: replacements })
    const ms = processUpdatedSource(code, { moduleSpecifierReplacements: replacements }, analysis)
    expect(ms.toString()).toContain(`'@weapp-tailwindcss/merge'`)
  })

  it('uses injected eval handler when provided', () => {
    const handler = vi.fn(() => ({
      code: 'handled',
      get map() {
        return undefined
      },
    }))
    const code = `eval("twMerge('a')")`
    const ast = babelParse(code, { sourceFilename: 'entry.js', sourceType: 'module', cache: false })
    analyzeSource(ast, {}, handler)
    expect(handler).toHaveBeenCalled()
  })
})
