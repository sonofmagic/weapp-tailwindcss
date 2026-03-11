import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  buildBundleSnapshot,
  createBundleBuildState,
  updateBundleBuildState,
} from '@/bundlers/vite/bundle-state'
import { createCache } from '@/cache'
import {
  createRollupAsset,
  createRollupChunk,
} from './vite-plugin.testkit'

function createOptions() {
  return {
    cache: createCache(),
    cssMatcher: (file: string) => file.endsWith('.css'),
    htmlMatcher: (file: string) => file.endsWith('.wxml'),
    jsMatcher: (file: string) => file.endsWith('.js'),
    wxsMatcher: () => false,
  } as any
}

describe('bundlers/vite bundle state', () => {
  it('does not mark formatting-only html/js changes as runtime-affecting', () => {
    const opts = createOptions()
    const state = createBundleBuildState()
    const outDir = '/project/dist'

    const firstSnapshot = buildBundleSnapshot({
      'pages/index/index.wxml': {
        ...createRollupAsset('<view class="foo">hello</view>'),
        fileName: 'pages/index/index.wxml',
      },
      'assets/index.js': {
        ...createRollupChunk('const cls = "foo"\nexport { cls }\n'),
        fileName: 'assets/index.js',
      },
    }, opts, outDir, state)

    updateBundleBuildState(state, firstSnapshot, new Map([
      ['assets/index.js', new Set<string>()],
    ]))

    const secondSnapshot = buildBundleSnapshot({
      'pages/index/index.wxml': {
        ...createRollupAsset('<view   class="foo">\n  hello\n</view>'),
        fileName: 'pages/index/index.wxml',
      },
      'assets/index.js': {
        ...createRollupChunk('const cls = "foo";\n\nexport { cls }\n'),
        fileName: 'assets/index.js',
      },
    }, opts, outDir, state)

    expect(secondSnapshot.changedByType.html.has('pages/index/index.wxml')).toBe(true)
    expect(secondSnapshot.changedByType.js.has('assets/index.js')).toBe(true)
    expect(secondSnapshot.runtimeAffectingChangedByType.html.has('pages/index/index.wxml')).toBe(false)
    expect(secondSnapshot.runtimeAffectingChangedByType.js.has('assets/index.js')).toBe(false)
  })

  it('marks comment and literal changes as runtime-affecting', () => {
    const opts = createOptions()
    const state = createBundleBuildState()
    const outDir = '/project/dist'

    const firstSnapshot = buildBundleSnapshot({
      'pages/index/index.wxml': {
        ...createRollupAsset('<view class="foo">hello</view>'),
        fileName: 'pages/index/index.wxml',
      },
      'assets/index.js': {
        ...createRollupChunk('const cls = "foo"\nexport { cls }\n'),
        fileName: 'assets/index.js',
      },
    }, opts, outDir, state)

    updateBundleBuildState(state, firstSnapshot, new Map([
      ['assets/index.js', new Set<string>()],
    ]))

    const secondSnapshot = buildBundleSnapshot({
      'pages/index/index.wxml': {
        ...createRollupAsset('<view class="bar">hello</view><!-- text-red-500 -->'),
        fileName: 'pages/index/index.wxml',
      },
      'assets/index.js': {
        ...createRollupChunk('const cls = "bar"\nexport { cls }\n/* text-red-500 */'),
        fileName: 'assets/index.js',
      },
    }, opts, outDir, state)

    expect(secondSnapshot.runtimeAffectingChangedByType.html.has('pages/index/index.wxml')).toBe(true)
    expect(secondSnapshot.runtimeAffectingChangedByType.js.has('assets/index.js')).toBe(true)
  })

  it('re-queues dependent js entries when linked module source changes', () => {
    const opts = createOptions()
    const state = createBundleBuildState()
    const outDir = '/project/dist'

    const firstSnapshot = buildBundleSnapshot({
      'pages/index/index.wxml': {
        ...createRollupAsset('<view class="foo" />'),
        fileName: 'pages/index/index.wxml',
      },
      'assets/entry.js': {
        ...createRollupChunk('import "./shared.js"\nconst cls = "foo"'),
        fileName: 'assets/entry.js',
      },
      'assets/shared.js': {
        ...createRollupChunk('export const cls = "foo"'),
        fileName: 'assets/shared.js',
      },
    }, opts, outDir, state)

    expect(firstSnapshot.processFiles.html.has('pages/index/index.wxml')).toBe(true)
    expect(firstSnapshot.processFiles.js.has('assets/entry.js')).toBe(true)
    expect(firstSnapshot.processFiles.js.has('assets/shared.js')).toBe(true)
    // toAbsoluteOutputPath 使用 path.resolve，Windows 下会带盘符
    expect(firstSnapshot.jsEntries.has(path.resolve('/project/dist', 'assets/entry.js'))).toBe(true)
    expect(firstSnapshot.jsEntries.has(path.resolve('/project/dist', 'assets/shared.js'))).toBe(true)

    updateBundleBuildState(state, firstSnapshot, new Map([
      ['assets/entry.js', new Set(['assets/shared.js'])],
      ['assets/shared.js', new Set<string>()],
    ]))

    const secondSnapshot = buildBundleSnapshot({
      'pages/index/index.wxml': {
        ...createRollupAsset('<view class="foo" />'),
        fileName: 'pages/index/index.wxml',
      },
      'assets/entry.js': {
        ...createRollupChunk('import "./shared.js"\nconst cls = "foo"'),
        fileName: 'assets/entry.js',
      },
      'assets/shared.js': {
        ...createRollupChunk('export const cls = "bar"'),
        fileName: 'assets/shared.js',
      },
    }, opts, outDir, state)

    expect(secondSnapshot.changedByType.js.has('assets/shared.js')).toBe(true)
    expect(secondSnapshot.processFiles.js.has('assets/shared.js')).toBe(true)
    expect(secondSnapshot.processFiles.js.has('assets/entry.js')).toBe(true)
    expect(secondSnapshot.linkedImpactsByEntry.get('assets/entry.js')).toEqual(new Set(['assets/shared.js']))
  })

  it('replaces stale linked indexes when old entry files disappear', () => {
    const opts = createOptions()
    const state = createBundleBuildState()
    const outDir = '/project/dist'

    const firstSnapshot = buildBundleSnapshot({
      'assets/entry.js': {
        ...createRollupChunk('import "./shared.js"\nconst cls = "foo"'),
        fileName: 'assets/entry.js',
      },
      'assets/shared.js': {
        ...createRollupChunk('export const cls = "foo"'),
        fileName: 'assets/shared.js',
      },
    }, opts, outDir, state)

    updateBundleBuildState(state, firstSnapshot, new Map([
      ['assets/entry.js', new Set(['assets/shared.js'])],
      ['assets/shared.js', new Set<string>()],
    ]))

    const nextSnapshot = buildBundleSnapshot({
      'assets/shared.js': {
        ...createRollupChunk('export const cls = "foo"'),
        fileName: 'assets/shared.js',
      },
    }, opts, outDir, state)

    updateBundleBuildState(state, nextSnapshot, new Map([
      ['assets/shared.js', new Set<string>()],
    ]))

    expect(state.linkedByEntry.has('assets/entry.js')).toBe(false)
    expect(state.dependentsByLinkedFile.has('assets/shared.js')).toBe(false)
    expect(state.sourceHashByFile.has('assets/entry.js')).toBe(false)
  })
})
