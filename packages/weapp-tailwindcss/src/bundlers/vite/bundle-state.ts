import type { OutputAsset, OutputChunk } from 'rollup'
import type { OutputEntry } from './bundle-entries'
import type { InternalUserDefinedOptions } from '@/types'
import { toAbsoluteOutputPath } from '../shared/module-graph'
import { isJavaScriptEntry } from './bundle-entries'
import { createRuntimeAffectingSourceSignature } from './runtime-affecting-signature'

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
  runtimeAffectingFastSourceByFile: Map<string, string>
  changedByType: Record<EntryType, Set<string>>
  runtimeAffectingChangedByType: Record<EntryType, Set<string>>
  processFiles: ProcessFileSets
  linkedImpactsByEntry: Map<string, Set<string>>
}

export interface BundleBuildState {
  iteration: number
  sourceHashByFile: Map<string, string>
  runtimeAffectingSignatureByFile: Map<string, string>
  runtimeAffectingHashByFile: Map<string, string>
  runtimeAffectingFastSourceByFile: Map<string, string>
  linkedByEntry: Map<string, Set<string>>
  dependentsByLinkedFile: Map<string, Set<string>>
  generatorCandidateSignature?: string | undefined
}

export interface BuildBundleSnapshotOptions {
  forceAll?: boolean | undefined
  fastInitialRuntimeSignatures?: boolean | undefined
}

interface UpdateBundleBuildStateOptions {
  incremental?: boolean
}

const FAST_RUNTIME_AFFECTING_SIGNATURE_PREFIX = 'fast-source:'
const LARGE_JS_RUNTIME_SIGNATURE_THRESHOLD = 100 * 1024
const VENDOR_JS_FILE_RE = /(?:^|\/)(?:common\/)?(?:vendor|vendors|taro|runtime|babelHelpers)(?:[./-]|$)/

export function createBundleBuildState(): BundleBuildState {
  return {
    iteration: 0,
    sourceHashByFile: new Map<string, string>(),
    runtimeAffectingSignatureByFile: new Map<string, string>(),
    runtimeAffectingHashByFile: new Map<string, string>(),
    runtimeAffectingFastSourceByFile: new Map<string, string>(),
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
  if (opts.cssMatcher(file)) {
    return 'css'
  }
  if (opts.htmlMatcher(file)) {
    return 'html'
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

function shouldUseSourceHashRuntimeSignature(file: string, source: string, type: EntryType) {
  return type === 'js'
    && source.length >= LARGE_JS_RUNTIME_SIGNATURE_THRESHOLD
    && VENDOR_JS_FILE_RE.test(file)
}

export function buildBundleSnapshot(
  bundle: Record<string, OutputAsset | OutputChunk>,
  opts: InternalUserDefinedOptions,
  outDir: string,
  state: BundleBuildState,
  options: boolean | BuildBundleSnapshotOptions = false,
): BundleSnapshot {
  const forceAll = typeof options === 'boolean' ? options : options.forceAll === true
  const fastInitialRuntimeSignatures = typeof options === 'object'
    && options.fastInitialRuntimeSignatures === true
  const sourceHashByFile = new Map<string, string>()
  const runtimeAffectingSignatureByFile = new Map<string, string>()
  const runtimeAffectingHashByFile = new Map<string, string>()
  const runtimeAffectingFastSourceByFile = new Map<string, string>()
  const changedByType = createChangedByType()
  const runtimeAffectingChangedByType = createChangedByType()
  const processFiles = createProcessFiles()
  const linkedImpactsByEntry = new Map<string, Set<string>>()
  const jsEntries = new Map<string, OutputEntry>()
  const entries: BundleStateEntry[] = []
  const firstRun = state.linkedByEntry.size === 0
  const canUseFastInitialRuntimeSignatures = fastInitialRuntimeSignatures
    && (forceAll || firstRun)

  for (const [file, output] of Object.entries(bundle)) {
    const type = classifyBundleEntry(file, opts)
    const source = readEntrySource(output)
    const hash = opts.cache.computeHash(source)
    sourceHashByFile.set(file, hash)

    const previousHash = state.sourceHashByFile.get(file)
    const changed = previousHash == null || previousHash !== hash
    const previousRuntimeAffectingSignature = state.runtimeAffectingSignatureByFile.get(file)
    const previousRuntimeAffectingHash = state.runtimeAffectingHashByFile.get(file)
    const canReuseRuntimeAffectingSignature = !changed
      && previousRuntimeAffectingSignature != null
      && previousRuntimeAffectingHash != null
    let runtimeAffectingSignature: string
    let runtimeAffectingHash: string
    let previousComparableRuntimeAffectingHash = previousRuntimeAffectingHash
    if (canReuseRuntimeAffectingSignature) {
      runtimeAffectingSignature = previousRuntimeAffectingSignature
      runtimeAffectingHash = previousRuntimeAffectingHash
      const previousFastSource = state.runtimeAffectingFastSourceByFile.get(file)
      if (previousFastSource != null) {
        runtimeAffectingFastSourceByFile.set(file, previousFastSource)
      }
    }
    else if (
      (canUseFastInitialRuntimeSignatures && previousRuntimeAffectingHash == null)
      || shouldUseSourceHashRuntimeSignature(file, source, type)
    ) {
      runtimeAffectingSignature = `${FAST_RUNTIME_AFFECTING_SIGNATURE_PREFIX}${hash}`
      runtimeAffectingHash = hash
      runtimeAffectingFastSourceByFile.set(file, source)
    }
    else {
      const previousFastSource = state.runtimeAffectingFastSourceByFile.get(file)
      runtimeAffectingSignature = createRuntimeAffectingSourceSignature(source, type)
      runtimeAffectingHash = opts.cache.computeHash(runtimeAffectingSignature)
      if (previousFastSource != null && previousRuntimeAffectingSignature?.startsWith(FAST_RUNTIME_AFFECTING_SIGNATURE_PREFIX)) {
        const previousRuntimeAffectingSignature = createRuntimeAffectingSourceSignature(previousFastSource, type)
        previousComparableRuntimeAffectingHash = opts.cache.computeHash(previousRuntimeAffectingSignature)
      }
    }
    runtimeAffectingSignatureByFile.set(file, runtimeAffectingSignature)
    runtimeAffectingHashByFile.set(file, runtimeAffectingHash)

    if (changed) {
      changedByType[type].add(file)
    }
    const runtimeAffectingChanged
      = previousComparableRuntimeAffectingHash == null || previousComparableRuntimeAffectingHash !== runtimeAffectingHash
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
    runtimeAffectingFastSourceByFile,
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
    runtimeAffectingFastSourceByFile: new Map<string, string>(),
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

export function updateBundleBuildState(
  state: BundleBuildState,
  snapshot: BundleSnapshot,
  linkedByEntry: Map<string, Set<string>>,
  options: UpdateBundleBuildStateOptions = {},
) {
  const incremental = options.incremental === true
  state.iteration += 1
  state.sourceHashByFile = incremental
    ? new Map([
        ...state.sourceHashByFile,
        ...snapshot.sourceHashByFile,
      ])
    : snapshot.sourceHashByFile
  state.runtimeAffectingSignatureByFile = incremental
    ? new Map([...state.runtimeAffectingSignatureByFile, ...snapshot.runtimeAffectingSignatureByFile])
    : snapshot.runtimeAffectingSignatureByFile
  state.runtimeAffectingHashByFile = incremental
    ? new Map([
        ...state.runtimeAffectingHashByFile,
        ...snapshot.runtimeAffectingHashByFile,
      ])
    : snapshot.runtimeAffectingHashByFile
  if (incremental) {
    const nextFastSourceByFile = new Map(state.runtimeAffectingFastSourceByFile)
    for (const entry of snapshot.entries) {
      const fastSource = snapshot.runtimeAffectingFastSourceByFile.get(entry.file)
      if (fastSource == null) {
        nextFastSourceByFile.delete(entry.file)
      }
      else {
        nextFastSourceByFile.set(entry.file, fastSource)
      }
    }
    state.runtimeAffectingFastSourceByFile = nextFastSourceByFile
  }
  else {
    state.runtimeAffectingFastSourceByFile = snapshot.runtimeAffectingFastSourceByFile
  }
  state.linkedByEntry = incremental
    ? new Map([
        ...state.linkedByEntry,
        ...linkedByEntry,
      ])
    : linkedByEntry
  state.dependentsByLinkedFile = invertLinkedByEntry(state.linkedByEntry)
}
