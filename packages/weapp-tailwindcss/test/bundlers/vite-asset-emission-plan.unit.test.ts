import type { OutputAsset } from 'rollup'
import { describe, expect, it, vi } from 'vitest'
import { applyViteAssetEmissionPlan } from '@/bundlers/vite/generate-bundle/asset-emission-plan'
import { AssetEmissionPlan } from '@/compiler'

function createAsset(fileName: string, source: string): OutputAsset {
  return {
    fileName,
    name: undefined,
    names: [],
    needsCodeReference: false,
    originalFileName: null,
    originalFileNames: [],
    source,
    type: 'asset',
  }
}

describe('Vite asset emission plan', () => {
  it('applies writes, creates replay assets, and removes stale bundle entries', () => {
    const existing = createAsset('app.wxss', 'old')
    const replay = createAsset('generated.wxss', 'generated')
    const bundle = {
      'app.wxss': existing,
      'stale.wxss': createAsset('stale.wxss', 'stale'),
    }
    const emitOrReplayAsset = vi.fn((file: string) => file === 'generated.wxss' ? replay : undefined)
    const plan = new AssetEmissionPlan()
    plan.write('app.wxss', 'updated')
    plan.write('generated.wxss', 'generated')
    plan.remove('stale.wxss')

    applyViteAssetEmissionPlan(plan, {
      bundle,
      emitOrReplayAsset,
    })

    expect(existing.source).toBe('updated')
    expect(bundle['generated.wxss']).toBe(replay)
    expect(bundle['stale.wxss']).toBeUndefined()
    expect(emitOrReplayAsset).toHaveBeenCalledWith('generated.wxss', 'generated')
  })

  it('uses explicit write targets when the bundle key points elsewhere', () => {
    const writeTarget = createAsset('source.scss', 'old')
    const bundle = {
      'source.scss': createAsset('source.scss', 'other'),
    }
    const plan = new AssetEmissionPlan()
    plan.write('source.scss', '')

    applyViteAssetEmissionPlan(plan, {
      bundle,
      emitOrReplayAsset: vi.fn(),
      writeTargets: new Map([['source.scss', writeTarget]]),
    })

    expect(writeTarget.source).toBe('')
    expect(bundle['source.scss'].source).toBe('other')
  })
})
