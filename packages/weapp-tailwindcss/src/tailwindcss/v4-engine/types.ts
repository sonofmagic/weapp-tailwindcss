import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type {
  TailwindV4Engine as PatchTailwindV4Engine,
  TailwindV4GenerateOptions as PatchTailwindV4GenerateOptions,
  TailwindV4GenerateResult as PatchTailwindV4GenerateResult,
  TailwindV4CandidateSource,
  TailwindV4DesignSystem,
  TailwindV4ResolvedSource,
  TailwindV4SourceOptions,
} from 'tailwindcss-patch'

export type TailwindV4GenerateTarget = 'weapp' | 'web' | 'tailwind'

type TailwindV4PatchGenerateOptions = Omit<PatchTailwindV4GenerateOptions, 'target' | 'styleOptions' | 'tailwindcssV3Compatibility' | 'scanSources'>

export interface TailwindV4GenerateOptions extends TailwindV4PatchGenerateOptions {
  incrementalCache?: boolean | undefined
  target?: TailwindV4GenerateTarget | undefined
  styleOptions?: Partial<IStyleHandlerOptions> | undefined
  tailwindcssV3Compatibility?: boolean | undefined
  scanSources?: PatchTailwindV4GenerateOptions['scanSources'] | undefined
}

export interface TailwindV4GenerateResult extends Omit<PatchTailwindV4GenerateResult, 'css'> {
  css: string
  rawCss: string
  target: TailwindV4GenerateTarget
}

export interface TailwindV4Engine extends Omit<PatchTailwindV4Engine, 'generate'> {
  source: TailwindV4ResolvedSource
  generate: (options?: TailwindV4GenerateOptions) => Promise<TailwindV4GenerateResult>
}

export type {
  TailwindV4CandidateSource,
  TailwindV4DesignSystem,
  TailwindV4ResolvedSource,
  TailwindV4SourceOptions,
}
