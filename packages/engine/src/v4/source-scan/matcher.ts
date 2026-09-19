import type { TailwindV4SourcePattern } from '../types.ts'
import path from 'node:path'
import micromatch from 'micromatch'
import { normalizeGlobPattern, resolveSourceScanPath, toPosixPath } from './sources.ts'

function normalizeEntryPattern(entry: TailwindV4SourcePattern) {
  return path.isAbsolute(entry.pattern)
    ? toPosixPath(path.relative(resolveSourceScanPath(entry.base), entry.pattern))
    : normalizeGlobPattern(entry.pattern)
}

function isFileMatchedByTailwindV4SourceEntry(file: string, entry: TailwindV4SourcePattern) {
  const relative = toPosixPath(path.relative(resolveSourceScanPath(entry.base), file))
  return Boolean(relative)
    && !relative.startsWith('../')
    && !path.isAbsolute(relative)
    && micromatch.isMatch(relative, normalizeEntryPattern(entry))
}

export function isFileExcludedByTailwindV4SourceEntries(
  file: string,
  entries: TailwindV4SourcePattern[] | undefined,
) {
  if (!entries?.length) {
    return false
  }
  const resolvedFile = resolveSourceScanPath(file)
  return entries.some(entry => entry.negated && isFileMatchedByTailwindV4SourceEntry(resolvedFile, entry))
}

export function isFileMatchedByTailwindV4SourceEntries(
  file: string,
  entries: TailwindV4SourcePattern[] | undefined,
) {
  if (!entries?.length) {
    return true
  }

  const positiveEntries = entries.filter(entry => !entry.negated)
  const negativeEntries = entries.filter(entry => entry.negated)
  if (positiveEntries.length === 0) {
    return false
  }

  const resolvedFile = resolveSourceScanPath(file)
  const matchesPositive = positiveEntries.some(entry => isFileMatchedByTailwindV4SourceEntry(resolvedFile, entry))
  if (!matchesPositive) {
    return false
  }

  return !negativeEntries.some(entry => isFileMatchedByTailwindV4SourceEntry(resolvedFile, entry))
}

export function createTailwindV4SourceEntryMatcher(entries: TailwindV4SourcePattern[] | undefined) {
  if (!entries?.length) {
    return undefined
  }
  return (file: string) => isFileMatchedByTailwindV4SourceEntries(file, entries)
}

export function createTailwindV4SourceExclusionMatcher(entries: TailwindV4SourcePattern[] | undefined) {
  if (!entries?.length) {
    return undefined
  }
  return (file: string) => isFileExcludedByTailwindV4SourceEntries(file, entries)
}

export function groupTailwindV4SourceEntriesByBase(entries: TailwindV4SourcePattern[]) {
  const entriesByBase = new Map<string, TailwindV4SourcePattern[]>()
  for (const entry of entries) {
    const base = path.resolve(entry.base)
    const group = entriesByBase.get(base) ?? []
    group.push({
      ...entry,
      base,
      pattern: normalizeGlobPattern(entry.pattern),
    })
    entriesByBase.set(base, group)
  }
  return entriesByBase
}

export async function expandTailwindV4SourceEntries(
  entries: TailwindV4SourcePattern[],
  resolveFiles: (options: { cwd: string, sources: TailwindV4SourcePattern[] }) => Promise<string[]>,
) {
  if (entries.length === 0) {
    return []
  }

  const files = new Set<string>()
  await Promise.all([...groupTailwindV4SourceEntriesByBase(entries).entries()].map(async ([base, group]) => {
    const matched = await resolveFiles({
      cwd: base,
      sources: group,
    })
    for (const file of matched) {
      files.add(path.resolve(file))
    }
  }))

  return [...files].filter(file => !isFileExcludedByTailwindV4SourceEntries(file, entries))
}

export function mergeTailwindV4SourceEntries(...entries: Array<TailwindV4SourcePattern[] | undefined>) {
  const result: TailwindV4SourcePattern[] = []
  const seen = new Set<string>()
  for (const group of entries) {
    for (const entry of group ?? []) {
      const normalized = {
        base: path.resolve(entry.base),
        pattern: normalizeGlobPattern(entry.pattern),
        negated: entry.negated,
      }
      const key = JSON.stringify(normalized)
      if (seen.has(key)) {
        continue
      }
      seen.add(key)
      result.push(normalized)
    }
  }
  return result
}
