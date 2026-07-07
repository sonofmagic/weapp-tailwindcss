import type { GenerateCssByGeneratorOptions } from './types'
import { createWeappTailwindcssGenerator, normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { collectGeneratedRawSourceCandidates } from './class-selectors'
import { resolveGeneratorSources } from './source-resolver'

export interface ValidateCandidatesByGeneratorOptions extends Omit<GenerateCssByGeneratorOptions, 'runtime'> {
  candidates: Set<string>
  generatedCssSources?: Iterable<string> | undefined
  skipGenerateFallback?: boolean | undefined
}

export async function validateCandidatesByGenerator(
  options: ValidateCandidatesByGeneratorOptions,
): Promise<Set<string>> {
  const {
    candidates,
    cssHandlerOptions,
    debug,
    file,
    opts,
    rawSource,
    runtimeState,
  } = options
  const majorVersion = runtimeState.tailwindRuntime.majorVersion
  if (majorVersion !== 4 || candidates.size === 0) {
    return new Set<string>()
  }
  const classSet = new Set<string>()
  try {
    const generatorOptions = {
      ...normalizeWeappTailwindcssGeneratorOptions(opts.generator),
      bareArbitraryValues: opts.arbitraryValues?.bareArbitraryValues,
    }
    if (generatorOptions.enabled) {
      const sources = await resolveGeneratorSources(
        majorVersion,
        runtimeState,
        rawSource,
        file,
        cssHandlerOptions,
        generatorOptions,
        {
          cssEntries: opts.cssEntries,
          runtime: candidates,
        },
      )
      const classSets = await Promise.all(sources.map(async (source) => {
        const generator = createWeappTailwindcssGenerator(source)
        if (typeof generator.validateCandidates !== 'function') {
          return new Set<string>()
        }
        return generator.validateCandidates(candidates)
      }))
      for (const candidate of classSets.flatMap(item => [...item])) {
        classSet.add(candidate)
      }
    }
  }
  catch {
  }
  const rawSourceCandidates = collectGeneratedRawSourceCandidates(candidates, rawSource, opts.escapeMap)
  for (const candidate of rawSourceCandidates) {
    classSet.add(candidate)
  }
  for (const generatedCss of options.generatedCssSources ?? []) {
    for (const candidate of collectGeneratedRawSourceCandidates(candidates, generatedCss, opts.escapeMap)) {
      classSet.add(candidate)
    }
  }
  debug(
    'tailwind generator validated candidates: %s candidates=%d classSet=%d',
    file,
    candidates.size,
    classSet.size,
  )
  return classSet
}
