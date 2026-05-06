import type { TailwindV4Engine, TailwindV4GenerateOptions, TailwindV4ResolvedSource } from './types'
import { createTailwindV4Engine as createPatchTailwindV4Engine } from 'tailwindcss-patch'
import { transformTailwindV4CssByTarget } from './miniprogram'

export function createTailwindV4Engine(source: TailwindV4ResolvedSource): TailwindV4Engine {
  const engine = createPatchTailwindV4Engine(source)

  async function generate(options: TailwindV4GenerateOptions = {}) {
    const {
      styleOptions,
      target = 'weapp',
      ...patchOptions
    } = options
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
    loadDesignSystem: engine.loadDesignSystem,
    validateCandidates: engine.validateCandidates,
    generate,
  }
}
