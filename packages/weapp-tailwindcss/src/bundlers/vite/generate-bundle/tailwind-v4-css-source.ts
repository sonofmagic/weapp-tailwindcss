import path from 'node:path'
import { postcss } from '@weapp-tailwindcss/postcss'
import { scoreTailwindV4CssSourceFileMatch } from '@/bundlers/shared/generator-css/source-resolver/matching'
import { hasTailwindGenerationSource } from './sfc-style-source'

export interface TailwindV4GenerationCssSourceEntry {
  file: string
  source: string
}

export interface TailwindV4GenerationCssSourceSelectionOptions {
  cwd?: string | undefined
  outputRoot?: string | undefined
  projectRoot?: string | undefined
}

function createStableTextSignature(input: string) {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
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
  for (const match of source.matchAll(/@plugin\s+(["'])(.+?)\1\s*(?:\{([\s\S]*?)\}|;)/g)) {
    const request = match[2]!
    const optionBlock = match[3]
    add('plugin', request)
    add('plugin-request', request.replace(/\\/g, '/'))
    if (optionBlock !== undefined) {
      add('plugin-options', `${request}:${createStableTextSignature(optionBlock)}`)
    }
  }
  try {
    postcss.parse(source).walkAtRules('plugin', (rule) => {
      const request = /^(['"])(.+?)\1/.exec(rule.params.trim())?.[2]
      if (!request || !rule.nodes?.length) {
        return
      }
      rule.walkDecls((decl) => {
        add('plugin-option', `${request}:${decl.prop}:${decl.value}`)
      })
    })
  }
  catch {
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

export function selectTailwindV4GenerationCssSourceForOutput<T extends TailwindV4GenerationCssSourceEntry>(
  outputFile: string,
  entries: T[],
  rawSource?: string,
  options: TailwindV4GenerationCssSourceSelectionOptions = {},
) {
  const generationSources = entries.filter(entry => hasTailwindGenerationSource(entry.source))
  if (generationSources.length <= 1) {
    return generationSources[0]
  }
  const canMatchByOutputPath = Boolean(options.cwd || options.outputRoot || options.projectRoot)
  const selectByOutputPath = (
    candidates: typeof generationSources,
    shouldUseScore: (score: number) => boolean = score => score > 0,
  ) => {
    if (!canMatchByOutputPath) {
      return undefined
    }
    const scoredSources = candidates
      .map(entry => ({
        entry,
        score: scoreTailwindV4CssSourceFileMatch(outputFile, entry.file, {
          cwd: options.cwd,
          outputRoot: options.outputRoot,
          projectRoot: options.projectRoot,
        }),
      }))
      .filter(item => shouldUseScore(item.score))
      .sort((a, b) => b.score - a.score)
    const bestScore = scoredSources[0]?.score
    const bestSources = bestScore ? scoredSources.filter(item => item.score === bestScore) : []
    return bestSources.length === 1 ? bestSources[0]?.entry : undefined
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
  const explicitSources = generationSources.filter(entry =>
    /@(?:config|source|plugin|custom-variant|theme|utility|variant|apply)\b/.test(entry.source),
  )
  const candidates = explicitSources.length === 1 ? explicitSources : generationSources
  const directoryIndexOutputPathMatched = selectByOutputPath(candidates, score => score >= 25000 && score < 50000)
  if (directoryIndexOutputPathMatched) {
    return directoryIndexOutputPathMatched
  }
  const rawSourceMatched = selectByRawSourceFingerprint(generationSources)
  if (rawSourceMatched) {
    return rawSourceMatched
  }
  const outputPathMatched = selectByOutputPath(candidates)
  if (outputPathMatched) {
    return outputPathMatched
  }
  if (candidates.length === 1) {
    return candidates[0]
  }
  return selectByRawSourceFingerprint(candidates)
}
