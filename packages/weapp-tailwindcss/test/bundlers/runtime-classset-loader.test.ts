import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import loader from '@/bundlers/webpack/loaders/weapp-tw-runtime-classset-loader'

describe('bundlers/runtime classset loader', () => {
  const tempDirs: string[] = []

  afterEach(() => {
    delete process.env.WEAPP_TW_LOADER_DEBUG
    vi.restoreAllMocks()
  })

  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
  })

  it('registers watch files and contexts after runtime set preparation', async () => {
    const addDependency = vi.fn()
    const addContextDependency = vi.fn()
    const getClassSet = vi.fn(async () => {})
    const getWatchDependencies = vi.fn(async () => ({
      files: ['/workspace/src/index.html', '/workspace/tailwind.config.ts'],
      contexts: ['/workspace/src'],
    }))

    const source = '.app {}'
    const result = await loader.call({
      addDependency,
      addContextDependency,
      getOptions: () => ({
        getClassSet,
        getWatchDependencies,
      }),
      resourcePath: '/workspace/src/app.css',
    } as any, source)

    expect(result).toBe(source)
    expect(getClassSet).toHaveBeenCalledTimes(1)
    expect(getWatchDependencies).toHaveBeenCalledTimes(1)
    expect(addDependency).toHaveBeenCalledWith('/workspace/src/index.html')
    expect(addDependency).toHaveBeenCalledWith('/workspace/tailwind.config.ts')
    expect(addContextDependency).toHaveBeenCalledWith('/workspace/src')
  })

  it('supports synchronous class set preparation and dependencies', () => {
    const addDependency = vi.fn()
    const addContextDependency = vi.fn()
    const getClassSet = vi.fn()
    const getWatchDependencies = vi.fn(() => ({
      files: ['/workspace/src/index.wxml'],
      contexts: ['/workspace/src/components'],
    }))

    const source = Buffer.from('.app {}')
    const result = loader.call({
      addDependency,
      addContextDependency,
      getOptions: () => ({
        getClassSet,
        getWatchDependencies,
      }),
      resourcePath: '/workspace/src/app.css',
    } as any, source)

    expect(result).toBe(source)
    expect(getClassSet).toHaveBeenCalledTimes(1)
    expect(getWatchDependencies).toHaveBeenCalledTimes(1)
    expect(addDependency).toHaveBeenCalledWith('/workspace/src/index.wxml')
    expect(addContextDependency).toHaveBeenCalledWith('/workspace/src/components')
  })

  it('registers directory dependencies as webpack context dependencies', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-runtime-loader-'))
    tempDirs.push(tempDir)
    const existingFile = path.join(tempDir, 'tailwind.config.ts')
    const sourceDir = path.join(tempDir, 'src')
    const missingFile = path.join(tempDir, 'missing.html')
    await writeFile(existingFile, 'export default {}', 'utf8')
    await mkdir(sourceDir)

    const addDependency = vi.fn()
    const addMissingDependency = vi.fn()
    const addContextDependency = vi.fn()
    const getClassSet = vi.fn()
    const getWatchDependencies = vi.fn(() => ({
      files: [existingFile, sourceDir, missingFile],
      contexts: [sourceDir],
    }))

    const source = '.app {}'
    loader.call({
      addDependency,
      addMissingDependency,
      addContextDependency,
      getOptions: () => ({
        getClassSet,
        getWatchDependencies,
      }),
      resourcePath: path.join(sourceDir, 'app.css'),
    } as any, source)

    expect(addDependency).toHaveBeenCalledWith(existingFile)
    expect(addDependency).not.toHaveBeenCalledWith(sourceDir)
    expect(addDependency).not.toHaveBeenCalledWith(missingFile)
    expect(addMissingDependency).toHaveBeenCalledWith(missingFile)
    expect(addContextDependency).toHaveBeenCalledWith(sourceDir)
  })

  it('keeps source unchanged when loader options are absent', () => {
    const source = '.app {}'

    expect(loader.call({
      getOptions: () => ({}),
      resourcePath: '/workspace/src/app.css',
    } as any, source)).toBe(source)
  })

  it('registers original resource css instead of transformed loader input', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-runtime-loader-'))
    tempDirs.push(tempDir)
    const sourceFile = path.join(tempDir, 'src/sub-normal/pages/index.css')
    await mkdir(path.dirname(sourceFile), { recursive: true })
    const originalSource = [
      '@import "tailwindcss/base";',
      '@import "tailwindcss/components";',
      '@import "tailwindcss/utilities";',
      '@config "../../../tailwind.config.sub-normal.js";',
    ].join('\n')
    await writeFile(sourceFile, originalSource, 'utf8')
    const transformedSource = '@tailwind base;@tailwind components;@tailwind utilities;@config "../../../tailwind.config.sub-normal.js";'
    const registerCssSourceFile = vi.fn()

    const result = loader.call({
      getOptions: () => ({
        registerCssSourceFile,
      }),
      resourcePath: sourceFile,
    } as any, transformedSource)

    expect(result).toBe(transformedSource)
    expect(registerCssSourceFile).toHaveBeenCalledWith({
      file: sourceFile,
      css: originalSource,
    })
  })

  it('registers loader css input for preprocessor resources', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-runtime-loader-'))
    tempDirs.push(tempDir)
    const sourceFile = path.join(tempDir, 'src/pages/index.scss')
    await mkdir(path.dirname(sourceFile), { recursive: true })
    await writeFile(sourceFile, '.test { @apply text-[#fff] #{!important}; }', 'utf8')
    const loaderCssInput = '.test { @apply text-[#fff] !important; }'
    const registerCssSourceFile = vi.fn()

    const result = loader.call({
      getOptions: () => ({
        registerCssSourceFile,
      }),
      resourcePath: sourceFile,
    } as any, loaderCssInput)

    expect(result).toBe(loaderCssInput)
    expect(registerCssSourceFile).toHaveBeenCalledWith({
      file: sourceFile,
      css: loaderCssInput,
    })
  })

  it('removes cascade layer syntax from runtime css before later webpack processors', () => {
    const source = [
      '@layer theme, base, components, utilities;',
      '@layer utilities {',
      '.text-red-500 { color: red; }',
      '}',
    ].join('\n')

    const result = loader.call({
      getOptions: () => ({}),
      resourcePath: '/workspace/src/app.css',
    } as any, source)

    expect(result).not.toContain('@layer')
    expect(result).toContain('.text-red-500 { color: red; }')
  })

  it('removes cascade layer syntax from buffer runtime css source', () => {
    const source = Buffer.from([
      '@layer utilities {',
      '.text-blue-500 { color: blue; }',
      '}',
    ].join('\n'))

    const result = loader.call({
      getOptions: () => ({}),
      resourcePath: '/workspace/src/app.css',
    } as any, source)

    expect(Buffer.isBuffer(result)).toBe(true)
    expect(result.toString('utf8')).not.toContain('@layer')
    expect(result.toString('utf8')).toContain('.text-blue-500 { color: blue; }')
  })

  it('preserves runtime css declaration order outside cascade layers', () => {
    const source = [
      '@layer utilities {',
      '.i-mdi-abacus {',
      '  width: 1em;',
      '  height: 1em;',
      '  --svg: url("data:image/svg+xml,%3Csvg%3E%3C/svg%3E");',
      '  mask-image: var(--svg);',
      '  background-color: currentColor;',
      '  display: inline-block;',
      '}',
      '}',
    ].join('\n')

    const result = loader.call({
      getOptions: () => ({}),
      resourcePath: '/workspace/src/app.css',
    } as any, source)

    expect(result.trim()).toMatchInlineSnapshot(`
      ".i-mdi-abacus {
        width: 1em;
        height: 1em;
        --svg: url("data:image/svg+xml,%3Csvg%3E%3C/svg%3E");
        mask-image: var(--svg);
        background-color: currentColor;
        display: inline-block;
      }"
    `)
  })

  it('removes vendor-prefixed keyframes from runtime theme blocks', () => {
    const source = [
      '@theme default {',
      '@-webkit-keyframes spin {',
      '  to { transform: rotate(1turn); }',
      '}',
      '@keyframes spin {',
      '  to { transform: rotate(1turn); }',
      '}',
      '--animate-spin: spin 1s linear infinite;',
      '}',
    ].join('\n')

    const result = loader.call({
      getOptions: () => ({}),
      resourcePath: '/workspace/src/app.css',
    } as any, source)

    expect(result).not.toContain('@-webkit-keyframes')
    expect(result).toContain('@keyframes spin')
    expect(result).toContain('--animate-spin: spin 1s linear infinite;')
  })

  it('emits debug output when loader debug flag is enabled', () => {
    process.env.WEAPP_TW_LOADER_DEBUG = '1'
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const source = '.app {}'

    expect(loader.call({
      getOptions: () => ({}),
      resourcePath: '/workspace/src/app.css',
    } as any, source)).toBe(source)
    expect(write).toHaveBeenCalledWith(expect.stringContaining('weapp-tw-runtime-classset-loader'))
    expect(write).toHaveBeenCalledWith(expect.stringContaining('/workspace/src/app.css'))
  })
})
