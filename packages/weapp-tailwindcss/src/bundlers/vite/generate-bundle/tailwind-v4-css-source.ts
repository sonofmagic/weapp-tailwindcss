import path from 'node:path'
import { hasTailwindGenerationSource } from './sfc-style-source'
import { isSubpackageOutputFile } from './subpackages'

export interface TailwindV4GenerationCssSourceEntry {
  file: string
  source: string
}

export function collectTailwindV4SourceFingerprint(source: string) {
  const tokens = new Set<string>()
  const add = (prefix: string, value: string) => {
    tokens.add(`${prefix}:${value.trim()}`)
  }
  for (const match of source.matchAll(/@config\s+(["'])(.+?)\1\s*;?/g)) {
    const configRequest = match[2]!
    add('config', path.basename(configRequest))
    add('config-request', configRequest.replace(/\\/g, '/'))
  }
  for (const match of source.matchAll(/@source\s+(not\s+)?(["'])(.+?)\2\s*;?/g)) {
    add(match[1] ? 'source:not' : 'source', match[3]!)
  }
  for (const match of source.matchAll(/@custom-variant\s+([^{\s]+)/g)) {
    add('custom-variant', match[1]!)
  }
  for (const match of source.matchAll(/@(?:theme|utility|variant|layer)\s+([^{;\s]+)/g)) {
    add('directive', match[1]!)
  }
  for (const match of source.matchAll(/--[\w-]+(?=\s*:)/g)) {
    add('theme-token', match[0])
  }
  for (const match of source.matchAll(/\.([_a-z][\w-]*)\s*[{,]/gi)) {
    add('selector', match[1]!)
  }
  return tokens
}

export function scoreConfiguredTailwindV4SourceForRawSource(rawSource: string | undefined, entrySource: string) {
  if (!rawSource) {
    return 0
  }
  const rawTokens = collectTailwindV4SourceFingerprint(rawSource)
  if (rawTokens.size === 0) {
    return 0
  }
  const entryTokens = collectTailwindV4SourceFingerprint(entrySource)
  let score = 0
  for (const token of entryTokens) {
    if (rawTokens.has(token)) {
      score += token.startsWith('config:') ? 100 : 1
    }
  }
  return score
}

export function resolveSubpackageRootForFile(file: string | undefined, subpackageRoots: Set<string> | undefined) {
  if (!file || !subpackageRoots) {
    return undefined
  }
  return [...subpackageRoots].find(root =>
    isSubpackageOutputFile(file, new Set([root])),
  )
}

export function isSameSubpackageScope(
  outputFile: string,
  sourceFile: string | undefined,
  subpackageRoots: Set<string> | undefined,
) {
  const outputRoot = resolveSubpackageRootForFile(outputFile, subpackageRoots)
  const sourceRoot = resolveSubpackageRootForFile(sourceFile, subpackageRoots)
  return outputRoot === sourceRoot
}

export function selectTailwindV4GenerationCssSourceForOutput<T extends TailwindV4GenerationCssSourceEntry>(
  outputFile: string,
  entries: T[],
  rawSource?: string,
  subpackageRoots?: Set<string> | undefined,
) {
  const generationSources = entries.filter(entry => hasTailwindGenerationSource(entry.source))
  if (generationSources.length <= 1) {
    return generationSources[0]
  }
  const selectByRawSourceFingerprint = (candidates: typeof generationSources) => {
    const scoredSources = candidates
      .map(entry => ({
        entry,
        score: scoreConfiguredTailwindV4SourceForRawSource(rawSource, entry.source),
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
    const bestScore = scoredSources[0]?.score
    const bestSources = bestScore ? scoredSources.filter(item => item.score === bestScore) : []
    return bestSources.length === 1 ? bestSources[0]?.entry : undefined
  }
  const rawSourceMatched = selectByRawSourceFingerprint(generationSources)
  if (rawSourceMatched) {
    return rawSourceMatched
  }
  const scopedSources = subpackageRoots
    ? generationSources.filter((entry) => {
        const outputMatchesSubpackage = isSubpackageOutputFile(outputFile, subpackageRoots)
        const sourceMatchesSubpackage = isSubpackageOutputFile(entry.file, subpackageRoots)
        if (!outputMatchesSubpackage) {
          return !sourceMatchesSubpackage
        }
        return sourceMatchesSubpackage
          && [...subpackageRoots].some(root =>
            isSubpackageOutputFile(outputFile, new Set([root]))
            && isSubpackageOutputFile(entry.file, new Set([root])),
          )
      })
    : generationSources
  const explicitSources = scopedSources.filter(entry =>
    /@(?:config|source|plugin|custom-variant|theme|utility|variant|apply)\b/.test(entry.source),
  )
  const candidates = explicitSources.length === 1 ? explicitSources : scopedSources
  if (candidates.length === 1) {
    return candidates[0]
  }
  return selectByRawSourceFingerprint(candidates)
}
