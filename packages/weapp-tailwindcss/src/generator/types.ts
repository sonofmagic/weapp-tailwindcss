import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
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

export type WeappTailwindcssGeneratorTarget = TailwindV4GenerateTarget

export interface WeappTailwindcssGenerateOptions extends TailwindV4GenerateOptions {
  target?: WeappTailwindcssGeneratorTarget
  styleOptions?: Partial<IStyleHandlerOptions>
}

export type WeappTailwindcssGenerateResult = TailwindV4GenerateResult

export interface WeappTailwindcssGenerator extends Omit<TailwindV4Engine, 'generate'> {
  generate: (options?: WeappTailwindcssGenerateOptions) => Promise<WeappTailwindcssGenerateResult>
}

export type {
  TailwindV4CandidateSource,
  TailwindV4DesignSystem,
  TailwindV4ResolvedSource,
  TailwindV4SourceOptions,
}
