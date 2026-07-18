import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { TailwindV4CssSource } from './source-resolver/types'
import type { CompilationDependencyChange, SourceScope } from '@/compiler'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { InternalUserDefinedOptions } from '@/types'

export interface GenerateCssByGeneratorOptions {
  opts: InternalUserDefinedOptions
  runtimeState: {
    tailwindRuntime: InternalUserDefinedOptions['tailwindRuntime']
    readyPromise: Promise<void>
  }
  runtime: Set<string>
  rawSource: string
  file: string
  cssHandlerOptions: IStyleHandlerOptions
  cssUserHandlerOptions: IStyleHandlerOptions
  cssSources?: TailwindV4CssSource[] | undefined
  getSourceCandidatesForEntries?: ((entries: TailwindSourceEntry[] | undefined) => Set<string>) | undefined
  sourceCandidates?: Set<string> | undefined
  compilation?: {
    changes?: CompilationDependencyChange[] | undefined
    enabled: boolean
    preserveDeletedCss: boolean
    scope: SourceScope
  } | undefined
  outputFile?: string | undefined
  styleHandler: InternalUserDefinedOptions['styleHandler']
  debug: (format: string, ...args: unknown[]) => void
  generatorPlatform?: string | undefined
  userRawSource?: string | undefined
  userRawSourceProcessed?: boolean | undefined
  forceGenerator?: boolean | undefined
  previousCss?: string | undefined
  previousClassSet?: Set<string> | undefined
  deferEmptyScopedCssSource?: boolean | undefined
  deferCssAdaptation?: boolean | undefined
  disableSourceScan?: boolean | undefined
  restoreLocalCssImports?: boolean | undefined
}

export interface GenerateCssByGeneratorResult {
  css: string
  classSet: Set<string>
  target: string
  source: 'generator'
  dependencies: string[]
  incremental?: boolean | undefined
  metadata?: {
    file: string
    majorVersion?: number | undefined
    outputFile?: string | undefined
    preflightMode?: {
      inject: boolean
      preserve: boolean
    } | undefined
    rawCss?: string | undefined
    revision?: number | undefined
  } | undefined
}
