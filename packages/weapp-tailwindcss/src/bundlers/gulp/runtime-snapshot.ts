import type { RuntimeCompilationSnapshot, RuntimeSnapshotEntry } from '@/compiler'
import { createRuntimeCompilationSnapshot } from '@/compiler'

export function createGulpRuntimeSnapshot(
  runtimeSourcesByFile: Map<string, { source: string, type: 'html' | 'js' }>,
  changedFiles: Iterable<string>,
): RuntimeCompilationSnapshot {
  const changedFileSet = new Set(changedFiles)
  const entries: RuntimeSnapshotEntry[] = [...runtimeSourcesByFile.entries()].map(([file, entry]) => ({
    file,
    runtimeCandidate: true,
    source: entry.source,
    type: entry.type,
  }))
  return createRuntimeCompilationSnapshot(entries, {
    changedFiles: changedFileSet,
    runtimeAffectingChangedFiles: changedFileSet,
    processFiles: changedFileSet,
  })
}
