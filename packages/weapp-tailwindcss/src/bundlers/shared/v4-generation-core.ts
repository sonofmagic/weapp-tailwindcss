import type { GenerateCssByGeneratorOptions, GenerateCssByGeneratorResult } from './generator-css'
import { generateCssByGenerator } from './generator-css'

export interface TailwindV4GenerationCoreInput extends GenerateCssByGeneratorOptions {
  outputFile?: string | undefined
  sourceCandidates?: Set<string> | undefined
}

export interface TailwindV4GenerationCoreResult extends GenerateCssByGeneratorResult {
  classSet: Set<string>
  dependencies: string[]
  metadata: NonNullable<GenerateCssByGeneratorResult['metadata']>
}

export async function generateTailwindV4Css(
  options: TailwindV4GenerationCoreInput,
): Promise<TailwindV4GenerationCoreResult | undefined> {
  const majorVersion = options.runtimeState.tailwindRuntime.majorVersion
  if (majorVersion !== 4) {
    return undefined
  }
  const generated = await generateCssByGenerator(options)
  if (!generated) {
    return undefined
  }
  return {
    ...generated,
    classSet: generated.classSet,
    dependencies: generated.dependencies,
    metadata: {
      file: options.file,
      majorVersion,
      outputFile: options.outputFile,
      ...(generated.metadata ?? {}),
    },
  }
}
