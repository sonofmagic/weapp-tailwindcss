import type { OutputAsset, OutputChunk } from 'rollup'
import type { GenerateBundleThis } from './types'
import { createReplayCssAsset } from './rollup-assets'

export function createCssAssetEmitter(
  context: Pick<GenerateBundleThis, 'emitFile'>,
  bundle: Record<string, OutputAsset | OutputChunk>,
) {
  return (fileName: string, source: string) => {
    const replayAsset = createReplayCssAsset(fileName, source)
    if (context.emitFile) {
      context.emitFile({
        type: 'asset',
        fileName,
        source,
      })
    }
    else {
      bundle[fileName] = replayAsset
    }
    return replayAsset
  }
}

export function resolveAssetSourceFile(asset: OutputAsset, fallbackFile: string) {
  const candidates = [
    asset.originalFileName,
    ...(asset.originalFileNames ?? []),
  ].filter((item): item is string => typeof item === 'string' && item.length > 0)
  return candidates[0] ?? fallbackFile
}
