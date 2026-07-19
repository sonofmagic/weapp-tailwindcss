import path from 'node:path'
import { normalizeOutputPathKey } from '@/bundlers/shared/module-graph'
import { getActiveViteSourceOutputRelationOwner } from '../source-output-relations'

export interface ResolveCurrentSourceCandidateSourceOptions {
  file: string
  getSourceCandidateSource?: ((file: string) => string | undefined) | undefined
  getSourceCandidateSources?: (() => Iterable<[string, string]> | undefined) | undefined
  outDir: string
  rootDir: string
  sourceRoot?: string | undefined
}

export interface CurrentSourceCandidateFileMatch {
  confidence: 'exact' | 'suffix'
  file: string
}

function normalizeSourceCandidatePathKey(file: string) {
  return normalizeOutputPathKey(path.resolve(file))
}

function createSourceCandidateFiles(options: ResolveCurrentSourceCandidateSourceOptions) {
  const {
    file,
    outDir,
    rootDir,
    sourceRoot,
  } = options
  const cleanedFile = file.replace(/[?#].*$/, '')
  const absoluteFile = path.isAbsolute(cleanedFile)
    ? cleanedFile
    : path.resolve(rootDir, cleanedFile)
  const relativeFromOutDir = normalizeOutputPathKey(path.relative(outDir, absoluteFile))
  return [
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
}

export function resolveCurrentSourceCandidateFileMatch(
  options: ResolveCurrentSourceCandidateSourceOptions,
): CurrentSourceCandidateFileMatch | undefined {
  const sourceCandidates = createSourceCandidateFiles(options)
  for (const candidate of sourceCandidates) {
    if (candidate && options.getSourceCandidateSource?.(candidate) !== undefined) {
      return {
        confidence: 'exact',
        file: candidate,
      }
    }
  }

  const normalizedFile = normalizeOutputPathKey(options.file.replace(/[?#].*$/, ''))
  let bestMatch: { confidence: CurrentSourceCandidateFileMatch['confidence'], file: string, score: number } | undefined
  const normalizedSourceCandidates = sourceCandidates
    .filter((candidate): candidate is string => Boolean(candidate))
    .map(candidate => ({
      absolute: path.isAbsolute(candidate),
      key: normalizeSourceCandidatePathKey(candidate),
    }))
  for (const [sourceFile] of options.getSourceCandidateSources?.() ?? []) {
    const normalizedSourceFile = normalizeSourceCandidatePathKey(sourceFile)
    let score = normalizedSourceCandidates.reduce((current, candidate) => {
      return normalizedSourceFile === candidate.key
        ? Math.max(current, candidate.absolute ? 100 : 80)
        : current
    }, 0)
    if (normalizedSourceFile.endsWith(`/${normalizedFile}`)) {
      score = Math.max(score, 20)
    }
    if (score > (bestMatch?.score ?? 0)) {
      bestMatch = {
        confidence: score >= 80 ? 'exact' : 'suffix',
        file: sourceFile,
        score,
      }
    }
  }
  return bestMatch
}

export function resolveCurrentSourceCandidateFile(options: ResolveCurrentSourceCandidateSourceOptions) {
  const match = resolveCurrentSourceCandidateFileMatch(options)
  if (match?.confidence === 'exact') {
    getActiveViteSourceOutputRelationOwner()?.recordOwnedOutput(match.file, options.file)
  }
  return match?.file
}

export function resolveCurrentSourceCandidateSource(options: ResolveCurrentSourceCandidateSourceOptions) {
  const {
    file,
    getSourceCandidateSource,
    getSourceCandidateSources,
  } = options
  const cleanedFile = file.replace(/[?#].*$/, '')
  const normalizedFile = normalizeOutputPathKey(cleanedFile)
  const sourceCandidates = createSourceCandidateFiles(options)
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
