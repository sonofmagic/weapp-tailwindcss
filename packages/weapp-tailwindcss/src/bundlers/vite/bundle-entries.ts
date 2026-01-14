import type { OutputAsset, OutputChunk } from 'rollup'
import type { LinkedJsModuleResult } from '@/types'
import { Buffer } from 'node:buffer'
import { resolveOutputSpecifier } from '../shared/module-graph'

export interface OutputEntry {
  fileName: string
  output: OutputAsset | OutputChunk
}

export function readOutputEntry(entry: OutputEntry): string | undefined {
  if (entry.output.type === 'chunk') {
    return entry.output.code
  }
  const source = entry.output.source
  if (typeof source === 'string') {
    return source
  }
  if (source instanceof Uint8Array) {
    return Buffer.from(source).toString()
  }
  const fallbackSource = source as unknown
  if (fallbackSource == null) {
    return undefined
  }
  if (typeof (fallbackSource as { toString?: unknown }).toString === 'function') {
    return (fallbackSource as { toString: () => string }).toString()
  }
  return undefined
}

export function isJavaScriptEntry(entry: OutputEntry): boolean {
  if (entry.output.type === 'chunk') {
    return true
  }
  return entry.fileName.endsWith('.js')
}

export function createBundleModuleGraphOptions(
  outputDir: string,
  entries: Map<string, OutputEntry>,
) {
  return {
    resolve(specifier: string, importer: string) {
      return resolveOutputSpecifier(specifier, importer, outputDir, candidate => entries.has(candidate))
    },
    load(id: string) {
      const entry = entries.get(id)
      if (!entry) {
        return undefined
      }
      return readOutputEntry(entry)
    },
    filter(id: string) {
      return entries.has(id)
    },
  }
}

export function applyLinkedResults(
  linked: Record<string, LinkedJsModuleResult> | undefined,
  entries: Map<string, OutputEntry>,
  onLinkedUpdate: (fileName: string, previous: string, next: string) => void,
  onApplied?: (entry: OutputEntry, code: string) => void,
) {
  if (!linked) {
    return
  }

  for (const [id, { code }] of Object.entries(linked)) {
    const entry = entries.get(id)
    if (!entry) {
      continue
    }
    const previous = readOutputEntry(entry)
    if (previous == null || previous === code) {
      continue
    }

    if (entry.output.type === 'chunk') {
      entry.output.code = code
    }
    else {
      entry.output.source = code
    }

    onApplied?.(entry, code)
    onLinkedUpdate(entry.fileName, previous, code)
  }
}
