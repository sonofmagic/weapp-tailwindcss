import type { Transform } from 'node:stream'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import Vinyl from 'vinyl'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPlugins } from '@/bundlers/gulp'
import { createCache } from '@/cache'

interface InternalContext {
  templateHandler: ReturnType<typeof vi.fn>
  styleHandler: ReturnType<typeof vi.fn>
  jsHandler: ReturnType<typeof vi.fn>
  cache: ReturnType<typeof createCache>
  jsMatcher?: ReturnType<typeof vi.fn>
  wxsMatcher?: ReturnType<typeof vi.fn>
  mainCssChunkMatcher: ReturnType<typeof vi.fn>
  twPatcher: {
    patch: ReturnType<typeof vi.fn>
    getClassSet: ReturnType<typeof vi.fn>
    getClassSetSync: ReturnType<typeof vi.fn>
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

function createNullFile(path: string) {
  return new Vinyl({
    cwd: '/',
    base: '/src',
    path,
    contents: null,
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
      getClassSetSync: vi.fn(() => runtimeSet),
      extract: vi.fn(async () => ({ classSet: runtimeSet })),
      majorVersion: 3,
    }

    currentContext = {
      templateHandler,
      styleHandler,
      jsHandler,
      cache,
      jsMatcher: vi.fn((id: string) => id.endsWith('.js')),
      wxsMatcher: vi.fn((id: string) => id.endsWith('.wxs')),
      mainCssChunkMatcher: vi.fn((name: string) => path.basename(name) === 'app.wxss'),
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
    expect(twPatcher.getClassSetSync).toHaveBeenCalledTimes(1)
    expect(twPatcher.extract).toHaveBeenCalledTimes(1)

    const cachedCssFile = createFile('/src/app.wxss', '.foo { color: red; }')
    const cachedCss = await runTransform(plugins.transformWxss(), cachedCssFile)
    expect(styleHandler).toHaveBeenCalledTimes(1)
    expect(cachedCss.contents?.toString()).toBe('css:.foo { color: red; }')
    expect(twPatcher.getClassSetSync).toHaveBeenCalledTimes(1)
    expect(twPatcher.extract).toHaveBeenCalledTimes(1)

    // Ensure runtime set is reused for JS handler
    const jsFile = createFile('/src/app.js', 'import "./init"; console.log("hi")')
    const processedJs = await runTransform(plugins.transformJs(), jsFile)
    expect(jsHandler).toHaveBeenCalledTimes(1)
    expect(twPatcher.getClassSetSync).toHaveBeenCalledTimes(1)
    expect(jsHandler).toHaveBeenCalledWith(
      'import "./init"; console.log("hi")',
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
    expect(processedJs.contents?.toString()).toBe('js:import "./init"; console.log("hi")')

    const cachedJsFile = createFile('/src/app.js', 'import "./init"; console.log("hi")')
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

    const jsFile = createFile('/src/app.js', 'import "./init"; console.log("cache-off")')
    await runTransform(plugins.transformJs(), jsFile)
    const jsFileSecond = createFile('/src/app.js', 'import "./init"; console.log("cache-off")')
    await runTransform(plugins.transformJs(), jsFileSecond)
    expect(jsHandler).toHaveBeenCalledTimes(2)

    const htmlFile = createFile('/src/app.wxml', '<view>cache</view>')
    await runTransform(plugins.transformWxml(), htmlFile)
    const htmlFileSecond = createFile('/src/app.wxml', '<view>cache</view>')
    await runTransform(plugins.transformWxml(), htmlFileSecond)
    expect(templateHandler).toHaveBeenCalledTimes(2)
  })

  it('reuses default css handler options across transformWxss invocations', async () => {
    const plugins = createPlugins()

    await runTransform(plugins.transformWxss(), createFile('/src/app.wxss', '.foo { color: blue; }'))
    await runTransform(plugins.transformWxss(), createFile('/src/page.wxss', '.bar { color: green; }'))

    expect(styleHandler).toHaveBeenCalledTimes(2)
    expect(styleHandler.mock.calls[0]?.[1]).toEqual({
      isMainChunk: true,
      majorVersion: 3,
    })
    expect(styleHandler.mock.calls[1]?.[1]).toEqual({
      isMainChunk: false,
      majorVersion: 3,
    })
  })

  it('uses mainCssChunkMatcher to resolve css main chunk', async () => {
    const mainCssChunkMatcher = vi.fn((name: string) => name === 'styles/index.css')
    currentContext.mainCssChunkMatcher = mainCssChunkMatcher
    const plugins = createPlugins()

    await runTransform(
      plugins.transformWxss(),
      new Vinyl({
        cwd: '/',
        base: '/src',
        path: '/src/styles/index.css',
        contents: Buffer.from('.foo { color: red; }'),
      }),
    )

    expect(mainCssChunkMatcher).toHaveBeenCalledWith('styles/index.css', undefined)
    expect(styleHandler.mock.calls[0]?.[1]).toEqual({
      isMainChunk: true,
      majorVersion: 3,
    })
  })

  it('reuses default template handler options across transformWxml invocations', async () => {
    const plugins = createPlugins()

    await runTransform(plugins.transformWxml(), createFile('/src/app.wxml', '<view class="foo"></view>'))
    await runTransform(plugins.transformWxml(), createFile('/src/page.wxml', '<view class="bar"></view>'))

    expect(templateHandler).toHaveBeenCalledTimes(2)
    expect(templateHandler.mock.calls[0]?.[1]).toBe(templateHandler.mock.calls[1]?.[1])
    expect(templateHandler.mock.calls[0]?.[1]).toEqual({
      runtimeSet,
    })
  })

  it('resolves directory index files when building module graph', async () => {
    const plugins = createPlugins()

    const jsFile = createFile('/src/app.js', 'import "./init"; console.log("graph")')
    await runTransform(plugins.transformJs(), jsFile)

    const handlerCalls = jsHandler.mock.calls
    const handlerOptions = handlerCalls.at(-1)?.[2]
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

  it('reuses the default moduleGraph across transformJs invocations', async () => {
    const plugins = createPlugins()

    await runTransform(plugins.transformJs(), createFile('/src/app.js', 'import "./init"; console.log("a")'))
    await runTransform(plugins.transformJs(), createFile('/src/page.js', 'import "./init"; console.log("b")'))

    const firstOptions = jsHandler.mock.calls[0]?.[2]
    const secondOptions = jsHandler.mock.calls[1]?.[2]

    expect(firstOptions?.moduleGraph).toBe(secondOptions?.moduleGraph)
  })

  it('passes through empty vinyl files without invoking handlers', async () => {
    const plugins = createPlugins()

    await runTransform(plugins.transformWxss(), createNullFile('/src/app.wxss'))
    await runTransform(plugins.transformJs(), createNullFile('/src/app.js'))
    await runTransform(plugins.transformWxml(), createNullFile('/src/app.wxml'))

    expect(styleHandler).not.toHaveBeenCalled()
    expect(jsHandler).not.toHaveBeenCalled()
    expect(templateHandler).not.toHaveBeenCalled()
  })

  it('forwards handler errors through the vinyl transform stream', async () => {
    const plugins = createPlugins()
    styleHandler.mockRejectedValueOnce(new Error('css failed'))

    await expect(runTransform(
      plugins.transformWxss(),
      createFile('/src/error.wxss', '.bad{}'),
    )).rejects.toThrow('css failed')
  })

  it('merges explicit css and template handler options', async () => {
    const plugins = createPlugins()
    const customRuntimeSet = new Set(['custom'])

    await runTransform(plugins.transformWxss({
      isMainChunk: false,
      cssRemoveProperty: false,
    }), createFile('/src/custom.wxss', '.foo{}'))
    await runTransform(plugins.transformWxml({
      runtimeSet: customRuntimeSet,
      customAttributesEntities: [],
    }), createFile('/src/custom.wxml', '<view />'))

    expect(styleHandler.mock.calls[0]?.[1]).toMatchObject({
      isMainChunk: false,
      majorVersion: 3,
      cssRemoveProperty: false,
    })
    expect(templateHandler.mock.calls[0]?.[1]).toMatchObject({
      runtimeSet: customRuntimeSet,
      customAttributesEntities: [],
    })
  })

  it('keeps js unchanged when precheck skips transformation', async () => {
    const plugins = createPlugins()

    const processed = await runTransform(
      plugins.transformJs(),
      createFile('/src/plain.js', 'const value = 1'),
    )

    expect(processed.contents?.toString()).toBe('const value = 1')
    expect(jsHandler).not.toHaveBeenCalled()
  })

  it('uses custom module graph options when provided', async () => {
    const plugins = createPlugins()
    const moduleGraph = {
      resolve: vi.fn(),
      load: vi.fn(),
      filter: vi.fn(),
    }

    await runTransform(plugins.transformJs({
      moduleGraph,
      babelParserOptions: {
        plugins: ['typescript'],
      },
    }), createFile('/src/custom.ts', 'import "./dep"; const cls = "w-[1px]"'))

    expect(jsHandler.mock.calls[0]?.[2]).toMatchObject({
      moduleGraph,
      babelParserOptions: {
        plugins: ['typescript'],
        sourceFilename: expect.stringContaining('custom.ts'),
      },
    })
  })

  it('resolves module graph files, extension fallbacks, loads and filters ids', async () => {
    const plugins = createPlugins()

    await runTransform(plugins.transformJs(), createFile('/src/app.js', 'import "./init"; console.log("graph")'))

    const handlerOptions = jsHandler.mock.calls.at(-1)?.[2]
    const moduleGraph = handlerOptions?.moduleGraph
    const importer = handlerOptions?.filename
    expect(moduleGraph).toBeDefined()
    expect(importer).toBeTruthy()

    const directFile = path.resolve(path.dirname(importer!), './direct.js')
    const extBase = path.resolve(path.dirname(importer!), './with-ext')
    const extFile = `${extBase}.tsx`
    const statSpy = vi.spyOn(fs, 'statSync')
    const readSpy = vi.spyOn(fs, 'readFileSync')
    const fileStats = {
      isFile: () => true,
      isDirectory: () => false,
    } as unknown as fs.Stats

    statSpy.mockImplementation((target: fs.PathLike) => {
      if (target === directFile || target === extFile) {
        return fileStats
      }
      const error = new Error(`ENOENT: no such file or directory, stat '${target.toString()}'`) as NodeJS.ErrnoException
      error.code = 'ENOENT'
      throw error
    })
    readSpy.mockImplementation((target: fs.PathOrFileDescriptor) => {
      if (target === directFile) {
        return 'export const value = 1'
      }
      throw new Error('read failed')
    })

    try {
      expect(moduleGraph?.resolve?.('', importer!)).toBeUndefined()
      expect(moduleGraph?.resolve?.('pkg', importer!)).toBeUndefined()
      expect(moduleGraph?.resolve?.('./direct.js', importer!)).toBe(directFile)
      expect(moduleGraph?.resolve?.('./with-ext', importer!)).toBe(extFile)
      expect(moduleGraph?.resolve?.('./missing.css', importer!)).toBeUndefined()
      expect(moduleGraph?.load?.(directFile)).toBe('export const value = 1')
      expect(moduleGraph?.load?.('/missing.js')).toBeUndefined()
      expect(moduleGraph?.filter?.(path.join(process.cwd(), 'src/app.js'))).toBe(true)
      expect(moduleGraph?.filter?.(path.join(process.cwd(), 'src/app.wxs'))).toBe(true)
      expect(moduleGraph?.filter?.(path.join(process.cwd(), 'src/app.css'))).toBe(false)
    }
    finally {
      statSpy.mockRestore()
      readSpy.mockRestore()
    }
  })
})
