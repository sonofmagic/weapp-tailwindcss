import type { TailwindV4Engine, TailwindV4GenerateOptions, TailwindV4ResolvedSource } from './types'
import { createTailwindV4Engine as createPatchTailwindV4Engine } from 'tailwindcss-patch'
import { transformTailwindV4CssToWeapp } from './miniprogram'

export function createTailwindV4Engine(source: TailwindV4ResolvedSource): TailwindV4Engine {
  const engine = createPatchTailwindV4Engine(source)

  async function generate(options: TailwindV4GenerateOptions = {}) {
    const {
      styleOptions,
      target = 'weapp',
      ...patchOptions
    } = options
    const result = await engine.generate(patchOptions)
    const rawCss = result.css
    const css = target === 'weapp'
      ? await transformTailwindV4CssToWeapp(rawCss, styleOptions)
      : rawCss

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
