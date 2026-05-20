import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { Config } from 'tailwindcss'

export type TailwindV3GenerateTarget = 'weapp' | 'web' | 'tailwind'

export interface TailwindV3CandidateSource {
  content: string
  extension?: string | undefined
}

export interface TailwindV3SourcePattern {
  base: string
  pattern: string
  negated: boolean
}

export interface TailwindV3SourceOptions {
  projectRoot?: string | undefined
  cwd?: string | undefined
  base?: string | undefined
  css?: string | undefined
  config?: string | undefined
  packageName?: string | undefined
  postcssPlugin?: string | undefined
}

export interface TailwindV3ResolvedSource {
  version: 3
  projectRoot: string
  cwd: string
  base: string
  css: string
  config?: string | undefined
  configObject?: Config | undefined
  dependencies: string[]
  packageName: string
  postcssPlugin: string
}

export interface TailwindV3GenerateOptions {
  candidates?: Iterable<string> | undefined
  sources?: TailwindV3CandidateSource[] | undefined
  incrementalCache?: boolean | undefined
  target?: TailwindV3GenerateTarget | undefined
  styleOptions?: Partial<IStyleHandlerOptions> | undefined
}

export interface TailwindV3GenerateResult {
  css: string
  rawCss: string
  incrementalCss?: string | undefined
  incrementalRawCss?: string | undefined
  classSet: Set<string>
  rawCandidates: Set<string>
  dependencies: string[]
  sources: TailwindV3SourcePattern[]
  root: null
  target: TailwindV3GenerateTarget
  version: 3
}

export interface TailwindV3Engine {
  source: TailwindV3ResolvedSource
  validateCandidates: (candidates: Iterable<string>) => Promise<Set<string>>
  generate: (options?: TailwindV3GenerateOptions) => Promise<TailwindV3GenerateResult>
}
