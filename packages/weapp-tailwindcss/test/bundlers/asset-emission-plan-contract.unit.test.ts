import type { OutputAsset } from 'rollup'
import { Buffer } from 'node:buffer'
import { describe, expect, it } from 'vitest'
import { applyGulpAssetEmissionPlan } from '@/bundlers/gulp/asset-emission-plan'
import { applyViteAssetEmissionPlan } from '@/bundlers/vite/generate-bundle/asset-emission-plan'
import { applyWebpackAssetEmissionPlan } from '@/bundlers/webpack/BaseUnifiedPlugin/v5-assets/asset-emission-plan'
import { AssetEmissionPlan } from '@/compiler'
import { createRollupAsset } from './vite-plugin.testkit'

class ConcatSource {
  constructor(readonly value: string) {}

  source() {
    return this.value
  }
}

function createPlan() {
  const plan = new AssetEmissionPlan()
  plan.write('app.acss', '.app{color:red}')
  plan.write('generated.acss', '.generated{display:flex}')
  plan.remove('stale.acss')
  return plan
}

function normalizeAssets(assets: Map<string, string>) {
  return Object.fromEntries([...assets].sort(([left], [right]) => left.localeCompare(right)))
}

describe('bundler asset emission plan contract', () => {
  it('applies equivalent writes and deletions in Vite, Webpack, and Gulp', () => {
    const viteBundle: Record<string, OutputAsset> = {
      'app.acss': { ...createRollupAsset('old'), fileName: 'app.acss' },
      'stale.acss': { ...createRollupAsset('stale'), fileName: 'stale.acss' },
    }
    applyViteAssetEmissionPlan(createPlan(), {
      bundle: viteBundle,
      emitOrReplayAsset: (file, source) => ({
        ...createRollupAsset(source),
        fileName: file,
      }),
    })
    const viteAssets = new Map(
      Object.entries(viteBundle).map(([file, asset]) => [file, asset.source.toString()]),
    )

    const webpackAssets = new Map<string, ConcatSource>([
      ['app.acss', new ConcatSource('old')],
      ['stale.acss', new ConcatSource('stale')],
    ])
    applyWebpackAssetEmissionPlan(createPlan(), {
      compilation: {
        deleteAsset: file => webpackAssets.delete(file),
        emitAsset: (file, source) => webpackAssets.set(file, source as ConcatSource),
        getAsset: file => webpackAssets.has(file)
          ? { source: webpackAssets.get(file)! }
          : undefined,
        updateAsset: (file, source) => webpackAssets.set(file, source as ConcatSource),
      },
      ConcatSource: ConcatSource as any,
    })
    const normalizedWebpackAssets = new Map(
      [...webpackAssets].map(([file, source]) => [file, source.source()]),
    )

    const gulpAssets = new Map<string, Buffer>([
      ['app.acss', Buffer.from('old')],
      ['stale.acss', Buffer.from('stale')],
    ])
    applyGulpAssetEmissionPlan(createPlan(), {
      deleteAsset: file => gulpAssets.delete(file),
      writeAsset: (file, contents) => gulpAssets.set(file, contents),
    })
    const normalizedGulpAssets = new Map(
      [...gulpAssets].map(([file, contents]) => [file, contents.toString()]),
    )

    expect(normalizeAssets(viteAssets)).toEqual(normalizeAssets(normalizedGulpAssets))
    expect(normalizeAssets(normalizedWebpackAssets)).toEqual(normalizeAssets(normalizedGulpAssets))
  })
})
