import type { OutputAsset, OutputChunk } from 'rollup'
import { describe, expect, it } from 'vitest'
import { resolveCurrentSourceCandidateFile } from '@/bundlers/vite/generate-bundle/source-candidate-source'
import {
  createViteSourceOutputRelationOwner,
  withViteSourceOutputRelationOwner,
} from '@/bundlers/vite/source-output-relations'

function createAsset(fileName: string, originalFileNames: string[]): OutputAsset {
  return {
    type: 'asset',
    fileName,
    name: undefined,
    names: [],
    needsCodeReference: false,
    originalFileName: originalFileNames[0] ?? null,
    originalFileNames,
    source: '',
  }
}

function createChunk(fileName: string, facadeModuleId: string | null, moduleIds: string[]): OutputChunk {
  return {
    type: 'chunk',
    code: '',
    dynamicImports: [],
    exports: [],
    facadeModuleId,
    fileName,
    implicitlyLoadedBefore: [],
    importedBindings: {},
    imports: [],
    isDynamicEntry: false,
    isEntry: true,
    isImplicitEntry: false,
    map: null,
    moduleIds,
    modules: {},
    name: fileName,
    preliminaryFileName: fileName,
    referencedFiles: [],
    sourcemapFileName: null,
  }
}

describe('vite source output relations', () => {
  it('consumes an explicitly deleted non-WeChat style output once', () => {
    const owner = createViteSourceOutputRelationOwner()
    const consumer = owner.createRemovalConsumer()
    owner.recordBundle({
      'styles/theme.acss': createAsset('styles/theme.acss', ['/workspace/src/theme.css']),
    })

    expect(owner.removeSource('/workspace/src/theme.css')).toEqual(new Set(['styles/theme.acss']))
    expect(consumer.consume([])).toEqual(['styles/theme.acss'])
    expect(consumer.consume([])).toEqual([])
  })

  it('keeps unrelated omitted outputs and filters outputs still emitted by the current bundle', () => {
    const owner = createViteSourceOutputRelationOwner()
    const consumer = owner.createRemovalConsumer()
    owner.recordBundle({
      'pages/a.ttss': createAsset('pages/a.ttss', ['/workspace/src/a.css']),
      'pages/b.ttss': createAsset('pages/b.ttss', ['/workspace/src/b.css']),
    })

    expect(consumer.consume(['pages/a.ttss'])).toEqual([])
    owner.removeSource('/workspace/src/a.css')
    expect(consumer.consume(['pages/a.ttss'])).toEqual([])
    owner.removeSource('/workspace/src/b.css')
    expect(consumer.consume([])).toEqual(['pages/b.ttss'])
  })

  it('does not remove a shared output until its final owner is deleted', () => {
    const owner = createViteSourceOutputRelationOwner()
    const consumer = owner.createRemovalConsumer()
    owner.recordOwnedOutput('/workspace/src/a.css', 'styles/shared.css')
    owner.recordOwnedOutput('/workspace/src/b.css', 'styles/shared.css')

    expect(owner.removeSource('/workspace/src/a.css')).toEqual(new Set())
    expect(consumer.consume([])).toEqual([])
    expect(owner.removeSource('/workspace/src/b.css')).toEqual(new Set(['styles/shared.css']))
    expect(consumer.consume([])).toEqual(['styles/shared.css'])
  })

  it('normalizes SFC queries and blocks stale replay until the source is observed again', () => {
    const owner = createViteSourceOutputRelationOwner()
    const consumer = owner.createRemovalConsumer()
    owner.recordOwnedOutput('/workspace/src/Page.vue?vue&type=style&index=0', 'pages/page.acss')

    owner.removeSource('/workspace/src/Page.vue')
    owner.recordOwnedOutput('/workspace/src/Page.vue?vue&type=style&index=0', 'pages/page.acss')
    expect(consumer.consume([])).toEqual(['pages/page.acss'])

    owner.observeSource('/workspace/src/Page.vue')
    owner.recordOwnedOutput('/workspace/src/Page.vue?vue&type=style&index=0', 'pages/page.acss')
    expect(owner.removeSource('/workspace/src/Page.vue')).toEqual(new Set(['pages/page.acss']))
  })

  it('uses facade ownership and avoids treating multi-module chunk membership as ownership', () => {
    const owner = createViteSourceOutputRelationOwner()
    const consumer = owner.createRemovalConsumer()
    owner.recordBundle({
      'entry.js': createChunk('entry.js', '/workspace/src/entry.ts', [
        '/workspace/src/entry.ts',
        '/workspace/src/shared.ts',
      ]),
      'shared.js': createChunk('shared.js', null, [
        '/workspace/src/a.ts',
        '/workspace/src/b.ts',
      ]),
    })

    expect(owner.removeSource('/workspace/src/shared.ts')).toEqual(new Set())
    expect(owner.removeSource('/workspace/src/a.ts')).toEqual(new Set())
    expect(owner.removeSource('/workspace/src/entry.ts')).toEqual(new Set(['entry.js']))
    expect(consumer.consume([])).toEqual(['entry.js'])
  })

  it('records exact source-candidate matches but rejects suffix-only ownership', () => {
    const owner = createViteSourceOutputRelationOwner()
    const consumer = owner.createRemovalConsumer()
    const exactSource = '/workspace/source/views/card.axml'
    const suffixSource = '/workspace/other/views/fallback.axml'

    withViteSourceOutputRelationOwner(owner, () => {
      expect(resolveCurrentSourceCandidateFile({
        file: 'views/card.axml',
        getSourceCandidateSource: file => file === exactSource ? '<view />' : undefined,
        outDir: '/workspace/dist',
        rootDir: '/workspace',
        sourceRoot: '/workspace/source',
      })).toBe(exactSource)
      expect(resolveCurrentSourceCandidateFile({
        file: 'views/fallback.axml',
        getSourceCandidateSources: () => new Map([[suffixSource, '<view />']]),
        outDir: '/workspace/dist',
        rootDir: '/workspace',
      })).toBe(suffixSource)
    })

    expect(owner.removeSource(exactSource)).toEqual(new Set(['views/card.axml']))
    expect(owner.removeSource(suffixSource)).toEqual(new Set())
    expect(consumer.consume([])).toEqual(['views/card.axml'])
  })
})
