import { statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('bundle size', () => {
  const distDir = resolve(__dirname, '../dist')

  it('lite entry 应小于 20KB', () => {
    const size = statSync(resolve(distDir, 'lite.mjs')).size
    expect(size).toBeLessThan(20 * 1024)
  })

  it('slim entry 应小于 60KB', () => {
    const size = statSync(resolve(distDir, 'slim.mjs')).size
    expect(size).toBeLessThan(60 * 1024)
  })
})
