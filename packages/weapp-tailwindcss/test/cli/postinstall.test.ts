import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

const {
  isMissingRuntimeModuleOutput,
  resolvePostinstallPatchExitCode,
} = await import('../../scripts/postinstall.mjs')

const packageRoot = path.resolve(__dirname, '../..')
const binPath = path.join(packageRoot, 'bin/weapp-tailwindcss.js')

function createMissingModulePreload() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'weapp-tw-bin-'))
  const preloadPath = path.join(tempDir, 'preload.cjs')
  fs.writeFileSync(preloadPath, `
const Module = require('node:module')
const originalLoad = Module._load
Module._load = function patchedLoad(request, parent, isMain) {
  if (String(request).replace(/\\\\/g, '/').endsWith('/dist/cli.js')) {
    const error = new Error("Cannot find module 'postcss-units-to-px'")
    error.code = 'MODULE_NOT_FOUND'
    throw error
  }
  const resolved = Module._resolveFilename(request, parent, isMain)
  if (resolved.replace(/\\\\/g, '/').endsWith('/dist/cli.js')) {
    const error = new Error("Cannot find module 'postcss-units-to-px'")
    error.code = 'MODULE_NOT_FOUND'
    throw error
  }
  return originalLoad.apply(this, arguments)
}
`)
  return {
    cleanup: () => fs.rmSync(tempDir, { force: true, recursive: true }),
    preloadPath,
  }
}

describe('postinstall patch script', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
    vi.doUnmock('node:child_process')
  })

  it('skips missing runtime module failures during install', () => {
    const stderr = "Error: Cannot find module 'postcss-units-to-px'\ncode: 'MODULE_NOT_FOUND'"
    const result = resolvePostinstallPatchExitCode({
      status: 1,
      stdout: '',
      stderr,
    })

    expect(isMissingRuntimeModuleOutput(stderr)).toBe(true)
    expect(result.code).toBe(0)
    expect(result.message).toContain('runtime module is missing')
  })

  it('keeps non module failures strict', () => {
    expect(resolvePostinstallPatchExitCode({
      status: 1,
      stdout: '',
      stderr: 'patch failed',
    }).code).toBe(1)
  })

  it('returns a successful skip result when spawn reports an execution error', () => {
    expect(resolvePostinstallPatchExitCode({
      error: new Error('spawn failed'),
    }).code).toBe(0)
    expect(resolvePostinstallPatchExitCode({
      error: new Error('spawn failed'),
    }).message).toContain('spawn failed')
  })

  it('runs the patch command and forwards output streams', async () => {
    const stdoutWrite = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const stderrWrite = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
    const spawnSyncMock = vi.fn(() => ({
      status: 1,
      stdout: 'out',
      stderr: "Cannot find module 'postcss-units-to-px'",
    }))

    vi.resetModules()
    vi.doMock('node:child_process', () => ({
      spawnSync: spawnSyncMock,
    }))

    const { runPostinstallPatch } = await import('../../scripts/postinstall.mjs')
    const previousExitCode = process.exitCode

    try {
      runPostinstallPatch()

      expect(spawnSyncMock).toHaveBeenCalledTimes(1)
      const [command, args, options] = spawnSyncMock.mock.calls[0]
      expect(command).toBe(process.execPath)
      expect(args).toEqual([binPath, 'patch'])
      expect(options).toEqual({ encoding: 'utf8' })
      expect(stdoutWrite).toHaveBeenCalledWith('out')
      expect(stderrWrite).toHaveBeenCalledWith("Cannot find module 'postcss-units-to-px'")
      expect(stderrWrite).toHaveBeenCalledWith(expect.stringContaining('runtime module is missing'))
      expect(process.exitCode).toBe(0)
    }
    finally {
      process.exitCode = previousExitCode
    }
  })


  it('lets bin skip missing module failures only during install lifecycle', () => {
    const preload = createMissingModulePreload()
    try {
      const installResult = spawnSync(process.execPath, ['--require', preload.preloadPath, binPath, 'patch'], {
        encoding: 'utf8',
        env: {
          ...process.env,
          npm_lifecycle_event: 'postinstall',
        },
      })

      expect(installResult.status).toBe(0)
      expect(installResult.stderr).toContain('install lifecycle patch skipped')

      const strictResult = spawnSync(process.execPath, ['--require', preload.preloadPath, binPath, 'patch'], {
        encoding: 'utf8',
        env: {
          ...process.env,
          npm_lifecycle_event: '',
        },
      })

      expect(strictResult.status).toBe(1)
      expect(strictResult.stderr).toContain('postcss-units-to-px')
    }
    finally {
      preload.cleanup()
    }
  })
})
