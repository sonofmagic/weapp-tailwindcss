import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  buildBundleSnapshot,
  buildBundleSnapshotForBuild,
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

  it('keeps formatting-only filtering after a fast initial runtime snapshot', () => {
    const opts = createOptions()
    const state = createBundleBuildState()
    const outDir = '/project/dist'
    const jsFile = 'assets/index.js'
    const htmlFile = 'pages/index/index.wxml'
    const cssFile = 'assets/index.css'

    const firstSnapshot = buildBundleSnapshot({
      [htmlFile]: {
        ...createRollupAsset('<view class="foo">hello</view>'),
        fileName: htmlFile,
      },
      [jsFile]: {
        ...createRollupChunk('const cls = "foo"\nexport { cls }\n'),
        fileName: jsFile,
      },
      [cssFile]: {
        ...createRollupAsset('.card { color: red; }\n.page { padding: 8px; }'),
        fileName: cssFile,
      },
    }, opts, outDir, state, {
      forceAll: true,
      fastInitialRuntimeSignatures: true,
    })

    expect(firstSnapshot.runtimeAffectingFastSourceByFile.get(jsFile)).toBe('const cls = "foo"\nexport { cls }\n')
    expect(firstSnapshot.runtimeAffectingSignatureByFile.get(jsFile)).toBe(`fast-source:${opts.cache.computeHash('const cls = "foo"\nexport { cls }\n')}`)

    updateBundleBuildState(state, firstSnapshot, new Map([
      [jsFile, new Set<string>()],
    ]))

    const secondSnapshot = buildBundleSnapshot({
      [htmlFile]: {
        ...createRollupAsset('<view   class="foo">\n  hello\n</view>'),
        fileName: htmlFile,
      },
      [jsFile]: {
        ...createRollupChunk('const cls = "foo";\n\nexport { cls }\n'),
        fileName: jsFile,
      },
      [cssFile]: {
        ...createRollupAsset('.card{color:red}/* note */\n.page{padding:8px}'),
        fileName: cssFile,
      },
    }, opts, outDir, state)

    expect(secondSnapshot.changedByType.html.has(htmlFile)).toBe(true)
    expect(secondSnapshot.changedByType.js.has(jsFile)).toBe(true)
    expect(secondSnapshot.changedByType.css.has(cssFile)).toBe(true)
    expect(secondSnapshot.runtimeAffectingChangedByType.html.has(htmlFile)).toBe(false)
    expect(secondSnapshot.runtimeAffectingChangedByType.js.has(jsFile)).toBe(false)
    expect(secondSnapshot.runtimeAffectingChangedByType.css.has(cssFile)).toBe(false)
    expect(secondSnapshot.runtimeAffectingFastSourceByFile.has(jsFile)).toBe(false)
  })

  it('uses source-hash runtime signatures for large vendor js chunks', () => {
    const opts = createOptions()
    const state = createBundleBuildState()
    const outDir = '/project/dist'
    const file = 'taro.js'
    const source = `const runtime = "foo";\n${'/* framework runtime */\n'.repeat(5200)}`

    const snapshot = buildBundleSnapshot({
      [file]: {
        ...createRollupChunk(source),
        fileName: file,
      },
    }, opts, outDir, state)

    expect(snapshot.runtimeAffectingSignatureByFile.get(file)).toBe(`fast-source:${opts.cache.computeHash(source)}`)
    expect(snapshot.runtimeAffectingFastSourceByFile.get(file)).toBe(source)
  })

  it('does not mark formatting-only css changes as runtime-affecting', () => {
    const opts = createOptions()
    const state = createBundleBuildState()
    const outDir = '/project/dist'

    const firstSnapshot = buildBundleSnapshot({
      'assets/index.css': {
        ...createRollupAsset('.card { color: red; }\n.page { padding: 8px; }'),
        fileName: 'assets/index.css',
      },
    }, opts, outDir, state)

    updateBundleBuildState(state, firstSnapshot, new Map())

    const secondSnapshot = buildBundleSnapshot({
      'assets/index.css': {
        ...createRollupAsset('.card{color:red}/* note */\n.page{padding:8px}'),
        fileName: 'assets/index.css',
      },
    }, opts, outDir, state)

    expect(secondSnapshot.changedByType.css.has('assets/index.css')).toBe(true)
    expect(secondSnapshot.runtimeAffectingChangedByType.css.has('assets/index.css')).toBe(false)
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

  it('keeps omitted files in build state during incremental bundle updates', () => {
    const opts = createOptions()
    const state = createBundleBuildState()
    const outDir = '/project/dist'

    const firstSnapshot = buildBundleSnapshot({
      'pages/index/index.wxml': {
        ...createRollupAsset('<view class="foo" />'),
        fileName: 'pages/index/index.wxml',
      },
      'assets/index.js': {
        ...createRollupChunk('const cls = "bg-[#000]"'),
        fileName: 'assets/index.js',
      },
    }, opts, outDir, state)

    updateBundleBuildState(state, firstSnapshot, new Map([
      ['assets/index.js', new Set<string>()],
    ]))

    const secondSnapshot = buildBundleSnapshot({
      'assets/index.js': {
        ...createRollupChunk('const cls = "bg-[#f00]"'),
        fileName: 'assets/index.js',
      },
    }, opts, outDir, state)

    updateBundleBuildState(state, secondSnapshot, new Map([
      ['assets/index.js', new Set<string>()],
    ]), { incremental: true })

    expect(state.sourceHashByFile.has('pages/index/index.wxml')).toBe(true)
    expect(state.sourceHashByFile.has('assets/index.js')).toBe(true)

    const thirdSnapshot = buildBundleSnapshot({
      'assets/index.js': {
        ...createRollupChunk('const cls = "bg-[#0f0]"'),
        fileName: 'assets/index.js',
      },
    }, opts, outDir, state)

    expect(thirdSnapshot.processFiles.js.has('assets/index.js')).toBe(true)
    expect(thirdSnapshot.processFiles.html.has('pages/index/index.wxml')).toBe(false)
  })

  it('build snapshot processes all entries without incremental bookkeeping', () => {
    const opts = createOptions()
    const outDir = '/project/dist'

    const snapshot = buildBundleSnapshotForBuild({
      'pages/index/index.wxml': {
        ...createRollupAsset('<view class="foo" />'),
        fileName: 'pages/index/index.wxml',
      },
      'assets/entry.js': {
        ...createRollupChunk('console.log("foo")'),
        fileName: 'assets/entry.js',
      },
      'assets/index.css': {
        ...createRollupAsset('.foo { color: red; }'),
        fileName: 'assets/index.css',
      },
    }, opts, outDir)

    expect(snapshot.processFiles.html).toEqual(new Set(['pages/index/index.wxml']))
    expect(snapshot.processFiles.js).toEqual(new Set(['assets/entry.js']))
    expect(snapshot.processFiles.css).toEqual(new Set(['assets/index.css']))
    expect(snapshot.changedByType.html.size).toBe(0)
    expect(snapshot.changedByType.js.size).toBe(0)
    expect(snapshot.changedByType.css.size).toBe(0)
    expect(snapshot.runtimeAffectingChangedByType.html.size).toBe(0)
    expect(snapshot.runtimeAffectingChangedByType.js.size).toBe(0)
  })
})
