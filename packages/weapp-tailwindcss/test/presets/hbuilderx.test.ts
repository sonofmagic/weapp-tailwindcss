import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { hbuilderx } from '@/presets/hbuilderx'
import { setupEnvSandbox } from './helpers'

describe('hbuilderx preset', () => {
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

  it('is exported from the public presets entry', async () => {
    const presets = await import('@/presets')

    expect(presets.hbuilderx).toBe(hbuilderx)
  })

  it('fills base configuration using environment fallback', () => {
    env.clearBaseEnv()
    process.env.UNI_INPUT_DIR = '/Users/foo/uni-project'
    const result = hbuilderx({
      cssEntries: 'tailwind.css',
    })

    // 环境变量中的绝对路径经 path.normalize 返回平台原生格式
    expect(result.tailwindcssBasedir).toBe(path.normalize('/Users/foo/uni-project'))
    expect(result.tailwindcss?.v4?.base).toBe(path.normalize('/Users/foo/uni-project'))
    expect(result.tailwindcss?.v4?.cssEntries).toEqual(['tailwind.css'])
    expect(result.tailwindcss?.version).toBe(4)
    expect(result.tailwindcssRuntimeOptions?.projectRoot).toBe(path.normalize('/Users/foo/uni-project'))
    expect(result.tailwindcssRuntimeOptions?.tailwindcss?.v4?.base).toBe(path.normalize('/Users/foo/uni-project'))
  })

  it('resolves relative base against overridden working directory hints', () => {
    env.clearBaseEnv()
    process.env.PWD = '/Applications/HBuilderX.app/Contents/HBuilderX'
    process.env.INIT_CWD = '/Applications/HBuilderX.app/Contents/HBuilderX'
    const result = hbuilderx({
      base: './',
      cssEntries: ['tailwind.css'],
    })

    // 相对 base 基于 INIT_CWD resolve，Windows 下会带盘符
    const expectedBase = path.resolve('/Applications/HBuilderX.app/Contents/HBuilderX', './')
    expect(result.tailwindcssBasedir).toBe(expectedBase)
    expect(result.tailwindcss?.v4?.cssEntries).toEqual(['tailwind.css'])
    expect(result.tailwindcssRuntimeOptions?.projectRoot).toBe(expectedBase)
  })

  it('enables web compatibility for H5 by default', () => {
    env.clearBaseEnv()
    process.env.UNI_PLATFORM = 'h5'
    const result = hbuilderx({
      base: '/Users/foo/uni-project',
      cssEntries: 'tailwind.css',
    })

    expect(result.generator).toMatchObject({
      target: 'web',
      webCompat: true,
    })
  })
})
