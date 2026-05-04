import type {
  TailwindV4ResolvedSource,
  WeappTailwindcssGenerator,
} from './types'
import {
  createTailwindV4Engine,
  resolveTailwindV4Source,
  resolveTailwindV4SourceFromPatcher,
  resolveTailwindV4SourceFromPatchOptions,
  resolveTailwindV4SourceOptionsFromPatcher,
  transformTailwindV4CssByTarget,
  transformTailwindV4CssToWeapp,
} from '@/tailwindcss/v4-engine'

export function createWeappTailwindcssGenerator(source: TailwindV4ResolvedSource): WeappTailwindcssGenerator {
  return createTailwindV4Engine(source)
}

export {
  normalizeWeappTailwindcssGeneratorOptions,
} from './options'

export {
  resolveTailwindV4Source,
  resolveTailwindV4SourceFromPatcher,
  resolveTailwindV4SourceFromPatchOptions,
  resolveTailwindV4SourceOptionsFromPatcher,
  transformTailwindV4CssByTarget,
  transformTailwindV4CssToWeapp,
}

export type {
  NormalizedWeappTailwindcssGeneratorOptions,
  WeappTailwindcssGeneratorMode,
  WeappTailwindcssGeneratorOptions,
  WeappTailwindcssGeneratorUserOptions,
} from './options'

export type {
  TailwindV4CandidateSource,
  TailwindV4DesignSystem,
  TailwindV4ResolvedSource,
  TailwindV4SourceOptions,
  WeappTailwindcssGenerateOptions,
  WeappTailwindcssGenerateResult,
  WeappTailwindcssGenerator,
  WeappTailwindcssGeneratorTarget,
} from './types'
