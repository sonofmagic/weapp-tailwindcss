import type File from 'vinyl'
import type { AssetEmissionPlan } from '@/compiler'
import { Buffer } from 'node:buffer'
import { AssetEmissionPlan as DefaultAssetEmissionPlan } from '@/compiler'

export type GulpAssetSource = string | Buffer

export interface ApplyGulpAssetEmissionPlanOptions {
  deleteAsset: (assetId: string) => void
  writeAsset: (assetId: string, contents: Buffer) => void
}

export function applyGulpAssetEmissionPlan(
  plan: AssetEmissionPlan<GulpAssetSource>,
  options: ApplyGulpAssetEmissionPlanOptions,
) {
  for (const operation of plan.operations()) {
    if (operation.kind === 'delete') {
      options.deleteAsset(operation.assetId)
      continue
    }
    options.writeAsset(
      operation.assetId,
      typeof operation.source === 'string'
        ? Buffer.from(operation.source)
        : Buffer.from(operation.source),
    )
  }
}

export function writeGulpFileAsset(file: File, source: GulpAssetSource) {
  const plan = new DefaultAssetEmissionPlan<GulpAssetSource>()
  plan.write(file.path, source)
  applyGulpAssetEmissionPlan(plan, {
    deleteAsset(assetId) {
      if (assetId === file.path) {
        file.contents = null
      }
    },
    writeAsset(assetId, contents) {
      if (assetId === file.path) {
        file.contents = contents
      }
    },
  })
}
