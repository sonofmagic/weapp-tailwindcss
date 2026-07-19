import { describe, expect, it } from 'vitest'
import {
  buildRuntimeCompilationSnapshot,
  createRuntimeCompilationAffectingSignature,
  createRuntimeAffectingSourceSignature,
  createRuntimeCompilationBuildState,
  createRuntimeCompilationSnapshot,
  removeRuntimeCompilationBuildStateFiles,
  resetRuntimeCompilationBuildState,
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

  it('removes evicted files and their linked state from the build state', () => {
    const state = createRuntimeCompilationBuildState()
    state.sourceHashByFile.set('entry.js', 'entry-hash')
    state.sourceHashByFile.set('shared.js', 'shared-hash')
    state.runtimeAffectingHashByFile.set('shared.js', 'runtime-hash')
    state.bundleMarkupCandidatesByFile.set('shared.js', new Set(['flex']))
    state.linkedByEntry.set('entry.js', new Set(['shared.js']))
    state.dependentsByLinkedFile.set('shared.js', new Set(['entry.js']))

    removeRuntimeCompilationBuildStateFiles(state, ['shared.js'])

    expect(state.sourceHashByFile.has('shared.js')).toBe(false)
    expect(state.runtimeAffectingHashByFile.has('shared.js')).toBe(false)
    expect(state.bundleMarkupCandidatesByFile.has('shared.js')).toBe(false)
    expect(state.linkedByEntry.get('entry.js')).toEqual(new Set())
    expect(state.dependentsByLinkedFile.has('shared.js')).toBe(false)
  })

  it('applies explicit removals to partial snapshots and incremental state', () => {
    const cache = createCache()
    const state = createRuntimeCompilationBuildState()
    const first = buildRuntimeCompilationSnapshot([
      createEntry('entry.js', 'const cls = "grid"', 'js'),
      createEntry('removed.js', 'const cls = "flex"', 'js'),
    ], state, {
      computeHash: value => cache.computeHash(value),
      createRuntimeAffectingSignature: createRuntimeAffectingSourceSignature,
    })
    updateRuntimeCompilationBuildState(state, first, new Map([
      ['entry.js', new Set(['removed.js'])],
    ]))

    const partial = buildRuntimeCompilationSnapshot([
      createEntry('entry.js', 'const cls = "grid"', 'js'),
    ], state, {
      computeHash: value => cache.computeHash(value),
      createRuntimeAffectingSignature: createRuntimeAffectingSourceSignature,
      hasOmittedKnownFiles: true,
      removedFiles: ['removed.js'],
    })
    expect(partial.removedFiles).toEqual(new Set(['removed.js']))

    updateRuntimeCompilationBuildState(state, partial, new Map(), { incremental: true })
    expect(state.sourceHashByFile.has('removed.js')).toBe(false)
    expect(state.runtimeAffectingHashByFile.has('removed.js')).toBe(false)
    expect(state.linkedByEntry.get('entry.js')).toEqual(new Set())
    expect(state.dependentsByLinkedFile.has('removed.js')).toBe(false)
  })

  it('creates stable semantic signatures and resets build state ownership', () => {
    const cache = createCache()
    const state = createRuntimeCompilationBuildState()
    const build = (source: string) => buildRuntimeCompilationSnapshot([
      createEntry('entry.js', source, 'js'),
    ], state, {
      computeHash: value => cache.computeHash(value),
      createRuntimeAffectingSignature: createRuntimeAffectingSourceSignature,
    })
    const first = build('const cls = "card"\nexport { cls }')
    const firstSignature = createRuntimeCompilationAffectingSignature(first, value => cache.computeHash(value))
    updateRuntimeCompilationBuildState(state, first, new Map())
    const sourceHashByFile = state.sourceHashByFile
    const second = build('const cls = "card";\n\nexport { cls }\n')

    expect(createRuntimeCompilationAffectingSignature(second, value => cache.computeHash(value))).toBe(firstSignature)

    resetRuntimeCompilationBuildState(state)

    expect(state.iteration).toBe(0)
    expect(state.sourceHashByFile).toBe(sourceHashByFile)
    expect(state.sourceHashByFile.size).toBe(0)
    expect(state.runtimeAffectingHashByFile.size).toBe(0)
  })
})
