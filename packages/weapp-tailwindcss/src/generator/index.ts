import type { TailwindResolvedSource, WeappTailwindcssGenerator } from './types'
import type { TailwindcssRuntimeLike } from '@/types'
import {
  createTailwindV3Engine,
  resolveTailwindV3Source,
  resolveTailwindV3SourceFromRuntime,
  resolveTailwindV3SourceOptionsFromRuntime,
  transformTailwindV3CssByTarget,
  transformTailwindV3CssToWeapp,
} from '@/tailwindcss/v3-engine'
import {
  createTailwindV4Engine,
  resolveTailwindV4Source,
  resolveTailwindV4SourceFromRuntime,
  resolveTailwindV4SourceFromRuntimeOptions,
  resolveTailwindV4SourceOptionsFromRuntime,
  transformTailwindV4CssByTarget,
  transformTailwindV4CssToWeapp,
} from '@/tailwindcss/v4-engine'

function isTailwindV3Source(source: TailwindResolvedSource): source is Extract<TailwindResolvedSource, { version: 3 }> {
  return 'version' in source && source.version === 3
}

export function createWeappTailwindcssGenerator(source: TailwindResolvedSource): WeappTailwindcssGenerator {
  return isTailwindV3Source(source)
    ? createTailwindV3Engine(source)
    : createTailwindV4Engine(source)
}

export async function resolveTailwindSourceFromRuntime(
  tailwindRuntime: TailwindcssRuntimeLike,
): Promise<TailwindResolvedSource> {
  return tailwindRuntime.majorVersion === 3
    ? resolveTailwindV3SourceFromRuntime(tailwindRuntime)
    : resolveTailwindV4SourceFromRuntime(tailwindRuntime)
}

export async function createWeappTailwindcssGeneratorFromRuntime(
  tailwindRuntime: TailwindcssRuntimeLike,
) {
  return createWeappTailwindcssGenerator(await resolveTailwindSourceFromRuntime(tailwindRuntime))
}

export {
  normalizeWeappTailwindcssGeneratorOptions,
} from './options'

export {
  resolveTailwindV3Source,
  resolveTailwindV3SourceFromRuntime,
  resolveTailwindV3SourceOptionsFromRuntime,
  resolveTailwindV4Source,
  resolveTailwindV4SourceFromRuntime,
  resolveTailwindV4SourceFromRuntimeOptions,
  resolveTailwindV4SourceOptionsFromRuntime,
  transformTailwindV3CssByTarget,
  transformTailwindV3CssToWeapp,
  transformTailwindV4CssByTarget,
  transformTailwindV4CssToWeapp,
}

export type {
  NormalizedWeappTailwindcssGeneratorOptions,
  WeappTailwindcssGeneratorOptions,
  WeappTailwindcssGeneratorUserOptions,
} from './options'

export type {
  TailwindCandidateSource,
  TailwindGeneratorVersion,
  TailwindResolvedSource,
  TailwindV3CandidateSource,
  TailwindV3Engine,
  TailwindV3GenerateOptions,
  TailwindV3GenerateResult,
  TailwindV3GenerateTarget,
  TailwindV3ResolvedSource,
  TailwindV3SourceOptions,
  TailwindV4CandidateSource,
  TailwindV4DesignSystem,
  TailwindV4Engine,
  TailwindV4GenerateOptions,
  TailwindV4GenerateResult,
  TailwindV4GenerateTarget,
  TailwindV4ResolvedSource,
  TailwindV4SourceOptions,
  WeappTailwindcssGenerateOptions,
  WeappTailwindcssGenerateResult,
  WeappTailwindcssGenerator,
  WeappTailwindcssGeneratorTarget,
} from './types'
