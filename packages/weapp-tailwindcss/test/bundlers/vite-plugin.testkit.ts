import type { OutputAsset, OutputChunk } from 'rollup'
import type * as UniAppXModule from '@/uni-app-x'
import { vi } from 'vitest'
import { createCache } from '@/cache'

export function createContext(overrides: Record<string, unknown> = {}) {
  const cache = createCache()
  const runtimeSet = new Set(['alpha'])

  return {
    disabled: false,
    onLoad: vi.fn(),
    onStart: vi.fn(),
    onEnd: vi.fn(),
    onUpdate: vi.fn(),
    templateHandler: vi.fn(async (code: string) => `tpl:${code}`),
    styleHandler: vi.fn(async (code: string) => ({
      css: `css:${code}`,
      map: {
        toJSON: () => ({
          version: 3,
          file: 'style.css',
          sources: ['style.css'],
          names: [],
          mappings: 'AAAA',
          sourcesContent: [code],
        }),
      },
    })),
    // 保持 jsHandler 为同步实现，以符合 JsHandler 的类型签名
    jsHandler: vi.fn((code: string) => ({ code: `js:${code}` })),
    mainCssChunkMatcher: vi.fn(() => true),
    appType: 'uni-app',
    cache,
    cssMatcher: (file: string) => file.endsWith('.css'),
    htmlMatcher: (file: string) => file.endsWith('.wxml'),
    jsMatcher: (file: string) => file.endsWith('.js'),
    wxsMatcher: () => false,
    twPatcher: {
      patch: vi.fn(),
      getClassSet: vi.fn(async () => runtimeSet),
      getClassSetSync: vi.fn(() => runtimeSet),
      majorVersion: 3,
      extract: vi.fn(async () => ({ classSet: runtimeSet })),
    },
    uniAppX: undefined as any,
    runtimeLoaderPath: undefined,
    mainChunkRegex: undefined,
    cssEntries: undefined,
    customReplaceDictionary: undefined,
    staleClassNameFallback: undefined,
    ...overrides,
  }
}

export type InternalContext = ReturnType<typeof createContext>

let currentContext: InternalContext = createContext()

const hoistedMocks = vi.hoisted(() => ({
  postcssHtmlTransformMock: vi.fn(() => ({ postcssPlugin: 'mocked-html-transform' })),
  transformUVueMock: vi.fn((code: string, id: string, _jsHandler?: unknown, _runtimeSet?: Set<string>) => ({
    code: `uvue:${id}:${code}`,
  })),
}))

const { postcssHtmlTransformMock, transformUVueMock } = hoistedMocks

vi.mock('@weapp-tailwindcss/postcss/html-transform', () => ({
  default: postcssHtmlTransformMock,
}))

vi.mock('@/uni-app-x/transform', () => ({
  transformUVue: transformUVueMock,
}))
vi.mock('@/uni-app-x', async (importOriginal) => {
  const actual = await importOriginal<typeof UniAppXModule>()
  return {
    ...actual,
  }
})

export const getCompilerContextMock = vi.fn<(options?: unknown) => InternalContext>(() => currentContext)
vi.mock('@/context', () => ({
  getCompilerContext: (options?: unknown) => getCompilerContextMock(options),
}))

export function setCurrentContext(nextContext: InternalContext) {
  currentContext = nextContext
}

export function getCurrentContext() {
  return currentContext
}

export function resetVitePluginTestContext() {
  setCurrentContext(createContext())
  getCompilerContextMock.mockClear()
  postcssHtmlTransformMock.mockClear()
  transformUVueMock.mockClear()
}

export function getTransformUVueMock() {
  return transformUVueMock
}

export function createRollupAsset(source: string): OutputAsset {
  return {
    type: 'asset',
    fileName: 'index.wxml',
    name: undefined,
    source,
    needsCodeReference: false,
    names: [] as string[],
    originalFileName: null,
    originalFileNames: [] as string[],
  } as OutputAsset
}

export function createRollupChunk(code: string): OutputChunk {
  return {
    type: 'chunk',
    fileName: 'index.js',
    name: 'index',
    code,
    map: null,
    facadeModuleId: null,
    moduleIds: [],
    modules: {},
    imports: [],
    exports: [],
    dynamicImports: [],
    implicitlyLoadedBefore: [],
    importedBindings: {},
    isEntry: true,
    isDynamicEntry: false,
    referencedFiles: [],
    isImplicitEntry: false,
    sourcemapFileName: null,
    preliminaryFileName: null,
  } as unknown as OutputChunk
}
