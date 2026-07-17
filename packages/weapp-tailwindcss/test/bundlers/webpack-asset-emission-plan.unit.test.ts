import { describe, expect, it, vi } from 'vitest'
import { applyWebpackAssetEmissionPlan } from '@/bundlers/webpack/BaseUnifiedPlugin/v5-assets/asset-emission-plan'
import { applyWebpackLinkedJsResults } from '@/bundlers/webpack/BaseUnifiedPlugin/v5-assets/js-module-graph'
import { AssetEmissionPlan } from '@/compiler'

class ConcatSource {
  constructor(readonly value: string) {}

  source() {
    return this.value
  }
}

describe('webpack asset emission plan', () => {
  it('updates existing assets and preserves webpack source objects', () => {
    const updateAsset = vi.fn()
    const source = { source: vi.fn(() => 'cached') }
    const plan = new AssetEmissionPlan<any>()
    plan.write('app.wxss', source)

    applyWebpackAssetEmissionPlan(plan, {
      compilation: {
        getAsset: vi.fn(() => ({ source })),
        updateAsset,
      },
      ConcatSource: ConcatSource as any,
    })

    expect(source.source).not.toHaveBeenCalled()
    expect(updateAsset).toHaveBeenCalledWith('app.wxss', source)
  })

  it('emits missing assets and deletes removed assets', () => {
    const emitAsset = vi.fn()
    const deleteAsset = vi.fn()
    const plan = new AssetEmissionPlan()
    plan.write('generated.acss', '.generated{}')
    plan.remove('stale.acss')

    applyWebpackAssetEmissionPlan(plan, {
      compilation: {
        deleteAsset,
        emitAsset,
        getAsset: vi.fn(() => undefined),
        updateAsset: vi.fn(),
      },
      ConcatSource: ConcatSource as any,
    })

    expect(emitAsset).toHaveBeenCalledWith('generated.acss', expect.objectContaining({
      value: '.generated{}',
    }))
    expect(deleteAsset).toHaveBeenCalledWith('stale.acss')
  })

  it('writes linked js results through the webpack emission executor', () => {
    const updateAsset = vi.fn()
    const onUpdate = vi.fn()
    const debug = vi.fn()
    const sources = new Map([
      ['page.js', { source: () => 'const value = "old"' }],
      ['same.js', { source: () => 'const value = "same"' }],
    ])

    applyWebpackLinkedJsResults({
      compilation: {
        getAsset: vi.fn(file => sources.has(file) ? { source: sources.get(file)! } : undefined),
        updateAsset,
      },
      compilerOptions: { onUpdate } as any,
      ConcatSource: ConcatSource as any,
      debug,
      jsAssets: new Map([
        ['/output/page.js', 'page.js'],
        ['/output/same.js', 'same.js'],
      ]),
      linked: {
        '/output/page.js': { code: 'const value = "next"' },
        '/output/same.js': { code: 'const value = "same"' },
      } as any,
    })

    expect(updateAsset).toHaveBeenCalledTimes(1)
    expect(updateAsset).toHaveBeenCalledWith('page.js', expect.objectContaining({
      value: 'const value = "next"',
    }))
    expect(onUpdate).toHaveBeenCalledWith('page.js', 'const value = "old"', 'const value = "next"')
    expect(debug).toHaveBeenCalledWith('js linked handle: %s', 'page.js')
  })
})
