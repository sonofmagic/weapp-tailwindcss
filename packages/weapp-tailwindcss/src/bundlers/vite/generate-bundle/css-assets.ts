import type { OutputAsset } from 'rollup'
import type { GenerateBundleThis } from './types'
import { normalizeOutputPathKey } from '../../shared/module-graph'
import { createReplayCssAsset } from './rollup-assets'

export function createCssAssetEmitter(
  context: Pick<GenerateBundleThis, 'emitFile'>,
  bundle?: Record<string, OutputAsset | unknown> | undefined,
) {
  return (fileName: string, source: string) => {
    const fileNameKey = normalizeOutputPathKey(fileName)
    const existing = bundle?.[fileName] ?? Object.entries(bundle ?? {}).find(([bundleFile, output]) =>
      output != null
      && typeof output === 'object'
      && 'type' in output
      && output.type === 'asset'
      && normalizeOutputPathKey(('fileName' in output && typeof output.fileName === 'string' ? output.fileName : bundleFile)) === fileNameKey,
    )?.[1]
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
