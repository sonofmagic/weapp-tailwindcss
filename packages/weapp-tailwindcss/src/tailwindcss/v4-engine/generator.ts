import type { TailwindV4Engine, TailwindV4GenerateOptions, TailwindV4ResolvedSource } from './types'
import { createTailwindV4Engine as createPatchTailwindV4Engine } from 'tailwindcss-patch'
import { transformTailwindV4CssByTarget } from './miniprogram'
import { applyTailwindV3CompatibilityCss } from './tailwind-v3-compatibility'
import { createTailwindV4DefaultColorThemeCss } from './tailwind-v4-default-colors'

function applyMiniProgramTailwindV4DefaultColorCss(css: string) {
  return `${createTailwindV4DefaultColorThemeCss()}\n${css}`
}

export function createTailwindV4Engine(source: TailwindV4ResolvedSource): TailwindV4Engine {
  async function generate(options: TailwindV4GenerateOptions = {}) {
    const {
      styleOptions,
      tailwindcssV3Compatibility,
      target = 'weapp',
      ...patchOptions
    } = options
    const shouldApplyTailwindV3Compatibility = tailwindcssV3Compatibility ?? target === 'weapp'
    const sourceCss = shouldApplyTailwindV3Compatibility
      ? applyTailwindV3CompatibilityCss(source.css)
      : target === 'weapp'
        ? applyMiniProgramTailwindV4DefaultColorCss(source.css)
        : source.css
    const engine = createPatchTailwindV4Engine(
      sourceCss === source.css ? source : { ...source, css: sourceCss },
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
