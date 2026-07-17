import type { GenerationArtifact } from './types'
import { cloneGenerationArtifact } from './artifact'

export interface AssetEmission {
  assetId: string
  artifact: GenerationArtifact
}

export interface AssetWriteOperation<Source = string> {
  assetId: string
  kind: 'write'
  source: Source
}

export interface AssetDeleteOperation {
  assetId: string
  kind: 'delete'
}

export type AssetEmissionOperation<Source = string> = AssetWriteOperation<Source> | AssetDeleteOperation

export class AssetEmissionPlan<Source = string> {
  private readonly emissions = new Map<string, GenerationArtifact>()
  private readonly assetOperations: AssetEmissionOperation<Source>[] = []

  upsert(assetId: string, artifact: GenerationArtifact) {
    this.emissions.set(assetId, cloneGenerationArtifact(artifact))
  }

  get(assetId: string) {
    const artifact = this.emissions.get(assetId)
    return artifact ? cloneGenerationArtifact(artifact) : undefined
  }

  entries(): AssetEmission[] {
    return [...this.emissions].map(([assetId, artifact]) => ({
      assetId,
      artifact: cloneGenerationArtifact(artifact),
    }))
  }

  write(assetId: string, source: Source) {
    this.assetOperations.push({
      assetId,
      kind: 'write',
      source,
    })
  }

  remove(assetId: string) {
    this.assetOperations.push({
      assetId,
      kind: 'delete',
    })
  }

  operations(): AssetEmissionOperation<Source>[] {
    return this.assetOperations.map(operation => ({ ...operation }))
  }

  clear() {
    this.emissions.clear()
    this.assetOperations.length = 0
  }
}
