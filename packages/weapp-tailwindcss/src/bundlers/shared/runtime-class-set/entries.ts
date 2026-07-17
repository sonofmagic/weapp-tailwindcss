import type { RuntimeCompilationSnapshot, RuntimeSnapshotEntry } from '@/compiler'

const EXTENSION_DOT_PREFIX_RE = /^\./

export function createRuntimeEntries(snapshot: RuntimeCompilationSnapshot) {
  return snapshot.entries.filter(entry => entry.runtimeCandidate !== false)
}

export function collectChangedRuntimeFiles(snapshot: RuntimeCompilationSnapshot) {
  return new Set<string>([
    ...snapshot.runtimeAffectingChangedByType.html,
    ...snapshot.runtimeAffectingChangedByType.js,
  ])
}

export function resolveEntryExtension(entry: RuntimeSnapshotEntry) {
  if (entry.type === 'html') {
    return 'html'
  }
  const ext = entry.file.split(/[?#]/, 1)[0]?.split('.').pop()?.replace(EXTENSION_DOT_PREFIX_RE, '') ?? ''
  if (ext.length > 0) {
    return ext
  }
  return 'js'
}
