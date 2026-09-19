import type {
  GenerationRequest,
  TailwindV4GenerateOptions,
  TailwindV4GenerateResult,
  TailwindV4ResolvedSource,
  TailwindV4SourcePattern,
} from './types.ts'
import postcss from 'postcss'
import { extractRawCandidates, extractRawCandidatesWithPositions } from '../extraction/candidate-extractor.ts'
import { extractTailwindV4InlineSourceCandidates } from './candidates.ts'
import { createTailwindV4CompiledSourceEntries } from './source-scan.ts'

export interface InternalGenerationRequest extends GenerationRequest {
  scanSources?: TailwindV4GenerateOptions['scanSources']
}

export function toGenerationRequest(
  options: TailwindV4GenerateOptions | undefined,
): InternalGenerationRequest {
  return {
    ...(options?.candidates === undefined ? {} : { candidates: options.candidates }),
    ...(options?.sources === undefined
      ? {}
      : {
          sourceEntries: options.sources.map((sourceEntry, index) => ({
            id: `source:${index}`,
            ...sourceEntry,
          })),
        }),
    ...(options?.bareArbitraryValues === undefined ? {} : { bareArbitraryValues: options.bareArbitraryValues }),
    ...(options?.scanSources === undefined ? {} : { scanSources: options.scanSources }),
  }
}

export function toGenerateOptions(request: InternalGenerationRequest): TailwindV4GenerateOptions {
  return {
    ...(request.candidates === undefined ? {} : { candidates: request.candidates }),
    ...(request.sourceEntries === undefined ? {} : { sources: request.sourceEntries }),
    ...(request.bareArbitraryValues === undefined ? {} : { bareArbitraryValues: request.bareArbitraryValues }),
    ...(request.scanSources === undefined ? {} : { scanSources: request.scanSources }),
  }
}

function resolveScanSources(
  options: TailwindV4GenerateOptions | undefined,
  source: TailwindV4ResolvedSource,
  compiledRoot: TailwindV4GenerateResult['root'],
  compiledSources: TailwindV4SourcePattern[],
) {
  if (Array.isArray(options?.scanSources)) {
    return options.scanSources
  }
  if (options?.scanSources === true) {
    return createTailwindV4CompiledSourceEntries(compiledRoot, compiledSources, source.base)
  }
  return []
}

export function shouldCompileSourceEntries(options: TailwindV4GenerateOptions | undefined) {
  return options?.scanSources === true
}

export function stripCompiledSourceEntries(source: TailwindV4ResolvedSource): TailwindV4ResolvedSource {
  if (!source.css.includes('@source') && !source.css.includes('source(')) {
    return source
  }
  try {
    const root = postcss.parse(source.css)
    let changed = false
    root.walkAtRules((rule) => {
      if (rule.name === 'source') {
        rule.remove()
        changed = true
        return
      }
      if (rule.name === 'import' && /\bsource\(/.test(rule.params)) {
        rule.params = rule.params.replace(/\s+source\((?:[^()]|\([^()]*\))*\)/g, '')
        changed = true
      }
    })
    return changed
      ? {
          ...source,
          css: root.toString(),
        }
      : source
  }
  catch {
    return source
  }
}

export async function collectRawCandidates(
  source: TailwindV4ResolvedSource,
  options: TailwindV4GenerateOptions | undefined,
  compiledRoot: TailwindV4GenerateResult['root'],
  compiledSources: TailwindV4SourcePattern[] = [],
) {
  const rawCandidates = new Set<string>()
  const extractOptions = options?.bareArbitraryValues === undefined
    ? undefined
    : { bareArbitraryValues: options.bareArbitraryValues }

  for (const candidate of options?.candidates ?? []) {
    rawCandidates.add(candidate)
  }

  for (const candidateSource of options?.sources ?? []) {
    const candidates = await extractRawCandidatesWithPositions(candidateSource.content, candidateSource.extension, extractOptions)
    for (const candidate of candidates) {
      rawCandidates.add(candidate.rawCandidate)
    }
  }

  const filesystemSources = resolveScanSources(options, source, compiledRoot, compiledSources)
  if (filesystemSources.length > 0) {
    for (const candidate of await extractRawCandidates(filesystemSources, extractOptions)) {
      rawCandidates.add(candidate)
    }
  }

  const inlineSources = extractTailwindV4InlineSourceCandidates(source.css)
  for (const candidate of inlineSources.included) {
    rawCandidates.add(candidate)
  }
  for (const candidate of inlineSources.excluded) {
    rawCandidates.delete(candidate)
  }

  return rawCandidates
}
