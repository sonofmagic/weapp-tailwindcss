import type { RuntimeCompilationBuildState, RuntimeCompilationSnapshot, RuntimeSnapshotEntry } from '@/compiler'
import { buildRuntimeCompilationSnapshot, createRuntimeAffectingSourceSignature } from '@/compiler'

export function createGulpRuntimeSnapshot(
  runtimeSourcesByFile: Map<string, { source: string, type: 'html' | 'js' }>,
  state: RuntimeCompilationBuildState,
  computeHash: (source: string) => string,
  options: { removedFiles?: Iterable<string> | undefined } = {},
): RuntimeCompilationSnapshot {
  const entries: RuntimeSnapshotEntry[] = [...runtimeSourcesByFile.entries()].map(([file, entry]) => ({
    file,
    runtimeCandidate: true,
    source: entry.source,
    type: entry.type,
  }))
  return buildRuntimeCompilationSnapshot(entries, state, {
    computeHash,
    createRuntimeAffectingSignature: createRuntimeAffectingSourceSignature,
    removedFiles: options.removedFiles,
  })
}
