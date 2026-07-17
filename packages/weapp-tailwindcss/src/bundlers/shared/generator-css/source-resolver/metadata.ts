import type { SourceSideCssEntrySource } from '../source-files'
import type { TailwindResolvedSource } from '@/generator'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'

export interface GeneratorSourceMetadata {
  candidateMatchedCssSource?: boolean | undefined
  cssEntryIndex?: number | undefined
  cssSourceIndex?: number | undefined
  includesPreflight?: boolean | undefined
  isolateCssSource?: boolean | undefined
  matchedCssSourceFile?: string | undefined
  primaryCssSource?: boolean | undefined
  sourceEntries?: TailwindSourceEntry[] | undefined
  sourceBase?: string | undefined
  sourceCss?: string | undefined
}

const generatorSourceMetadataKey = Symbol('weapp-tailwindcss.generator-source-metadata')

export type GeneratorResolvedSource = TailwindResolvedSource & {
  [generatorSourceMetadataKey]?: GeneratorSourceMetadata | undefined
}

export function getGeneratorSourceMetadata(
  source: TailwindResolvedSource,
): GeneratorSourceMetadata | undefined {
  return (source as GeneratorResolvedSource)[generatorSourceMetadataKey]
    ?? (source as TailwindResolvedSource & {
      __weappTailwindcssMeta?: GeneratorSourceMetadata | undefined
    }).__weappTailwindcssMeta
}

export function withGeneratorSourceMetadata(
  source: TailwindResolvedSource,
  metadata: GeneratorSourceMetadata,
): GeneratorResolvedSource {
  return {
    ...source,
    [generatorSourceMetadataKey]: metadata,
  }
}

export function withMatchedSourceSideMetadata(
  source: TailwindResolvedSource,
  resolvedEntrySource: SourceSideCssEntrySource,
  metadata: GeneratorSourceMetadata = {},
) {
  return resolvedEntrySource.file
    ? withGeneratorSourceMetadata(source, {
        ...metadata,
        isolateCssSource: true,
        matchedCssSourceFile: resolvedEntrySource.file,
        sourceBase: resolvedEntrySource.base,
        sourceCss: resolvedEntrySource.css,
      })
    : source
}
