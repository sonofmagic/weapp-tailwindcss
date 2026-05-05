import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { Config } from 'tailwindcss'

export type TailwindV3GenerateTarget = 'weapp' | 'web' | 'tailwind'

export interface TailwindV3CandidateSource {
  content: string
  extension?: string
}

export interface TailwindV3SourcePattern {
  base: string
  pattern: string
  negated: boolean
}

export interface TailwindV3SourceOptions {
  projectRoot?: string
  cwd?: string
  base?: string
  css?: string
  config?: string
  packageName?: string
  postcssPlugin?: string
}

export interface TailwindV3ResolvedSource {
  version: 3
  projectRoot: string
  cwd: string
  base: string
  css: string
  config?: string
  configObject?: Config
  dependencies: string[]
  packageName: string
  postcssPlugin: string
}

export interface TailwindV3GenerateOptions {
  candidates?: Iterable<string>
  sources?: TailwindV3CandidateSource[]
  target?: TailwindV3GenerateTarget
  styleOptions?: Partial<IStyleHandlerOptions>
}

export interface TailwindV3GenerateResult {
  css: string
  rawCss: string
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
