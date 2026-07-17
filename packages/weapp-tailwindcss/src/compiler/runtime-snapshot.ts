export type RuntimeEntryType = 'html' | 'js' | 'css' | 'other'

export interface RuntimeSnapshotEntry {
  file: string
  source: string
  type: RuntimeEntryType
  runtimeCandidate?: boolean | undefined
}

export interface RuntimeProcessFileSets {
  html: Set<string>
  js: Set<string>
  css: Set<string>
}

export interface RuntimeCompilationSnapshot<
  Entry extends RuntimeSnapshotEntry = RuntimeSnapshotEntry,
> {
  entries: Entry[]
  sourceHashByFile: Map<string, string>
  runtimeAffectingSignatureByFile: Map<string, string>
  runtimeAffectingHashByFile: Map<string, string>
  hasOmittedKnownFiles: boolean
  changedByType: Record<RuntimeEntryType, Set<string>>
  runtimeAffectingChangedByType: Record<RuntimeEntryType, Set<string>>
  processFiles: RuntimeProcessFileSets
  linkedImpactsByEntry: Map<string, Set<string>>
}

export interface RuntimeCompilationBuildState {
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
  bundleMarkupCandidatesByFile: Map<string, Set<string>>
  generatorCandidateSignature?: string | undefined
}

export interface CreateRuntimeCompilationSnapshotOptions {
  changedFiles?: Iterable<string> | undefined
  runtimeAffectingChangedFiles?: Iterable<string> | undefined
  processFiles?: Iterable<string> | undefined
  hasOmittedKnownFiles?: boolean | undefined
}

export interface BuildRuntimeCompilationSnapshotOptions {
  computeHash: (source: string) => string
  createRuntimeAffectingSignature: (source: string, type: RuntimeEntryType) => string
  forceAll?: boolean | undefined
  hasOmittedKnownFiles?: boolean | undefined
}

export interface UpdateRuntimeCompilationBuildStateOptions {
  incremental?: boolean | undefined
}

export function createRuntimeCompilationBuildState(): RuntimeCompilationBuildState {
  return {
    iteration: 0,
    sourceHashByFile: new Map<string, string>(),
    runtimeAffectingSignatureByFile: new Map<string, string>(),
    runtimeAffectingHashByFile: new Map<string, string>(),
    linkedByEntry: new Map<string, Set<string>>(),
    dependentsByLinkedFile: new Map<string, Set<string>>(),
    bundleMarkupCandidatesByFile: new Map<string, Set<string>>(),
    generatorCandidateSignature: undefined,
  }
}

function createChangedByType() {
  return {
    html: new Set<string>(),
    js: new Set<string>(),
    css: new Set<string>(),
    other: new Set<string>(),
  } satisfies Record<RuntimeEntryType, Set<string>>
}

function createProcessFiles(): RuntimeProcessFileSets {
  return {
    html: new Set<string>(),
    js: new Set<string>(),
    css: new Set<string>(),
  }
}

function markProcessFile(
  type: RuntimeEntryType,
  file: string,
  processFiles: RuntimeProcessFileSets,
) {
  if (type === 'html' || type === 'js' || type === 'css') {
    processFiles[type].add(file)
  }
}

function markFilesByEntryType(
  files: Iterable<string> | undefined,
  entriesByFile: Map<string, RuntimeSnapshotEntry>,
  target: Record<RuntimeEntryType, Set<string>>,
) {
  for (const file of files ?? []) {
    const entry = entriesByFile.get(file)
    if (entry) {
      target[entry.type].add(file)
    }
  }
}

export function createRuntimeCompilationSnapshot<
  Entry extends RuntimeSnapshotEntry,
>(
  entries: Entry[],
  options: CreateRuntimeCompilationSnapshotOptions = {},
): RuntimeCompilationSnapshot<Entry> {
  const changedByType = createChangedByType()
  const runtimeAffectingChangedByType = createChangedByType()
  const processFiles = createProcessFiles()
  const entriesByFile = new Map(entries.map(entry => [entry.file, entry]))

  markFilesByEntryType(options.changedFiles, entriesByFile, changedByType)
  markFilesByEntryType(
    options.runtimeAffectingChangedFiles,
    entriesByFile,
    runtimeAffectingChangedByType,
  )
  for (const file of options.processFiles ?? []) {
    const entry = entriesByFile.get(file)
    if (entry) {
      markProcessFile(entry.type, file, processFiles)
    }
  }

  return {
    entries,
    sourceHashByFile: new Map<string, string>(),
    runtimeAffectingSignatureByFile: new Map<string, string>(),
    runtimeAffectingHashByFile: new Map<string, string>(),
    hasOmittedKnownFiles: options.hasOmittedKnownFiles === true,
    changedByType,
    runtimeAffectingChangedByType,
    processFiles,
    linkedImpactsByEntry: new Map<string, Set<string>>(),
  }
}

export function buildRuntimeCompilationSnapshot<
  Entry extends RuntimeSnapshotEntry,
>(
  entries: Entry[],
  state: RuntimeCompilationBuildState,
  options: BuildRuntimeCompilationSnapshotOptions,
): RuntimeCompilationSnapshot<Entry> {
  const snapshot = createRuntimeCompilationSnapshot(entries, {
    hasOmittedKnownFiles: options.hasOmittedKnownFiles,
  })
  const firstRun = state.iteration === 0 && state.sourceHashByFile.size === 0

  for (const entry of entries) {
    const { file, source, type } = entry
    const hash = options.computeHash(source)
    snapshot.sourceHashByFile.set(file, hash)

    const previousHash = state.sourceHashByFile.get(file)
    const changed = previousHash == null || previousHash !== hash
    const previousRuntimeAffectingHash = state.runtimeAffectingHashByFile.get(file)
    const canReuseRuntimeAffectingHash = !changed && previousRuntimeAffectingHash != null
    const runtimeAffectingHash = canReuseRuntimeAffectingHash
      ? previousRuntimeAffectingHash
      : (() => {
          const signature = options.createRuntimeAffectingSignature(source, type)
          snapshot.runtimeAffectingSignatureByFile.set(file, signature)
          return options.computeHash(signature)
        })()
    snapshot.runtimeAffectingHashByFile.set(file, runtimeAffectingHash)

    if (changed) {
      snapshot.changedByType[type].add(file)
    }
    if (previousRuntimeAffectingHash == null || previousRuntimeAffectingHash !== runtimeAffectingHash) {
      snapshot.runtimeAffectingChangedByType[type].add(file)
    }

    if (options.forceAll || firstRun) {
      markProcessFile(type, file, snapshot.processFiles)
    }
    else if (type === 'html') {
      // watch 轮次下需要始终回填 html 缓存，避免产物回退。
      snapshot.processFiles.html.add(file)
    }
    else if (changed && (type === 'js' || type === 'css')) {
      snapshot.processFiles[type].add(file)
    }
  }

  if (!options.forceAll && !firstRun) {
    for (const changedFile of snapshot.changedByType.js) {
      const dependents = state.dependentsByLinkedFile.get(changedFile)
      if (!dependents) {
        continue
      }
      for (const entryFile of dependents) {
        snapshot.processFiles.js.add(entryFile)
        let impacts = snapshot.linkedImpactsByEntry.get(entryFile)
        if (!impacts) {
          impacts = new Set<string>()
          snapshot.linkedImpactsByEntry.set(entryFile, impacts)
        }
        impacts.add(changedFile)
      }
    }
  }

  return snapshot
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

export function updateRuntimeCompilationBuildState(
  state: RuntimeCompilationBuildState,
  snapshot: RuntimeCompilationSnapshot,
  linkedByEntry: Map<string, Set<string>>,
  options: UpdateRuntimeCompilationBuildStateOptions = {},
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

export function removeRuntimeCompilationBuildStateFiles(
  state: RuntimeCompilationBuildState,
  files: Iterable<string>,
) {
  const removedFiles = new Set(files)
  if (removedFiles.size === 0) {
    return
  }
  for (const file of removedFiles) {
    state.sourceHashByFile.delete(file)
    state.runtimeAffectingSignatureByFile.delete(file)
    state.runtimeAffectingHashByFile.delete(file)
    state.bundleMarkupCandidatesByFile.delete(file)
    state.linkedByEntry.delete(file)
  }
  for (const linkedFiles of state.linkedByEntry.values()) {
    for (const file of removedFiles) {
      linkedFiles.delete(file)
    }
  }
  state.dependentsByLinkedFile = invertLinkedByEntry(state.linkedByEntry)
}
