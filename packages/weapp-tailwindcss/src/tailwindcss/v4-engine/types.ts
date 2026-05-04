import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'

export type TailwindV4GenerateTarget = 'weapp' | 'tailwind'

export interface TailwindV4SourceOptions {
  projectRoot?: string
  base?: string
  baseFallbacks?: string[]
  css?: string
  cssEntries?: string[]
  packageName?: string
}

export interface TailwindV4ResolvedSource {
  projectRoot: string
  base: string
  baseFallbacks: string[]
  css: string
  dependencies: string[]
}

export interface TailwindV4CandidateSource {
  content: string
  extension?: string
}

export interface TailwindV4GenerateOptions {
  candidates?: Iterable<string>
  sources?: TailwindV4CandidateSource[]
  target?: TailwindV4GenerateTarget
  styleOptions?: Partial<IStyleHandlerOptions>
}

export interface TailwindV4GenerateResult {
  css: string
  rawCss: string
  target: TailwindV4GenerateTarget
  classSet: Set<string>
  dependencies: string[]
  sources: {
    base: string
    pattern: string
    negated: boolean
  }[]
  root: 'none' | {
    base: string
    pattern: string
  } | null
}

export interface TailwindV4Engine {
  source: TailwindV4ResolvedSource
  generate: (options?: TailwindV4GenerateOptions) => Promise<TailwindV4GenerateResult>
}

export interface TailwindV4DesignSystem {
  parseCandidate: (candidate: string) => unknown[]
  candidatesToCss: (candidates: string[]) => Array<string | null | undefined>
}

export interface TailwindV4CompiledStylesheet {
  sources: TailwindV4GenerateResult['sources']
  root: TailwindV4GenerateResult['root']
  build: (candidates: string[]) => string
}

export interface TailwindV4NodeModule {
  compile: (
    css: string,
    options: {
      base: string
      from?: string
      onDependency: (path: string) => void
    },
  ) => Promise<TailwindV4CompiledStylesheet>
  __unstable__loadDesignSystem: (
    css: string,
    options: {
      base: string
    },
  ) => Promise<TailwindV4DesignSystem>
}
