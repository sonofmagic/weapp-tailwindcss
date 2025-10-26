import type { Transform } from 'node:stream'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import Vinyl from 'vinyl'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPlugins } from '@/bundlers/gulp'
import { createCache } from '@/cache'

interface InternalContext {
  templateHandler: ReturnType<typeof vi.fn>
  styleHandler: ReturnType<typeof vi.fn>
  jsHandler: ReturnType<typeof vi.fn>
  cache: ReturnType<typeof createCache>
  twPatcher: {
    patch: ReturnType<typeof vi.fn>
    getClassSet: ReturnType<typeof vi.fn>
    extract: ReturnType<typeof vi.fn>
    majorVersion: number
  }
}

let currentContext: InternalContext
const getCompilerContextMock = vi.fn<(options?: unknown) => InternalContext>(() => currentContext)

vi.mock('@/context', () => ({
  getCompilerContext: (options?: unknown) => getCompilerContextMock(options),
}))

function createFile(path: string, contents: string) {
  return new Vinyl({
    cwd: '/',
    base: '/src',
    path,
    contents: Buffer.from(contents),
  })
}

async function runTransform(transform: Transform, file: Vinyl) {
  return await new Promise<Vinyl>((resolve, reject) => {
    transform.once('data', resolve)
    transform.once('error', reject)
    transform.write(file)
    transform.end()
  })
}

describe('bundlers/gulp createPlugins', () => {
  let styleHandler: ReturnType<typeof vi.fn>
  let templateHandler: ReturnType<typeof vi.fn>
  let jsHandler: ReturnType<typeof vi.fn>
  let runtimeSet: Set<string>
  let twPatcher: any

  beforeEach(() => {
    const cache = createCache()
    runtimeSet = new Set(['foo'])

    styleHandler = vi.fn(async (source: string) => ({
      css: `css:${source}`,
    }))
    templateHandler = vi.fn(async (source: string) => `tpl:${source}`)
    jsHandler = vi.fn(async (source: string) => ({ code: `js:${source}` }))
    twPatcher = {
      patch: vi.fn(),
      getClassSet: vi.fn(async () => runtimeSet),
      extract: vi.fn(async () => ({ classSet: runtimeSet })),
      majorVersion: 3,
    }

    currentContext = {
      templateHandler,
      styleHandler,
      jsHandler,
      cache,
      twPatcher,
    }

    getCompilerContextMock.mockClear()
  })

  it('processes files and caches results across runs', async () => {
    const plugins = createPlugins()
    expect(getCompilerContextMock).toHaveBeenCalled()
    expect(twPatcher.patch).toHaveBeenCalledTimes(1)

    const cssFile = createFile('/src/app.wxss', '.foo { color: red; }')
    const processedCss = await runTransform(plugins.transformWxss(), cssFile)
    expect(processedCss.contents?.toString()).toBe('css:.foo { color: red; }')
    expect(styleHandler).toHaveBeenCalledTimes(1)
    expect(twPatcher.extract).toHaveBeenCalledTimes(1)

    const cachedCssFile = createFile('/src/app.wxss', '.foo { color: red; }')
    const cachedCss = await runTransform(plugins.transformWxss(), cachedCssFile)
    expect(styleHandler).toHaveBeenCalledTimes(1)
    expect(cachedCss.contents?.toString()).toBe('css:.foo { color: red; }')
    expect(twPatcher.extract).toHaveBeenCalledTimes(2)

    // Ensure runtime set is reused for JS handler
    const jsFile = createFile('/src/app.js', 'console.log("hi")')
    const processedJs = await runTransform(plugins.transformJs(), jsFile)
    expect(jsHandler).toHaveBeenCalledTimes(1)
    expect(jsHandler).toHaveBeenCalledWith(
      'console.log("hi")',
      runtimeSet,
      expect.objectContaining({
        filename: expect.stringContaining('app.js'),
        moduleGraph: expect.objectContaining({
          resolve: expect.any(Function),
          load: expect.any(Function),
        }),
        babelParserOptions: expect.objectContaining({
          sourceFilename: expect.stringContaining('app.js'),
        }),
      }),
    )
    expect(processedJs.contents?.toString()).toBe('js:console.log("hi")')

    const cachedJsFile = createFile('/src/app.js', 'console.log("hi")')
    await runTransform(plugins.transformJs(), cachedJsFile)
    expect(jsHandler).toHaveBeenCalledTimes(1)

    const wxmlFile = createFile('/src/app.wxml', '<view class="foo"></view>')
    const processedHtml = await runTransform(plugins.transformWxml(), wxmlFile)
    expect(templateHandler).toHaveBeenCalledTimes(1)
    expect(processedHtml.contents?.toString()).toBe('tpl:<view class="foo"></view>')

    const cachedHtmlFile = createFile('/src/app.wxml', '<view class="foo"></view>')
    await runTransform(plugins.transformWxml(), cachedHtmlFile)
    expect(templateHandler).toHaveBeenCalledTimes(1)
  })

  it('re-runs handlers when cache is disabled', async () => {
    currentContext.cache = createCache(false)

    const plugins = createPlugins()

    const cssFile = createFile('/src/app.wxss', '.foo { color: blue; }')
    await runTransform(plugins.transformWxss(), cssFile)
    const cssFileSecond = createFile('/src/app.wxss', '.foo { color: blue; }')
    await runTransform(plugins.transformWxss(), cssFileSecond)
    expect(styleHandler).toHaveBeenCalledTimes(2)

    const jsFile = createFile('/src/app.js', 'console.log("cache-off")')
    await runTransform(plugins.transformJs(), jsFile)
    const jsFileSecond = createFile('/src/app.js', 'console.log("cache-off")')
    await runTransform(plugins.transformJs(), jsFileSecond)
    expect(jsHandler).toHaveBeenCalledTimes(2)

    const htmlFile = createFile('/src/app.wxml', '<view>cache</view>')
    await runTransform(plugins.transformWxml(), htmlFile)
    const htmlFileSecond = createFile('/src/app.wxml', '<view>cache</view>')
    await runTransform(plugins.transformWxml(), htmlFileSecond)
    expect(templateHandler).toHaveBeenCalledTimes(2)
  })

  it('resolves directory index files when building module graph', async () => {
    const plugins = createPlugins()

    const jsFile = createFile('/src/app.js', 'console.log("graph")')
    await runTransform(plugins.transformJs(), jsFile)

    const handlerCalls = jsHandler.mock.calls
    const handlerOptions = handlerCalls[handlerCalls.length - 1]?.[2]
    expect(handlerOptions?.moduleGraph).toBeDefined()
    const moduleGraph = handlerOptions?.moduleGraph
    const importer = handlerOptions?.filename
    expect(importer).toBeTruthy()

    const moduleDir = path.resolve(path.dirname(importer!), './utils')
    const indexTs = path.join(moduleDir, 'index.ts')
    const statSpy = vi.spyOn(fs, 'statSync')
    const directoryStats = {
      isFile: () => false,
      isDirectory: () => true,
    } as unknown as fs.Stats
    const fileStats = {
      isFile: () => true,
      isDirectory: () => false,
    } as unknown as fs.Stats

    statSpy.mockImplementation((target: fs.PathLike) => {
      if (target === moduleDir) {
        return directoryStats
      }
      if (target === indexTs) {
        return fileStats
      }
      const error = new Error(`ENOENT: no such file or directory, stat '${target.toString()}'`) as NodeJS.ErrnoException
      error.code = 'ENOENT'
      throw error
    })

    try {
      const resolved = moduleGraph?.resolve?.('./utils', importer!)
      expect(resolved).toBe(indexTs)
    }
    finally {
      statSpy.mockRestore()
    }
  })
})
