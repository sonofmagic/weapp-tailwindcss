import fs from 'node:fs'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createCache } from '@/cache'

let currentContext: TestContext
const getCompilerContextMock = vi.fn<(options?: unknown) => TestContext>(() => currentContext)
vi.mock('@/context', () => ({
  getCompilerContext: (options?: unknown) => getCompilerContextMock(options),
}))

const { UnifiedWebpackPluginV5 } = await import('@/bundlers/webpack/BaseUnifiedPlugin/v5')

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
  refreshTailwindcssPatcher: ReturnType<typeof vi.fn>
  templateHandler: ReturnType<typeof vi.fn>
  styleHandler: ReturnType<typeof vi.fn>
  jsHandler: ReturnType<typeof vi.fn>
  cache: ReturnType<typeof createCache>
  twPatcher: {
    patch: ReturnType<typeof vi.fn>
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
    refreshTailwindcssPatcher: vi.fn(async () => currentContext.twPatcher),
    templateHandler: vi.fn(async (code: string) => code),
    styleHandler: vi.fn(async (code: string) => ({ css: code })),
    jsHandler: vi.fn(async (code: string) => ({ code })),
    cache: createCache(),
    twPatcher: {
      patch: vi.fn(),
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

    new UnifiedWebpackPluginV5().apply(compiler as any)

    await processAssetsCallbacks[0](createAssets(assetStore))
    expect(assetStore['index.css']).toContain('.base')
    const refreshCallsAfterBaseline = currentContext.refreshTailwindcssPatcher.mock.calls.length

    assetStore = {
      'index.css': '.base { color: black; }\n.tw-watch-style-case { color: red; }',
    }
    compilation.chunks[0].hash = 'hash-2'
    invalidHandlers[0]?.()
    thisCompilationHandlers[0]?.(compilation)

    await processAssetsCallbacks[0](createAssets(assetStore))

    expect(currentContext.refreshTailwindcssPatcher.mock.calls.length).toBeGreaterThan(refreshCallsAfterBaseline)
    expect(assetStore['index.css']).toContain('.tw-watch-style-case')
  })
})
