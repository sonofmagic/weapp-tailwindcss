import type { CompilerGenerateRequest, CompilerTarget } from './types'
import type { WeappTailwindcssGenerateResult } from '@/generator'
import { createCompilerValueFingerprint } from './source-fingerprint'

export interface CompilerGenerationCacheEntry {
  key: CompilerGenerationCacheKey
  result: WeappTailwindcssGenerateResult
}

interface CompilerGenerationCacheKey {
  bareArbitraryValues: CompilerGenerateRequest['bareArbitraryValues']
  candidateSignature: string
  incrementalCache: CompilerGenerateRequest['incrementalCache']
  scanSources: CompilerGenerateRequest['scanSources']
  sourcesFingerprint: string | undefined
  styleOptionsFingerprint: string | undefined
  target: CompilerTarget
}

export function createCompilerGenerationCacheKey(
  request: CompilerGenerateRequest,
  candidates: Iterable<string>,
  target: CompilerTarget,
): CompilerGenerationCacheKey {
  return {
    bareArbitraryValues: request.bareArbitraryValues,
    candidateSignature: [...candidates].sort().join('\0'),
    incrementalCache: request.incrementalCache,
    scanSources: request.scanSources,
    sourcesFingerprint: request.sources === undefined
      ? undefined
      : createCompilerValueFingerprint(request.sources),
    styleOptionsFingerprint: request.styleOptions === undefined
      ? undefined
      : createCompilerValueFingerprint(request.styleOptions),
    target,
  }
}

export function isSameCompilerGenerationCacheKey(
  left: CompilerGenerationCacheKey,
  right: CompilerGenerationCacheKey,
) {
  return left.bareArbitraryValues === right.bareArbitraryValues
    && left.candidateSignature === right.candidateSignature
    && left.incrementalCache === right.incrementalCache
    && left.scanSources === right.scanSources
    && left.sourcesFingerprint === right.sourcesFingerprint
    && left.styleOptionsFingerprint === right.styleOptionsFingerprint
    && left.target === right.target
}

export function reuseCompilerGenerationResult(result: WeappTailwindcssGenerateResult) {
  return {
    ...result,
    incrementalCss: '',
    incrementalRawCss: '',
  }
}
