import type { OutputAsset } from 'rollup'
import path from 'node:path'
import { hasBundlerGeneratedCssMarker } from '../shared/generated-css-marker'
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

function readAssetSource(asset: OutputAsset) {
  return typeof asset.source === 'string' ? asset.source : asset.source.toString()
}

function isLegacyPlaceholderSource(source: string) {
  return source.includes('weapp-tailwindcss generator-placeholder')
    || source.includes('vite-placeholder')
}

export function resolveLegacyViteCssAssetIdentity(asset: OutputAsset): ViteCssAssetIdentity {
  if (isLegacyPlaceholderSource(readAssetSource(asset))) {
    return {
      kind: 'generator-placeholder',
    }
  }
  if (hasBundlerGeneratedCssMarker(asset.source)) {
    return {
      kind: 'bundler-generated',
    }
  }
  return {
    kind: 'user',
  }
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
      const legacyIdentity = resolveLegacyViteCssAssetIdentity(asset)
      identity = legacyIdentity.kind === 'generator-placeholder'
        ? legacyIdentity
        : candidates.some(options.isKnownProcessedSource)
          ? { kind: 'bundler-generated' }
          : legacyIdentity
    }
    identityByAsset.set(asset, identity)
    return identity
  }
}
