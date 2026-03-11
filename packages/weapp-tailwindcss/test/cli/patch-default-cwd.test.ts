import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resolvePatchDefaultCwd } from '../../src/cli/helpers'
import { findWorkspaceRoot } from '../../src/context/workspace'
import { getTailwindcssPackageInfo } from '../../src/tailwindcss'

vi.mock('../../src/tailwindcss', () => ({
  getTailwindcssPackageInfo: vi.fn(),
}))

vi.mock('../../src/context/workspace', () => ({
  findWorkspaceRoot: vi.fn(),
}))

const ENV_KEYS = ['WEAPP_TW_PATCH_CWD', 'INIT_CWD', 'npm_config_local_prefix'] as const
type EnvKey = typeof ENV_KEYS[number]

let envSnapshot: Record<EnvKey, string | undefined>
const mockedFindWorkspaceRoot = vi.mocked(findWorkspaceRoot)
const mockedGetTailwindcssPackageInfo = vi.mocked(getTailwindcssPackageInfo)
function mockedTailwindInfo(rootPath: string) {
  return {
    name: 'tailwindcss',
    version: '3.4.0',
    rootPath,
    packageJsonPath: path.join(rootPath, 'package.json'),
    packageJson: {},
  }
}

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
  vi.resetAllMocks()
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

  it('prefers workspace package directory when tailwindcss is installed locally', () => {
    const cwd = '/monorepo/packages/app'
    process.env.INIT_CWD = '/monorepo'
    mockedFindWorkspaceRoot.mockReturnValue(path.normalize('/monorepo'))
    mockedGetTailwindcssPackageInfo.mockImplementation(({ paths }) => {
      // Windows 下传入的 paths 已经过 path.normalize，需统一格式比较
      if (paths?.some((p: string) => path.normalize(p) === path.normalize(cwd))) {
        return mockedTailwindInfo(path.normalize(cwd))
      }
      return undefined
    })

    expect(resolvePatchDefaultCwd(cwd)).toBe(path.normalize(cwd))
  })

  it('falls back to workspace root when tailwindcss is hoisted', () => {
    const cwd = '/monorepo/packages/app'
    const workspaceRoot = '/monorepo'
    process.env.INIT_CWD = workspaceRoot
    mockedFindWorkspaceRoot.mockReturnValue(path.normalize(workspaceRoot))
    mockedGetTailwindcssPackageInfo.mockImplementation(({ paths }) => {
      // Windows 下传入的 paths 已经过 path.normalize，需统一格式比较
      if (paths?.some((p: string) => path.normalize(p) === path.normalize(workspaceRoot))) {
        return mockedTailwindInfo(path.normalize(workspaceRoot))
      }
      return undefined
    })

    expect(resolvePatchDefaultCwd(cwd)).toBe(path.normalize(workspaceRoot))
  })
})
