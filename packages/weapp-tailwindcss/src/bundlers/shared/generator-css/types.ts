import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { TailwindV4CssSource } from './source-resolver/types'
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
  styleHandler: InternalUserDefinedOptions['styleHandler']
  debug: (format: string, ...args: unknown[]) => void
  userRawSource?: string | undefined
  previousCss?: string | undefined
  deferEmptyScopedCssSource?: boolean | undefined
  restoreLocalCssImports?: boolean | undefined
}

export interface GenerateCssByGeneratorResult {
  css: string
  target: string
  source: 'generator'
  dependencies: string[]
  incremental?: boolean | undefined
}
