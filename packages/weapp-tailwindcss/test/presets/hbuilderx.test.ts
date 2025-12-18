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

    expect(result.tailwindcssBasedir).toBe('/Users/foo/uni-project')
    expect(result.tailwindcss?.v3?.cwd).toBe('/Users/foo/uni-project')
    expect(result.tailwindcss?.v4?.base).toBe('/Users/foo/uni-project')
    expect(result.tailwindcss?.v4?.cssEntries).toEqual(['tailwind.css'])
    expect(result.tailwindcss?.version).toBe(4)
    expect(result.tailwindcssPatcherOptions?.cwd).toBe('/Users/foo/uni-project')
    expect(result.tailwindcssPatcherOptions?.tailwind?.v4?.base).toBe('/Users/foo/uni-project')
  })

  it('resolves relative base against overridden working directory hints', () => {
    env.clearBaseEnv()
    process.env.PWD = '/Applications/HBuilderX.app/Contents/HBuilderX'
    process.env.INIT_CWD = '/Applications/HBuilderX.app/Contents/HBuilderX'
    const result = hbuilderx({
      base: './',
      cssEntries: ['tailwind.css'],
    })

    expect(result.tailwindcssBasedir).toBe('/Applications/HBuilderX.app/Contents/HBuilderX')
    expect(result.tailwindcss?.v4?.cssEntries).toEqual(['tailwind.css'])
    expect(result.tailwindcssPatcherOptions?.tailwind?.v3?.cwd).toBe('/Applications/HBuilderX.app/Contents/HBuilderX')
  })
})
