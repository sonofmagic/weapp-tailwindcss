import type { TailwindV4Engine, TailwindV4GenerateOptions, TailwindV4ResolvedSource } from './types'
import { createTailwindV4Engine as createPatchTailwindV4Engine } from 'tailwindcss-patch'
import { appendTailwindV4LegacyDefaultsCss } from './legacy-defaults'
import { transformTailwindV4CssByTarget } from './miniprogram'

export function createTailwindV4Engine(source: TailwindV4ResolvedSource): TailwindV4Engine {
  async function generate(options: TailwindV4GenerateOptions = {}) {
    const {
      legacyDefaults,
      styleOptions,
      target = 'weapp',
      ...patchOptions
    } = options
    const shouldUseLegacyDefaults = legacyDefaults ?? target === 'weapp'
    const engine = createPatchTailwindV4Engine(
      shouldUseLegacyDefaults
        ? {
            ...source,
            css: appendTailwindV4LegacyDefaultsCss(source.css),
          }
        : source,
    )
    const result = await engine.generate({
      scanSources: true,
      ...patchOptions,
    })
    const rawCss = result.css
    const css = await transformTailwindV4CssByTarget(rawCss, target, styleOptions)

    return {
      ...result,
      css,
      rawCss,
      target,
    }
  }

  return {
    source,
    loadDesignSystem: createPatchTailwindV4Engine(source).loadDesignSystem,
    validateCandidates: createPatchTailwindV4Engine(source).validateCandidates,
    generate,
  }
}
