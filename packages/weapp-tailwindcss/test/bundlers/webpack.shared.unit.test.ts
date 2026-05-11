import { describe, expect, it } from 'vitest'
import {
  createAssetHashByChunkMap,
  createRuntimeAwareCssHash,
  getCacheKey,
  hasLoaderEntry,
  isCssLikeModuleResource,
  stripResourceQuery,
} from '@/bundlers/webpack/BaseUnifiedPlugin/shared'

describe('bundlers/webpack shared helpers', () => {
  it('returns cache keys and strips resource query/hash suffixes', () => {
    expect(getCacheKey('pages/index.js')).toBe('pages/index.js')
    expect(stripResourceQuery(undefined)).toBeUndefined()
    expect(stripResourceQuery('app.css?type=style')).toBe('app.css')
    expect(stripResourceQuery('app.css#hash')).toBe('app.css')
    expect(stripResourceQuery('app.css')).toBe('app.css')
  })

  it('detects css-like module resources and loader entries', () => {
    const cssMatcher = (file: string) => file.endsWith('.css')

    expect(isCssLikeModuleResource(undefined, cssMatcher)).toBe(false)
    expect(isCssLikeModuleResource('app.css?type=style', cssMatcher)).toBe(true)
    expect(isCssLikeModuleResource('component.mpx?type=styles&index=0', cssMatcher, 'mpx')).toBe(true)
    expect(isCssLikeModuleResource('component.mpx?type=styles&index=0', cssMatcher)).toBe(false)

    expect(hasLoaderEntry([{ loader: '/virtual/runtime-loader.js?abc' }], 'runtime-loader.js')).toBe(true)
    expect(hasLoaderEntry([{ loader: '/virtual/runtime-loader.js?abc' }])).toBe(false)
    expect(hasLoaderEntry([{ loader: undefined }], 'runtime-loader.js')).toBe(false)
  })

  it('creates stable per-asset hash from chunk hashes', () => {
    const chunks = [
      {
        id: 'main',
        hash: 'hash-main',
        files: ['app.js', 'app.wxss'],
      },
      {
        id: 'vendor',
        hash: 'hash-vendor',
        files: ['app.js'],
      },
      {
        id: 'empty',
        hash: undefined,
        files: ['noop.js'],
      },
      {
        name: 'runtime',
        hash: 'hash-runtime',
        files: new Set(['runtime.js', '']),
      },
      {
        id: 'nofiles',
        hash: 'hash-nofiles',
      },
    ]

    const result = createAssetHashByChunkMap(chunks)

    expect(result.get('app.js')).toBe('main:hash-main|vendor:hash-vendor')
    expect(result.get('app.wxss')).toBe('main:hash-main')
    expect(result.get('runtime.js')).toBe('runtime:hash-runtime')
    expect(result.has('noop.js')).toBe(false)
    expect(result.has('')).toBe(false)
  })

  it('includes runtime class set hash for css assets without chunk hash', () => {
    const sourceHash = 'source:old-utilities'

    expect(createRuntimeAwareCssHash('main:chunk-a', sourceHash, 'runtime:1')).toBe('main:chunk-a:runtime:1')
    expect(createRuntimeAwareCssHash(undefined, sourceHash, 'runtime:1')).toBe('source:old-utilities:runtime:1')
    expect(createRuntimeAwareCssHash(undefined, sourceHash, 'runtime:2')).toBe('source:old-utilities:runtime:2')
  })
})
