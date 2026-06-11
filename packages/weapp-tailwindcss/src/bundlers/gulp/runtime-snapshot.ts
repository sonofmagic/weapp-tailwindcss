import type { BundleSnapshot, BundleStateEntry, EntryType } from '../vite/bundle-state'

export function createGulpRuntimeSnapshot(
  runtimeSourcesByFile: Map<string, { source: string, type: 'html' | 'js' }>,
  changedFiles: Iterable<string>,
): BundleSnapshot {
  const runtimeAffectingChangedByType = {
    html: new Set<string>(),
    js: new Set<string>(),
    css: new Set<string>(),
    other: new Set<string>(),
  } satisfies Record<EntryType, Set<string>>
  for (const file of changedFiles) {
    const entry = runtimeSourcesByFile.get(file)
    if (entry) {
      runtimeAffectingChangedByType[entry.type].add(file)
    }
  }
  const entries = [...runtimeSourcesByFile.entries()].map(([file, entry]) => ({
    file,
    output: {
      fileName: file,
      source: entry.source,
      type: 'asset' as const,
    } as BundleStateEntry['output'],
    source: entry.source,
    type: entry.type,
  }))
  return {
    entries,
    jsEntries: new Map(),
    sourceHashByFile: new Map(),
    runtimeAffectingSignatureByFile: new Map(),
    runtimeAffectingHashByFile: new Map(),
    hasOmittedKnownFiles: false,
    changedByType: {
      html: new Set<string>(),
      js: new Set<string>(),
      css: new Set<string>(),
      other: new Set<string>(),
    },
    runtimeAffectingChangedByType,
    processFiles: {
      html: new Set<string>(),
      js: new Set<string>(),
      css: new Set<string>(),
    },
    linkedImpactsByEntry: new Map(),
  }
}
