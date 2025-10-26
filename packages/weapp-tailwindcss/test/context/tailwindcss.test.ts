import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const originalEnv = process.env

describe('resolveTailwindcssBasedir', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    vi.resetModules()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('prefers npm_package_json directory when available', async () => {
    process.env.npm_package_json = '/workspace/apps/vite-native-skyline/package.json'

    const { resolveTailwindcssBasedir } = await import('@/context/tailwindcss')

    expect(resolveTailwindcssBasedir()).toBe(path.normalize('/workspace/apps/vite-native-skyline'))
  })
})
