import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { CompilationResult } from '@/compiler'
import { createGulpRuntimeSnapshot } from '@/bundlers/gulp/runtime-snapshot'
import {
  buildBundleSnapshot,
  createBundleBuildState,
} from '@/bundlers/vite/bundle-state'
import { buildWebpackBundleSnapshot } from '@/bundlers/webpack/BaseUnifiedPlugin/v5-assets/helpers'
import { createCache } from '@/cache'
import {
  createCompilationScopeSnapshot,
  createRuntimeCompilationBuildState,
  DefaultCompilationSession,
  sourceNodeId,
  updateRuntimeCompilationBuildState,
} from '@/compiler'
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

function normalizeSnapshot(snapshot: ReturnType<typeof createGulpRuntimeSnapshot>) {
  return {
    entries: snapshot.entries.map(({ file, runtimeCandidate, source, type }) => ({
      file,
      runtimeCandidate,
      source,
      type,
    })),
    changed: Object.fromEntries(
      Object.entries(snapshot.changedByType).map(([type, files]) => [type, [...files].sort()]),
    ),
    runtimeChanged: Object.fromEntries(
      Object.entries(snapshot.runtimeAffectingChangedByType).map(([type, files]) => [type, [...files].sort()]),
    ),
    processFiles: Object.fromEntries(
      Object.entries(snapshot.processFiles).map(([type, files]) => [type, [...files].sort()]),
    ),
    removedFiles: [...snapshot.removedFiles].sort(),
  }
}

function createCompilerSnapshot(
  snapshot: ReturnType<typeof createGulpRuntimeSnapshot>,
  candidatesByFile: ReadonlyMap<string, Iterable<string>>,
) {
  return createCompilationScopeSnapshot(
    { id: 'app', kind: 'global' },
    'app.css',
    snapshot.entries.map(entry => ({
      id: entry.file,
      kind: entry.type === 'html' ? 'template' as const : 'script' as const,
      candidates: candidatesByFile.get(entry.file) ?? [],
      content: entry.source,
    })),
    {
      changes: [...snapshot.removedFiles].map(file => ({
        sourceId: sourceNodeId(file),
        type: 'source-removed' as const,
      })),
    },
  )
}

function normalizeCompilationResult(result: CompilationResult) {
  return {
    revision: result.revision,
    candidates: [...result.candidates].sort(),
    candidatesBySource: Object.fromEntries(
      [...result.candidatesBySource]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([sourceId, candidates]) => [sourceId, [...candidates].sort()]),
    ),
    validatedClassSet: [...result.validatedClassSet].sort(),
    invalidatedScopes: [...result.invalidatedScopes].sort(),
    graphNodes: [...result.graphNodes].sort((left, right) => left.id.localeCompare(right.id)),
    graphEdges: [...result.graphEdges].sort((left, right) => (
      `${left.from}:${left.kind}:${left.to}`.localeCompare(`${right.from}:${right.kind}:${right.to}`)
    )),
  }
}

describe('bundler runtime snapshot contract', () => {
  it('produces equivalent runtime decisions for Vite, Webpack, and Gulp entries', () => {
    const opts = createOptions()
    const viteState = createBundleBuildState()
    const webpackState = createBundleBuildState()
    const htmlFile = 'pages/index/index.wxml'
    const jsFile = 'assets/index.js'
    const htmlSource = '<view class="text-red-500" />'
    const jsSource = 'const cls = "text-red-500"'
    const viteSnapshot = buildBundleSnapshot({
      [htmlFile]: {
        ...createRollupAsset(htmlSource),
        fileName: htmlFile,
      },
      [jsFile]: {
        ...createRollupChunk(jsSource),
        fileName: jsFile,
      },
    }, opts, path.resolve('/project/dist'), viteState)
    const webpackSnapshot = buildWebpackBundleSnapshot({
      [htmlFile]: { source: () => htmlSource },
      [jsFile]: { source: () => jsSource },
    }, opts, webpackState)
    const gulpSnapshot = createGulpRuntimeSnapshot(new Map([
      [htmlFile, { source: htmlSource, type: 'html' }],
      [jsFile, { source: jsSource, type: 'js' }],
    ]), createRuntimeCompilationBuildState(), source => opts.cache.computeHash(source))

    expect(normalizeSnapshot(viteSnapshot)).toEqual(normalizeSnapshot(gulpSnapshot))
    expect(normalizeSnapshot(webpackSnapshot)).toEqual(normalizeSnapshot(gulpSnapshot))

    const candidatesByFile = new Map([
      [htmlFile, ['text-red-500']],
      [jsFile, ['text-red-500']],
    ])
    const viteResult = new DefaultCompilationSession().update(
      createCompilerSnapshot(viteSnapshot, candidatesByFile),
    )
    const webpackResult = new DefaultCompilationSession().update(
      createCompilerSnapshot(webpackSnapshot, candidatesByFile),
    )
    const gulpResult = new DefaultCompilationSession().update(
      createCompilerSnapshot(gulpSnapshot, candidatesByFile),
    )
    expect(normalizeCompilationResult(viteResult)).toEqual(normalizeCompilationResult(gulpResult))
    expect(normalizeCompilationResult(webpackResult)).toEqual(normalizeCompilationResult(gulpResult))
  })

  it('keeps incremental CompilationResult decisions equivalent across bundlers', () => {
    const opts = createOptions()
    const viteState = createBundleBuildState()
    const webpackState = createRuntimeCompilationBuildState()
    const gulpState = createRuntimeCompilationBuildState()
    const viteSession = new DefaultCompilationSession()
    const webpackSession = new DefaultCompilationSession()
    const gulpSession = new DefaultCompilationSession()
    const htmlFile = 'pages/index/index.wxml'
    const jsFile = 'assets/index.js'
    const htmlSource = '<view class="text-red-500" />'
    const firstJsSource = 'const cls = "text-red-500"'
    const nextJsSource = 'const cls = "p-4"'

    const buildSnapshots = (
      jsSource: string,
      options: { includeHtml?: boolean, removedFiles?: string[] } = {},
    ) => {
      const includeHtml = options.includeHtml !== false
      const removedFiles = options.removedFiles ?? []
      const vite = buildBundleSnapshot({
        ...(includeHtml
          ? {
              [htmlFile]: {
                ...createRollupAsset(htmlSource),
                fileName: htmlFile,
              },
            }
          : {}),
        [jsFile]: {
          ...createRollupChunk(jsSource),
          fileName: jsFile,
        },
      }, opts, path.resolve('/project/dist'), viteState, false, {
        hasOmittedKnownFiles: removedFiles.length > 0,
        removedFiles,
      })
      const webpack = buildWebpackBundleSnapshot({
        ...(includeHtml ? { [htmlFile]: { source: () => htmlSource } } : {}),
        [jsFile]: { source: () => jsSource },
      }, opts, webpackState, undefined, { removedFiles })
      const gulpEntries = new Map<string, { source: string, type: 'html' | 'js' }>()
      if (includeHtml) {
        gulpEntries.set(htmlFile, { source: htmlSource, type: 'html' })
      }
      gulpEntries.set(jsFile, { source: jsSource, type: 'js' })
      const gulp = createGulpRuntimeSnapshot(
        gulpEntries,
        gulpState,
        source => opts.cache.computeHash(source),
        { removedFiles },
      )
      return { vite, webpack, gulp }
    }

    const firstSnapshots = buildSnapshots(firstJsSource)
    const firstCandidates = new Map([
      [htmlFile, ['text-red-500']],
      [jsFile, ['text-red-500']],
    ])
    viteSession.update(createCompilerSnapshot(firstSnapshots.vite, firstCandidates))
    webpackSession.update(createCompilerSnapshot(firstSnapshots.webpack, firstCandidates))
    gulpSession.update(createCompilerSnapshot(firstSnapshots.gulp, firstCandidates))
    updateRuntimeCompilationBuildState(viteState, firstSnapshots.vite, new Map())
    updateRuntimeCompilationBuildState(webpackState, firstSnapshots.webpack, new Map())
    updateRuntimeCompilationBuildState(gulpState, firstSnapshots.gulp, new Map())

    const nextSnapshots = buildSnapshots(nextJsSource)
    expect(normalizeSnapshot(nextSnapshots.vite)).toEqual(normalizeSnapshot(nextSnapshots.gulp))
    expect(normalizeSnapshot(nextSnapshots.webpack)).toEqual(normalizeSnapshot(nextSnapshots.gulp))
    const nextCandidates = new Map([
      [htmlFile, ['text-red-500']],
      [jsFile, ['p-4']],
    ])
    const viteResult = viteSession.update(createCompilerSnapshot(nextSnapshots.vite, nextCandidates))
    const webpackResult = webpackSession.update(createCompilerSnapshot(nextSnapshots.webpack, nextCandidates))
    const gulpResult = gulpSession.update(createCompilerSnapshot(nextSnapshots.gulp, nextCandidates))

    expect(normalizeCompilationResult(viteResult)).toEqual(normalizeCompilationResult(gulpResult))
    expect(normalizeCompilationResult(webpackResult)).toEqual(normalizeCompilationResult(gulpResult))
    expect(gulpResult.candidates).toEqual(new Set(['text-red-500', 'p-4']))
    expect(gulpResult.invalidatedScopes).toEqual(new Set(['app']))
    expect(nextSnapshots.gulp.processFiles.js).toEqual(new Set([jsFile]))

    updateRuntimeCompilationBuildState(viteState, nextSnapshots.vite, new Map(), { incremental: true })
    updateRuntimeCompilationBuildState(webpackState, nextSnapshots.webpack, new Map(), { incremental: true })
    updateRuntimeCompilationBuildState(gulpState, nextSnapshots.gulp, new Map(), { incremental: true })
    const removedSnapshots = buildSnapshots(nextJsSource, {
      includeHtml: false,
      removedFiles: [htmlFile],
    })
    expect(normalizeSnapshot(removedSnapshots.vite)).toEqual(normalizeSnapshot(removedSnapshots.gulp))
    expect(normalizeSnapshot(removedSnapshots.webpack)).toEqual(normalizeSnapshot(removedSnapshots.gulp))
    const removedCandidates = new Map([[jsFile, ['p-4']]])
    const viteRemoved = viteSession.update(createCompilerSnapshot(removedSnapshots.vite, removedCandidates))
    const webpackRemoved = webpackSession.update(createCompilerSnapshot(removedSnapshots.webpack, removedCandidates))
    const gulpRemoved = gulpSession.update(createCompilerSnapshot(removedSnapshots.gulp, removedCandidates))

    expect(normalizeCompilationResult(viteRemoved)).toEqual(normalizeCompilationResult(gulpRemoved))
    expect(normalizeCompilationResult(webpackRemoved)).toEqual(normalizeCompilationResult(gulpRemoved))
    expect(gulpRemoved.candidates).toEqual(new Set(['p-4']))
    expect(gulpRemoved.invalidatedScopes).toEqual(new Set(['app']))
    updateRuntimeCompilationBuildState(viteState, removedSnapshots.vite, new Map(), { incremental: true })
    updateRuntimeCompilationBuildState(webpackState, removedSnapshots.webpack, new Map(), { incremental: true })
    updateRuntimeCompilationBuildState(gulpState, removedSnapshots.gulp, new Map(), { incremental: true })
    expect(viteState.sourceHashByFile.has(htmlFile)).toBe(false)
    expect(webpackState.sourceHashByFile.has(htmlFile)).toBe(false)
    expect(gulpState.sourceHashByFile.has(htmlFile)).toBe(false)
  })

  it('preserves non-vendor JavaScript assets as runtime candidate sources', () => {
    const opts = createOptions()
    const file = 'workers/runtime.js'
    const snapshot = buildBundleSnapshot({
      [file]: {
        ...createRollupAsset('const cls = "grid"'),
        fileName: file,
      },
    }, opts, path.resolve('/project/dist'), createBundleBuildState())

    expect(snapshot.entries[0]?.runtimeCandidate).toBe(true)
  })

  it('accepts partial Rollup chunk metadata when planning runtime candidates', () => {
    const opts = createOptions()
    const file = 'pages/runtime.js'
    const output = {
      ...createRollupChunk('const cls = "flex"'),
      fileName: file,
      moduleIds: undefined,
      modules: undefined,
    } as any
    const snapshot = buildBundleSnapshot({
      [file]: output,
    }, opts, path.resolve('/project/dist'), createBundleBuildState())

    expect(snapshot.entries[0]?.runtimeCandidate).toBe(true)
  })
})
