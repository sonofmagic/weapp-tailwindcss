import type { OutputAsset } from 'rollup'
import path from 'node:path'
import { normalizeOutputPathKey } from '../shared/module-graph'

export type ViteCssAssetIdentityKind = 'user' | 'generator-placeholder' | 'bundler-generated'

export interface ViteCssAssetIdentity {
  kind: ViteCssAssetIdentityKind
  sourceFile?: string | undefined
}

export interface CreateViteCssAssetIdentityResolverOptions {
  generatorPlaceholderFile: string
  isKnownProcessedSource: (file: string) => boolean
}

export function createViteCssAssetIdentityResolver(
  options: CreateViteCssAssetIdentityResolverOptions,
) {
  const identityByAsset = new WeakMap<OutputAsset, ViteCssAssetIdentity>()
  const placeholderFile = normalizeOutputPathKey(path.resolve(options.generatorPlaceholderFile))
  return (asset: OutputAsset, file?: string): ViteCssAssetIdentity => {
    const cached = identityByAsset.get(asset)
    if (cached) {
      return cached
    }
    const candidates = [
      file,
      asset.originalFileName,
      ...(asset.originalFileNames ?? []),
    ].filter((candidate): candidate is string => typeof candidate === 'string' && candidate.length > 0)
    const placeholderSourceFile = candidates.find(candidate =>
      normalizeOutputPathKey(path.resolve(candidate.replace(/[?#].*$/, ''))) === placeholderFile,
    )
    let identity: ViteCssAssetIdentity
    if (placeholderSourceFile) {
      identity = {
        kind: 'generator-placeholder',
        sourceFile: placeholderSourceFile,
      }
    }
    else {
      identity = candidates.some(options.isKnownProcessedSource)
        ? { kind: 'bundler-generated' }
        : { kind: 'user' }
    }
    identityByAsset.set(asset, identity)
    return identity
  }
}
