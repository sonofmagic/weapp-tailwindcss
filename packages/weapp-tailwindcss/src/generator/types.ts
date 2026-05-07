import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type {
  TailwindV3CandidateSource,
  TailwindV3Engine,
  TailwindV3GenerateOptions,
  TailwindV3GenerateResult,
  TailwindV3GenerateTarget,
  TailwindV3ResolvedSource,
  TailwindV3SourceOptions,
} from '@/tailwindcss/v3-engine'
import type {
  TailwindV4CandidateSource,
  TailwindV4DesignSystem,
  TailwindV4Engine,
  TailwindV4GenerateOptions,
  TailwindV4GenerateResult,
  TailwindV4GenerateTarget,
  TailwindV4ResolvedSource,
  TailwindV4SourceOptions,
} from '@/tailwindcss/v4-engine'

export type WeappTailwindcssGeneratorTarget = TailwindV3GenerateTarget | TailwindV4GenerateTarget
export type TailwindGeneratorVersion = 3 | 4
export type TailwindCandidateSource = TailwindV3CandidateSource | TailwindV4CandidateSource
export type TailwindResolvedSource = TailwindV3ResolvedSource | TailwindV4ResolvedSource

export interface WeappTailwindcssGenerateOptions extends Omit<TailwindV3GenerateOptions & TailwindV4GenerateOptions, 'target'> {
  target?: WeappTailwindcssGeneratorTarget
  styleOptions?: Partial<IStyleHandlerOptions>
  tailwindcssV3Compatibility?: boolean
}

export type WeappTailwindcssGenerateResult = (TailwindV3GenerateResult | TailwindV4GenerateResult) & {
  target: WeappTailwindcssGeneratorTarget
  rawCss: string
}

export interface WeappTailwindcssGenerator extends Omit<TailwindV3Engine | TailwindV4Engine, 'generate'> {
  generate: (options?: WeappTailwindcssGenerateOptions) => Promise<WeappTailwindcssGenerateResult>
}

export type {
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
}
