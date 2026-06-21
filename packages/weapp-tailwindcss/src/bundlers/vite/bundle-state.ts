import type { OutputAsset, OutputChunk } from 'rollup'
import type { OutputEntry } from './bundle-entries'
import type { InternalUserDefinedOptions } from '@/types'
import { toAbsoluteOutputPath } from '../shared/module-graph'
import { isJavaScriptEntry } from './bundle-entries'
import { createRuntimeAffectingSourceSignature } from './runtime-affecting-signature'
import { isCSSRequest, isHTMLRequest } from './utils'

export type EntryType = 'html' | 'js' | 'css' | 'other'

export interface BundleStateEntry {
  file: string
  output: OutputAsset | OutputChunk
  source: string
  type: EntryType
}

export interface ProcessFileSets {
  html: Set<string>
  js: Set<string>
  css: Set<string>
}

export interface BundleSnapshot {
  entries: BundleStateEntry[]
  jsEntries: Map<string, OutputEntry>
  sourceHashByFile: Map<string, string>
  runtimeAffectingSignatureByFile: Map<string, string>
  runtimeAffectingHashByFile: Map<string, string>
  hasOmittedKnownFiles: boolean
  changedByType: Record<EntryType, Set<string>>
  runtimeAffectingChangedByType: Record<EntryType, Set<string>>
  processFiles: ProcessFileSets
  linkedImpactsByEntry: Map<string, Set<string>>
}

export interface BundleBuildState {
  iteration: number
  sourceHashByFile: Map<string, string>
  /**
   * 仅为快照结构兼容保留。长期 build state 不保存完整 runtime 签名，
   * 避免 watch/HMR 中把大段源码派生字符串常驻内存。
   */
  runtimeAffectingSignatureByFile: Map<string, string>
  runtimeAffectingHashByFile: Map<string, string>
  linkedByEntry: Map<string, Set<string>>
  dependentsByLinkedFile: Map<string, Set<string>>
  generatorCandidateSignature?: string | undefined
}

interface UpdateBundleBuildStateOptions {
  incremental?: boolean
}

interface BuildBundleSnapshotOptions {
  hasOmittedKnownFiles?: boolean | undefined
}

export function createBundleBuildState(): BundleBuildState {
  return {
    iteration: 0,
    sourceHashByFile: new Map<string, string>(),
    runtimeAffectingSignatureByFile: new Map<string, string>(),
    runtimeAffectingHashByFile: new Map<string, string>(),
    linkedByEntry: new Map<string, Set<string>>(),
    dependentsByLinkedFile: new Map<string, Set<string>>(),
    generatorCandidateSignature: undefined,
  }
}

function createChangedByType() {
  return {
    html: new Set<string>(),
    js: new Set<string>(),
    css: new Set<string>(),
    other: new Set<string>(),
  } satisfies Record<EntryType, Set<string>>
}

function createProcessFiles(): ProcessFileSets {
  return {
    html: new Set<string>(),
    js: new Set<string>(),
    css: new Set<string>(),
  }
}

function readEntrySource(output: OutputAsset | OutputChunk) {
  if (output.type === 'chunk') {
    return output.code
  }
  return output.source.toString()
}

export function classifyBundleEntry(file: string, opts: InternalUserDefinedOptions): EntryType {
  if (opts.htmlMatcher(file) || isHTMLRequest(file)) {
    return 'html'
  }
  if (opts.cssMatcher(file) || isCSSRequest(file)) {
    return 'css'
  }
  if (opts.jsMatcher(file) || opts.wxsMatcher(file)) {
    return 'js'
  }
  return 'other'
}

function collectJsEntries(
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

function markProcessFile(
  type: EntryType,
  file: string,
  processFiles: ProcessFileSets,
) {
  if (type === 'html' || type === 'js' || type === 'css') {
    processFiles[type].add(file)
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
  const sourceHashByFile = new Map<string, string>()
  const runtimeAffectingSignatureByFile = new Map<string, string>()
  const runtimeAffectingHashByFile = new Map<string, string>()
  const changedByType = createChangedByType()
  const runtimeAffectingChangedByType = createChangedByType()
  const processFiles = createProcessFiles()
  const linkedImpactsByEntry = new Map<string, Set<string>>()
  const jsEntries = new Map<string, OutputEntry>()
  const entries: BundleStateEntry[] = []
  const firstRun = state.iteration === 0 && state.sourceHashByFile.size === 0
  const hasOmittedKnownFiles = options.hasOmittedKnownFiles === true

  for (const [file, output] of Object.entries(bundle)) {
    const type = classifyBundleEntry(file, opts)
    const source = readEntrySource(output)
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

    if (forceAll || firstRun) {
      markProcessFile(type, file, processFiles)
    }
    else if (type === 'html') {
      // watch 轮次下需要始终回填 html 缓存，避免产物回退。
      processFiles.html.add(file)
    }
    else if (changed && (type === 'js' || type === 'css')) {
      processFiles[type].add(file)
    }

    collectJsEntries(file, output, outDir, jsEntries)
    entries.push({
      file,
      output,
      source,
      type,
    })
  }

  if (!forceAll && !firstRun) {
    for (const changedFile of changedByType.js) {
      const dependents = state.dependentsByLinkedFile.get(changedFile)
      if (!dependents) {
        continue
      }
      for (const entryFile of dependents) {
        processFiles.js.add(entryFile)
        let impacts = linkedImpactsByEntry.get(entryFile)
        if (!impacts) {
          impacts = new Set<string>()
          linkedImpactsByEntry.set(entryFile, impacts)
        }
        impacts.add(changedFile)
      }
    }
  }

  return {
    entries,
    jsEntries,
    sourceHashByFile,
    runtimeAffectingSignatureByFile,
    runtimeAffectingHashByFile,
    hasOmittedKnownFiles,
    changedByType,
    runtimeAffectingChangedByType,
    processFiles,
    linkedImpactsByEntry,
  }
}

export function buildBundleSnapshotForBuild(
  bundle: Record<string, OutputAsset | OutputChunk>,
  opts: InternalUserDefinedOptions,
  outDir: string,
): BundleSnapshot {
  const processFiles = createProcessFiles()
  const jsEntries = new Map<string, OutputEntry>()
  const entries: BundleStateEntry[] = []

  for (const [file, output] of Object.entries(bundle)) {
    const type = classifyBundleEntry(file, opts)
    const source = readEntrySource(output)
    markProcessFile(type, file, processFiles)
    collectJsEntries(file, output, outDir, jsEntries)
    entries.push({
      file,
      output,
      source,
      type,
    })
  }

  return {
    entries,
    jsEntries,
    sourceHashByFile: new Map<string, string>(),
    runtimeAffectingSignatureByFile: new Map<string, string>(),
    runtimeAffectingHashByFile: new Map<string, string>(),
    hasOmittedKnownFiles: false,
    changedByType: createChangedByType(),
    runtimeAffectingChangedByType: createChangedByType(),
    processFiles,
    linkedImpactsByEntry: new Map<string, Set<string>>(),
  }
}

function invertLinkedByEntry(linkedByEntry: Map<string, Set<string>>) {
  const dependentsByLinkedFile = new Map<string, Set<string>>()
  for (const [entryFile, linkedFiles] of linkedByEntry.entries()) {
    for (const linkedFile of linkedFiles) {
      let dependents = dependentsByLinkedFile.get(linkedFile)
      if (!dependents) {
        dependents = new Set<string>()
        dependentsByLinkedFile.set(linkedFile, dependents)
      }
      dependents.add(entryFile)
    }
  }
  return dependentsByLinkedFile
}

function replaceMapEntries<Key, Value>(
  target: Map<Key, Value>,
  source: Map<Key, Value>,
) {
  target.clear()
  for (const [key, value] of source) {
    target.set(key, value)
  }
  return target
}

function mergeMapEntries<Key, Value>(
  target: Map<Key, Value>,
  source: Map<Key, Value>,
) {
  for (const [key, value] of source) {
    target.set(key, value)
  }
  return target
}

export function updateBundleBuildState(
  state: BundleBuildState,
  snapshot: BundleSnapshot,
  linkedByEntry: Map<string, Set<string>>,
  options: UpdateBundleBuildStateOptions = {},
) {
  const incremental = options.incremental === true
  state.iteration += 1
  state.sourceHashByFile = incremental
    ? mergeMapEntries(state.sourceHashByFile, snapshot.sourceHashByFile)
    : replaceMapEntries(state.sourceHashByFile, snapshot.sourceHashByFile)
  state.runtimeAffectingSignatureByFile.clear()
  state.runtimeAffectingHashByFile = incremental
    ? mergeMapEntries(state.runtimeAffectingHashByFile, snapshot.runtimeAffectingHashByFile)
    : replaceMapEntries(state.runtimeAffectingHashByFile, snapshot.runtimeAffectingHashByFile)
  state.linkedByEntry = incremental
    ? mergeMapEntries(state.linkedByEntry, linkedByEntry)
    : replaceMapEntries(state.linkedByEntry, linkedByEntry)
  state.dependentsByLinkedFile = invertLinkedByEntry(state.linkedByEntry)
}
