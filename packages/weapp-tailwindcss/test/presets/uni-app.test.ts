import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { uniApp } from '@/presets'
import { setupEnvSandbox } from './helpers'

describe('uni-app preset', () => {
  const env = setupEnvSandbox()
  const originalUniPlatform = process.env.UNI_PLATFORM

  afterEach(() => {
    env.restore()
    if (originalUniPlatform === undefined) {
      delete process.env.UNI_PLATFORM
    }
    else {
      process.env.UNI_PLATFORM = originalUniPlatform
    }
    vi.restoreAllMocks()
  })

  it('prefills uni-app vite defaults', () => {
    env.clearBaseEnv()
    process.env.UNI_INPUT_DIR = '/Users/foo/uni-app'
    const result = uniApp({
      cssEntries: 'src/tailwind.css',
    })

    // 环境变量中的绝对路径经 path.normalize 返回平台原生格式
    expect(result.tailwindcssBasedir).toBe(path.normalize('/Users/foo/uni-app'))
    expect(result.tailwindcss?.v4?.cssEntries).toEqual(['src/tailwind.css'])
    expect(result.tailwindcss?.version).toBe(4)
  })

  it('disables plugin for h5/app targets by default', () => {
    env.clearBaseEnv()
    process.env.UNI_PLATFORM = 'h5'
    const result = uniApp({
      base: '/Users/foo/uni-app',
    })

    expect(result.disabled).toBe(true)
  })
})
