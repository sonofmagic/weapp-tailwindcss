import type {
  TailwindResolvedSource,
  TailwindV4ResolvedSource,
  WeappTailwindcssGenerator,
} from './types'
import type { TailwindcssPatcherLike } from '@/types'
import {
  createTailwindV3Engine,
  resolveTailwindV3Source,
  resolveTailwindV3SourceFromPatcher,
  resolveTailwindV3SourceOptionsFromPatcher,
  transformTailwindV3CssByTarget,
  transformTailwindV3CssToWeapp,
} from '@/tailwindcss/v3-engine'
import {
  createTailwindV4Engine,
  resolveTailwindV4Source,
  resolveTailwindV4SourceFromPatcher,
  resolveTailwindV4SourceFromPatchOptions,
  resolveTailwindV4SourceOptionsFromPatcher,
  transformTailwindV4CssByTarget,
  transformTailwindV4CssToWeapp,
} from '@/tailwindcss/v4-engine'

function isTailwindV3Source(source: TailwindResolvedSource): source is TailwindResolvedSource & { version: 3 } {
  return 'version' in source && source.version === 3
}

export function createWeappTailwindcssGenerator(source: TailwindResolvedSource): WeappTailwindcssGenerator {
  return isTailwindV3Source(source)
    ? createTailwindV3Engine(source)
    : createTailwindV4Engine(source as TailwindV4ResolvedSource)
}

export async function resolveTailwindSourceFromPatcher(
  patcher: TailwindcssPatcherLike,
): Promise<TailwindResolvedSource> {
  return patcher.majorVersion === 3
    ? resolveTailwindV3SourceFromPatcher(patcher)
    : resolveTailwindV4SourceFromPatcher(patcher)
}

export async function createWeappTailwindcssGeneratorFromPatcher(
  patcher: TailwindcssPatcherLike,
) {
  return createWeappTailwindcssGenerator(await resolveTailwindSourceFromPatcher(patcher))
}

export {
  normalizeWeappTailwindcssGeneratorOptions,
} from './options'

export {
  resolveTailwindV3Source,
  resolveTailwindV3SourceFromPatcher,
  resolveTailwindV3SourceOptionsFromPatcher,
  resolveTailwindV4Source,
  resolveTailwindV4SourceFromPatcher,
  resolveTailwindV4SourceFromPatchOptions,
  resolveTailwindV4SourceOptionsFromPatcher,
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
