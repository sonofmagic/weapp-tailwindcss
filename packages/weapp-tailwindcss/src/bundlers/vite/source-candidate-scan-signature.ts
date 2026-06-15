import type { TailwindInlineSourceCandidates, TailwindSourceEntry } from '@/tailwindcss/source-scan'
import path from 'node:path'
import { slash } from './utils'

export interface SourceCandidateScanRoot {
  root: string
  entries?: TailwindSourceEntry[] | undefined
  explicit?: boolean | undefined
}

export interface SourceCandidateScanSignatureInput {
  inlineCandidates?: TailwindInlineSourceCandidates | undefined
  outDir?: string | undefined
  roots: SourceCandidateScanRoot[]
  scanAllSources?: boolean | undefined
}

function normalizeSignaturePath(value: string) {
  return slash(path.resolve(value))
}

function serializeInlineCandidates(inlineCandidates: TailwindInlineSourceCandidates | undefined) {
  return {
    excluded: [...(inlineCandidates?.excluded ?? [])].sort(),
    included: [...(inlineCandidates?.included ?? [])].sort(),
  }
}

function serializeSourceEntries(entries: TailwindSourceEntry[] | undefined) {
  return (entries ?? [])
    .map(entry => ({
      base: normalizeSignaturePath(entry.base),
      negated: entry.negated,
      pattern: entry.pattern,
    }))
    .sort((a, b) => `${a.base}\0${a.pattern}\0${a.negated}`.localeCompare(`${b.base}\0${b.pattern}\0${b.negated}`))
}

export function createSourceCandidateScanSignature(input: SourceCandidateScanSignatureInput) {
  return JSON.stringify({
    inlineCandidates: serializeInlineCandidates(input.inlineCandidates),
    outDir: input.outDir ? normalizeSignaturePath(input.outDir) : undefined,
    roots: input.roots.map(root => ({
      entries: serializeSourceEntries(root.entries),
      root: normalizeSignaturePath(root.root),
    })),
    scanAllSources: input.scanAllSources ?? false,
  })
}
