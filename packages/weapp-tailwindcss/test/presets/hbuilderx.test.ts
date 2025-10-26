import { afterEach, describe, expect, it, vi } from 'vitest'

import { hbuilderx } from '@/presets'

describe('hbuilderx preset', () => {
  const originalPWD = process.env.PWD
  const originalInitCwd = process.env.INIT_CWD
  const baseEnvKeys = [
    'WEAPP_TAILWINDCSS_BASEDIR',
    'WEAPP_TAILWINDCSS_BASE_DIR',
    'TAILWINDCSS_BASEDIR',
    'TAILWINDCSS_BASE_DIR',
    'UNI_INPUT_DIR',
    'UNI_INPUT_ROOT',
    'UNI_CLI_ROOT',
    'UNI_APP_INPUT_DIR',
  ] as const
  const originalEnvValues = new Map<string, string | undefined>(baseEnvKeys.map(key => [key, process.env[key]]))

  function clearBaseEnv() {
    for (const key of baseEnvKeys) {
      delete process.env[key]
    }
  }

  afterEach(() => {
    clearBaseEnv()
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
    for (const key of baseEnvKeys) {
      const value = originalEnvValues.get(key)
      if (value === undefined) {
        delete process.env[key]
      }
      else {
        process.env[key] = value
      }
    }
    vi.restoreAllMocks()
  })

  it('fills base configuration using environment fallback', () => {
    clearBaseEnv()
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
    clearBaseEnv()
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
