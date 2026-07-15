import type { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { postcss, transformWebCssCompat } from '@weapp-tailwindcss/postcss'
import { collectGeneratedRawSourceCandidates } from './class-selectors'
import { finalizeMiniProgramGeneratorCss } from './generation-helpers'
import { createCssAppend } from './markers'

function collectCssRuleIdentityMarkers(source: string) {
  const markers = new Set<string>()
  try {
    const root = postcss.parse(source)
    root.walkRules((rule) => {
      for (const selector of rule.selectors ?? [rule.selector]) {
        for (const match of selector.matchAll(/\.((?:\\.|[_a-z\u00A0-\uFFFF-])(?:\\.|[\w\u00A0-\uFFFF-])*)/gi)) {
          markers.add(`class:${match[1]}`)
        }
      }
    })
    root.walkAtRules('keyframes', (rule) => {
      if (rule.params) {
        markers.add(`keyframes:${rule.params}`)
      }
    })
  }
  catch {
  }
  return markers
}

export function isCssAlreadyRepresentedByMarkers(css: string, source: string) {
  const sourceMarkers = collectCssRuleIdentityMarkers(source)
  if (sourceMarkers.size === 0) {
    return false
  }
  const cssMarkers = collectCssRuleIdentityMarkers(css)
  for (const marker of sourceMarkers) {
    if (!cssMarkers.has(marker)) {
      return false
    }
  }
  return true
}

function mergeGeneratedCssClassSet(
  classSet: Set<string>,
  candidates: Iterable<string>,
  css: string,
  escapeMap: Record<string, string> | undefined,
) {
  const merged = new Set(classSet)
  for (const candidate of collectGeneratedRawSourceCandidates(candidates, css, escapeMap)) {
    merged.add(candidate)
  }
  return merged
}

export function resolveGeneratedCssClassSet(
  target: string,
  classSet: Set<string>,
  candidates: Iterable<string>,
  css: string,
  escapeMap: Record<string, string> | undefined,
  previousClassSet?: Set<string> | undefined,
) {
  if (target === 'web') {
    return new Set([
      ...(previousClassSet ?? []),
      ...classSet,
    ])
  }
  return mergeGeneratedCssClassSet(classSet, candidates, css, escapeMap)
}

export function finalizeWebGeneratorCss(
  css: string,
  target: string,
  webCompat: ReturnType<typeof normalizeWeappTailwindcssGeneratorOptions>['webCompat'],
) {
  return target === 'web'
    ? transformWebCssCompat(css, webCompat)
    : css
}

export function finalizeIncrementalGeneratorCss(
  previousCss: string,
  incrementalCss: string,
  target: string,
  majorVersion: number | undefined,
  cssPreflight: Parameters<typeof finalizeMiniProgramGeneratorCss>[3],
  options: Parameters<typeof finalizeMiniProgramGeneratorCss>[4],
  webCompat: ReturnType<typeof normalizeWeappTailwindcssGeneratorOptions>['webCompat'],
) {
  const finalizedIncrementalCss = finalizeMiniProgramGeneratorCss(
    incrementalCss,
    target,
    majorVersion,
    cssPreflight,
    options,
  )
  if (target === 'web') {
    return createCssAppend(previousCss, finalizeWebGeneratorCss(finalizedIncrementalCss, target, webCompat))
  }
  return createCssAppend(previousCss, finalizedIncrementalCss)
}
