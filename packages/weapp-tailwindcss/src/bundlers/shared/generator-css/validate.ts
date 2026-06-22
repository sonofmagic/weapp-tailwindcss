import type { GenerateCssByGeneratorOptions } from './types'
import {
  createWeappTailwindcssGenerator,
  normalizeWeappTailwindcssGeneratorOptions,
} from '@/generator'
import { resolveGeneratorSources } from './source-resolver'

export interface ValidateCandidatesByGeneratorOptions extends Omit<GenerateCssByGeneratorOptions, 'runtime'> {
  candidates: Set<string>
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
    skipGenerateFallback,
  } = options
  const majorVersion = runtimeState.tailwindRuntime.majorVersion
  if (majorVersion !== 4 || candidates.size === 0) {
    return new Set<string>()
  }

  const generatorOptions = {
    ...normalizeWeappTailwindcssGeneratorOptions(opts.generator),
    bareArbitraryValues: opts.arbitraryValues?.bareArbitraryValues,
  }
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
    if (generatorOptions.bareArbitraryValues === undefined || generatorOptions.bareArbitraryValues === false) {
      if (typeof generator.validateCandidates === 'function') {
        return generator.validateCandidates(candidates)
      }
    }
    if (skipGenerateFallback) {
      return new Set<string>()
    }
    const generated = await generator.generate({
      bareArbitraryValues: generatorOptions.bareArbitraryValues,
      candidates,
      target: 'web',
    })
    return generated.classSet
  }))
  const classSet = new Set(classSets.flatMap(item => [...item]))
  debug(
    'tailwind generator validated candidates: %s candidates=%d classSet=%d',
    file,
    candidates.size,
    classSet.size,
  )
  return classSet
}
