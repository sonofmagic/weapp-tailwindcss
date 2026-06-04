import type { OutputEntry } from '../bundle-entries'
import { normalizeOutputPathKey } from '../../shared/module-graph'

export function createJsEntryResolver(jsEntries: Map<string, OutputEntry>) {
  const normalizedJsEntries = new Map<string, OutputEntry>()
  for (const [id, entry] of jsEntries) {
    normalizedJsEntries.set(normalizeOutputPathKey(id), entry)
  }
  return (id: string) => jsEntries.get(id) ?? normalizedJsEntries.get(normalizeOutputPathKey(id))
}
