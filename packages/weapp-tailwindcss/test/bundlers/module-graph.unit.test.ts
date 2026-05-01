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
    expect(isResolvableSpecifier('D:\\project\\dist\\app.js')).toBe(true)
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

  it('resolves Windows absolute output specifiers before protocol filtering', () => {
    const outDir = 'D:\\project\\dist'
    const importer = 'D:\\project\\dist\\pages\\index\\index.js'
    const absoluteOutput = 'D:\\project\\dist\\absolute.js'
    const outputs = new Set([absoluteOutput])
    const hasOutput = (value: string) => outputs.has(value)

    expect(resolveOutputSpecifier('D:\\project\\dist\\absolute', importer, outDir, hasOutput)).toBe(absoluteOutput)
  })

  it('normalizes relative output filenames against outDir', () => {
    const outDir = path.resolve('/project/dist')
    const absoluteOutputPath = path.resolve('/already/app.js')

    expect(toAbsoluteOutputPath(absoluteOutputPath, outDir)).toBe(path.normalize(absoluteOutputPath))
    expect(toAbsoluteOutputPath('pages/index.js', outDir)).toBe(path.resolve(outDir, 'pages/index.js'))
  })
})
