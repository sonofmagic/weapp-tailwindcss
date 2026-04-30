import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const {
  isMissingRuntimeModuleOutput,
  resolvePostinstallPatchExitCode,
} = await import('../../scripts/postinstall.mjs')

const packageRoot = path.resolve(__dirname, '../..')
const binPath = path.join(packageRoot, 'bin/weapp-tailwindcss.js')
const distCliPath = path.join(packageRoot, 'dist/cli.js')

function createMissingModulePreload() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'weapp-tw-bin-'))
  const preloadPath = path.join(tempDir, 'preload.cjs')
  fs.writeFileSync(preloadPath, `
const Module = require('node:module')
const originalLoad = Module._load
Module._load = function patchedLoad(request, parent, isMain) {
  const resolved = Module._resolveFilename(request, parent, isMain)
  if (resolved === ${JSON.stringify(distCliPath)}) {
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
