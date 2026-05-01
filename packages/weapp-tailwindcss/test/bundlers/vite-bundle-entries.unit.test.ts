import { describe, expect, it, vi } from 'vitest'
import {
  applyLinkedResults,
  createBundleModuleGraphOptions,
  isJavaScriptEntry,
  readOutputEntry,
} from '@/bundlers/vite/bundle-entries'

function chunk(code: string) {
  return {
    type: 'chunk',
    code,
  } as never
}

function asset(source: unknown) {
  return {
    type: 'asset',
    source,
  } as never
}

describe('vite bundle entries', () => {
  it('reads chunk, string, Uint8Array, custom stringifiable and empty asset output', () => {
    expect(readOutputEntry({ fileName: 'app.js', output: chunk('const a = 1') })).toBe('const a = 1')
    expect(readOutputEntry({ fileName: 'app.wxss', output: asset('.a{}') })).toBe('.a{}')
    expect(readOutputEntry({ fileName: 'app.wxss', output: asset(new Uint8Array([97, 98])) })).toBe('ab')
    expect(readOutputEntry({ fileName: 'app.wxss', output: asset({ toString: () => 'custom' }) })).toBe('custom')
    expect(readOutputEntry({ fileName: 'app.wxss', output: asset(undefined) })).toBeUndefined()
    expect(readOutputEntry({ fileName: 'app.wxss', output: asset(Object.create(null)) })).toBeUndefined()
  })

  it('detects JavaScript entries from chunks and asset filenames', () => {
    expect(isJavaScriptEntry({ fileName: 'app.wxss', output: chunk('') })).toBe(true)
    expect(isJavaScriptEntry({ fileName: 'app.js', output: asset('') })).toBe(true)
    expect(isJavaScriptEntry({ fileName: 'app.wxml', output: asset('') })).toBe(false)
  })

  it('creates module graph options over bundle outputs', () => {
    const outputDir = '/project/dist'
    const entries = new Map([
      ['/project/dist/app.js', { fileName: 'app.js', output: chunk('import "./dep"') }],
      ['/project/dist/dep.js', { fileName: 'dep.js', output: chunk('export {}') }],
    ])
    const options = createBundleModuleGraphOptions(outputDir, entries)

    expect(options.filter('/project/dist/app.js')).toBe(true)
    expect(options.filter('/project/dist/missing.js')).toBe(false)
    expect(options.load('/project/dist/app.js')).toBe('import "./dep"')
    expect(options.load('/project/dist/missing.js')).toBeUndefined()
    expect(options.resolve('./dep?x=1', '/project/dist/app.js')).toBe('/project/dist/dep.js')
    expect(options.resolve('node:fs', '/project/dist/app.js')).toBeUndefined()
  })

  it('applies linked code to chunks and assets only when content changed', () => {
    const onLinkedUpdate = vi.fn()
    const onApplied = vi.fn()
    const app = { fileName: 'app.js', output: chunk('old') }
    const assetEntry = { fileName: 'app.sjs', output: asset('asset-old') }
    const entries = new Map([
      ['app.js', app],
      ['app.sjs', assetEntry],
      ['same.js', { fileName: 'same.js', output: chunk('same') }],
      ['empty.js', { fileName: 'empty.js', output: asset(undefined) }],
    ])

    applyLinkedResults(undefined, entries, onLinkedUpdate, onApplied)
    applyLinkedResults({
      'missing.js': { code: 'ignored' } as never,
      'same.js': { code: 'same' } as never,
      'empty.js': { code: 'next' } as never,
      'app.js': { code: 'new' } as never,
      'app.sjs': { code: 'asset-new' } as never,
    }, entries, onLinkedUpdate, onApplied)

    expect(app.output.code).toBe('new')
    expect(assetEntry.output.source).toBe('asset-new')
    expect(onApplied).toHaveBeenCalledTimes(2)
    expect(onLinkedUpdate).toHaveBeenCalledTimes(2)
    expect(onLinkedUpdate).toHaveBeenNthCalledWith(1, 'app.js', 'old', 'new')
    expect(onLinkedUpdate).toHaveBeenNthCalledWith(2, 'app.sjs', 'asset-old', 'asset-new')
  })
})
