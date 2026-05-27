import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { GeneratorResolvedSource } from './generator-css/source-resolver'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { InternalUserDefinedOptions } from '@/types'
import postcss from 'postcss'
import {
  createWeappTailwindcssGenerator,
  normalizeWeappTailwindcssGeneratorOptions,
} from '@/generator'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from '@/tailwindcss/v4-engine/candidates'
import { resolveUniAppXOptions } from '@/uni-app-x/options'
import { finalizeMiniProgramCss, removeUnsupportedMiniProgramAtRules } from './css-cleanup'
import {
  hasTailwindSourceDirectives,
  normalizeTailwindSourceDirectives,
  parseImportRequest,
  removeTailwindSourceDirectives,
} from './generator-css/directives'
import { appendLegacyCompatCss, appendLegacyContainerCompatCss, hasConfiguredContainerCompatSources } from './generator-css/legacy-compat'
import { inheritLegacyUnitConvertedDeclarations } from './generator-css/legacy-units'
import {
  createCssAppend,
  hasTailwindGeneratedCss,
  hasTailwindGeneratedCssMarkers,
  splitGeneratorPlaceholderCssBySourceOrder,
  splitTailwindGeneratedCssByBanner,
  splitTailwindV4GeneratedCssBySourceOrder,
  stripTailwindBanner,
} from './generator-css/markers'
import {

  resolveGeneratorSourceEntries,
  resolveGeneratorSources,
} from './generator-css/source-resolver'

export {
  hasTailwindSourceDirectives,
  normalizeTailwindSourceForGenerator,
  removeTailwindSourceDirectives,
  resolveCssEntrySource,
} from './generator-css/directives'
export {
  removeTailwindApplyRules,
} from './generator-css/legacy-compat'
export {
  inheritLegacyUnitConvertedDeclarations,
} from './generator-css/legacy-units'
export {
  createCssAppend,
  hasTailwindGeneratedCss,
  hasTailwindGeneratedCssMarkers,
  removeTailwindGeneratedCssByBanner,
  splitGeneratorPlaceholderCssBySourceOrder,
  splitTailwindGeneratedCssByBanner,
  splitTailwindV4GeneratedCss,
  splitTailwindV4GeneratedCssBySourceOrder,
  stripGeneratorPlaceholderMarkers,
  stripTailwindBanner,
  stripTailwindBanners,
} from './generator-css/markers'
export {
  resolveGeneratorSource,
} from './generator-css/source-resolver'

const SUPPORTED_GENERATOR_MAJOR_VERSIONS = new Set([3, 4])
const REMOTE_IMPORT_RE = /^(?:https?:)?\/\//i
export interface GenerateCssByGeneratorOptions {
  opts: InternalUserDefinedOptions
  runtimeState: {
    twPatcher: InternalUserDefinedOptions['twPatcher']
    readyPromise: Promise<void>
  }
  runtime: Set<string>
  rawSource: string
  file: string
  cssHandlerOptions: IStyleHandlerOptions
  cssUserHandlerOptions: IStyleHandlerOptions
  getSourceCandidatesForEntries?: ((entries: TailwindSourceEntry[] | undefined) => Set<string>) | undefined
  styleHandler: InternalUserDefinedOptions['styleHandler']
  debug: (format: string, ...args: unknown[]) => void
  previousCss?: string | undefined
}

export interface GenerateCssByGeneratorResult {
  css: string
  target: string
  source: 'generator'
  dependencies: string[]
  incremental?: boolean | undefined
}

function finalizeMiniProgramGeneratorCss(
  css: string,
  target: string,
  majorVersion: number | undefined,
  cssPreflight: InternalUserDefinedOptions['cssPreflight'],
  options: { injectPreflight?: boolean } = {},
) {
  if (target !== 'weapp') {
    return css
  }
  return finalizeMiniProgramCss(css, {
    cssPreflight: majorVersion === 4 && options.injectPreflight !== false ? cssPreflight : undefined,
    preservePseudoContentInit: majorVersion === 3,
  })
}

function mergeScopedRuntimeWithCurrentRuntime(
  scopedRuntime: Set<string>,
  runtime: Set<string>,
  options: {
    cssHandlerOptions: IStyleHandlerOptions
    isolateCssSource: boolean
  },
) {
  if (runtime.size === 0 || !options.cssHandlerOptions.isMainChunk || options.isolateCssSource) {
    return scopedRuntime
  }
  return new Set([
    ...scopedRuntime,
    ...runtime,
  ])
}

function shouldIsolateMatchedCssSource(source: GeneratorResolvedSource, sourceEntries: TailwindSourceEntry[] | undefined) {
  return Boolean(source.__weappTailwindcssMeta?.matchedCssSourceFile && sourceEntries !== undefined)
}

function resolveGeneratorStyleOptions(
  opts: InternalUserDefinedOptions,
  cssHandlerOptions: IStyleHandlerOptions,
  generatorStyleOptions: Partial<IStyleHandlerOptions> | undefined,
): Partial<IStyleHandlerOptions> {
  const preflightStyleOptions: Partial<IStyleHandlerOptions> = {
    cssPreflight: opts.cssPreflight,
    cssPreflightRange: opts.cssPreflightRange,
  }
  const resolvedUniAppXOptions = resolveUniAppXOptions(opts.uniAppX)
  return {
    cssChildCombinatorReplaceValue: opts.cssChildCombinatorReplaceValue,
    cssSelectorReplacement: opts.cssSelectorReplacement,
    platform: opts.platform,
    rem2rpx: opts.rem2rpx,
    px2rpx: opts.px2rpx,
    unitsToPx: opts.unitsToPx,
    unitConversion: opts.unitConversion,
    cssRemoveProperty: opts.cssRemoveProperty,
    cssRemoveHoverPseudoClass: opts.cssRemoveHoverPseudoClass,
    cssPresetEnv: opts.cssPresetEnv,
    autoprefixer: opts.autoprefixer,
    cssCalc: opts.cssCalc,
    atRules: opts.atRules,
    uniAppX: resolvedUniAppXOptions.enabled,
    uniAppXCssTarget: opts.uniAppXCssTarget,
    uniAppXUnsupported: opts.uniAppXUnsupported,
    ...cssHandlerOptions,
    ...preflightStyleOptions,
    ...generatorStyleOptions,
  }
}

function isLocalImportRequest(request: string) {
  return request.length > 0
    && !request.startsWith('tailwindcss')
    && !request.startsWith('weapp-tailwindcss')
    && !request.startsWith('data:')
    && !REMOTE_IMPORT_RE.test(request)
}

function isCommentOnlyCss(source: string) {
  try {
    const root = postcss.parse(source)
    return root.nodes.length > 0 && root.nodes.every(node => node.type === 'comment')
  }
  catch {
    return false
  }
}

function stripTailwindSourceMediaFragments(source: string) {
  return source
    .replace(/^\s*@media\s+source\([^)]*\)\s*\{\s*$/gm, '')
    .replace(/^\s*\}\s*(?=@(?:source|theme|config|plugin|utility|variant|custom-variant)\b)/gm, '')
    .replace(/^\s*\}\s*\/\*\s*source\([^)]*\)\s*\*\/\s*$/gm, '')
}

function stripLeadingTailwindSourceMediaCloseFragment(source: string) {
  return source.replace(/^\s*\}\s*(?:\n|$)/, '')
}

function stripUnmatchedTailwindSourceMediaCloseFragments(source: string) {
  try {
    postcss.parse(source)
    return source
  }
  catch {
    return stripLeadingTailwindSourceMediaCloseFragment(source)
      .replace(/\s*\}\s*$/, '')
  }
}

function createCssSourceOrderAppend(base: string, extra: string) {
  if (!base) {
    return extra
  }
  if (!extra) {
    return base
  }
  if (/\s$/.test(base) || /^\s/.test(extra)) {
    return `${base}${extra}`
  }
  return `${base}\n${extra}`
}

function splitRawSourceByGeneratedCssOrder(rawSource: string, rawTailwindCss: string) {
  const placeholderParts = splitGeneratorPlaceholderCssBySourceOrder(rawSource, rawTailwindCss)
  if (placeholderParts) {
    return placeholderParts
  }
  const exactParts = splitTailwindV4GeneratedCssBySourceOrder(rawSource, rawTailwindCss)
  if (exactParts) {
    return exactParts
  }
  return splitTailwindGeneratedCssByBanner(rawSource)
}

async function transformGeneratorUserCss(
  source: string,
  options: {
    generatorTarget: string
    generatorStyleOptions: Partial<IStyleHandlerOptions>
    cssUserHandlerOptions: IStyleHandlerOptions
    styleHandler: InternalUserDefinedOptions['styleHandler']
    importFallback: boolean
  },
) {
  if (source.trim().length === 0) {
    return ''
  }
  const repairedSource = stripUnmatchedTailwindSourceMediaCloseFragments(
    stripTailwindSourceMediaFragments(source),
  )
  const cleanedSource = removeTailwindSourceDirectives(repairedSource, {
    importFallback: options.importFallback,
  })
  if (cleanedSource.trim().length === 0) {
    return ''
  }
  const sanitizedSource = removeTailwindSourceDirectives(
    stripUnmatchedTailwindSourceMediaCloseFragments(
      stripTailwindSourceMediaFragments(options.generatorTarget === 'weapp'
        ? removeUnsupportedMiniProgramAtRules(cleanedSource)
        : cleanedSource),
    ),
    {
      importFallback: options.importFallback,
    },
  )
  const userSource = stripUnmatchedTailwindSourceMediaCloseFragments(sanitizedSource)
  if (userSource.trim().length === 0) {
    return ''
  }
  if (isCommentOnlyCss(userSource)) {
    return userSource
  }
  if (options.generatorTarget !== 'weapp') {
    return userSource
  }
  const { css } = await options.styleHandler(userSource, {
    ...options.generatorStyleOptions,
    ...options.cssUserHandlerOptions,
  })
  return removeUnsupportedMiniProgramAtRules(css)
}

export function isPureLocalCssImportWrapper(css: string) {
  let hasImport = false
  try {
    const root = postcss.parse(css)
    for (const node of root.nodes) {
      if (node.type === 'comment') {
        continue
      }
      if (node.type !== 'atrule' || node.name !== 'import') {
        return false
      }
      const request = parseImportRequest(node.params)
      if (!request || !isLocalImportRequest(request)) {
        return false
      }
      hasImport = true
    }
  }
  catch {
    return false
  }
  return hasImport
}

function cleanLocalCssImportWrapperTailwindDirectives(css: string) {
  let hasLocalImport = false
  let hasTailwindDirective = false
  try {
    const root = postcss.parse(css)
    for (const node of root.nodes) {
      if (node.type === 'comment') {
        continue
      }
      if (node.type === 'atrule' && node.name === 'import') {
        const request = parseImportRequest(node.params)
        if (!request || !isLocalImportRequest(request)) {
          return undefined
        }
        hasLocalImport = true
        continue
      }
      if (node.type === 'atrule' && node.name === 'source') {
        hasTailwindDirective = true
        continue
      }
      return undefined
    }
  }
  catch {
    return undefined
  }
  return hasLocalImport && hasTailwindDirective
    ? prefixLocalCssImportsWithWebpackIgnore(removeTailwindSourceDirectives(css))
    : undefined
}

function prefixLocalCssImportsWithWebpackIgnore(css: string) {
  try {
    const root = postcss.parse(css)
    root.walkAtRules('import', (atRule) => {
      const request = parseImportRequest(atRule.params)
      if (request && isLocalImportRequest(request)) {
        atRule.raws.before = `${atRule.raws.before ?? ''}/* webpackIgnore: true */\n`
      }
    })
    return root.toString()
  }
  catch {
    return css
  }
}

export async function generateCssByGenerator(
  options: GenerateCssByGeneratorOptions,
): Promise<GenerateCssByGeneratorResult | undefined> {
  const {
    opts,
    runtimeState,
    runtime,
    rawSource,
    file,
    cssHandlerOptions,
    cssUserHandlerOptions,
    getSourceCandidatesForEntries,
    styleHandler,
    debug,
  } = options
  const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(opts.generator)
  const majorVersion = runtimeState.twPatcher.majorVersion
  const effectiveRawSource = stripUnmatchedTailwindSourceMediaCloseFragments(
    stripTailwindSourceMediaFragments(
      normalizeTailwindSourceDirectives(rawSource, {
        importFallback: generatorOptions.importFallback,
      }),
    ),
  )

  const cleanedLocalImportWrapper = cleanLocalCssImportWrapperTailwindDirectives(effectiveRawSource)
  if (cleanedLocalImportWrapper !== undefined) {
    return {
      css: generatorOptions.target === 'weapp'
        ? removeUnsupportedMiniProgramAtRules(cleanedLocalImportWrapper)
        : cleanedLocalImportWrapper,
      target: generatorOptions.target,
      source: 'generator',
      dependencies: [],
    }
  }

  if (isPureLocalCssImportWrapper(effectiveRawSource)) {
    return undefined
  }

  const hasGeneratedCss = hasTailwindGeneratedCss(effectiveRawSource)
  const hasSourceDirectives = hasTailwindSourceDirectives(effectiveRawSource, {
    importFallback: generatorOptions.importFallback,
  })
  const hasGeneratedMarkers = hasTailwindGeneratedCssMarkers(effectiveRawSource)
  const shouldGenerateCurrentCss = hasGeneratedCss
    || hasGeneratedMarkers
    || hasSourceDirectives
    || cssHandlerOptions.isMainChunk

  if (
    !SUPPORTED_GENERATOR_MAJOR_VERSIONS.has(majorVersion ?? 0)
    || !shouldGenerateCurrentCss
    || (
      majorVersion === 3
      && !hasSourceDirectives
      && !hasGeneratedCss
      && !hasGeneratedMarkers
    )
  ) {
    return undefined
  }

  try {
    await runtimeState.readyPromise
    const sources = await resolveGeneratorSources(
      majorVersion,
      runtimeState,
      effectiveRawSource,
      file,
      cssHandlerOptions,
      generatorOptions,
      {
        getSourceCandidatesForEntries,
        runtime,
      },
    )
    const generatorStyleOptions = resolveGeneratorStyleOptions(opts, cssHandlerOptions, generatorOptions.styleOptions)
    const configuredContainerCompat = hasConfiguredContainerCompatSources(sources)
    const generatedResults = await Promise.all(sources.map(async (source) => {
      const generator = createWeappTailwindcssGenerator(source)
      const sourceEntries = getSourceCandidatesForEntries && majorVersion === 4
        ? await resolveGeneratorSourceEntries(source, runtimeState)
        : undefined
      const scopedRuntime = sourceEntries
        ? getSourceCandidatesForEntries?.(sourceEntries)
        : undefined
      const isolateCssSource = shouldIsolateMatchedCssSource(source, sourceEntries)
      const sourceRuntime = scopedRuntime && (scopedRuntime.size > 0 || isolateCssSource)
        ? mergeScopedRuntimeWithCurrentRuntime(scopedRuntime, runtime, {
            cssHandlerOptions,
            isolateCssSource,
          })
        : runtime
      const generatorRuntime = majorVersion === 4 && generatorOptions.target === 'weapp'
        ? filterUnsupportedMiniProgramTailwindV4Candidates(sourceRuntime)
        : sourceRuntime
      return generator.generate({
        candidates: generatorRuntime,
        incrementalCache: majorVersion === 3 || majorVersion === 4,
        scanSources: majorVersion === 4 && generatorRuntime.size === 0 && !isolateCssSource,
        styleOptions: generatorStyleOptions,
        tailwindcssV3Compatibility: generatorOptions.tailwindcssV3Compatibility,
        target: generatorOptions.target,
      })
    }))
    const firstGenerated = generatedResults[0]
    if (!firstGenerated) {
      return undefined
    }
    const incrementalCssResults = generatedResults
      .map(item => item.incrementalCss)
      .filter((css): css is string => typeof css === 'string')
    const incrementalRawCssResults = generatedResults
      .map(item => item.incrementalRawCss)
      .filter((css): css is string => typeof css === 'string')
    const generated = generatedResults.length === 1
      ? firstGenerated
      : {
          ...firstGenerated,
          css: generatedResults.map(item => item.css).join('\n'),
          rawCss: generatedResults.map(item => item.rawCss).join('\n'),
          incrementalCss: incrementalCssResults.length === generatedResults.length
            ? incrementalCssResults.filter(Boolean).join('\n')
            : undefined,
          incrementalRawCss: incrementalRawCssResults.length === generatedResults.length
            ? incrementalRawCssResults.filter(Boolean).join('\n')
            : undefined,
          classSet: new Set(generatedResults.flatMap(item => [...item.classSet])),
          dependencies: [...new Set(generatedResults.flatMap(item => item.dependencies))],
          sources: generatedResults.flatMap(item => item.sources),
        }
    debug(
      'tailwind generator result: %s rawBytes=%d cssBytes=%d candidates=%d',
      file,
      generated.rawCss.length,
      generated.css.length,
      generated.classSet.size,
    )
    if (typeof options.previousCss === 'string' && typeof generated.incrementalCss === 'string') {
      const incrementalCss = stripTailwindBanner(generated.incrementalCss)
      const css = incrementalCss.trim().length > 0
        ? createCssAppend(options.previousCss, finalizeMiniProgramGeneratorCss(incrementalCss, generated.target, majorVersion, opts.cssPreflight, { injectPreflight: false }))
        : options.previousCss
      return {
        css,
        target: generated.target,
        source: 'generator',
        dependencies: generated.dependencies,
        incremental: true,
      }
    }
    const hasMatchedCssSourceFile = sources.some(source => (source as GeneratorResolvedSource).__weappTailwindcssMeta?.matchedCssSourceFile)
    const orderedExtraCss = hasMatchedCssSourceFile
      ? splitTailwindV4GeneratedCssBySourceOrder(effectiveRawSource, generated.rawCss)
      : splitRawSourceByGeneratedCssOrder(effectiveRawSource, generated.rawCss)
    if (orderedExtraCss) {
      let css = stripTailwindBanner(generated.css)
      if (generated.target === 'weapp') {
        css = inheritLegacyUnitConvertedDeclarations(css, effectiveRawSource)
      }
      const userCssOptions = {
        generatorTarget: generated.target,
        generatorStyleOptions,
        cssUserHandlerOptions,
        styleHandler,
        importFallback: generatorOptions.importFallback,
      }
      const beforeUserCss = await transformGeneratorUserCss(orderedExtraCss.before, userCssOptions)
      const afterUserCss = await transformGeneratorUserCss(orderedExtraCss.after, userCssOptions)
      css = createCssSourceOrderAppend(createCssSourceOrderAppend(beforeUserCss, css), afterUserCss)
      if (generated.target === 'weapp') {
        css = await appendLegacyCompatCss(
          css,
          effectiveRawSource,
          generated.target,
          styleHandler,
          cssHandlerOptions,
          generatorStyleOptions,
        )
        css = await appendLegacyContainerCompatCss(
          css,
          effectiveRawSource,
          file,
          runtime,
          configuredContainerCompat,
          generated.target,
          styleHandler,
          cssHandlerOptions,
          generatorStyleOptions,
        )
      }
      return {
        css: finalizeMiniProgramGeneratorCss(css, generated.target, majorVersion, opts.cssPreflight),
        target: generated.target,
        source: 'generator',
        dependencies: generated.dependencies,
      }
    }

    debug(
      'tailwind direct css generation prefix mismatch, append transformed bundle css %s',
      file,
    )
    let css = stripTailwindBanner(generated.css)
    if (generated.target === 'weapp') {
      css = inheritLegacyUnitConvertedDeclarations(css, effectiveRawSource)
    }
    if (hasMatchedCssSourceFile || generated.target === 'web') {
      return {
        css: finalizeMiniProgramGeneratorCss(css, generated.target, majorVersion, opts.cssPreflight),
        target: generated.target,
        source: 'generator',
        dependencies: generated.dependencies,
      }
    }
    css = await appendLegacyCompatCss(
      css,
      effectiveRawSource,
      generated.target,
      styleHandler,
      cssHandlerOptions,
      generatorStyleOptions,
    )
    css = await appendLegacyContainerCompatCss(
      css,
      effectiveRawSource,
      file,
      runtime,
      configuredContainerCompat,
      generated.target,
      styleHandler,
      cssHandlerOptions,
      generatorStyleOptions,
    )
    return {
      css: finalizeMiniProgramGeneratorCss(css, generated.target, majorVersion, opts.cssPreflight),
      target: generated.target,
      source: 'generator',
      dependencies: generated.dependencies,
    }
  }
  catch (error) {
    debug('tailwind direct css generation failed: %s %O', file, error)
    throw error
  }

  return undefined
}

export interface ValidateCandidatesByGeneratorOptions extends Omit<GenerateCssByGeneratorOptions, 'runtime'> {
  candidates: Set<string>
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
  } = options
  const majorVersion = runtimeState.twPatcher.majorVersion
  if (!SUPPORTED_GENERATOR_MAJOR_VERSIONS.has(majorVersion ?? 0) || candidates.size === 0) {
    return new Set<string>()
  }

  const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(opts.generator)
  const sources = await resolveGeneratorSources(
    majorVersion,
    runtimeState,
    rawSource,
    file,
    cssHandlerOptions,
    generatorOptions,
    {
      runtime: candidates,
    },
  )
  const classSets = await Promise.all(sources.map(async (source) => {
    const generator = createWeappTailwindcssGenerator(source)
    if (typeof generator.validateCandidates === 'function') {
      return generator.validateCandidates(candidates)
    }
    const generated = await generator.generate({
      candidates,
      target: 'tailwind',
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
