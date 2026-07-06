import path from 'node:path'
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resolveTailwindcssBasedir } from '@/context/tailwindcss/basedir'
import { logger } from '@/logger'

const ENV_KEYS = [
  'WEAPP_TAILWINDCSS_BASEDIR',
  'WEAPP_TAILWINDCSS_BASE_DIR',
  'TAILWINDCSS_BASEDIR',
  'TAILWINDCSS_BASE_DIR',
  'UNI_INPUT_DIR',
  'UNI_INPUT_ROOT',
  'UNI_CLI_ROOT',
  'UNI_APP_INPUT_DIR',
  'INIT_CWD',
  'PWD',
  'npm_package_json',
  'npm_config_local_prefix',
  'PNPM_PACKAGE_NAME',
  'WEAPP_TW_DEBUG_STACK',
]

describe('resolveTailwindcssBasedir', () => {
  const originalEnv = { ...process.env }
  const createdDirs: string[] = []

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      delete process.env[key]
    }
    vi.spyOn(logger, 'debug').mockImplementation(() => undefined)
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
    return Promise.all(createdDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
  })

  it('resolves explicit and environment basedirs', () => {
    process.env.WEAPP_TAILWINDCSS_BASEDIR = '/env/root'
    expect(resolveTailwindcssBasedir('src')).toBe(path.normalize('/env/root/src'))
    expect(resolveTailwindcssBasedir()).toBe(path.normalize('/env/root'))

    delete process.env.WEAPP_TAILWINDCSS_BASEDIR
    process.env.npm_package_json = '/pkg/package.json'
    expect(resolveTailwindcssBasedir()).toBe(path.normalize('/pkg'))

    delete process.env.npm_package_json
    process.env.npm_config_local_prefix = '/prefix'
    expect(resolveTailwindcssBasedir()).toBe(path.normalize('/prefix'))
  })

  it('uses fallback before package and generic env basedirs', () => {
    process.env.INIT_CWD = '/init'
    expect(resolveTailwindcssBasedir(undefined, 'fallback')).toBe(path.normalize('/init/fallback'))
    expect(resolveTailwindcssBasedir('/absolute')).toBe(path.normalize('/absolute'))
  })

  it('ignores relative environment package hints and resolves generic env as a final fallback', () => {
    process.env.npm_package_json = 'relative/package.json'
    process.env.npm_config_local_prefix = 'relative-prefix'
    process.env.PWD = '/generic'

    expect(resolveTailwindcssBasedir()).toBe(path.normalize('/generic'))
  })

  it('logs debug details and falls back to cwd when package lookup fails', () => {
    process.env.PNPM_PACKAGE_NAME = '@missing/package'
    process.env.WEAPP_TW_DEBUG_STACK = '1'

    const resolved = resolveTailwindcssBasedir()

    expect(path.isAbsolute(resolved)).toBe(true)
    expect(logger.debug).toHaveBeenCalled()
  })

  it('resolves PNPM package basedir through package resolution and workspace fallback', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-basedir-pnpm-'))
    createdDirs.push(root)
    const nodeModulePackageDir = path.join(root, 'node_modules/@scope/pkg')
    await mkdir(nodeModulePackageDir, { recursive: true })
    await writeFile(path.join(nodeModulePackageDir, 'package.json'), JSON.stringify({
      name: '@scope/pkg',
      version: '0.0.0-test',
    }))
    process.env.INIT_CWD = root
    process.env.PNPM_PACKAGE_NAME = '@scope/pkg'
    process.env.WEAPP_TW_DEBUG_STACK = '1'

    const realNodeModulePackageDir = await realpath(nodeModulePackageDir)
    expect(resolveTailwindcssBasedir()).toBe(path.normalize(realNodeModulePackageDir))
    expect(logger.debug).toHaveBeenCalledWith(
      'package basedir resolved from PNPM_PACKAGE_NAME: %s',
      path.join(realNodeModulePackageDir, 'package.json'),
    )

    const workspaceRoot = await mkdtemp(path.join(tmpdir(), 'weapp-tw-basedir-workspace-'))
    createdDirs.push(workspaceRoot)
    const workspacePackageDir = path.join(workspaceRoot, 'packages/pkg')
    await mkdir(workspacePackageDir, { recursive: true })
    await writeFile(path.join(workspaceRoot, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n')
    await writeFile(path.join(workspacePackageDir, 'package.json'), JSON.stringify({
      name: '@scope/workspace-pkg',
      version: '0.0.0-test',
    }))
    process.env.INIT_CWD = workspaceRoot
    process.env.PNPM_PACKAGE_NAME = '@scope/workspace-pkg'

    expect(resolveTailwindcssBasedir()).toBe(path.normalize(workspacePackageDir))
  })
})
