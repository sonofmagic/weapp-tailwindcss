import type { TailwindV4Engine, TailwindV4GenerateOptions, TailwindV4ResolvedSource } from './types'
import { createTailwindV4Engine as createPatchTailwindV4Engine } from 'tailwindcss-patch'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from './candidates'
import { transformTailwindV4CssByTarget } from './miniprogram'
import { applyTailwindV3CompatibilityCss } from './tailwind-v3-compatibility'
import { createTailwindV4DefaultColorThemeCss } from './tailwind-v4-default-colors'

function findLeadingImportInsertionIndex(css: string) {
  const importPattern = /(?:^|\n)\s*@import\b[^;]*;/g
  let insertionIndex = 0
  let match = importPattern.exec(css)
  while (match !== null) {
    insertionIndex = match.index + match[0].length
    match = importPattern.exec(css)
  }
  return insertionIndex
}

function applyMiniProgramTailwindV4DefaultColorCss(css: string) {
  const themeCss = createTailwindV4DefaultColorThemeCss()
  const insertionIndex = findLeadingImportInsertionIndex(css)
  if (insertionIndex === 0) {
    return `${themeCss}\n${css}`
  }
  return `${css.slice(0, insertionIndex)}\n${themeCss}\n${css.slice(insertionIndex)}`
}

export function createTailwindV4Engine(source: TailwindV4ResolvedSource): TailwindV4Engine {
  async function generate(options: TailwindV4GenerateOptions = {}) {
    const {
      scanSources = true,
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
    const candidates = target === 'weapp'
      ? filterUnsupportedMiniProgramTailwindV4Candidates(patchOptions.candidates)
      : patchOptions.candidates
    const engine = createPatchTailwindV4Engine(
      sourceCss === source.css ? source : { ...source, css: sourceCss },
    )
    const result = await engine.generate({
      scanSources,
      ...patchOptions,
      candidates,
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
