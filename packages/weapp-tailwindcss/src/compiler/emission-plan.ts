import type { GenerationArtifact } from './types'
import { cloneGenerationArtifact } from './artifact'

export interface AssetEmission {
  assetId: string
  artifact: GenerationArtifact
}

export class AssetEmissionPlan {
  private readonly emissions = new Map<string, GenerationArtifact>()

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

  clear() {
    this.emissions.clear()
  }
}
