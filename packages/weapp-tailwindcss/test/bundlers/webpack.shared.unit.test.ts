import { describe, expect, it } from 'vitest'
import { createAssetHashByChunkMap } from '@/bundlers/webpack/BaseUnifiedPlugin/shared'

describe('bundlers/webpack shared helpers', () => {
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
    ]

    const result = createAssetHashByChunkMap(chunks)

    expect(result.get('app.js')).toBe('main:hash-main|vendor:hash-vendor')
    expect(result.get('app.wxss')).toBe('main:hash-main')
    expect(result.has('noop.js')).toBe(false)
  })
})
