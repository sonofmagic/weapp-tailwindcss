import type { OutputAsset } from 'rollup'
import type { RememberedCssSource } from './types'
import type { InternalUserDefinedOptions } from '@/types'
import { hasBundlerGeneratedCssMarker, parseBundlerGeneratedCssMarkerBlocks } from '../../shared/generated-css-marker'
import { normalizeOutputPathKey } from '../../shared/module-graph'
import { resolveViteCssPipelineOutputFile } from './css-output'
import { hasTailwindGenerationSource } from './sfc-style-source'
import { scoreMatchingStyleFileBase } from './style-matching'

export function createRememberedCssRuntimeSignature(cssRuntimeSignature: string, cssRuntimeAffectingHash: string) {
  return `${cssRuntimeSignature}:${cssRuntimeAffectingHash}`
}

export function resolveRememberedCssSourceForTest(
  sources: Iterable<[string, RememberedCssSource]> | undefined,
  outputFile: string,
  file: string,
  originalSource: OutputAsset,
  outputRoot: string,
  sourceRoot: string | undefined,
) {
  return findRememberedCssSource(sources, outputFile, file, originalSource, outputRoot, sourceRoot)
}

function findRememberedCssSource(
  sources: Iterable<[string, RememberedCssSource]> | undefined,
  outputFile: string,
  file: string,
  originalSource: OutputAsset,
  outputRoot: string,
  sourceRoot: string | undefined,
) {
  const matched = findRememberedCssSources(sources, outputFile, file, originalSource, outputRoot, sourceRoot)
  return matched.length === 1 ? matched[0] : undefined
}

function normalizeRememberedSourceIdentity(file: string) {
  return normalizeOutputPathKey(file.replace(/[?#].*$/, ''))
}

export function findRememberedCssSources(
  sources: Iterable<[string, RememberedCssSource]> | undefined,
  outputFile: string,
  file: string,
  originalSource: OutputAsset,
  outputRoot: string,
  sourceRoot: string | undefined,
) {
  if (!sources) {
    return []
  }
  const rememberedSources = [...sources].map(([, remembered]) => remembered)
  const source = typeof originalSource.source === 'string'
    ? originalSource.source
    : originalSource.source.toString()
  const markerFiles = new Set(parseBundlerGeneratedCssMarkerBlocks(source)
    .filter(block => block.bundler === 'vite' && typeof block.file === 'string' && block.file.length > 0)
    .map(block => normalizeOutputPathKey(block.file!)))
  if (markerFiles.size > 0) {
    const markerMatched = rememberedSources.filter(remembered =>
      markerFiles.has(normalizeRememberedSourceIdentity(remembered.sourceFile)),
    )
    if (markerMatched.length > 0) {
      return markerMatched
    }
  }
  const originalFiles = [
    file,
    originalSource.originalFileName,
    ...(originalSource.originalFileNames ?? []),
  ].filter((item): item is string => typeof item === 'string' && item.length > 0)

  const sourceMatched = rememberedSources.filter(remembered =>
    originalFiles.some(originalFile => normalizeRememberedSourceIdentity(remembered.sourceFile) === normalizeRememberedSourceIdentity(originalFile)),
  )
  if (sourceMatched.length > 0) {
    return sourceMatched
  }

  const outputMatched = rememberedSources.filter(remembered =>
    normalizeOutputPathKey(remembered.outputFile) === normalizeOutputPathKey(outputFile),
  )
  if (outputMatched.length > 0) {
    return outputMatched
  }

  const shouldUseRememberedFallback = !hasBundlerGeneratedCssMarker(source)
    && !hasTailwindGenerationSource(source)
  if (shouldUseRememberedFallback) {
    return []
  }

  const scoredMatches = rememberedSources
    .map(remembered => ({
      remembered,
      score: Math.max(
        scoreMatchingStyleFileBase(outputFile, remembered.sourceFile, outputRoot, sourceRoot),
        scoreMatchingStyleFileBase(outputFile, remembered.outputFile, outputRoot, sourceRoot),
      ),
    }))
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score)
  const bestScore = scoredMatches[0]?.score
  return bestScore
    ? scoredMatches.filter(match => match.score === bestScore).map(match => match.remembered)
    : []
}

export function mergeRememberedCssSources(
  sources: RememberedCssSource[],
  outputFile: string,
) {
  if (sources.length <= 1) {
    return sources[0]
  }
  const seen = new Set<string>()
  const rawSources: string[] = []
  for (const source of sources) {
    const key = `${source.sourceFile}\0${source.rawSource}`
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    rawSources.push(source.rawSource)
  }
  return {
    outputFile,
    rawSource: rawSources.join('\n'),
    sourceFile: sources[0]?.sourceFile ?? outputFile,
  }
}

export function collectRememberedCssReplayGroups(
  sources: Iterable<[string, RememberedCssSource]> | undefined,
  opts: Pick<InternalUserDefinedOptions, 'cssMatcher' | 'platform'>,
  rootDir: string,
  isWebGeneratorTarget: boolean,
  preserveCssExtension: boolean,
  sourceRoot?: string | undefined,
  styleOutputExtension?: string | undefined,
  styleOutputFiles?: Iterable<string> | undefined,
) {
  const groups = new Map<string, Array<{ key: string, remembered: RememberedCssSource }>>()
  for (const [key, remembered] of sources ?? []) {
    const outputFile = resolveViteCssPipelineOutputFile(
      remembered.outputFile,
      opts,
      rootDir,
      isWebGeneratorTarget,
      preserveCssExtension,
      sourceRoot,
      styleOutputExtension,
      styleOutputFiles,
    )
    const outputKey = normalizeOutputPathKey(outputFile)
    const group = groups.get(outputKey) ?? []
    group.push({ key, remembered })
    groups.set(outputKey, group)
  }
  return groups
}
