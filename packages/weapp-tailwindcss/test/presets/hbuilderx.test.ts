import { afterEach, describe, expect, it, vi } from 'vitest'

import { hbuilderx } from '@/presets'

describe('hbuilderx preset', () => {
  const originalPWD = process.env.PWD
  const originalInitCwd = process.env.INIT_CWD

  afterEach(() => {
    delete process.env.UNI_INPUT_DIR
    if (originalPWD !== undefined) {
      process.env.PWD = originalPWD
    }
    else {
      delete process.env.PWD
    }
    if (originalInitCwd !== undefined) {
      process.env.INIT_CWD = originalInitCwd
    }
    else {
      delete process.env.INIT_CWD
    }
    vi.restoreAllMocks()
  })

  it('fills base configuration using environment fallback', () => {
    process.env.UNI_INPUT_DIR = '/Users/foo/uni-project'
    const result = hbuilderx({
      cssEntries: 'tailwind.css',
    })

    expect(result.tailwindcssBasedir).toBe('/Users/foo/uni-project')
    expect(result.tailwindcss?.v3?.cwd).toBe('/Users/foo/uni-project')
    expect(result.tailwindcss?.v4?.base).toBe('/Users/foo/uni-project')
    expect(result.tailwindcss?.v4?.cssEntries).toEqual(['tailwind.css'])
    expect(result.tailwindcss?.version).toBe(4)
    expect(result.tailwindcssPatcherOptions?.patch?.basedir).toBe('/Users/foo/uni-project')
    expect(result.tailwindcssPatcherOptions?.patch?.cwd).toBe('/Users/foo/uni-project')
    expect(result.tailwindcssPatcherOptions?.patch?.tailwindcss?.v4?.base).toBe('/Users/foo/uni-project')
  })

  it('resolves relative base against overridden working directory hints', () => {
    process.env.PWD = '/Applications/HBuilderX.app/Contents/HBuilderX'
    process.env.INIT_CWD = '/Applications/HBuilderX.app/Contents/HBuilderX'
    const result = hbuilderx({
      base: './',
      cssEntries: ['tailwind.css'],
    })

    expect(result.tailwindcssBasedir).toBe('/Applications/HBuilderX.app/Contents/HBuilderX')
    expect(result.tailwindcss?.v4?.cssEntries).toEqual(['tailwind.css'])
    expect(result.tailwindcssPatcherOptions?.patch?.tailwindcss?.v3?.cwd).toBe('/Applications/HBuilderX.app/Contents/HBuilderX')
  })
})
