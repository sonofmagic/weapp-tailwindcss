import path from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildBundleSnapshot, createBundleBuildState, updateBundleBuildState } from '@/bundlers/vite/bundle-state'
import { createBundleRuntimeClassSetManager } from '@/bundlers/vite/incremental-runtime-class-set'
import { createCache } from '@/cache'
import { createRollupAsset, createRollupChunk } from './vite-plugin.testkit'

function createOptions() {
  return {
    cache: createCache(),
    cssMatcher: (file: string) => file.endsWith('.css'),
    htmlMatcher: (file: string) => file.endsWith('.wxml'),
    jsMatcher: (file: string) => file.endsWith('.js'),
    wxsMatcher: () => false,
  } as any
}

function createPatcher(projectRoot: string) {
  return {
    majorVersion: 4,
    patch: vi.fn(async () => ({})),
    getClassSet: vi.fn(async () => new Set<string>()),
    extract: vi.fn(async () => ({ classSet: new Set<string>() })),
    options: {
      projectRoot,
      tailwind: {
        v4: {
          base: projectRoot,
        },
      },
    },
  } as any
}

describe('bundlers/vite incremental runtime class set', () => {
  const tempRoot = path.resolve(process.cwd(), '.tmp/vite-incremental-runtime-set-test')
  const validationFile = path.join(tempRoot, 'runtime-candidates.html')

  afterEach(async () => {
    const manager = createBundleRuntimeClassSetManager({ tempRoot })
    await manager.reset()
    vi.restoreAllMocks()
  })

  it('only re-extracts changed runtime files and keeps union stable', async () => {
    const opts = createOptions()
    const outDir = '/project/dist'
    const state = createBundleBuildState()
    const patcher = createPatcher('/project')
    const extractCandidates = vi.fn(async () => {
      const source = await readFile(validationFile, 'utf8')
      return source.split(/\s+/).filter(Boolean)
    })
    const extractRawCandidates = vi.fn(async (content: string) => {
      if (content.includes('foo bar')) {
        return [{ rawCandidate: 'foo' }, { rawCandidate: 'bar' }]
      }
      if (content.includes('"baz"')) {
        return [{ rawCandidate: 'baz' }]
      }
      if (content.includes('bar qux')) {
        return [{ rawCandidate: 'bar' }, { rawCandidate: 'qux' }]
      }
      return []
    })
    const manager = createBundleRuntimeClassSetManager({
      extractCandidates,
      extractRawCandidates,
      tempRoot,
    })

    const firstSnapshot = buildBundleSnapshot({
      'pages/index/index.wxml': {
        ...createRollupAsset('<view class="foo bar" />'),
        fileName: 'pages/index/index.wxml',
      },
      'assets/index.js': {
        ...createRollupChunk('const cls = "baz"'),
        fileName: 'assets/index.js',
      },
    }, opts, outDir, state)

    const firstRuntimeSet = await manager.sync(patcher, firstSnapshot)

    expect(firstRuntimeSet).toEqual(new Set(['foo', 'bar', 'baz']))
    expect(extractCandidates).toHaveBeenCalledTimes(1)

    updateBundleBuildState(state, firstSnapshot, new Map([
      ['assets/index.js', new Set<string>()],
    ]))

    extractCandidates.mockClear()

    const secondSnapshot = buildBundleSnapshot({
      'pages/index/index-next.wxml': {
        ...createRollupAsset('<view class="bar qux" />'),
        fileName: 'pages/index/index-next.wxml',
      },
      'assets/index.js': {
        ...createRollupChunk('const cls = "baz"'),
        fileName: 'assets/index.js',
      },
    }, opts, outDir, state)

    const secondRuntimeSet = await manager.sync(patcher, secondSnapshot)

    expect(secondRuntimeSet).toEqual(new Set(['bar', 'baz', 'qux']))
    expect(extractCandidates).toHaveBeenCalledTimes(1)
    expect(extractCandidates.mock.calls[0]?.[0]?.sources?.[0]?.pattern).toBe('runtime-candidates.html')
  })

  it('removes stale candidates when runtime files disappear from the bundle', async () => {
    const opts = createOptions()
    const outDir = '/project/dist'
    const state = createBundleBuildState()
    const patcher = createPatcher('/project')
    const extractCandidates = vi.fn(async () => {
      const source = await readFile(validationFile, 'utf8')
      return source.split(/\s+/).filter(Boolean)
    })
    const extractRawCandidates = vi.fn(async (content: string) => {
      if (content.includes('"foo"') || content.includes('class="foo"')) {
        return [{ rawCandidate: 'foo' }]
      }
      if (content.includes('"bar"')) {
        return [{ rawCandidate: 'bar' }]
      }
      return []
    })
    const manager = createBundleRuntimeClassSetManager({
      extractCandidates,
      extractRawCandidates,
      tempRoot,
    })

    const firstSnapshot = buildBundleSnapshot({
      'pages/index/index.wxml': {
        ...createRollupAsset('<view class="foo" />'),
        fileName: 'pages/index/index.wxml',
      },
      'assets/index.js': {
        ...createRollupChunk('const cls = "bar"'),
        fileName: 'assets/index.js',
      },
    }, opts, outDir, state)

    await manager.sync(patcher, firstSnapshot)
    updateBundleBuildState(state, firstSnapshot, new Map([
      ['assets/index.js', new Set<string>()],
    ]))

    extractCandidates.mockClear()

    const nextSnapshot = buildBundleSnapshot({
      'assets/index.js': {
        ...createRollupChunk('const cls = "bar"'),
        fileName: 'assets/index.js',
      },
    }, opts, outDir, state)

    const nextRuntimeSet = await manager.sync(patcher, nextSnapshot)

    expect(nextRuntimeSet).toEqual(new Set(['bar']))
    expect(extractCandidates).not.toHaveBeenCalled()
  })

  it('prefers cssEntries when building extract options for tailwind v4', async () => {
    const opts = createOptions()
    const projectRoot = path.join(tempRoot, 'css-entry-project')
    const outDir = path.join(projectRoot, 'dist')
    const state = createBundleBuildState()
    const patcher = createPatcher(projectRoot)
    const cssEntry = path.join(projectRoot, 'src/app.css')
    await mkdir(path.dirname(cssEntry), { recursive: true })
    await writeFile(cssEntry, '@import "tailwindcss";\n@theme { --color-brand: #123456; }\n', 'utf8')
    patcher.options.tailwind.v4.cssEntries = [cssEntry]
    patcher.options.tailwind.postcssPlugin = path.join(projectRoot, 'node_modules/@tailwindcss/postcss/dist/index.js')
    patcher.packageInfo = {
      name: '@tailwindcss/postcss',
      rootPath: path.join(projectRoot, 'node_modules/@tailwindcss/postcss'),
    }
    const extractCandidates = vi.fn(async () => ['foo'])
    const extractRawCandidates = vi.fn(async () => [{ rawCandidate: 'foo' }])
    const manager = createBundleRuntimeClassSetManager({
      extractCandidates,
      extractRawCandidates,
      tempRoot,
    })

    const snapshot = buildBundleSnapshot({
      'pages/index/index.wxml': {
        ...createRollupAsset('<view class="foo" />'),
        fileName: 'pages/index/index.wxml',
      },
    }, opts, outDir, state)

    await manager.sync(patcher, snapshot)

    expect(extractCandidates).toHaveBeenCalledTimes(1)
    expect(extractCandidates.mock.calls[0]?.[0]?.css).toContain('@theme { --color-brand: #123456; }')
  })

  it('falls back to importing tailwind package instead of postcss plugin targets', async () => {
    const opts = createOptions()
    const outDir = '/project/dist'
    const state = createBundleBuildState()
    const patcher = createPatcher('/project')
    patcher.options.tailwind.packageName = 'tailwindcss4'
    patcher.options.tailwind.postcssPlugin = '/project/node_modules/@tailwindcss/postcss/dist/index.js'
    patcher.packageInfo = {
      name: '@tailwindcss/postcss',
      rootPath: '/project/node_modules/@tailwindcss/postcss',
    }
    const extractCandidates = vi.fn(async () => ['foo'])
    const extractRawCandidates = vi.fn(async () => [{ rawCandidate: 'foo' }])
    const manager = createBundleRuntimeClassSetManager({
      extractCandidates,
      extractRawCandidates,
      tempRoot,
    })

    const snapshot = buildBundleSnapshot({
      'pages/index/index.wxml': {
        ...createRollupAsset('<view class="foo" />'),
        fileName: 'pages/index/index.wxml',
      },
    }, opts, outDir, state)

    await manager.sync(patcher, snapshot)

    expect(extractCandidates).toHaveBeenCalledTimes(1)
    expect(extractCandidates.mock.calls[0]?.[0]?.css).toBe('@import "tailwindcss4";')
  })

  it('keeps incremental runtime sync for extended length unit candidates', async () => {
    const opts = createOptions()
    const outDir = '/project/dist'
    const state = createBundleBuildState()
    const patcher = createPatcher('/project')
    const extractCandidates = vi.fn(async () => ['w-[200rpx]', 'h-[20upx]', 'bg-[#123456]'])
    const extractRawCandidates = vi.fn(async (content: string) => {
      if (content.includes('w-[200rpx]')) {
        return [
          { rawCandidate: 'w-[200rpx]' },
          { rawCandidate: 'h-[20upx]' },
          { rawCandidate: 'bg-[#123456]' },
        ]
      }
      return []
    })
    const manager = createBundleRuntimeClassSetManager({
      extractCandidates,
      extractRawCandidates,
      tempRoot,
    })

    const snapshot = buildBundleSnapshot({
      'common/vendor.js': {
        ...createRollupChunk('const cls = "w-[200rpx] h-[20upx] bg-[#123456]"'),
        fileName: 'common/vendor.js',
      },
    }, opts, outDir, state)

    await expect(manager.sync(patcher, snapshot)).resolves.toEqual(new Set([
      'w-[200rpx]',
      'h-[20upx]',
      'bg-[#123456]',
    ]))
    expect(extractCandidates).toHaveBeenCalledTimes(1)
  })
})
