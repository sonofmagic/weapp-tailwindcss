import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { InternalUserDefinedOptions } from '@/types'

export interface GenerateCssByGeneratorOptions {
  opts: InternalUserDefinedOptions
  runtimeState: {
    twPatcher: InternalUserDefinedOptions['twPatcher']
    readyPromise: Promise<void>
  }
  runtime: Set<string>
  rawSource: string
  file: string
  cssHandlerOptions: IStyleHandlerOptions
  cssUserHandlerOptions: IStyleHandlerOptions
  getSourceCandidatesForEntries?: ((entries: TailwindSourceEntry[] | undefined) => Set<string>) | undefined
  styleHandler: InternalUserDefinedOptions['styleHandler']
  debug: (format: string, ...args: unknown[]) => void
  previousCss?: string | undefined
  deferEmptyScopedCssSource?: boolean | undefined
}

export interface GenerateCssByGeneratorResult {
  css: string
  target: string
  source: 'generator'
  dependencies: string[]
  incremental?: boolean | undefined
}
