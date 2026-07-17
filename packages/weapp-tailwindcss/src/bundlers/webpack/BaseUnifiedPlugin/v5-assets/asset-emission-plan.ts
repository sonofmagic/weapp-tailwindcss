import type { sources as WebpackSources } from 'webpack'
import type { AssetEmissionPlan } from '@/compiler'

export type WebpackSourceLike = string | WebpackSources.Source

export interface WebpackAssetCompilationLike {
  deleteAsset?: ((file: string) => void) | undefined
  emitAsset?: ((file: string, source: WebpackSources.Source) => void) | undefined
  getAsset: (file: string) => { source: { source: () => unknown } } | undefined
  updateAsset: (file: string, source: WebpackSources.Source) => void
}

export function applyWebpackAssetEmissionPlan(
  plan: AssetEmissionPlan<WebpackSourceLike>,
  options: {
    compilation: WebpackAssetCompilationLike
    ConcatSource: new (source: string) => WebpackSources.Source
    writeMode?: 'update' | 'upsert' | undefined
  },
) {
  for (const operation of plan.operations()) {
    if (operation.kind === 'delete') {
      options.compilation.deleteAsset?.(operation.assetId)
      continue
    }
    const source = typeof operation.source === 'string'
      ? new options.ConcatSource(operation.source)
      : operation.source
    if (options.writeMode !== 'update' && !options.compilation.getAsset(operation.assetId)) {
      if (options.compilation.emitAsset) {
        options.compilation.emitAsset(operation.assetId, source)
        continue
      }
    }
    options.compilation.updateAsset(operation.assetId, source)
  }
}
