import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { GeneratorResolvedSource } from './generator-css/source-resolver'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { InternalUserDefinedOptions } from '@/types'
import postcss from 'postcss'
import { extractSourceCandidates } from 'tailwindcss-patch'
import { resolveStyleOptionsFromContext } from '@/context/style-options'
import {
  createWeappTailwindcssGenerator,
  normalizeWeappTailwindcssGeneratorOptions,
} from '@/generator'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from '@/tailwindcss/v4-engine/candidates'
import { finalizeMiniProgramCss, removeUnsupportedMiniProgramAtRules } from './css-cleanup'
import {
  hasTailwindApplyDirective,
  hasTailwindRootDirectives,
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
import {
  reorderMarkedUserLayerComponentsCss,
  wrapUserLayerComponentsCss,
} from './generator-css/user-layer-order'

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
  deferEmptyScopedCssSource?: boolean | undefined
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
    isTailwindcssV4: majorVersion === 4,
    preservePseudoContentInit: majorVersion === 3,
  })
}

function mergeScopedRuntimeWithCurrentRuntime(
  scopedRuntime: Set<string>,
  runtime: Set<string>,
  options: {
    currentCssCandidates?: string[] | undefined
    cssHandlerOptions: IStyleHandlerOptions
    isolateCssSource: boolean
    matchedCssSourceFile: boolean
  },
) {
  if (options.isolateCssSource && options.currentCssCandidates?.length) {
    return new Set([
      ...scopedRuntime,
      ...options.currentCssCandidates,
    ])
  }
  if (
    runtime.size === 0
    || !options.cssHandlerOptions.isMainChunk
    || options.matchedCssSourceFile
    || (options.isolateCssSource && scopedRuntime.size === 0)
  ) {
    return scopedRuntime
  }
  return new Set([
    ...scopedRuntime,
    ...runtime,
  ])
}

function shouldIsolateScopedCssSource(source: GeneratorResolvedSource, sourceEntries: TailwindSourceEntry[] | undefined) {
  return sourceEntries !== undefined
    && Boolean(source.__weappTailwindcssMeta?.matchedCssSourceFile || sourceEntries.length > 0)
}

function shouldIsolateCurrentTailwindV4CssCandidates(
  majorVersion: number | undefined,
  cssHandlerOptions: IStyleHandlerOptions,
  options: {
    hasGeneratedCss: boolean
    hasGeneratedMarkers: boolean
    rawSource: string
  },
) {
  return majorVersion === 4
    && !cssHandlerOptions.isMainChunk
    && hasTailwindApplyDirective(options.rawSource)
    && !hasTailwindRootDirectives(options.rawSource)
    && !options.hasGeneratedCss
    && !options.hasGeneratedMarkers
}

function removeTailwindApplyAtRules(source: string) {
  if (!source.includes('@apply')) {
    return source
  }
  try {
    const root = postcss.parse(source)
    let changed = false
    root.walkAtRules('apply', (rule) => {
      rule.remove()
      changed = true
    })
    root.walk((node) => {
      if ('nodes' in node && node.nodes?.length === 0) {
        node.remove()
      }
    })
    return changed ? root.toString() : source
  }
  catch {
    return source
  }
}

function shouldScanTailwindV4Sources(
  majorVersion: number | undefined,
  target: string,
  generatorRuntime: Set<string>,
  isolateCssSource: boolean,
) {
  if (majorVersion !== 4 || isolateCssSource) {
    return false
  }
  return target === 'web' || generatorRuntime.size === 0
}

function shouldAppendWebBundleCssFallback(
  target: string,
  options: {
    hasSourceDirectives: boolean
    hasMatchedCssSourceFile: boolean
  },
) {
  return target === 'web'
    && !options.hasMatchedCssSourceFile
    && !options.hasSourceDirectives
}

function isEmptyCssSourceOrderParts(parts: {
  before: string
  after: string
}) {
  return parts.before.trim().length === 0 && parts.after.trim().length === 0
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
  return {
    ...resolveStyleOptionsFromContext(opts),
    atRules: opts.atRules,
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

function shouldFinalizeMarkedUserLayerComponentsCss(file: string) {
  return !/\.(?:vue|svelte|astro|scss|sass|less|styl)(?:[?#].*)?$/i.test(file)
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

function splitUserCssLayerBlocks(source: string) {
  if (!source.includes('@layer')) {
    return {
      layer: '',
      rest: source,
    }
  }

  try {
    const root = postcss.parse(source)
    const layerRoot = postcss.root()
    const restRoot = postcss.root()
    for (const node of root.nodes) {
      const target = node.type === 'atrule' && node.name === 'layer' && node.nodes?.length
        ? layerRoot
        : restRoot
      target.append(node.clone())
    }
    return {
      layer: layerRoot.toString(),
      rest: restRoot.toString(),
    }
  }
  catch {
    return {
      layer: source,
      rest: '',
    }
  }
}

function hasUserCssLayerBlocks(source: string) {
  if (!source.includes('@layer')) {
    return false
  }

  try {
    let hasLayerBlock = false
    postcss.parse(source).walkAtRules('layer', (node) => {
      if (node.nodes?.length) {
        hasLayerBlock = true
      }
    })
    return hasLayerBlock
  }
  catch {
    return true
  }
}

function collectUserLayerSelectors(source: string) {
  const selectors = new Set<string>()
  try {
    postcss.parse(source).walkRules((rule) => {
      for (const selector of rule.selectors ?? [rule.selector]) {
        const normalized = selector.trim()
        if (normalized) {
          selectors.add(normalized)
        }
      }
    })
  }
  catch {
  }
  return selectors
}

function matchesUserLayerSelector(selector: string, userLayerSelector: string) {
  if (selector === userLayerSelector) {
    return true
  }
  if (!selector.startsWith(userLayerSelector)) {
    return false
  }
  const next = selector[userLayerSelector.length]
  return next === ':' || next === '['
}

function extractGeneratedCssForUserLayerSelectors(css: string, userLayerSource: string) {
  const selectors = collectUserLayerSelectors(userLayerSource)
  if (selectors.size === 0) {
    return {
      layer: '',
      rest: css,
    }
  }

  try {
    const root = postcss.parse(css)
    const layerRoot = postcss.root()
    const selectorList = [...selectors]
    root.walkRules((rule) => {
      const ruleSelectors = rule.selectors ?? [rule.selector]
      if (ruleSelectors.some(selector => selectorList.some(userSelector => matchesUserLayerSelector(selector.trim(), userSelector)))) {
        layerRoot.append(rule.clone())
        rule.remove()
      }
    })
    return {
      layer: layerRoot.toString(),
      rest: root.toString(),
    }
  }
  catch {
    return {
      layer: '',
      rest: css,
    }
  }
}

function normalizeGeneratedSelector(selector: string) {
  return selector.replace(/:not\(#\\#\)/g, '').trim()
}

function collectApplyOnlySourceSelectors(source: string) {
  const selectors = new Set<string>()
  try {
    postcss.parse(source).walkRules((rule) => {
      if (!rule.nodes?.some(node => node.type === 'atrule' && node.name === 'apply')) {
        return
      }
      for (const selector of rule.selectors ?? [rule.selector]) {
        const normalized = normalizeGeneratedSelector(selector)
        if (normalized) {
          selectors.add(normalized)
        }
      }
    })
  }
  catch {
  }
  return selectors
}

function filterApplyOnlyGeneratedCss(css: string, source: string) {
  const selectors = collectApplyOnlySourceSelectors(source)
  if (selectors.size === 0) {
    return css
  }
  const selectorList = [...selectors]

  try {
    const root = postcss.parse(css)
    root.walkRules((rule) => {
      const ruleSelectors = rule.selectors ?? [rule.selector]
      const isApplySelector = ruleSelectors.some((selector) => {
        const normalized = normalizeGeneratedSelector(selector)
        return selectorList.some((sourceSelector) => {
          if (normalized === sourceSelector) {
            return true
          }
          if (!normalized.startsWith(sourceSelector)) {
            return false
          }
          const next = normalized[sourceSelector.length]
          return next === ':' || next === '[' || next === '.'
        })
      })
      const isVariableRule = rule.nodes?.some(node => node.type === 'decl' && node.prop.startsWith('--'))
      if (!isApplySelector && !isVariableRule) {
        rule.remove()
      }
    })
    root.walkAtRules((rule) => {
      if (rule.nodes !== undefined && rule.nodes.length === 0) {
        rule.remove()
      }
    })
    return root.toString()
  }
  catch {
    return css
  }
}

function shouldFilterApplyOnlyGeneratedCss(
  majorVersion: number | undefined,
  target: string,
  source: string,
  options: {
    hasGeneratedCss: boolean
    hasGeneratedMarkers: boolean
  },
) {
  return majorVersion === 4
    && target === 'weapp'
    && hasTailwindApplyDirective(source)
    && !hasTailwindRootDirectives(source)
    && !options.hasGeneratedCss
    && !options.hasGeneratedMarkers
    && collectApplyOnlySourceSelectors(source).size > 0
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
  const userSource = stripUnmatchedTailwindSourceMediaCloseFragments(removeTailwindApplyAtRules(sanitizedSource))
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

function splitLocalCssImports(source: string) {
  try {
    const root = postcss.parse(source)
    const importRoot = postcss.root()
    let changed = false
    for (const node of [...root.nodes]) {
      if (node.type !== 'atrule' || node.name !== 'import') {
        continue
      }
      const request = parseImportRequest(node.params)
      if (!request || !isLocalImportRequest(request)) {
        continue
      }
      importRoot.append(node.clone())
      node.remove()
      changed = true
    }
    const imports = importRoot.nodes
      .filter((node): node is postcss.AtRule => node.type === 'atrule' && node.name === 'import')
      .map(node => `@import ${node.params};`)
      .join('\n')
    return changed
      ? {
          imports,
          source: root.toString(),
        }
      : undefined
  }
  catch {
    return undefined
  }
}

function restoreLocalCssImports(css: string, imports: string | undefined) {
  if (!imports?.trim()) {
    return css
  }
  return createCssSourceOrderAppend(imports, css)
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
  const generatorOptions = {
    ...normalizeWeappTailwindcssGeneratorOptions(opts.generator),
    bareArbitraryValues: opts.arbitraryValues?.bareArbitraryValues,
  }
  const majorVersion = runtimeState.twPatcher.majorVersion
  const effectiveRawSource = stripUnmatchedTailwindSourceMediaCloseFragments(
    stripTailwindSourceMediaFragments(
      normalizeTailwindSourceDirectives(rawSource, {
        importFallback: generatorOptions.importFallback,
      }),
    ),
  )
  const localImportParts = splitLocalCssImports(effectiveRawSource)
  const generatorRawSource = localImportParts?.source ?? effectiveRawSource

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

  const hasGeneratedCss = hasTailwindGeneratedCss(generatorRawSource)
  const hasSourceDirectives = hasTailwindSourceDirectives(generatorRawSource, {
    importFallback: generatorOptions.importFallback,
  })
  const hasGeneratedMarkers = hasTailwindGeneratedCssMarkers(generatorRawSource)
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
    const currentCssCandidates = majorVersion === 4
      ? await extractSourceCandidates(generatorRawSource, 'css', {
          ...(generatorOptions.bareArbitraryValues === undefined ? {} : { bareArbitraryValues: generatorOptions.bareArbitraryValues }),
        })
      : []
    const isolateCurrentCssCandidates = shouldIsolateCurrentTailwindV4CssCandidates(
      majorVersion,
      cssHandlerOptions,
      {
        hasGeneratedCss,
        hasGeneratedMarkers,
        rawSource: generatorRawSource,
      },
    )
    const runtimeWithCurrentCss = isolateCurrentCssCandidates
      ? new Set(currentCssCandidates)
      : currentCssCandidates.length > 0
        ? new Set([
            ...runtime,
            ...currentCssCandidates,
          ])
        : runtime
    const sources = await resolveGeneratorSources(
      majorVersion,
      runtimeState,
      generatorRawSource,
      file,
      cssHandlerOptions,
      generatorOptions,
      {
        cssEntries: opts.cssEntries,
        getSourceCandidatesForEntries,
        runtime: runtimeWithCurrentCss,
      },
    )
    const generatorStyleOptions = resolveGeneratorStyleOptions(opts, cssHandlerOptions, generatorOptions.styleOptions)
    const configuredContainerCompat = hasConfiguredContainerCompatSources(sources)
    const generatedResultsWithDeferred = await Promise.all(sources.map(async (source) => {
      const generator = createWeappTailwindcssGenerator(source)
      const sourceEntries = getSourceCandidatesForEntries && (majorVersion === 3 || majorVersion === 4)
        ? await resolveGeneratorSourceEntries(source, runtimeState)
        : undefined
      const scopedRuntime = sourceEntries
        ? getSourceCandidatesForEntries?.(sourceEntries)
        : undefined
      const isolateCssSource = shouldIsolateScopedCssSource(source, sourceEntries)
      const matchedCssSourceFile = Boolean(source.__weappTailwindcssMeta?.matchedCssSourceFile)
      if (
        options.deferEmptyScopedCssSource
        && isolateCssSource
        && scopedRuntime?.size === 0
        && currentCssCandidates.length === 0
        && !cssHandlerOptions.isMainChunk
      ) {
        debug('defer empty scoped css source generation: %s', file)
        return undefined
      }
      const sourceRuntime = scopedRuntime && (scopedRuntime.size > 0 || isolateCssSource)
        ? isolateCurrentCssCandidates
          ? runtimeWithCurrentCss
          : mergeScopedRuntimeWithCurrentRuntime(scopedRuntime, runtimeWithCurrentCss, {
              currentCssCandidates,
              cssHandlerOptions,
              isolateCssSource,
              matchedCssSourceFile,
            })
        : runtimeWithCurrentCss
      const generatorRuntime = majorVersion === 4 && generatorOptions.target === 'weapp'
        ? filterUnsupportedMiniProgramTailwindV4Candidates(sourceRuntime)
        : sourceRuntime
      return generator.generate({
        bareArbitraryValues: generatorOptions.bareArbitraryValues,
        candidates: generatorRuntime,
        incrementalCache: majorVersion === 3 || majorVersion === 4,
        scanSources: shouldScanTailwindV4Sources(
          majorVersion,
          generatorOptions.target,
          generatorRuntime,
          isolateCssSource,
        ),
        styleOptions: generatorStyleOptions,
        tailwindcssV3Compatibility: generatorOptions.tailwindcssV3Compatibility,
        target: generatorOptions.target,
      })
    }))
    const generatedResults = generatedResultsWithDeferred.filter((item): item is NonNullable<typeof item> => Boolean(item))
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
    const canAppendIncrementalCss = generated.target !== 'weapp' || !hasUserCssLayerBlocks(generatorRawSource)
    if (canAppendIncrementalCss && typeof options.previousCss === 'string' && typeof generated.incrementalCss === 'string') {
      const incrementalCss = stripTailwindBanner(generated.incrementalCss)
      const css = incrementalCss.trim().length > 0
        ? createCssAppend(options.previousCss, finalizeMiniProgramGeneratorCss(incrementalCss, generated.target, majorVersion, opts.cssPreflight, { injectPreflight: false }))
        : options.previousCss
      return {
        css: restoreLocalCssImports(css, localImportParts?.imports),
        target: generated.target,
        source: 'generator',
        dependencies: generated.dependencies,
        incremental: true,
      }
    }
    const shouldFilterApplyOnlyCss = shouldFilterApplyOnlyGeneratedCss(
      majorVersion,
      generated.target,
      generatorRawSource,
      {
        hasGeneratedCss,
        hasGeneratedMarkers,
      },
    )
    const generatedCss = shouldFilterApplyOnlyCss
      ? filterApplyOnlyGeneratedCss(stripTailwindBanner(generated.css), generatorRawSource)
      : stripTailwindBanner(generated.css)
    const hasMatchedCssSourceFile = sources.some(source => (source as GeneratorResolvedSource).__weappTailwindcssMeta?.matchedCssSourceFile)
    const orderedExtraCss = hasMatchedCssSourceFile
      ? splitTailwindV4GeneratedCssBySourceOrder(generatorRawSource, generated.rawCss)
      : splitRawSourceByGeneratedCssOrder(generatorRawSource, generated.rawCss)
    const shouldAppendMatchedCssSourceCompat = !hasMatchedCssSourceFile || orderedExtraCss !== undefined
    if (orderedExtraCss) {
      let css = generatedCss
      if (generated.target === 'weapp') {
        css = inheritLegacyUnitConvertedDeclarations(css, generatorRawSource)
      }
      const userCssOptions = {
        generatorTarget: generated.target,
        generatorStyleOptions,
        cssUserHandlerOptions,
        styleHandler,
        importFallback: generatorOptions.importFallback,
      }
      const afterLayerParts = generated.target === 'weapp'
        ? splitUserCssLayerBlocks(orderedExtraCss.after)
        : {
            layer: '',
            rest: orderedExtraCss.after,
          }
      const beforeUserCss = await transformGeneratorUserCss(orderedExtraCss.before, userCssOptions)
      const afterLayerUserCss = await transformGeneratorUserCss(afterLayerParts.layer, userCssOptions)
      const afterUserCss = await transformGeneratorUserCss(afterLayerParts.rest, userCssOptions)
      const orderedAfterLayerUserCss = generated.target === 'weapp'
        ? wrapUserLayerComponentsCss(afterLayerUserCss)
        : afterLayerUserCss
      css = createCssSourceOrderAppend(
        createCssSourceOrderAppend(
          createCssSourceOrderAppend(beforeUserCss, orderedAfterLayerUserCss),
          css,
        ),
        afterUserCss,
      )
      if (isEmptyCssSourceOrderParts(orderedExtraCss) && shouldAppendWebBundleCssFallback(generated.target, {
        hasSourceDirectives,
        hasMatchedCssSourceFile,
      })) {
        const userCss = await transformGeneratorUserCss(generatorRawSource, userCssOptions)
        css = createCssSourceOrderAppend(css, userCss)
      }
      if (generated.target === 'weapp' && shouldAppendMatchedCssSourceCompat) {
        if (shouldFinalizeMarkedUserLayerComponentsCss(file)) {
          css = reorderMarkedUserLayerComponentsCss(css)
        }
        if (!shouldFilterApplyOnlyCss) {
          css = await appendLegacyCompatCss(
            css,
            generatorRawSource,
            generated.target,
            styleHandler,
            cssHandlerOptions,
            generatorStyleOptions,
          )
          if (!isolateCurrentCssCandidates) {
            css = await appendLegacyContainerCompatCss(
              css,
              generatorRawSource,
              file,
              runtime,
              configuredContainerCompat,
              generated.target,
              styleHandler,
              cssHandlerOptions,
              generatorStyleOptions,
            )
          }
        }
      }
      else if (generated.target === 'weapp' && shouldFinalizeMarkedUserLayerComponentsCss(file)) {
        css = reorderMarkedUserLayerComponentsCss(css)
      }
      return {
        css: restoreLocalCssImports(
          finalizeMiniProgramGeneratorCss(css, generated.target, majorVersion, opts.cssPreflight, {
            injectPreflight: !isolateCurrentCssCandidates,
          }),
          localImportParts?.imports,
        ),
        target: generated.target,
        source: 'generator',
        dependencies: generated.dependencies,
      }
    }

    debug(
      'tailwind direct css generation prefix mismatch, append transformed bundle css %s',
      file,
    )
    let css = generatedCss
    if (generated.target === 'weapp') {
      css = inheritLegacyUnitConvertedDeclarations(css, generatorRawSource)
      if (hasUserCssLayerBlocks(generatorRawSource)) {
        const layerParts = splitUserCssLayerBlocks(generatorRawSource)
        const layerUserCss = await transformGeneratorUserCss(layerParts.layer, {
          generatorTarget: generated.target,
          generatorStyleOptions,
          cssUserHandlerOptions,
          styleHandler,
          importFallback: generatorOptions.importFallback,
        })
        const layerCss = layerUserCss.trim().length > 0 && !hasTailwindApplyDirective(layerUserCss)
          ? {
              layer: layerUserCss,
              rest: css,
            }
          : extractGeneratedCssForUserLayerSelectors(css, layerParts.layer)
        if (layerCss.layer.trim().length > 0) {
          css = createCssSourceOrderAppend(wrapUserLayerComponentsCss(layerCss.layer), layerCss.rest)
          if (shouldFinalizeMarkedUserLayerComponentsCss(file)) {
            css = reorderMarkedUserLayerComponentsCss(css)
          }
        }
      }
    }
    if (hasMatchedCssSourceFile || generated.target === 'web') {
      if (hasMatchedCssSourceFile && generated.target === 'weapp' && !hasGeneratedCss && !hasGeneratedMarkers) {
        const userCss = await transformGeneratorUserCss(generatorRawSource, {
          generatorTarget: generated.target,
          generatorStyleOptions,
          cssUserHandlerOptions,
          styleHandler,
          importFallback: generatorOptions.importFallback,
        })
        css = createCssSourceOrderAppend(css, userCss)
      }
      if (hasMatchedCssSourceFile && generated.target === 'weapp') {
        if (!isolateCurrentCssCandidates && !shouldFilterApplyOnlyCss) {
          css = await appendLegacyContainerCompatCss(
            css,
            generatorRawSource,
            file,
            runtime,
            configuredContainerCompat,
            generated.target,
            styleHandler,
            cssHandlerOptions,
            generatorStyleOptions,
          )
        }
      }
      if (shouldAppendWebBundleCssFallback(generated.target, {
        hasSourceDirectives,
        hasMatchedCssSourceFile,
      })) {
        const userCss = await transformGeneratorUserCss(generatorRawSource, {
          generatorTarget: generated.target,
          generatorStyleOptions,
          cssUserHandlerOptions,
          styleHandler,
          importFallback: generatorOptions.importFallback,
        })
        css = createCssSourceOrderAppend(css, userCss)
      }
      return {
        css: restoreLocalCssImports(
          finalizeMiniProgramGeneratorCss(css, generated.target, majorVersion, opts.cssPreflight, {
            injectPreflight: !isolateCurrentCssCandidates,
          }),
          localImportParts?.imports,
        ),
        target: generated.target,
        source: 'generator',
        dependencies: generated.dependencies,
      }
    }
    if (!shouldFilterApplyOnlyCss) {
      css = await appendLegacyCompatCss(
        css,
        generatorRawSource,
        generated.target,
        styleHandler,
        cssHandlerOptions,
        generatorStyleOptions,
      )
      css = await appendLegacyContainerCompatCss(
        css,
        generatorRawSource,
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
      css: restoreLocalCssImports(
        finalizeMiniProgramGeneratorCss(css, generated.target, majorVersion, opts.cssPreflight, {
          injectPreflight: !isolateCurrentCssCandidates,
        }),
        localImportParts?.imports,
      ),
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

  const generatorOptions = {
    ...normalizeWeappTailwindcssGeneratorOptions(opts.generator),
    bareArbitraryValues: opts.arbitraryValues?.bareArbitraryValues,
  }
  const sources = await resolveGeneratorSources(
    majorVersion,
    runtimeState,
    rawSource,
    file,
    cssHandlerOptions,
    generatorOptions,
    {
      cssEntries: opts.cssEntries,
      runtime: candidates,
    },
  )
  const classSets = await Promise.all(sources.map(async (source) => {
    const generator = createWeappTailwindcssGenerator(source)
    if (generatorOptions.bareArbitraryValues === undefined || generatorOptions.bareArbitraryValues === false) {
      if (typeof generator.validateCandidates === 'function') {
        return generator.validateCandidates(candidates)
      }
    }
    const generated = await generator.generate({
      bareArbitraryValues: generatorOptions.bareArbitraryValues,
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
