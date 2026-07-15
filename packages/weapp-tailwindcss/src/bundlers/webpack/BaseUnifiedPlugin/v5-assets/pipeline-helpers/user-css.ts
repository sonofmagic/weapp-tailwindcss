import type { WebpackGeneratorUserCssSource } from './sources'
import path from 'node:path'
import { filterExistingCssRules, mergeCoveredCssRuleDeclarations, postcss, removeUnsupportedCascadeLayers } from '@weapp-tailwindcss/postcss'
import { parseImportRequest } from '../../../../shared/generator-css/directives'
import { createCssSourceOrderAppend } from '../../../../shared/generator-css/generation-helpers'
import { collectWebpackCssRuleIdentityMarkers, hasAdditionalWebpackAssetUserCssMarkers, hasWebpackTailwindSourceDirectives } from './generated-css'

export function isWebpackTailwindImportRequest(request: string | undefined) {
  return request === 'tailwindcss'
    || request === 'tailwindcss4'
    || request?.startsWith('tailwindcss/')
    || request?.startsWith('tailwindcss4/')
    || request === 'weapp-tailwindcss'
    || request?.startsWith('weapp-tailwindcss/')
}

export function removeWebpackGeneratorNonTailwindImports(source: string | undefined) {
  if (!source?.includes('@import')) {
    return source
  }
  try {
    const root = postcss.parse(source)
    let changed = false
    root.walkAtRules('import', (rule) => {
      const request = parseImportRequest(rule.params)
      if (isWebpackTailwindImportRequest(request)) {
        return
      }
      rule.remove()
      changed = true
    })
    return changed ? root.toString() : source
  }
  catch {
    return source
  }
}

export function removeWebpackUserCssFallbackImports(source: string) {
  if (!source.includes('@import')) {
    return source
  }
  try {
    const root = postcss.parse(source)
    let changed = false
    root.walkAtRules('import', (rule) => {
      rule.remove()
      changed = true
    })
    return changed ? root.toString() : source
  }
  catch {
    return source
  }
}

export function normalizeWebpackUserCssFallbackSource(source: string) {
  const withoutImports = removeWebpackUserCssFallbackImports(source)
  if (!withoutImports.includes('@layer')) {
    return withoutImports
  }
  try {
    const root = postcss.parse(withoutImports)
    removeUnsupportedCascadeLayers(root)
    return root.toString()
  }
  catch {
    return withoutImports
  }
}

export function isWebpackCssSourceRepresentedInAsset(
  rawSource: string,
  sourceCss: string | undefined,
) {
  if (!sourceCss || !hasWebpackTailwindSourceDirectives(sourceCss)) {
    return false
  }
  const sourceMarkers = collectWebpackCssRuleIdentityMarkers(sourceCss)
  if (sourceMarkers.size === 0) {
    return false
  }
  const rawMarkers = collectWebpackCssRuleIdentityMarkers(rawSource)
  for (const marker of sourceMarkers) {
    if (!rawMarkers.has(marker)) {
      return false
    }
  }
  return true
}

export function createWebpackGeneratorCssSource(
  file: string | undefined,
  css: string | undefined,
) {
  if (!file || !css || !hasWebpackTailwindSourceDirectives(css)) {
    return undefined
  }
  return {
    file,
    base: path.dirname(file),
    css,
    dependencies: [file],
  }
}

export function createWebpackUserCssSourceAppend(
  sources: Iterable<{ css: string | undefined, file: string, processed?: boolean | undefined }>,
  generatorRawSource: string,
  currentSourceFile?: string | undefined,
  shouldIncludeSource?: ((file: string) => boolean) | undefined,
) {
  const matchedSources: Array<{ css: string, file: string, processed: boolean }> = []
  const seen = new Set<string>()
  for (const source of sources) {
    const css = source.css
    if (!css || seen.has(css)) {
      continue
    }
    if (shouldIncludeSource && !shouldIncludeSource(source.file)) {
      continue
    }
    seen.add(css)
    if (
      (source.processed === true || !css.includes('data:'))
      && hasAdditionalWebpackAssetUserCssMarkers(css, generatorRawSource)
    ) {
      matchedSources.push({
        css,
        file: source.file,
        processed: source.processed === true,
      })
    }
  }
  const currentFile = currentSourceFile ? path.resolve(currentSourceFile) : undefined
  const parts = matchedSources
    .sort((a, b) => {
      const aCurrent = currentFile !== undefined && path.resolve(a.file) === currentFile
      const bCurrent = currentFile !== undefined && path.resolve(b.file) === currentFile
      if (aCurrent !== bCurrent) {
        return aCurrent ? -1 : 1
      }
      return a.file.localeCompare(b.file)
    })
    .map(source => source.css)
  return parts.length > 0
    ? {
        css: parts.join('\n'),
        processed: matchedSources.every(source => source.processed),
      }
    : undefined
}

export function createWebpackGeneratorUserCssSourceAppend(
  ...sources: Array<WebpackGeneratorUserCssSource | undefined>
): WebpackGeneratorUserCssSource | undefined {
  const parts = sources.filter((source): source is WebpackGeneratorUserCssSource =>
    source !== undefined && source.css.trim().length > 0)
  if (parts.length === 0) {
    return undefined
  }
  let css = ''
  const usedParts: WebpackGeneratorUserCssSource[] = []
  for (const source of parts) {
    const merged = css.trim().length > 0
      ? mergeCoveredCssRuleDeclarations(css, source.css)
      : undefined
    if (merged?.changed) {
      css = merged.baseCss
    }
    const nextCss = css.trim().length > 0
      ? filterExistingCssRules(css, merged?.css ?? source.css)
      : source.css
    const hasNextCss = nextCss.trim().length > 0
    if (!hasNextCss) {
      continue
    }
    css = createCssSourceOrderAppend(css, nextCss)
    usedParts.push(source)
  }
  return {
    css,
    processed: usedParts.every(source => source.processed),
  }
}
