import type { TailwindV4Engine, TailwindV4GenerateOptions, TailwindV4ResolvedSource } from './types'
import { loadTailwindV4DesignSystem, resolveValidTailwindV4Candidates } from './design-system'
import { collectInlineSourceCandidates } from './inline-source'
import { transformTailwindV4CssToWeapp } from './miniprogram'
import { importTailwindV4NodeModule } from './node'
import { extractTailwindV4CandidatesFromSources } from './scanner'

function addAll(target: Set<string>, values: Iterable<string>) {
  for (const value of values) {
    target.add(value)
  }
}

export function createTailwindV4Engine(source: TailwindV4ResolvedSource): TailwindV4Engine {
  async function generate(options: TailwindV4GenerateOptions = {}) {
    const { compile } = await importTailwindV4NodeModule()
    const dependencies = new Set(source.dependencies)
    const compiled = await compile(source.css, {
      base: source.base,
      onDependency(file) {
        dependencies.add(file)
      },
    })

    const designSystem = await loadTailwindV4DesignSystem(source)
    const rawCandidates = new Set<string>()
    if (options.candidates) {
      addAll(rawCandidates, options.candidates)
    }
    addAll(rawCandidates, await extractTailwindV4CandidatesFromSources(options.sources))

    const inlineCandidates = await collectInlineSourceCandidates(source.css)
    addAll(rawCandidates, inlineCandidates.included)
    for (const candidate of inlineCandidates.excluded) {
      rawCandidates.delete(candidate)
    }

    const classSet = resolveValidTailwindV4Candidates(designSystem, rawCandidates)
    const rawCss = compiled.build([...classSet])
    const target = options.target ?? 'weapp'
    const css = target === 'weapp'
      ? await transformTailwindV4CssToWeapp(rawCss, options.styleOptions)
      : rawCss

    return {
      css,
      rawCss,
      target,
      classSet,
      dependencies: [...dependencies].sort((a, b) => a.localeCompare(b)),
      sources: compiled.sources,
      root: compiled.root,
    }
  }

  return {
    source,
    generate,
  }
}
