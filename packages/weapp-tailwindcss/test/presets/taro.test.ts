import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { taro } from '@/presets/taro'
import { setupEnvSandbox } from './helpers'

describe('taro preset', () => {
  const env = setupEnvSandbox()

  afterEach(() => {
    env.restore()
    vi.restoreAllMocks()
  })

  it('sets taro defaults and resolves cwd', () => {
    env.clearBaseEnv()
    process.env.PWD = '/Users/foo/taro-app'
    process.env.INIT_CWD = '/Users/foo/taro-app'
    const result = taro({
      base: '.',
      cssEntries: ['src/app.css'],
    })

    // 相对 base 基于 INIT_CWD resolve，Windows 下会带盘符
    expect(result.tailwindcssBasedir).toBe(path.resolve('/Users/foo/taro-app', '.'))
    expect(result.tailwindcss?.v4?.cssEntries).toEqual(['src/app.css'])
    expect(result.tailwindcss?.version).toBe(4)
  })
})
