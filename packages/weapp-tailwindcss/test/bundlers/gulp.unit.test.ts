import type { Transform } from 'node:stream'
import { Buffer } from 'node:buffer'
import Vinyl from 'vinyl'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPlugins } from '@/bundlers/gulp'
import { createCache } from '@/cache'

const getCompilerContextMock = vi.fn((_options?: unknown) => currentContext)

vi.mock('@/context', () => ({
  getCompilerContext: (options?: unknown) => getCompilerContextMock(options),
}))

let currentContext: any

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
  let setMangleRuntimeSet: ReturnType<typeof vi.fn>
  let twPatcher: any

  beforeEach(() => {
    const cache = createCache()
    const runtimeSet = new Set(['foo'])

    styleHandler = vi.fn(async (source: string) => ({
      css: `css:${source}`,
    }))
    templateHandler = vi.fn(async (source: string) => `tpl:${source}`)
    jsHandler = vi.fn(async (source: string) => ({ code: `js:${source}` }))
    setMangleRuntimeSet = vi.fn()
    twPatcher = {
      patch: vi.fn(),
      getClassSet: vi.fn(async () => runtimeSet),
      getClassSetV3: vi.fn(async () => runtimeSet),
      majorVersion: 3,
    }

    currentContext = {
      templateHandler,
      styleHandler,
      jsHandler,
      setMangleRuntimeSet,
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
    expect(setMangleRuntimeSet).toHaveBeenCalledTimes(1)
    expect([...setMangleRuntimeSet.mock.calls[0][0]]).toEqual(['foo'])

    const cachedCssFile = createFile('/src/app.wxss', '.foo { color: red; }')
    const cachedCss = await runTransform(plugins.transformWxss(), cachedCssFile)
    expect(styleHandler).toHaveBeenCalledTimes(1)
    expect(cachedCss.contents?.toString()).toBe('css:.foo { color: red; }')

    // Ensure runtime set is reused for JS handler
    const jsFile = createFile('/src/app.js', 'console.log("hi")')
    const processedJs = await runTransform(plugins.transformJs(), jsFile)
    expect(jsHandler).toHaveBeenCalledTimes(1)
    const runtimeSetFromCss = setMangleRuntimeSet.mock.calls[0][0]
    expect(jsHandler).toHaveBeenCalledWith('console.log("hi")', runtimeSetFromCss, {})
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
})
