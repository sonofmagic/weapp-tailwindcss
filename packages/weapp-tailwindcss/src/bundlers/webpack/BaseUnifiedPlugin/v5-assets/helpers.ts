import type { Compiler, sources as WebpackSources } from 'webpack'
import type { BundleRuntimeClassSetManager } from '../../../vite/incremental-runtime-class-set'
import type { AppType, InternalUserDefinedOptions } from '@/types'

export interface SetupWebpackV5ProcessAssetsHookOptions {
  compiler: Compiler
  options: InternalUserDefinedOptions
  appType?: AppType | undefined
  runtimeState: {
    twPatcher: InternalUserDefinedOptions['twPatcher']
    readyPromise: Promise<void>
  }
  getRuntimeRefreshRequirement: () => boolean
  refreshRuntimeMetadata: (force: boolean) => Promise<void>
  isWebpackProcessedCssAsset?: ((file: string, rawSource: string) => boolean) | undefined
  consumeRuntimeRefreshRequirement: () => void
  isWatchMode?: (() => boolean) | undefined
  runtimeClassSetManager?: BundleRuntimeClassSetManager | undefined
  debug: (format: string, ...args: unknown[]) => void
}

export type WebpackSourceLike = string | WebpackSources.Source

export function createWebpackSnapshotAssets(assets: Record<string, { source: () => unknown }>) {
  return Object.fromEntries(
    Object.entries(assets).map(([file, asset]) => {
      const source = asset.source()
      return [
        file,
        {
          fileName: file,
          source: typeof source === 'string' ? source : source?.toString() ?? '',
          type: 'asset',
        },
      ]
    }),
  )
}

export function stringifyWebpackSource(source: unknown) {
  if (typeof source === 'string') {
    return source
  }
  return source?.toString() ?? ''
}

export function createWebpackAssetUpdater(options: {
  compilation: {
    getAsset: (file: string) => { source: { source: () => unknown } } | undefined
    updateAsset: (file: string, source: WebpackSourceLike) => void
  }
  ConcatSource: new (source: string) => WebpackSources.Source
  onUpdate: (file: string, previousSource: string, nextSource: string) => void
  debug: (format: string, ...args: unknown[]) => void
}) {
  const getCurrentAssetSource = (file: string) => {
    const asset = options.compilation.getAsset(file)
    if (!asset) {
      return undefined
    }
    return stringifyWebpackSource(asset.source.source())
  }
  const updateAssetIfChanged = (
    file: string,
    source: WebpackSourceLike,
    { notifyUpdate = true }: { notifyUpdate?: boolean } = {},
  ) => {
    const nextSource = typeof source === 'string'
      ? source
      : stringifyWebpackSource(source.source())
    const previousSource = getCurrentAssetSource(file)
    if (previousSource === nextSource) {
      options.debug('asset unchanged, skip update: %s', file)
      return false
    }
    options.compilation.updateAsset(file, typeof source === 'string' ? new options.ConcatSource(source) : source)
    if (notifyUpdate) {
      options.onUpdate(file, previousSource ?? '', nextSource)
    }
    return true
  }

  return {
    getCurrentAssetSource,
    updateAssetIfChanged,
  }
}
