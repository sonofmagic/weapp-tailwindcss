import { afterEach, describe, expect, it, vi } from 'vitest'

import { taro } from '@/presets'
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

    expect(result.tailwindcssBasedir).toBe('/Users/foo/taro-app')
    expect(result.tailwindcss?.v4?.cssEntries).toEqual(['src/app.css'])
    expect(result.tailwindcss?.version).toBe(4)
  })
})
