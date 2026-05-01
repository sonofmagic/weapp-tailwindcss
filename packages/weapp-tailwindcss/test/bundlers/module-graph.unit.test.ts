import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  isResolvableSpecifier,
  resolveOutputSpecifier,
  stripQueryAndHash,
  toAbsoluteOutputPath,
} from '@/bundlers/shared/module-graph'

describe('bundlers shared module graph utilities', () => {
  it('strips query/hash suffixes and filters unresolvable specifiers', () => {
    expect(stripQueryAndHash('./app.js?raw#hash')).toBe('./app.js')
    expect(isResolvableSpecifier('')).toBe(false)
    expect(isResolvableSpecifier('\0virtual')).toBe(false)
    expect(isResolvableSpecifier('node:fs')).toBe(false)
    expect(isResolvableSpecifier('https://example.com/app.js')).toBe(false)
    expect(isResolvableSpecifier('./app.js?raw')).toBe(true)
  })

  it('resolves relative and absolute output specifiers with extension fallback', () => {
    const outDir = path.resolve('/project/dist')
    const importer = path.join(outDir, 'pages/index/index.js')
    const outputs = new Set([
      path.join(outDir, 'pages/index/util.mjs'),
      path.join(outDir, 'absolute.js'),
    ])
    const hasOutput = (value: string) => outputs.has(value)

    expect(resolveOutputSpecifier('./util', importer, outDir, hasOutput)).toBe(path.join(outDir, 'pages/index/util.mjs'))
    expect(resolveOutputSpecifier(path.join(outDir, 'absolute.js'), importer, outDir, hasOutput)).toBe(path.join(outDir, 'absolute.js'))
    expect(resolveOutputSpecifier('/assets/app', importer, outDir, hasOutput)).toBeUndefined()
    expect(resolveOutputSpecifier('./missing', importer, outDir, hasOutput)).toBeUndefined()
  })

  it('normalizes relative output filenames against outDir', () => {
    expect(toAbsoluteOutputPath('/already/app.js', '/project/dist')).toBe('/already/app.js')
    expect(toAbsoluteOutputPath('pages/index.js', '/project/dist')).toBe(path.resolve('/project/dist/pages/index.js'))
  })
})
