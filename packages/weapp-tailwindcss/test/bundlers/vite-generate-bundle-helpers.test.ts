import type { OutputAsset, OutputBundle, OutputChunk } from 'rollup'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createCssRuntimeSignature,
  createCssTransformShareScope,
  createCssTransformShareScopeKey,
} from '@/bundlers/vite/generate-bundle/css-share-scope'
import {
  getLastCssResult,
  getLastCssSourceHash,
  pruneLastCssResults,
  rememberLastCssResult,
  resolveViteCssTaskConcurrency,
} from '@/bundlers/vite/generate-bundle/vite-css-cache'
import {
  collectMiniProgramSubpackageRoots,
  collectMiniProgramSubpackageSourceEntries,
  isSubpackageOutputFile,
  normalizePackageRoot,
} from '@/bundlers/vite/generate-bundle/subpackages'

function asset(fileName: string, source: string | Buffer): OutputAsset {
  return {
    type: 'asset',
    fileName,
    names: [],
    originalFileNames: [],
    source,
  }
}

function chunk(fileName: string, modules: Record<string, unknown>): OutputChunk {
  return {
    type: 'chunk',
    fileName,
    name: fileName,
    facadeModuleId: null,
    isDynamicEntry: false,
    isEntry: false,
    isImplicitEntry: false,
    moduleIds: Object.keys(modules),
    modules: modules as any,
    code: '',
    dynamicImports: [],
    exports: [],
    implicitlyLoadedBefore: [],
    importedBindings: {},
    imports: [],
    map: null,
    preliminaryFileName: fileName,
    referencedFiles: [],
    sourcemapFileName: null,
  }
}

describe('vite generate-bundle helper modules', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses configured css concurrency and maintains an LRU css result cache', () => {
    vi.stubEnv('WEAPP_TW_VITE_CSS_CONCURRENCY', '3')
    expect(resolveViteCssTaskConcurrency(false)).toBe(3)
    vi.stubEnv('WEAPP_TW_VITE_CSS_CONCURRENCY', '0')
    expect(resolveViteCssTaskConcurrency(true, 4)).toBe(1)

    const results = new Map<string, string>()
    const hashes = new Map<string, string>()
    for (let index = 0; index < 66; index++) {
      rememberLastCssResult(results, hashes, `src/${index}.css`, `.c${index}{}`, `h${index}`)
    }

    expect(results.has('src/0.css')).toBe(false)
    expect(hashes.has('src/0.css')).toBe(false)
    expect(getLastCssResult(results, undefined, 'src/65.css')).toBe('.c65{}')
    expect([...results.keys()].at(-1)).toBe('src/65.css')
    expect(getLastCssSourceHash(hashes, 'src/65.css')).toBe('h65')

    pruneLastCssResults(results, hashes, new Set(['src/65.css']))
    expect([...results.keys()]).toEqual(['src/65.css'])
    expect([...hashes.keys()]).toEqual(['src/65.css'])
  })

  it('creates css transform share scope keys for imports, urls, source css, and main chunks', () => {
    const opts = {
      appType: 'taro',
      mainCssChunkMatcher: (file: string) => file === 'app.wxss',
      generator: {},
    } as any

    expect(createCssTransformShareScope('pages/index.wxss', '.a{background:url(./icon.png)}')).toBe('dir:pages')
    expect(createCssTransformShareScope('pages/index.wxss', '.a{background:url(/static/icon.png)}')).toBe('global')
    expect(createCssTransformShareScope('pages/index.wxss', '@import "./dep.wxss";')).toBe('dir:pages')
    expect(createCssTransformShareScopeKey(opts, 'app.wxss', '.root{}')).toBe('main:app.wxss')
    expect(createCssTransformShareScopeKey(opts, 'pages/index.wxss', '@import "tailwindcss";')).toBe('source:pages/index.wxss')
    expect(createCssRuntimeSignature('runtime', 'candidates')).toBe('runtime:candidates')
  })

  it('collects mini-program subpackage roots and source entries from bundle metadata', () => {
    const root = path.resolve('/workspace/project')
    const bundle: OutputBundle = {
      'app.json': asset('app.json', Buffer.from(JSON.stringify({
        subPackages: [
          { root: 'pkg-a/' },
          { root: '' },
          { root: 'pkg-b' },
        ],
      }))),
      'ignore.json': asset('ignore.json', '{broken'),
      'pkg-a/pages/index.js': chunk('pkg-a/pages/index.js', {
        [path.join(root, 'src/pkg-a/pages/index.ts')]: {},
        'virtual:module': {},
      }),
      'pkg-b/pages/index.js': chunk('pkg-b/pages/index.js', {
        [path.join(root, 'src/pkg-b')]: {},
      }),
    }

    const roots = collectMiniProgramSubpackageRoots(bundle)!
    expect([...roots]).toEqual(['pkg-a', 'pkg-b'])
    expect(collectMiniProgramSubpackageRoots({ 'pages/index.js': chunk('pages/index.js', {}) })).toBeUndefined()
    expect(normalizePackageRoot('pkg-a//')).toBe('pkg-a')
    expect(isSubpackageOutputFile('dist/pkg-a/pages/index.wxss?x=1', roots)).toBe(true)
    expect(isSubpackageOutputFile('pages/index.wxss', roots)).toBe(false)

    const entries = collectMiniProgramSubpackageSourceEntries({
      entries: Object.entries(bundle).map(([file, output]) => ({ file, output })) as any,
      files: new Set(Object.keys(bundle)),
    } as any, roots, [path.join(root, 'src'), path.join(root, 'src')])

    expect(entries).toEqual(expect.arrayContaining([
      { base: path.join(root, 'src/pkg-a'), negated: false, pattern: '**/*' },
      { base: path.join(root, 'src/pkg-b'), negated: false, pattern: '**/*' },
      { base: path.join(root, 'src'), negated: false, pattern: '**/pkg-a/**' },
      { base: path.join(root, 'src'), negated: false, pattern: '**/pkg-b/**' },
    ]))
  })
})
