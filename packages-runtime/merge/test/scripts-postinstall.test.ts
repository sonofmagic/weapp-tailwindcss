import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const scriptPath = path.resolve(testDir, '../scripts/postinstall.mjs')
const scriptUrl = pathToFileURL(scriptPath).href
const esmBundlePath = path.resolve(testDir, '../dist/postinstall.js')
const cjsBundlePath = path.resolve(testDir, '../dist/postinstall.cjs')

interface Logger {
  log: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}

interface RunOptions {
  existsSync?: (file: string) => boolean
  loadEsm?: (file: string) => Promise<unknown>
  loadCjs?: (file: string) => unknown | Promise<unknown>
  logger?: Logger
}

const originalExitCode = process.exitCode

async function runWithOptions(options?: RunOptions) {
  const { run } = await import(scriptUrl) as { run: (options?: RunOptions) => Promise<void> }
  await run(options)
}

beforeEach(() => {
  process.exitCode = undefined
})

afterEach(() => {
  vi.restoreAllMocks()
  process.exitCode = originalExitCode
})

describe('postinstall bootstrap script', () => {
  it('prefers the ESM bundle when available', async () => {
    const existsSync = vi.fn((file: string) => file === esmBundlePath)
    const loadEsm = vi.fn(async () => {})
    const loadCjs = vi.fn()
    const logger = { log: vi.fn(), error: vi.fn() }

    await runWithOptions({ existsSync, loadEsm, loadCjs, logger })

    expect(loadEsm).toHaveBeenCalledWith(esmBundlePath)
    expect(loadCjs).not.toHaveBeenCalled()
    expect(logger.log).not.toHaveBeenCalled()
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('falls back to the CJS bundle when ESM is unavailable', async () => {
    const existsSync = vi.fn((file: string) => file === cjsBundlePath)
    const loadEsm = vi.fn()
    const loadCjs = vi.fn(async () => {})
    const logger = { log: vi.fn(), error: vi.fn() }

    await runWithOptions({ existsSync, loadEsm, loadCjs, logger })

    expect(loadEsm).not.toHaveBeenCalled()
    expect(loadCjs).toHaveBeenCalledWith(cjsBundlePath)
    expect(logger.log).not.toHaveBeenCalled()
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('logs when no bundle is present', async () => {
    const existsSync = vi.fn(() => false)
    const loadEsm = vi.fn()
    const loadCjs = vi.fn()
    const logger = { log: vi.fn(), error: vi.fn() }

    await runWithOptions({ existsSync, loadEsm, loadCjs, logger })

    expect(loadEsm).not.toHaveBeenCalled()
    expect(loadCjs).not.toHaveBeenCalled()
    expect(logger.log).toHaveBeenCalledWith('postinstall bundle not found')
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('reports errors when both bundle loads fail', async () => {
    const existsSync = vi.fn((file: string) => file === esmBundlePath || file === cjsBundlePath)
    const esmError = new Error('esm failed')
    const cjsError = new Error('cjs failed')
    const loadEsm = vi.fn(async () => {
      throw esmError
    })
    const loadCjs = vi.fn(async () => {
      throw cjsError
    })
    const logger = { log: vi.fn(), error: vi.fn() }

    await runWithOptions({ existsSync, loadEsm, loadCjs, logger })

    expect(loadEsm).toHaveBeenCalledWith(esmBundlePath)
    expect(loadCjs).toHaveBeenCalledWith(cjsBundlePath)
    expect(logger.error).toHaveBeenCalledWith('Failed to load postinstall bundle.')
    expect(logger.error).toHaveBeenCalledWith(esmError)
    expect(logger.error).toHaveBeenCalledWith(cjsError)
    expect(process.exitCode).toBe(1)
    expect(logger.log).not.toHaveBeenCalled()
  })
})
