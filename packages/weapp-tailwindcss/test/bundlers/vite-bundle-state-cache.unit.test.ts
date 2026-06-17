import { describe, expect, it } from 'vitest'
import {
  buildBundleSnapshot,
  createBundleBuildState,
  updateBundleBuildState,
} from '@/bundlers/vite/bundle-state'
import { createCache } from '@/cache'
import { createRollupChunk } from './vite-plugin.testkit'

function createOptions() {
  return {
    cache: createCache(),
    cssMatcher: (file: string) => file.endsWith('.css'),
    htmlMatcher: (file: string) => file.endsWith('.wxml'),
    jsMatcher: (file: string) => file.endsWith('.js'),
    wxsMatcher: () => false,
  } as any
}

describe('bundlers/vite bundle state cache', () => {
  it('reuses runtime-affecting hashes when source hash is unchanged without retaining signatures', () => {
    const opts = createOptions()
    const state = createBundleBuildState()
    const source = 'const cls = "bg-[#123456]"'
    const file = 'assets/index.js'

    state.sourceHashByFile.set(file, opts.cache.computeHash(source))
    state.runtimeAffectingHashByFile.set(file, 'cached-runtime-hash')

    const snapshot = buildBundleSnapshot({
      [file]: {
        ...createRollupChunk(source),
        fileName: file,
      },
    }, opts, '/project/dist', state)

    expect(snapshot.changedByType.js.has(file)).toBe(false)
    expect(snapshot.runtimeAffectingChangedByType.js.has(file)).toBe(false)
    expect(snapshot.runtimeAffectingSignatureByFile.has(file)).toBe(false)
    expect(snapshot.runtimeAffectingHashByFile.get(file)).toBe('cached-runtime-hash')
  })

  it('updates incremental state in place and drops snapshot runtime signatures', () => {
    const opts = createOptions()
    const state = createBundleBuildState()
    const firstSnapshot = buildBundleSnapshot({
      'assets/a.js': {
        ...createRollupChunk('const cls = "w-1"'),
        fileName: 'assets/a.js',
      },
    }, opts, '/project/dist', state)
    const sourceHashByFile = state.sourceHashByFile
    const runtimeAffectingHashByFile = state.runtimeAffectingHashByFile
    const linkedByEntry = state.linkedByEntry

    updateBundleBuildState(state, firstSnapshot, new Map([
      ['assets/a.js', new Set<string>()],
    ]))

    expect(state.sourceHashByFile).toBe(sourceHashByFile)
    expect(state.runtimeAffectingHashByFile).toBe(runtimeAffectingHashByFile)
    expect(state.linkedByEntry).toBe(linkedByEntry)
    expect(firstSnapshot.runtimeAffectingSignatureByFile.size).toBe(1)
    expect(state.runtimeAffectingSignatureByFile.size).toBe(0)

    const secondSnapshot = buildBundleSnapshot({
      'assets/a.js': {
        ...createRollupChunk('const cls = "w-2"'),
        fileName: 'assets/a.js',
      },
    }, opts, '/project/dist', state)

    updateBundleBuildState(state, secondSnapshot, new Map([
      ['assets/a.js', new Set<string>()],
    ]), { incremental: true })

    expect(state.sourceHashByFile).toBe(sourceHashByFile)
    expect(state.runtimeAffectingHashByFile).toBe(runtimeAffectingHashByFile)
    expect(state.linkedByEntry).toBe(linkedByEntry)
    expect(secondSnapshot.runtimeAffectingSignatureByFile.size).toBe(1)
    expect(state.runtimeAffectingSignatureByFile.size).toBe(0)
  })
})
