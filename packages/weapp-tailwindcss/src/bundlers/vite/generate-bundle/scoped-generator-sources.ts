import type { RememberedCssSource } from './types'
import { createMergedCssSourceTraceMap } from './source-trace'

interface GeneratorCssHandlerOptions {
  isMainChunk?: boolean | undefined
}
type SourceTraceResolver = (rawSource: string, sourceFile: string) => Promise<Map<string, Set<string>> | undefined>
type RuntimeResolver = (outputFile: string, options: GeneratorCssHandlerOptions, runtime: Set<string>, rawSource?: string, sourceFile?: string) => Promise<Set<string>>
type CandidateSignatureResolver = (rawSource: string, sourceFile: string, fallbackSignature: string, getCandidates: ((entries: unknown) => Set<string>) | undefined, options: { includeFallbackSignature?: boolean, majorVersion?: number }) => Promise<string>

function getSignatureSources(rememberedCssSources: RememberedCssSource[], generatorRawSource: string, generatorSourceFile: string) {
  return rememberedCssSources.length > 1
    ? rememberedCssSources
    : [{ rawSource: generatorRawSource, sourceFile: generatorSourceFile }]
}

export async function createScopedGeneratorSourceData(options: {
  createScopedGeneratorRuntime: RuntimeResolver
  createScopedGeneratorSourceTraceMap: SourceTraceResolver
  generatorCssHandlerOptions: GeneratorCssHandlerOptions
  generatorRawSource: string
  generatorRuntime: Set<string>
  generatorSourceFile: string
  rememberedCssSources: RememberedCssSource[]
  scopedSourceCandidateSourceGetter: ((entries: unknown) => Map<string, Set<string>>) | undefined
  outputFile: string
}) {
  const { createScopedGeneratorRuntime, createScopedGeneratorSourceTraceMap, generatorCssHandlerOptions, generatorRawSource, generatorRuntime, generatorSourceFile, rememberedCssSources, scopedSourceCandidateSourceGetter, outputFile } = options
  const signatureSources = getSignatureSources(rememberedCssSources, generatorRawSource, generatorSourceFile)
  const sourceTraceSources = scopedSourceCandidateSourceGetter
    ? await createMergedCssSourceTraceMap(signatureSources, source => createScopedGeneratorSourceTraceMap(source.rawSource, source.sourceFile))
    : undefined
  const scopedGeneratorRuntime = rememberedCssSources.length > 1
    ? new Set<string>((await Promise.all(rememberedCssSources.map(source => createScopedGeneratorRuntime(outputFile, generatorCssHandlerOptions, generatorRuntime, source.rawSource, source.sourceFile)))).flatMap(candidates => [...candidates]))
    : await createScopedGeneratorRuntime(outputFile, generatorCssHandlerOptions, generatorRuntime, generatorRawSource, generatorSourceFile)
  return { scopedGeneratorRuntime, signatureSources, sourceTraceSources }
}

export async function createScopedGeneratorCandidateSignatureForSources(options: {
  createScopedGeneratorCandidateSignature: CandidateSignatureResolver
  generatorCssHandlerOptions: GeneratorCssHandlerOptions
  majorVersion: number | undefined
  scopedSourceCandidateGetter: ((entries: unknown) => Set<string>) | undefined
  signatureSources: RememberedCssSource[]
  trackedGeneratorCandidateSignature: string
}) {
  const { createScopedGeneratorCandidateSignature, generatorCssHandlerOptions, majorVersion, scopedSourceCandidateGetter, signatureSources, trackedGeneratorCandidateSignature } = options
  return JSON.stringify(await Promise.all(signatureSources.map(async source => [
    source.sourceFile,
    await createScopedGeneratorCandidateSignature(source.rawSource, source.sourceFile, trackedGeneratorCandidateSignature, scopedSourceCandidateGetter, { includeFallbackSignature: generatorCssHandlerOptions.isMainChunk, majorVersion }),
  ])))
}
