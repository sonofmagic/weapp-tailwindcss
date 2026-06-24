import path from 'node:path'
import { normalizeOutputPathKey } from '@/bundlers/shared/module-graph'

export interface ResolveCurrentSourceCandidateSourceOptions {
  file: string
  getSourceCandidateSource?: ((file: string) => string | undefined) | undefined
  getSourceCandidateSources?: (() => Iterable<[string, string]> | undefined) | undefined
  outDir: string
  rootDir: string
  sourceRoot?: string | undefined
}

function normalizeSourceCandidatePathKey(file: string) {
  return normalizeOutputPathKey(path.resolve(file))
}

export function resolveCurrentSourceCandidateSource(options: ResolveCurrentSourceCandidateSourceOptions) {
  const {
    file,
    getSourceCandidateSource,
    getSourceCandidateSources,
    outDir,
    rootDir,
    sourceRoot,
  } = options
  const cleanedFile = file.replace(/[?#].*$/, '')
  const normalizedFile = normalizeOutputPathKey(cleanedFile)
  const absoluteFile = path.isAbsolute(cleanedFile)
    ? cleanedFile
    : path.resolve(rootDir, cleanedFile)
  const relativeFromOutDir = normalizeOutputPathKey(path.relative(outDir, absoluteFile))
  const sourceCandidates = [
    sourceRoot ? path.resolve(sourceRoot, file) : undefined,
    path.resolve(rootDir, file),
    path.resolve(path.dirname(outDir), file),
    path.resolve(outDir, file),
    !path.isAbsolute(relativeFromOutDir) && !relativeFromOutDir.startsWith('../')
      ? path.resolve(rootDir, relativeFromOutDir)
      : undefined,
    !path.isAbsolute(relativeFromOutDir) && !relativeFromOutDir.startsWith('../')
      ? path.resolve(path.dirname(outDir), relativeFromOutDir)
      : undefined,
    file,
  ]
  const explicitSource = sourceCandidates.reduce<string | undefined>((source, candidate) => {
    if (source || !candidate) {
      return source
    }
    return getSourceCandidateSource?.(candidate)
  }, undefined)
  if (explicitSource) {
    return explicitSource
  }

  const normalizedSourceCandidates = sourceCandidates
    .filter((candidate): candidate is string => Boolean(candidate))
    .map(candidate => ({
      absolute: path.isAbsolute(candidate),
      key: normalizeSourceCandidatePathKey(candidate),
    }))
  let bestSource: {
    score: number
    source: string
  } | undefined
  for (const [sourceFile, source] of getSourceCandidateSources?.() ?? []) {
    const normalizedSourceFile = normalizeSourceCandidatePathKey(sourceFile)
    let score = 0
    for (const candidate of normalizedSourceCandidates) {
      if (normalizedSourceFile === candidate.key) {
        score = Math.max(score, candidate.absolute ? 100 : 80)
        continue
      }
    }
    if (normalizedSourceFile.endsWith(`/${normalizedFile}`)) {
      score = Math.max(score, 20)
    }
    if (score > (bestSource?.score ?? 0)) {
      bestSource = {
        score,
        source,
      }
    }
  }
  return bestSource?.source
}
