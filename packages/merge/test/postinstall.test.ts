import { Buffer } from 'node:buffer'
import path from 'node:path'
import process from 'node:process'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type MockedFiles = Map<string, Buffer>

function normalizePath(value: string): string {
  return path.normalize(value).replace(/\\+/g, '/')
}

const directories = new Set<string>()
let files: MockedFiles

const fsMock = {
  existsSync: vi.fn((pathname: string) => {
    const normalized = normalizePath(pathname)
    return directories.has(normalized) || files.has(normalized)
  }),
  readFileSync: vi.fn((pathname: string) => {
    const normalized = normalizePath(pathname)
    const content = files.get(normalized)
    if (!content) {
      const error = new Error(`ENOENT: ${normalized}`)
      // @ts-expect-error decorate diagnostic code
      error.code = 'ENOENT'
      throw error
    }
    return Buffer.from(content)
  }),
  writeFileSync: vi.fn((pathname: string, data: string | NodeJS.ArrayBufferView) => {
    const normalized = normalizePath(pathname)
    const buffer = Buffer.isBuffer(data)
      ? Buffer.from(data)
      : Buffer.from(data instanceof Uint8Array ? data : String(data))
    files.set(normalized, buffer)
  }),
}

const getPackageInfoSyncMock = vi.fn()
const satisfiesMock = vi.fn()

vi.mock('node:fs', () => ({
  default: fsMock,
  ...fsMock,
}))

vi.mock('local-pkg', () => ({
  getPackageInfoSync: getPackageInfoSyncMock,
}))

vi.mock('semver/functions/satisfies.js', () => ({
  default: satisfiesMock,
}))

async function runPostinstall() {
  await import('@/postinstall')
}

const distDir = normalizePath(path.resolve(__dirname, '../dist'))

function setFile(relativePath: string, content: string) {
  files.set(normalizePath(path.join(distDir, relativePath)), Buffer.from(content))
}

function setFileBuffer(relativePath: string, content: Buffer | undefined) {
  if (!content) {
    return
  }
  files.set(normalizePath(path.join(distDir, relativePath)), Buffer.from(content))
}

function getFile(relativePath: string): Buffer | undefined {
  return files.get(normalizePath(path.join(distDir, relativePath)))
}

function seedRuntimeFiles() {
  const variants = ['v3', 'v4'] as const
  const extensions = ['cjs', 'd.cts', 'd.ts', 'js'] as const

  for (const variant of variants) {
    for (const ext of extensions) {
      setFile(`${variant}.${ext}`, `${variant}-${ext}-content`)
    }
  }

  for (const ext of extensions) {
    setFile(`index.${ext}`, `index-${ext}-initial`)
  }
}

describe('postinstall script', () => {
  let stdoutWriteSpy: ReturnType<typeof vi.spyOn>
  let stderrWriteSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.resetModules()
    files = new Map<string, Buffer>()
    directories.clear()
    directories.add(distDir)
    fsMock.existsSync.mockClear()
    fsMock.readFileSync.mockClear()
    fsMock.writeFileSync.mockClear()
    getPackageInfoSyncMock.mockReset()
    satisfiesMock.mockReset()
    stdoutWriteSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    stderrWriteSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
    process.env.WEAPP_TW_MERGE_TARGET_VERSION = undefined
    process.env.WEAPP_TW_MERGE_FORCE_VERSION = undefined
    process.env.WEAPP_TW_MERGE_DISABLE_FALLBACK = undefined
    process.env.WEAPP_TW_MERGE_NO_FALLBACK = undefined
    process.env.WEAPP_TW_MERGE_STRICT = undefined
    process.env.WEAPP_TW_MERGE_RESOLVE_ROOT = undefined
    process.env.INIT_CWD = '/test-project'
    process.exitCode = undefined
    seedRuntimeFiles()
  })

  afterEach(() => {
    stdoutWriteSpy.mockRestore()
    stderrWriteSpy.mockRestore()
  })

  it('skips when dist directory does not exist', async () => {
    directories.delete(distDir)

    await runPostinstall()

    expect(stderrWriteSpy).toHaveBeenCalledWith(expect.stringContaining('dist directory not found'))
    expect(getPackageInfoSyncMock).not.toHaveBeenCalled()
    expect(fsMock.writeFileSync).not.toHaveBeenCalled()
  })

  it('falls back to v4 runtime when tailwindcss package is missing', async () => {
    getPackageInfoSyncMock.mockReturnValue(undefined)

    await runPostinstall()

    expect(stderrWriteSpy).toHaveBeenCalledWith(expect.stringContaining('tailwindcss not found'))
    expect(stdoutWriteSpy).toHaveBeenCalledWith(expect.stringContaining('Fallback to tailwind-merge@3 runtime'))

    for (const ext of ['cjs', 'd.cts', 'd.ts', 'js']) {
      expect(getFile(`index.${ext}`)?.equals(getFile(`v4.${ext}`) ?? Buffer.alloc(0))).toBe(true)
    }
  })

  it('switches to v3 runtime for Tailwind CSS v3 projects', async () => {
    getPackageInfoSyncMock.mockImplementation((_name, options) => {
      if (options?.paths?.[0] === '/test-project') {
        return {
          version: '3.4.0',
          rootPath: '/test-project',
        }
      }
      return undefined
    })
    satisfiesMock.mockReturnValue(false)

    await runPostinstall()

    expect(satisfiesMock).toHaveBeenCalledWith('3.4.0', '^4.0.0-0')
    expect(stdoutWriteSpy).toHaveBeenCalledWith(expect.stringContaining('tailwindcss@3.4.0'))

    for (const ext of ['cjs', 'd.cts', 'd.ts', 'js']) {
      expect(getFile(`index.${ext}`)?.equals(getFile(`v3.${ext}`) ?? Buffer.alloc(0))).toBe(true)
    }
  })

  it('switches to v4 runtime for Tailwind CSS v4 projects', async () => {
    getPackageInfoSyncMock.mockImplementation((_name, options) => {
      if (options?.paths?.[0] === '/test-project') {
        return {
          version: '4.0.1',
          rootPath: '/test-project',
        }
      }
      return undefined
    })
    satisfiesMock.mockReturnValue(true)

    await runPostinstall()

    expect(satisfiesMock).toHaveBeenCalledWith('4.0.1', '^4.0.0-0')
    expect(stdoutWriteSpy).toHaveBeenCalledWith(expect.stringContaining('tailwindcss@4.0.1'))

    for (const ext of ['cjs', 'd.cts', 'd.ts', 'js']) {
      expect(getFile(`index.${ext}`)?.equals(getFile(`v4.${ext}`) ?? Buffer.alloc(0))).toBe(true)
    }
  })

  it('permits forcing a specific runtime through environment variable', async () => {
    process.env.WEAPP_TW_MERGE_TARGET_VERSION = 'v3'
    getPackageInfoSyncMock.mockReturnValue({ version: '4.0.1', rootPath: '/other' })
    satisfiesMock.mockReturnValue(true)

    await runPostinstall()

    expect(stderrWriteSpy).not.toHaveBeenCalledWith(expect.stringContaining('Unknown runtime variant'))
    expect(stdoutWriteSpy).toHaveBeenCalledWith(expect.stringContaining('forced by environment'))

    for (const ext of ['cjs', 'd.cts', 'd.ts', 'js']) {
      expect(getFile(`index.${ext}`)?.equals(getFile(`v3.${ext}`) ?? Buffer.alloc(0))).toBe(true)
    }
  })

  it('does not rewrite files when they already match the requested runtime', async () => {
    getPackageInfoSyncMock.mockReturnValue({ version: '4.0.1', rootPath: '/test-project' })
    satisfiesMock.mockReturnValue(true)

    for (const ext of ['cjs', 'd.cts', 'd.ts', 'js']) {
      setFileBuffer(`index.${ext}`, getFile(`v4.${ext}`))
    }

    await runPostinstall()

    expect(fsMock.writeFileSync).not.toHaveBeenCalled()
    expect(stdoutWriteSpy).toHaveBeenCalledWith(expect.stringContaining('Entry files already match'))
  })

  it('skips applying fallback when disabled explicitly', async () => {
    process.env.WEAPP_TW_MERGE_DISABLE_FALLBACK = '1'
    getPackageInfoSyncMock.mockReturnValue(undefined)

    await runPostinstall()

    expect(stderrWriteSpy).toHaveBeenCalledWith(expect.stringContaining('tailwindcss not found'))
    expect(stderrWriteSpy).toHaveBeenCalledWith(expect.stringContaining('Fallback is disabled'))
    expect(fsMock.writeFileSync).not.toHaveBeenCalled()
  })

  it('marks installation as failed in strict mode when switching runtime throws', async () => {
    getPackageInfoSyncMock.mockImplementation((_name, options) => {
      if (options?.paths?.[0] === '/test-project') {
        return {
          version: '3.4.0',
          rootPath: '/test-project',
        }
      }
      return undefined
    })
    satisfiesMock.mockReturnValue(false)
    process.env.WEAPP_TW_MERGE_STRICT = 'true'

    fsMock.writeFileSync.mockImplementationOnce(() => {
      throw new Error('write failed')
    })

    await runPostinstall()

    expect(stderrWriteSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to switch runtime to v3. write failed'))
    expect(process.exitCode).toBe(1)
  })
})
