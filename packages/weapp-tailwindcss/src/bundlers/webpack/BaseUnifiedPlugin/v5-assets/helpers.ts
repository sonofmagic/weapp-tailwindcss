import type { Compiler, sources as WebpackSources } from 'webpack'
import type { BundleBuildState, BundleSnapshot, EntryType } from '../../../vite/bundle-state'
import type { BundleRuntimeClassSetManager } from '../../../vite/incremental-runtime-class-set'
import type { AppType, InternalUserDefinedOptions } from '@/types'
import { classifyBundleEntry } from '../../../vite/bundle-state'
import { createRuntimeAffectingSourceSignature } from '../../../vite/runtime-affecting-signature'

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
  isKnownWebpackProcessedCssAsset?: ((file: string) => boolean) | undefined
  isWebpackProcessedCssAsset?: ((file: string, rawSource: string) => boolean) | undefined
  consumeRuntimeRefreshRequirement: () => void
  isWatchMode?: (() => boolean) | undefined
  getWatchChangedFiles?: (() => Iterable<string>) | undefined
  runtimeClassSetManager?: BundleRuntimeClassSetManager | undefined
  getWebpackCssSources?: (() => Iterable<[string, string | undefined]>) | undefined
  pruneWebpackCssSources?: ((activeSourceFiles: ReadonlySet<string>) => void) | undefined
  prepareWebpackCssSources?: (() => ReadonlySet<string>) | undefined
  debug: (format: string, ...args: unknown[]) => void
}

export type WebpackSourceLike = string | WebpackSources.Source

interface WebpackAssetCompilationLike {
  getAsset: (file: string) => { source: { source: () => unknown } } | undefined
  updateAsset: Compiler['webpack']['Compilation']['prototype']['updateAsset']
}

function createChangedByType() {
  return {
    html: new Set<string>(),
    js: new Set<string>(),
    css: new Set<string>(),
    other: new Set<string>(),
  } satisfies Record<EntryType, Set<string>>
}

function createProcessFiles() {
  return {
    html: new Set<string>(),
    js: new Set<string>(),
    css: new Set<string>(),
  }
}

function markProcessFile(
  type: EntryType,
  file: string,
  processFiles: BundleSnapshot['processFiles'],
) {
  if (type === 'html' || type === 'js' || type === 'css') {
    processFiles[type].add(file)
  }
}

export function buildWebpackBundleSnapshot(
  assets: Record<string, { source: () => unknown }>,
  opts: InternalUserDefinedOptions,
  state: BundleBuildState,
) {
  const sourceHashByFile = new Map<string, string>()
  const runtimeAffectingSignatureByFile = new Map<string, string>()
  const runtimeAffectingHashByFile = new Map<string, string>()
  const changedByType = createChangedByType()
  const runtimeAffectingChangedByType = createChangedByType()
  const processFiles = createProcessFiles()
  const entries: BundleSnapshot['entries'] = []
  const firstRun = state.iteration === 0 && state.sourceHashByFile.size === 0

  for (const [file, asset] of Object.entries(assets)) {
    const type = classifyBundleEntry(file, opts)
    if (type !== 'html' && type !== 'js') {
      continue
    }
    const rawSource = asset.source()
    const source = stringifyWebpackSource(rawSource)
    const hash = opts.cache.computeHash(source)
    sourceHashByFile.set(file, hash)

    const previousHash = state.sourceHashByFile.get(file)
    const changed = previousHash == null || previousHash !== hash
    const previousRuntimeAffectingHash = state.runtimeAffectingHashByFile.get(file)
    const canReuseRuntimeAffectingHash = !changed && previousRuntimeAffectingHash != null
    const runtimeAffectingHash = canReuseRuntimeAffectingHash
      ? previousRuntimeAffectingHash
      : (() => {
          const runtimeAffectingSignature = createRuntimeAffectingSourceSignature(source, type)
          runtimeAffectingSignatureByFile.set(file, runtimeAffectingSignature)
          return opts.cache.computeHash(runtimeAffectingSignature)
        })()
    runtimeAffectingHashByFile.set(file, runtimeAffectingHash)

    if (changed) {
      changedByType[type].add(file)
    }
    const runtimeAffectingChanged
      = previousRuntimeAffectingHash == null || previousRuntimeAffectingHash !== runtimeAffectingHash
    if (runtimeAffectingChanged) {
      runtimeAffectingChangedByType[type].add(file)
    }

    if (firstRun) {
      markProcessFile(type, file, processFiles)
    }
    else if (type === 'html') {
      processFiles.html.add(file)
    }
    else if (changed) {
      processFiles.js.add(file)
    }

    entries.push({
      file,
      output: {
        fileName: file,
        source,
        type: 'asset',
      },
      source,
      type,
    })
  }

  return {
    entries,
    jsEntries: new Map(),
    sourceHashByFile,
    runtimeAffectingSignatureByFile,
    runtimeAffectingHashByFile,
    hasOmittedKnownFiles: false,
    changedByType,
    runtimeAffectingChangedByType,
    processFiles,
    linkedImpactsByEntry: new Map(),
  } satisfies BundleSnapshot
}

export function releaseWebpackBundleSnapshotSources(snapshot: BundleSnapshot) {
  for (const entry of snapshot.entries) {
    entry.source = ''
    entry.output.source = ''
  }
}

export function stringifyWebpackSource(source: unknown) {
  if (typeof source === 'string') {
    return source
  }
  return source?.toString() ?? ''
}

export function createWebpackAssetUpdater(options: {
  compilation: WebpackAssetCompilationLike
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
    {
      compare = true,
      notifyUpdate = true,
    }: {
      compare?: boolean | undefined
      notifyUpdate?: boolean | undefined
    } = {},
  ) => {
    if (!compare) {
      options.compilation.updateAsset(file, typeof source === 'string' ? new options.ConcatSource(source) : source)
      return true
    }
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
