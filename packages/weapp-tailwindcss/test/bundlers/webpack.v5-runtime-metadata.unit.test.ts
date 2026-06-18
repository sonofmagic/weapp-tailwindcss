import fs from 'node:fs'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createCache } from '@/cache'
import { upsertTailwindV4CssSource } from '@/tailwindcss/v4/css-sources'

let currentContext: TestContext
const getCompilerContextMock = vi.fn<(options?: unknown) => TestContext>(() => currentContext)
vi.mock('@/context', () => ({
  getCompilerContext: (options?: unknown) => getCompilerContextMock(options),
}))

const { WeappTailwindcss } = await import('@/bundlers/webpack/BaseUnifiedPlugin/v5')

class FakeConcatSource {
  constructor(private readonly value: string) {}
  source() {
    return this.value
  }

  toString() {
    return this.value
  }
}

interface TestContext {
  disabled: boolean
  onLoad: ReturnType<typeof vi.fn>
  onStart: ReturnType<typeof vi.fn>
  onEnd: ReturnType<typeof vi.fn>
  onUpdate: ReturnType<typeof vi.fn>
  refreshTailwindcssRuntime: ReturnType<typeof vi.fn>
  templateHandler: ReturnType<typeof vi.fn>
  styleHandler: ReturnType<typeof vi.fn>
  jsHandler: ReturnType<typeof vi.fn>
  cache: ReturnType<typeof createCache>
  tailwindRuntime: {
    getClassSet: ReturnType<typeof vi.fn>
    getClassSetSync: ReturnType<typeof vi.fn>
    extract: ReturnType<typeof vi.fn>
    majorVersion: number
    options: {
      tailwind: {
        v4: {
          cssEntries: string[]
          sources: never[]
        }
      }
    }
  }
  mainCssChunkMatcher: ReturnType<typeof vi.fn>
  cssMatcher: (file: string) => boolean
  htmlMatcher: (file: string) => boolean
  jsMatcher: (file: string) => boolean
  wxsMatcher: (file: string) => boolean
  runtimeLoaderPath: string
  runtimeCssImportRewriteLoaderPath: string
  escapeMap?: Record<string, string>
}

function createContext(): TestContext {
  const runtimeSet = new Set<string>()

  return {
    disabled: false,
    onLoad: vi.fn(),
    onStart: vi.fn(),
    onEnd: vi.fn(),
    onUpdate: vi.fn(),
    refreshTailwindcssRuntime: vi.fn(async () => currentContext.tailwindRuntime),
    templateHandler: vi.fn(async (code: string) => code),
    styleHandler: vi.fn(async (code: string) => ({ css: code })),
    jsHandler: vi.fn(async (code: string) => ({ code })),
    cache: createCache(),
    tailwindRuntime: {
      getClassSet: vi.fn(async () => runtimeSet),
      getClassSetSync: vi.fn(() => runtimeSet),
      extract: vi.fn(async () => ({ classSet: runtimeSet })),
      majorVersion: 4,
      options: {
        tailwind: {
          v4: {
            cssEntries: ['/virtual/app.css'],
            sources: [],
          },
        },
      },
    },
    mainCssChunkMatcher: vi.fn(() => true),
    cssMatcher: (file: string) => file.endsWith('.css'),
    htmlMatcher: (file: string) => file.endsWith('.wxml'),
    jsMatcher: (file: string) => file.endsWith('.js'),
    wxsMatcher: () => false,
    runtimeLoaderPath: '/virtual/weapp-tw-runtime-classset-loader.js',
    runtimeCssImportRewriteLoaderPath: '/virtual/weapp-tw-css-import-rewrite-loader.js',
  }
}

function createAssets(store: Record<string, string>) {
  return Object.fromEntries(
    Object.keys(store).map(file => [
      file,
      {
        source: () => store[file],
      },
    ]),
  )
}

describe('bundlers/webpack v5 runtime metadata', () => {
  let existsSyncSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    currentContext = createContext()
    getCompilerContextMock.mockClear()
    existsSyncSpy = vi.spyOn(fs as any, 'existsSync')
    existsSyncSpy.mockReturnValue(true)
  })

  afterEach(() => {
    existsSyncSpy.mockRestore()
  })

  it('refreshes runtime metadata during css-only invalidation for v4 output', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-webpack-v5-runtime-'))
    const cssEntry = path.join(root, 'app.css')
    await writeFile(cssEntry, [
      '@theme default {',
      '  --color-red-500: #ef4444;',
      '}',
      '@tailwind utilities;',
      '.tw-watch-style-case { color: red; }',
    ].join('\n'))
    currentContext.tailwindRuntime.options.tailwind.v4.cssEntries = [cssEntry]

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    const invalidHandlers: Array<() => void> = []
    const thisCompilationHandlers: Array<(_compilation: any) => void> = []
    let assetStore: Record<string, string> = {
      'index.css': '.base { color: black; }',
    }

    const compilation = {
      compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
      chunks: [{ id: 'main', hash: 'hash-1', files: ['index.css'] }],
      hooks: {
        processAssets: {
          tapPromise: (_options: unknown, handler: (assets: Record<string, any>) => Promise<void>) => {
            processAssetsCallbacks.push(handler)
          },
        },
      },
      updateAsset: vi.fn((file: string, source: FakeConcatSource) => {
        assetStore[file] = source.toString()
      }),
      getAsset(file: string) {
        const content = assetStore[file]
        if (content === undefined) {
          return undefined
        }
        return {
          source: {
            source: () => content,
          },
        }
      },
    }

    const compiler = {
      webpack: {
        Compilation: {
          PROCESS_ASSETS_STAGE_SUMMARIZE: Symbol('stage'),
        },
        sources: {
          ConcatSource: FakeConcatSource,
        },
        NormalModule: {
          getCompilationHooks: vi.fn(() => ({
            loader: {
              tap: vi.fn(),
            },
          })),
        },
      },
      hooks: {
        invalid: {
          tap: vi.fn((_name: string, handler: () => void) => {
            invalidHandlers.push(handler)
          }),
        },
        thisCompilation: {
          tap: vi.fn((_name: string, handler: (_compilation: any) => void) => {
            thisCompilationHandlers.push(handler)
            handler(compilation)
          }),
        },
        normalModuleFactory: {
          tap: vi.fn(() => {}),
        },
        compilation: {
          tap: vi.fn((_name: string, handler: (_compilation: any) => void) => {
            handler(compilation)
          }),
        },
        watchRun: {
          tap: vi.fn(),
        },
      },
    }

    new WeappTailwindcss().apply(compiler as any)

    await processAssetsCallbacks[0](createAssets(assetStore))
    expect(assetStore['index.css']).toContain('.base')
    const refreshCallsAfterBaseline = currentContext.refreshTailwindcssRuntime.mock.calls.length

    assetStore = {
      'index.css': '.base { color: black; }\n.tw-watch-style-case { color: red; }',
    }
    compilation.chunks[0].hash = 'hash-2'
    invalidHandlers[0]?.()
    thisCompilationHandlers[0]?.(compilation)

    await processAssetsCallbacks[0](createAssets(assetStore))

    expect(currentContext.refreshTailwindcssRuntime.mock.calls.length).toBeGreaterThan(refreshCallsAfterBaseline)
    expect(assetStore['index.css']).toContain('.tw-watch-style-case')
    await rm(root, { recursive: true, force: true })
  })

  it('upserts webpack auto css sources even when tailwind v4 roots already exist', () => {
    const options = {
      tailwindcss: {
        v4: {
          cssEntries: ['/virtual/app.css'],
          cssSources: [
            {
              file: '/virtual/app.css',
              css: '@import "tailwindcss";',
            },
          ],
        },
      },
    } as any

    const changed = upsertTailwindV4CssSource(options as any, {
      file: '/virtual/sub/pages/index.css',
      css: '@import "tailwindcss";\n@source "./sub/**/*.{ts,tsx}";',
    })

    expect(changed).toBe(true)
    expect(options.tailwindcss?.v4?.cssSources?.map((source: any) => source.file)).toEqual([
      '/virtual/app.css',
      '/virtual/sub/pages/index.css',
    ])
  })
})
