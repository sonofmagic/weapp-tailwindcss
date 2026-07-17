import { describe, expect, it, vi } from 'vitest'
import { applyWebpackAssetEmissionPlan } from '@/bundlers/webpack/BaseUnifiedPlugin/v5-assets/asset-emission-plan'
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
})
