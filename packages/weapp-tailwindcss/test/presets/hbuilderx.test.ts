import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { hbuilderx } from '@/presets/hbuilderx'
import { setupEnvSandbox } from './helpers'

describe('hbuilderx preset', () => {
  const env = setupEnvSandbox()

  afterEach(() => {
    env.restore()
    vi.restoreAllMocks()
  })

  it('fills base configuration using environment fallback', () => {
    env.clearBaseEnv()
    process.env.UNI_INPUT_DIR = '/Users/foo/uni-project'
    const result = hbuilderx({
      cssEntries: 'tailwind.css',
    })

    // 环境变量中的绝对路径经 path.normalize 返回平台原生格式
    expect(result.tailwindcssBasedir).toBe(path.normalize('/Users/foo/uni-project'))
    expect(result.tailwindcss?.v3?.cwd).toBe(path.normalize('/Users/foo/uni-project'))
    expect(result.tailwindcss?.v4?.base).toBe(path.normalize('/Users/foo/uni-project'))
    expect(result.tailwindcss?.v4?.cssEntries).toEqual(['tailwind.css'])
    expect(result.tailwindcss?.version).toBe(4)
    expect(result.tailwindcssPatcherOptions?.projectRoot).toBe(path.normalize('/Users/foo/uni-project'))
    expect(result.tailwindcssPatcherOptions?.tailwindcss?.v4?.base).toBe(path.normalize('/Users/foo/uni-project'))
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
    expect(result.tailwindcssPatcherOptions?.tailwindcss?.v3?.cwd).toBe(expectedBase)
  })
})
