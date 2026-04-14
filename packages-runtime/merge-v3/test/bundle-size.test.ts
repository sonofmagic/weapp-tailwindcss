import { statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('bundle size (merge-v3)', () => {
  const distDir = resolve(__dirname, '../dist')

  it('lite entry 应小于 15KB', () => {
    const size = statSync(resolve(distDir, 'lite.mjs')).size
    expect(size).toBeLessThan(15 * 1024)
  })

  it('slim entry 应小于 45KB', () => {
    const size = statSync(resolve(distDir, 'slim.mjs')).size
    expect(size).toBeLessThan(45 * 1024)
  })
})
