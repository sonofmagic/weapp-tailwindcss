import type { SourceSideCssEntrySource } from '../source-files'
import type { TailwindResolvedSource } from '@/generator'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'

export interface GeneratorSourceMetadata {
  matchedCssSourceFile?: string | undefined
  sourceEntries?: TailwindSourceEntry[] | undefined
  sourceBase?: string | undefined
  sourceCss?: string | undefined
}

export type GeneratorResolvedSource = TailwindResolvedSource & {
  __weappTailwindcssMeta?: GeneratorSourceMetadata | undefined
}

export function withGeneratorSourceMetadata(
  source: TailwindResolvedSource,
  metadata: GeneratorSourceMetadata,
): GeneratorResolvedSource {
  return {
    ...source,
    __weappTailwindcssMeta: metadata,
  }
}

export function withMatchedSourceSideMetadata(
  source: TailwindResolvedSource,
  resolvedEntrySource: SourceSideCssEntrySource,
) {
  return resolvedEntrySource.file
    ? withGeneratorSourceMetadata(source, {
        matchedCssSourceFile: resolvedEntrySource.file,
        sourceBase: resolvedEntrySource.base,
        sourceCss: resolvedEntrySource.css,
      })
    : source
}
