import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { resolvePatchDefaultCwd } from '../../src/cli/helpers'

const ENV_KEYS = ['WEAPP_TW_PATCH_CWD', 'INIT_CWD', 'npm_config_local_prefix'] as const
type EnvKey = typeof ENV_KEYS[number]

let envSnapshot: Record<EnvKey, string | undefined>

beforeEach(() => {
  envSnapshot = {} as Record<EnvKey, string | undefined>
  for (const key of ENV_KEYS) {
    envSnapshot[key] = process.env[key]
    delete process.env[key]
  }
})

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = envSnapshot[key]
    if (value === undefined) {
      delete process.env[key]
    }
    else {
      process.env[key] = value
    }
  }
})

describe('resolvePatchDefaultCwd', () => {
  it('prefers WEAPP_TW_PATCH_CWD over INIT_CWD and npm_config_local_prefix', () => {
    process.env.WEAPP_TW_PATCH_CWD = '/abs/custom'
    process.env.INIT_CWD = '/abs/init'
    process.env.npm_config_local_prefix = '/abs/local'

    expect(resolvePatchDefaultCwd('/workspace')).toBe(path.normalize('/abs/custom'))
  })

  it('falls back to INIT_CWD when WEAPP_TW_PATCH_CWD is missing', () => {
    process.env.INIT_CWD = '/abs/init'
    process.env.npm_config_local_prefix = '/abs/local'

    expect(resolvePatchDefaultCwd('/workspace')).toBe(path.normalize('/abs/init'))
  })

  it('uses npm_config_local_prefix when higher priority envs are absent', () => {
    process.env.npm_config_local_prefix = '/abs/local'

    expect(resolvePatchDefaultCwd('/workspace')).toBe(path.normalize('/abs/local'))
  })

  it('resolves relative env path against current working directory', () => {
    process.env.WEAPP_TW_PATCH_CWD = 'relative/path'
    const cwd = '/workspace/app'

    expect(resolvePatchDefaultCwd(cwd)).toBe(path.resolve(cwd, 'relative/path'))
  })

  it('falls back to current working directory when no env is set', () => {
    const cwd = '/workspace/fallback'

    expect(resolvePatchDefaultCwd(cwd)).toBe(path.normalize(cwd))
  })
})
