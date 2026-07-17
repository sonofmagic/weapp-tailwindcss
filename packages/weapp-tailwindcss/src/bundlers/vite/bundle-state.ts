import type { OutputAsset, OutputChunk } from 'rollup'
import type { OutputEntry } from './bundle-entries'
import type {
  RuntimeCompilationBuildState,
  RuntimeCompilationSnapshot,
  RuntimeEntryType,
  RuntimeSnapshotEntry,
  UpdateRuntimeCompilationBuildStateOptions,
} from '@/compiler'
import type { InternalUserDefinedOptions } from '@/types'
import { Buffer } from 'node:buffer'
import {
  buildRuntimeCompilationSnapshot,
  createRuntimeAffectingSourceSignature,
  createRuntimeCompilationBuildState,
  createRuntimeCompilationSnapshot,
  updateRuntimeCompilationBuildState,
} from '@/compiler'
import { toAbsoluteOutputPath } from '../shared/module-graph'
import { classifyRuntimeEntry } from '../shared/runtime-entry-type'
import { isJavaScriptEntry } from './bundle-entries'
import { isRuntimeCandidateBundleEntry } from './runtime-candidate-entry'

export type EntryType = RuntimeEntryType

export interface BundleStateEntry extends RuntimeSnapshotEntry {
  output: OutputAsset | OutputChunk
}

export interface BundleSnapshot extends RuntimeCompilationSnapshot<BundleStateEntry> {
  jsEntries: Map<string, OutputEntry>
}

export type BundleBuildState = RuntimeCompilationBuildState

interface BuildBundleSnapshotOptions {
  hasOmittedKnownFiles?: boolean | undefined
}

export function createBundleBuildState(): BundleBuildState {
  return createRuntimeCompilationBuildState()
}

function readEntrySource(output: OutputAsset | OutputChunk) {
  if (output.type === 'chunk') {
    return output.code
  }
  return typeof output.source === 'string'
    ? output.source
    : Buffer.from(output.source).toString()
}

export function classifyBundleEntry(file: string, opts: InternalUserDefinedOptions): EntryType {
  return classifyRuntimeEntry(file, opts)
}

function collectJsEntry(
  fileName: string,
  output: OutputAsset | OutputChunk,
  outDir: string,
  store: Map<string, OutputEntry>,
) {
  const entry: OutputEntry = { fileName, output }
  if (!isJavaScriptEntry(entry)) {
    return
  }
  const absolute = toAbsoluteOutputPath(fileName, outDir)
  store.set(absolute, entry)
}

function collectBundleEntries(
  bundle: Record<string, OutputAsset | OutputChunk>,
  opts: InternalUserDefinedOptions,
  outDir: string,
) {
  const jsEntries = new Map<string, OutputEntry>()
  const entries: BundleStateEntry[] = []

  for (const [file, output] of Object.entries(bundle)) {
    const type = classifyBundleEntry(file, opts)
    const entry: BundleStateEntry = {
      file,
      output,
      source: readEntrySource(output),
      type,
    }
    entry.runtimeCandidate = isRuntimeCandidateBundleEntry(entry)
    collectJsEntry(file, output, outDir, jsEntries)
    entries.push(entry)
  }

  return {
    entries,
    jsEntries,
  }
}

export function buildBundleSnapshot(
  bundle: Record<string, OutputAsset | OutputChunk>,
  opts: InternalUserDefinedOptions,
  outDir: string,
  state: BundleBuildState,
  forceAll = false,
  options: BuildBundleSnapshotOptions = {},
): BundleSnapshot {
  const { entries, jsEntries } = collectBundleEntries(bundle, opts, outDir)
  const snapshot = buildRuntimeCompilationSnapshot(entries, state, {
    computeHash: source => opts.cache.computeHash(source),
    createRuntimeAffectingSignature: createRuntimeAffectingSourceSignature,
    forceAll,
    hasOmittedKnownFiles: options.hasOmittedKnownFiles,
  })

  return {
    ...snapshot,
    jsEntries,
  }
}

export function buildBundleSnapshotForBuild(
  bundle: Record<string, OutputAsset | OutputChunk>,
  opts: InternalUserDefinedOptions,
  outDir: string,
): BundleSnapshot {
  const { entries, jsEntries } = collectBundleEntries(bundle, opts, outDir)
  const snapshot = createRuntimeCompilationSnapshot(entries, {
    processFiles: entries.map(entry => entry.file),
  })

  return {
    ...snapshot,
    jsEntries,
  }
}

export function updateBundleBuildState(
  state: BundleBuildState,
  snapshot: BundleSnapshot,
  linkedByEntry: Map<string, Set<string>>,
  options: UpdateRuntimeCompilationBuildStateOptions = {},
) {
  updateRuntimeCompilationBuildState(state, snapshot, linkedByEntry, options)
}
