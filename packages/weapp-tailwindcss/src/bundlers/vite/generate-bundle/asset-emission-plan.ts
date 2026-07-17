import type { OutputAsset, OutputChunk } from 'rollup'
import type { AssetEmissionPlan } from '@/compiler'

export interface ApplyViteAssetEmissionPlanOptions {
  bundle: Record<string, OutputAsset | OutputChunk>
  emitOrReplayAsset: (file: string, source: string) => OutputAsset | undefined
  writeTargets?: ReadonlyMap<string, OutputAsset> | undefined
}

export function applyViteAssetEmissionPlan(
  plan: AssetEmissionPlan,
  options: ApplyViteAssetEmissionPlanOptions,
) {
  for (const operation of plan.operations()) {
    if (operation.kind === 'delete') {
      delete options.bundle[operation.assetId]
      continue
    }

    const writeTarget = options.writeTargets?.get(operation.assetId)
    const existing = options.bundle[operation.assetId]
    const asset = writeTarget ?? (existing?.type === 'asset' ? existing : undefined)
    if (asset) {
      asset.source = operation.source
      continue
    }

    const replayAsset = options.emitOrReplayAsset(operation.assetId, operation.source)
    if (replayAsset) {
      options.bundle[operation.assetId] = replayAsset
    }
  }
}
