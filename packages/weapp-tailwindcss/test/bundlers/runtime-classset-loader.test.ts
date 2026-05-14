import { afterEach, describe, expect, it, vi } from 'vitest'
import loader from '@/bundlers/webpack/loaders/weapp-tw-runtime-classset-loader'

describe('bundlers/runtime classset loader', () => {
  afterEach(() => {
    delete process.env.WEAPP_TW_LOADER_DEBUG
    vi.restoreAllMocks()
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
      query: {
        getClassSet,
        getWatchDependencies,
      },
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
      query: {
        getClassSet,
        getWatchDependencies,
      },
      resourcePath: '/workspace/src/app.css',
    } as any, source)

    expect(result).toBe(source)
    expect(getClassSet).toHaveBeenCalledTimes(1)
    expect(getWatchDependencies).toHaveBeenCalledTimes(1)
    expect(addDependency).toHaveBeenCalledWith('/workspace/src/index.wxml')
    expect(addContextDependency).toHaveBeenCalledWith('/workspace/src/components')
  })

  it('keeps source unchanged when loader options are absent', () => {
    const source = '.app {}'

    expect(loader.call({
      query: {},
      resourcePath: '/workspace/src/app.css',
    } as any, source)).toBe(source)
  })

  it('removes cascade layer syntax from runtime css before later webpack processors', () => {
    const source = [
      '@layer theme, base, components, utilities;',
      '@layer utilities {',
      '.text-red-500 { color: red; }',
      '}',
    ].join('\n')

    const result = loader.call({
      query: {},
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
      query: {},
      resourcePath: '/workspace/src/app.css',
    } as any, source)

    expect(Buffer.isBuffer(result)).toBe(true)
    expect(result.toString('utf8')).not.toContain('@layer')
    expect(result.toString('utf8')).toContain('.text-blue-500 { color: blue; }')
  })

  it('emits debug output when loader debug flag is enabled', () => {
    process.env.WEAPP_TW_LOADER_DEBUG = '1'
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const source = '.app {}'

    expect(loader.call({
      query: {},
      resourcePath: '/workspace/src/app.css',
    } as any, source)).toBe(source)
    expect(write).toHaveBeenCalledWith(expect.stringContaining('weapp-tw-runtime-classset-loader'))
    expect(write).toHaveBeenCalledWith(expect.stringContaining('/workspace/src/app.css'))
  })
})
