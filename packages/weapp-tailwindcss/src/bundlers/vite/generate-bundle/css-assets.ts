import type { OutputAsset } from 'rollup'
import type { GenerateBundleThis } from './types'
import { createReplayCssAsset } from './rollup-assets'

export function createCssAssetEmitter(
  context: Pick<GenerateBundleThis, 'emitFile'>,
  bundle?: Record<string, OutputAsset | unknown> | undefined,
) {
  return (fileName: string, source: string) => {
    const existing = bundle?.[fileName]
    if (existing && typeof existing === 'object' && 'type' in existing && existing.type === 'asset') {
      existing.source = source
      return existing as OutputAsset
    }
    if (context.emitFile) {
      context.emitFile({
        type: 'asset',
        fileName,
        source,
      })
      return undefined
    }
    return createReplayCssAsset(fileName, source)
  }
}

export function resolveAssetSourceFile(asset: OutputAsset, fallbackFile: string) {
  const candidates = [
    asset.originalFileName,
    ...(asset.originalFileNames ?? []),
  ].filter((item): item is string => typeof item === 'string' && item.length > 0)
  return candidates[0] ?? fallbackFile
}
