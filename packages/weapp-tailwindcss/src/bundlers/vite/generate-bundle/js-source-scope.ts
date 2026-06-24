import type { OutputChunk } from 'rollup'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import path from 'node:path'
import { isFileMatchedByTailwindSourceEntries } from '@/tailwindcss/source-scan'
import { cleanUrl } from '../utils'

function hasExplicitSourceEntries(entries: TailwindSourceEntry[] | undefined) {
  return entries !== undefined && entries.length > 0
}

function normalizeModuleId(id: string) {
  const file = cleanUrl(id)
  return path.isAbsolute(file) ? path.resolve(file) : undefined
}

function collectChunkModuleIds(chunk: OutputChunk) {
  const ids = new Set<string>()
  for (const id of chunk.moduleIds ?? []) {
    const normalized = normalizeModuleId(id)
    if (normalized) {
      ids.add(normalized)
    }
  }
  for (const id of Object.keys(chunk.modules ?? {})) {
    const normalized = normalizeModuleId(id)
    if (normalized) {
      ids.add(normalized)
    }
  }
  return ids
}

export function isViteJsChunkWithinTailwindSourceScope(
  chunk: OutputChunk,
  entries: TailwindSourceEntry[] | undefined,
) {
  if (!hasExplicitSourceEntries(entries)) {
    return true
  }

  const moduleIds = collectChunkModuleIds(chunk)
  if (moduleIds.size === 0) {
    return true
  }

  for (const id of moduleIds) {
    if (isFileMatchedByTailwindSourceEntries(id, entries)) {
      return true
    }
  }

  return false
}
