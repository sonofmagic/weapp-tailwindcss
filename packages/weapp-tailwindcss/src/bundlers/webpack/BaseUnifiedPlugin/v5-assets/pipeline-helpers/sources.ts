import type { TailwindV4CssSource } from '../../../../shared/generator-css/source-resolver/types'
import type { WebpackCssHandlerOptions } from './preflight-runtime'
import type { InternalUserDefinedOptions } from '@/types'
import path from 'node:path'
import { postcss } from '@weapp-tailwindcss/postcss'
import { hasTailwindGeneratedCss, hasTailwindGeneratedCssMarkers, hasTailwindSourceDirectives } from '../../../../shared/generator-css'
import { collectRawSourceClassSelectors } from '../../../../shared/generator-css/class-selectors'
import { hasTailwindApplyDirective, hasTailwindRootDirectives, removeTailwindSourceDirectives } from '../../../../shared/generator-css/directives'
import { removeTailwindV4GeneratorAtRules, stripTailwindSourceMediaFragments } from '../../../../shared/generator-css/user-css'
import { hasAdditionalWebpackAssetUserCssMarkers, isOnlyWebpackTailwindGeneratedPreflightCss } from './generated-css'
import { hasMissingRuntimeCandidates, hasStaleRuntimeCandidates } from './preflight-runtime'
import { collectWebpackAssetUserCssMarkers } from './user-css-markers'

export { collectWebpackAssetUserCssMarkers } from './user-css-markers'

export function resolveWebpackGeneratorRawSource(
  rawSource: string,
  cssHandlerOptions: WebpackCssHandlerOptions,
) {
  const sourceCss = cssHandlerOptions.sourceOptions?.sourceCss
  if (
    sourceCss
    && (
      hasTailwindRootDirectives(sourceCss, { importFallback: true })
      || hasTailwindSourceDirectives(sourceCss, { importFallback: true })
      || hasTailwindApplyDirective(sourceCss)
      || hasTailwindGeneratedCss(sourceCss)
      || hasTailwindGeneratedCssMarkers(sourceCss)
    )
  ) {
    return sourceCss
  }
  return rawSource
}

export function shouldConsumeWebpackLoaderGeneratedCss(options: {
  allowMarkerlessRegistryMatch?: boolean | undefined
  hasBundlerGeneratedCssMarker: boolean
  loaderGeneratedClassSet?: Set<string> | undefined
  sourceCandidates?: Set<string> | undefined
  shouldRegenerateExplicitTailwindV4CssSource: boolean
  watchMode?: boolean | undefined
}) {
  if (!options.shouldRegenerateExplicitTailwindV4CssSource) {
    return true
  }
  if (
    options.watchMode === true
    && options.loaderGeneratedClassSet
    && options.sourceCandidates
    && hasStaleRuntimeCandidates(options.loaderGeneratedClassSet, options.sourceCandidates)
  ) {
    return false
  }
  if (options.hasBundlerGeneratedCssMarker) {
    return true
  }
  if (
    options.watchMode === true
    && options.loaderGeneratedClassSet
    && options.sourceCandidates
    && hasMissingRuntimeCandidates(options.loaderGeneratedClassSet, options.sourceCandidates)
  ) {
    return false
  }
  return Boolean(
    options.allowMarkerlessRegistryMatch
    && options.loaderGeneratedClassSet
    && options.sourceCandidates
    && !hasMissingRuntimeCandidates(options.loaderGeneratedClassSet, options.sourceCandidates)
    && !hasStaleRuntimeCandidates(options.loaderGeneratedClassSet, options.sourceCandidates),
  )
}

export function hasDeferredWebpackGeneratedCss(
  source: string,
  generatedClassSets: Iterable<ReadonlySet<string>>,
) {
  const selectors = collectRawSourceClassSelectors(source)
  for (const classSet of generatedClassSets) {
    for (const candidate of classSet) {
      if (selectors.has(candidate)) {
        return true
      }
    }
  }
  return false
}

export interface WebpackGeneratorUserCssSource {
  css: string
  processed: boolean
}

export function hasUsableWebpackGeneratorCssSources(
  cssSources: TailwindV4CssSource[] | undefined,
): cssSources is TailwindV4CssSource[] {
  return Array.isArray(cssSources)
    && cssSources.some(source => typeof source?.css === 'string' && source.css.length > 0)
}

export function normalizeWebpackGeneratorCssSources(cssSources: TailwindV4CssSource[] | undefined) {
  if (!Array.isArray(cssSources)) {
    return undefined
  }
  const normalized = cssSources.filter(source => typeof source?.css === 'string' && source.css.length > 0)
  return normalized.length > 0 ? normalized : undefined
}

export function scopeWebpackGeneratorOptionsToCssSource(
  compilerOptions: InternalUserDefinedOptions,
  sourceFile: string | undefined,
  options: { disableUnmatchedCssEntries?: boolean | undefined } = {},
) {
  const withoutCssEntries = () => ({
    ...compilerOptions,
    ...(compilerOptions.cssEntries?.length ? { cssEntries: [] } : {}),
    tailwindcss: {
      ...compilerOptions.tailwindcss,
      v4: {
        ...compilerOptions.tailwindcss?.v4,
        ...(compilerOptions.tailwindcss?.v4?.cssEntries?.length || compilerOptions.cssEntries?.length
          ? { cssEntries: [] }
          : {}),
      },
    },
  })
  if (!sourceFile) {
    if (options.disableUnmatchedCssEntries !== true) {
      return compilerOptions
    }
    if (!compilerOptions.cssEntries?.length && !compilerOptions.tailwindcss?.v4?.cssEntries?.length) {
      return compilerOptions
    }
    return withoutCssEntries()
  }
  const resolvedSourceFile = path.resolve(sourceFile)
  if (options.disableUnmatchedCssEntries === true) {
    const configuredEntries = [
      ...(compilerOptions.cssEntries ?? []),
      ...(compilerOptions.tailwindcss?.v4?.cssEntries ?? []),
    ]
    if (configuredEntries.length > 0 && !configuredEntries.some(entry => path.resolve(entry) === resolvedSourceFile)) {
      return withoutCssEntries()
    }
  }
  const cssEntries = compilerOptions.cssEntries?.filter(entry => path.resolve(entry) === resolvedSourceFile)
  const runtimeCssEntries = compilerOptions.tailwindcss?.v4?.cssEntries?.filter(entry => path.resolve(entry) === resolvedSourceFile)
  const hasScopedCssEntries = Boolean(cssEntries?.length)
  const hasScopedRuntimeCssEntries = Boolean(runtimeCssEntries?.length)
  if (!hasScopedCssEntries && !hasScopedRuntimeCssEntries) {
    return compilerOptions
  }
  const scoped = {
    ...compilerOptions,
    ...(hasScopedCssEntries ? { cssEntries } : {}),
    tailwindcss: {
      ...compilerOptions.tailwindcss,
      v4: {
        ...compilerOptions.tailwindcss?.v4,
        ...(hasScopedRuntimeCssEntries
          ? { cssEntries: runtimeCssEntries }
          : hasScopedCssEntries
            ? { cssEntries }
            : {}),
      },
    },
  }
  return scoped
}

export function hasProcessedCssAssetUrl(css: string) {
  return /url\(\s*["']?data:/i.test(css)
}

export function shouldUseWebpackAssetAsGeneratorUserCss(
  rawSource: string,
  generatorRawSource: string,
  options: { processed?: boolean | undefined } = {},
) {
  const rawMarkers = collectWebpackAssetUserCssMarkers(rawSource)
  return rawSource !== generatorRawSource
    && (options.processed === true || !rawSource.includes('data:'))
    && !hasTailwindRootDirectives(rawSource, { importFallback: true })
    && !hasTailwindSourceDirectives(rawSource, { importFallback: true })
    && !hasTailwindApplyDirective(rawSource)
    && rawMarkers.size > 0
    && !isOnlyWebpackTailwindGeneratedPreflightCss(rawSource)
    && (
      !hasTailwindGeneratedCssMarkers(rawSource)
      || hasAdditionalWebpackAssetUserCssMarkers(rawSource, generatorRawSource)
    )
}

function hasWebpackClassSelector(selector: string) {
  return /(?:^|[^\w-])\.[_a-z\u00A0-\uFFFF\\-]/i.test(selector)
}

function isWebpackKeyframesRule(rule: postcss.Rule) {
  let parent = rule.parent as postcss.Container | undefined
  while (parent) {
    if (parent.type === 'atrule' && (parent as postcss.AtRule).name.endsWith('keyframes')) {
      return true
    }
    parent = parent.parent as postcss.Container | undefined
  }
  return false
}

export function collectWebpackBareSelectorUserCss(source: string) {
  try {
    const normalizedSource = removeTailwindSourceDirectives(
      stripTailwindSourceMediaFragments(
        removeTailwindV4GeneratorAtRules(source),
      ),
      { importFallback: true },
    )
    const root = postcss.parse(normalizedSource)
    let changed = false
    root.walkAtRules((rule) => {
      if (rule.name === 'import' || rule.name === 'font-face' || rule.name.endsWith('keyframes')) {
        rule.remove()
        changed = true
      }
    })
    root.walkRules((rule) => {
      if (
        isWebpackKeyframesRule(rule)
        || rule.selectors.some(selector => hasWebpackClassSelector(selector))
      ) {
        rule.remove()
        changed = true
      }
    })
    root.walkAtRules((rule) => {
      if (rule.nodes !== undefined && rule.nodes.length === 0) {
        rule.remove()
        changed = true
      }
    })
    return changed ? root.toString() : normalizedSource
  }
  catch {
    return ''
  }
}
