import { describe, expect, it } from 'vitest'
import {
  buildBundleSnapshot,
  createBundleBuildState,
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
  it('reuses runtime-affecting signatures when source hash is unchanged', () => {
    const opts = createOptions()
    const state = createBundleBuildState()
    const source = 'const cls = "bg-[#123456]"'
    const file = 'assets/index.js'

    state.sourceHashByFile.set(file, opts.cache.computeHash(source))
    state.runtimeAffectingSignatureByFile.set(file, 'cached-runtime-signature')
    state.runtimeAffectingHashByFile.set(file, 'cached-runtime-hash')

    const snapshot = buildBundleSnapshot({
      [file]: {
        ...createRollupChunk(source),
        fileName: file,
      },
    }, opts, '/project/dist', state)

    expect(snapshot.changedByType.js.has(file)).toBe(false)
    expect(snapshot.runtimeAffectingChangedByType.js.has(file)).toBe(false)
    expect(snapshot.runtimeAffectingSignatureByFile.get(file)).toBe('cached-runtime-signature')
    expect(snapshot.runtimeAffectingHashByFile.get(file)).toBe('cached-runtime-hash')
  })
})
