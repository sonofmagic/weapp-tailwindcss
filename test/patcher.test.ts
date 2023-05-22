import fs from 'node:fs'
import { mkCacheDirectory } from '@/tailwindcss/patcher'

describe('patcher unit test', () => {
  it('if will create cache directory', () => {
    const p = mkCacheDirectory()
    expect(fs.existsSync(p)).toBe(true)
  })
})
