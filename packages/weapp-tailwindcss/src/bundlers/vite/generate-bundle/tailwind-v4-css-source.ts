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

function parseQuotedRequest(params: string) {
  const input = params.trim()
  const quote = input[0]
  if (quote !== '"' && quote !== '\'') {
    return
  }

  let escaped = false
  for (let index = 1; index < input.length; index++) {
    const char = input[index]
    if (escaped) {
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (char === quote) {
      return input.slice(1, index)
    }
  }
}

function parseSourceParams(params: string) {
  let input = params.trim()
  let negated = false
  if (input.startsWith('not ')) {
    negated = true
    input = input.slice(4).trim()
  }

  if (input.startsWith('inline(') && input.endsWith(')')) {
    return {
      prefix: negated ? 'source:inline:not' : 'source:inline',
      value: input.slice(7, -1).trim(),
    }
  }

  const request = parseQuotedRequest(input)
  if (!request) {
    return
  }

  return {
    prefix: negated ? 'source:not' : 'source',
    value: request,
  }
}

function parseTailwindImportSource(params: string) {
  const request = parseQuotedRequest(params)
  if (request !== 'tailwindcss') {
    return
  }
  const sourceMatch = /\bsource\(([^)]*)\)/.exec(params)
  return sourceMatch?.[1]?.trim()
}

function hasExplicitTailwindV4Directive(source: string) {
  try {
    let found = false
    postcss.parse(source).walkAtRules((rule) => {
      if (
        rule.name === 'config'
        || rule.name === 'source'
        || rule.name === 'plugin'
        || rule.name === 'custom-variant'
        || rule.name === 'theme'
        || rule.name === 'utility'
        || rule.name === 'variant'
        || rule.name === 'apply'
      ) {
        found = true
        return false
      }
    })
    return found
  }
  catch {
    return false
  }
}

export function collectTailwindV4SourceFingerprint(source: string) {
  const tokens = new Set<string>()
  const add = (prefix: string, value: string) => {
    tokens.add(`${prefix}:${value.trim()}`)
  }

  try {
    const root = postcss.parse(source)

    root.walkAtRules((rule) => {
      if (rule.name === 'import') {
        const sourceMode = parseTailwindImportSource(rule.params)
        if (sourceMode) {
          add('import-source', sourceMode)
        }
        return
      }

      if (rule.name === 'config') {
        const configRequest = parseQuotedRequest(rule.params)
        if (configRequest) {
          add('config', path.basename(configRequest))
          add('config-request', configRequest.replace(/\\/g, '/'))
        }
        return
      }

      if (rule.name === 'source') {
        const parsed = parseSourceParams(rule.params)
        if (parsed) {
          add(parsed.prefix, parsed.value)
        }
        return
      }

      if (rule.name === 'plugin') {
        const request = parseQuotedRequest(rule.params)
        if (!request) {
          return
        }
        add('plugin', request)
        add('plugin-request', request.replace(/\\/g, '/'))
        if (rule.nodes?.length) {
          add('plugin-options', `${request}:${createStableTextSignature(rule.toString())}`)
          rule.walkDecls((decl) => {
            add('plugin-option', `${request}:${decl.prop}:${decl.value}`)
          })
        }
        return
      }

      if (rule.name === 'custom-variant') {
        const [name] = rule.params.trim().split(/\s+/, 1)
        if (name) {
          add('custom-variant', name)
        }
        return
      }

      if (rule.name === 'theme' || rule.name === 'utility' || rule.name === 'variant' || rule.name === 'layer') {
        const [name] = rule.params.trim().split(/\s+/, 1)
        if (name) {
          add('directive', name)
        }
      }
    })

    root.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) {
        add('theme-token', decl.prop)
      }
    })

    root.walkRules((rule) => {
      for (const selector of rule.selectors ?? []) {
        const match = /\.([_a-z][\w-]*)/i.exec(selector)
        if (match?.[1]) {
          add('selector', match[1])
        }
      }
    })
  }
  catch {
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
  const explicitSources = generationSources.filter(entry => hasExplicitTailwindV4Directive(entry.source))
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
