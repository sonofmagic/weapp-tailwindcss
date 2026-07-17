import { describe, expect, it } from 'vitest'
import {
  buildRuntimeCompilationSnapshot,
  createRuntimeAffectingSourceSignature,
  createRuntimeCompilationBuildState,
  createRuntimeCompilationSnapshot,
  updateRuntimeCompilationBuildState,
} from '@/compiler'
import { createCache } from '@/cache'

function createEntry(file: string, source: string, type: 'html' | 'js' | 'css') {
  return {
    file,
    runtimeCandidate: type !== 'css',
    source,
    type,
  }
}

describe('compiler runtime snapshot', () => {
  it('creates explicit changed and process sets without bundler metadata', () => {
    const entries = [
      createEntry('pages/index.wxml', '<view class="foo" />', 'html'),
      createEntry('assets/index.js', 'const cls = "foo"', 'js'),
    ]
    const snapshot = createRuntimeCompilationSnapshot(entries, {
      changedFiles: ['assets/index.js'],
      processFiles: ['assets/index.js'],
      runtimeAffectingChangedFiles: ['assets/index.js'],
    })

    expect(snapshot.entries).toEqual(entries)
    expect(snapshot.entries.every(entry => !('output' in entry))).toBe(true)
    expect(snapshot.changedByType.js).toEqual(new Set(['assets/index.js']))
    expect(snapshot.runtimeAffectingChangedByType.js).toEqual(new Set(['assets/index.js']))
    expect(snapshot.processFiles.js).toEqual(new Set(['assets/index.js']))
  })

  it('reuses semantic hashes and queues linked dependents through one build state', () => {
    const cache = createCache()
    const state = createRuntimeCompilationBuildState()
    const build = (entries: ReturnType<typeof createEntry>[]) => buildRuntimeCompilationSnapshot(entries, state, {
      computeHash: source => cache.computeHash(source),
      createRuntimeAffectingSignature: createRuntimeAffectingSourceSignature,
    })
    const first = build([
      createEntry('assets/entry.js', 'import "./shared.js"\nconst cls = "foo"', 'js'),
      createEntry('assets/shared.js', 'export const cls = "foo"', 'js'),
    ])

    updateRuntimeCompilationBuildState(state, first, new Map([
      ['assets/entry.js', new Set(['assets/shared.js'])],
      ['assets/shared.js', new Set<string>()],
    ]))

    const second = build([
      createEntry('assets/entry.js', 'import "./shared.js"\nconst cls = "foo"', 'js'),
      createEntry('assets/shared.js', 'export const cls = "bar"', 'js'),
    ])

    expect(second.changedByType.js).toEqual(new Set(['assets/shared.js']))
    expect(second.processFiles.js).toEqual(new Set(['assets/shared.js', 'assets/entry.js']))
    expect(second.linkedImpactsByEntry.get('assets/entry.js')).toEqual(new Set(['assets/shared.js']))
    expect(second.runtimeAffectingSignatureByFile.has('assets/entry.js')).toBe(false)
  })
})
