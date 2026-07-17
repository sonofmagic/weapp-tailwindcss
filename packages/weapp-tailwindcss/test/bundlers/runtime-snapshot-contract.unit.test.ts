import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { createGulpRuntimeSnapshot } from '@/bundlers/gulp/runtime-snapshot'
import {
  buildBundleSnapshot,
  createBundleBuildState,
} from '@/bundlers/vite/bundle-state'
import { buildWebpackBundleSnapshot } from '@/bundlers/webpack/BaseUnifiedPlugin/v5-assets/helpers'
import { createCache } from '@/cache'
import { createRuntimeCompilationBuildState } from '@/compiler'
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
