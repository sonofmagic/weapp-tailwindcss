import { mkCacheDirectory } from '@/tailwindcss/patcher'
import fs from 'fs'

describe('patcher unit test', () => {
  it('if will create cache directory', () => {
    const p = mkCacheDirectory()
    expect(fs.existsSync(p)).toBe(true)
  })
})
