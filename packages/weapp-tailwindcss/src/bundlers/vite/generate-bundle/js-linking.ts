import type { OutputEntry } from '../bundle-entries'
import type { LinkedJsModuleResult } from '@/types'
import { applyLinkedResults } from '../bundle-entries'

interface LinkedUpdateHelpersOptions {
  jsEntries: Map<string, OutputEntry>
  onUpdate: (fileName: string, previous: string, next: string) => void
  debug: (format: string, ...args: unknown[]) => void
}

export function createLinkedUpdateHelpers(options: LinkedUpdateHelpersOptions) {
  const pendingLinkedUpdates: Array<() => void> = []
  const handleLinkedUpdate = (fileName: string, previous: string, next: string) => {
    options.onUpdate(fileName, previous, next)
    options.debug('js linked handle: %s', fileName)
  }
  const scheduleLinkedApply = (entry: OutputEntry, code: string) => {
    pendingLinkedUpdates.push(() => {
      if (entry.output.type === 'chunk') {
        entry.output.code = code
      }
      else {
        entry.output.source = code
      }
    })
  }
  const applyLinkedUpdates = (linked?: Record<string, LinkedJsModuleResult>) => {
    applyLinkedResults(linked, options.jsEntries, handleLinkedUpdate, scheduleLinkedApply)
  }

  return {
    applyLinkedUpdates,
    pendingLinkedUpdates,
  }
}

export function collectLinkedFileNames(
  linked: Record<string, LinkedJsModuleResult> | undefined,
  getJsEntry: (id: string) => OutputEntry | undefined,
  linkedSet: Set<string> | undefined,
) {
  if (!linked || !linkedSet) {
    return
  }
  for (const id of Object.keys(linked)) {
    const linkedEntry = getJsEntry(id)
    if (linkedEntry) {
      linkedSet.add(linkedEntry.fileName)
    }
  }
}
