import type { SourceSideCssEntryOptions } from '../source-files'
import type { resolveTailwindV4SourceOptionsFromPatcher } from '@/generator'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { InternalUserDefinedOptions } from '@/types'

export interface GeneratorSourceRuntimeState {
  twPatcher: InternalUserDefinedOptions['twPatcher']
}

export interface GeneratorSourceSelectionOptions {
  runtime?: Set<string> | undefined
  getSourceCandidatesForEntries?: ((entries: TailwindSourceEntry[] | undefined) => Set<string>) | undefined
  cssEntries?: string[] | undefined
}

export type TailwindV4SourceOptions = ReturnType<typeof resolveTailwindV4SourceOptionsFromPatcher> & {
  config?: string | undefined
  outputRoot?: string | undefined
  sourceFile?: string | undefined
}

export type TailwindV4CssSource = NonNullable<TailwindV4SourceOptions['cssSources']>[number]
export type TailwindV4CssSourceRef = Pick<TailwindV4CssSource, 'file'>
export interface SourceStyleMatchOptions extends SourceSideCssEntryOptions {}
