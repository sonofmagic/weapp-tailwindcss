import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { InternalUserDefinedOptions } from '@/types'
import postcss from 'postcss'
import {
  createWeappTailwindcssGenerator,
  normalizeWeappTailwindcssGeneratorOptions,
} from '@/generator'
import { resolveUniAppXOptions } from '@/uni-app-x/options'
import { finalizeMiniProgramCss, removeUnsupportedMiniProgramAtRules } from './css-cleanup'
import {
  hasTailwindSourceDirectives,
  parseImportRequest,
  removeTailwindSourceDirectives,
} from './generator-css/directives'
import { appendLegacyCompatCss, appendLegacyContainerCompatCss, hasConfiguredContainerCompatSources } from './generator-css/legacy-compat'
import { inheritLegacyUnitConvertedDeclarations } from './generator-css/legacy-units'
import {
  createCssAppend,
  hasTailwindGeneratedCss,
  hasTailwindGeneratedCssMarkers,
  splitTailwindV4GeneratedCss,
  stripTailwindBanner,
} from './generator-css/markers'
import {
  resolveGeneratorSources,
} from './generator-css/source-resolver'

export {
  hasTailwindSourceDirectives,
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
  splitTailwindV4GeneratedCss,
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
  styleHandler: InternalUserDefinedOptions['styleHandler']
  debug: (format: string, ...args: unknown[]) => void
}

export interface GenerateCssByGeneratorResult {
  css: string
  target: string
  source: 'generator'
  dependencies: string[]
}

function finalizeMiniProgramGeneratorCss(css: string, target: string) {
  if (target !== 'weapp') {
    return css
  }
  return finalizeMiniProgramCss(css)
}

function resolveGeneratorStyleOptions(
  opts: InternalUserDefinedOptions,
  cssHandlerOptions: IStyleHandlerOptions,
  generatorStyleOptions: Partial<IStyleHandlerOptions> | undefined,
): Partial<IStyleHandlerOptions> {
  const tailwindV3StyleOptions: Partial<IStyleHandlerOptions> = cssHandlerOptions.majorVersion === 3
    ? {
        cssPreflight: opts.cssPreflight,
        cssPreflightRange: opts.cssPreflightRange,
      }
    : {}
  const resolvedUniAppXOptions = resolveUniAppXOptions(opts.uniAppX)
  return {
    cssChildCombinatorReplaceValue: opts.cssChildCombinatorReplaceValue,
    cssSelectorReplacement: opts.cssSelectorReplacement,
    rem2rpx: opts.rem2rpx,
    px2rpx: opts.px2rpx,
    unitsToPx: opts.unitsToPx,
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
    ...tailwindV3StyleOptions,
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
    styleHandler,
    debug,
  } = options
  const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(opts.generator)
  const majorVersion = runtimeState.twPatcher.majorVersion

  const cleanedLocalImportWrapper = cleanLocalCssImportWrapperTailwindDirectives(rawSource)
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

  if (isPureLocalCssImportWrapper(rawSource)) {
    return undefined
  }

  const hasGeneratedCss = hasTailwindGeneratedCss(rawSource)
  const hasSourceDirectives = hasTailwindSourceDirectives(rawSource)
  const hasGeneratedMarkers = hasTailwindGeneratedCssMarkers(rawSource)
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
      rawSource,
      file,
      cssHandlerOptions,
      generatorOptions,
    )
    const generatorStyleOptions = resolveGeneratorStyleOptions(opts, cssHandlerOptions, generatorOptions.styleOptions)
    const configuredContainerCompat = hasConfiguredContainerCompatSources(sources)
    const generatedResults = await Promise.all(sources.map(async (source) => {
      const generator = createWeappTailwindcssGenerator(source)
      return generator.generate({
        candidates: runtime,
        scanSources: majorVersion === 4,
        styleOptions: generatorStyleOptions,
        tailwindcssV3Compatibility: generatorOptions.tailwindcssV3Compatibility,
        target: generatorOptions.target,
      })
    }))
    const firstGenerated = generatedResults[0]
    if (!firstGenerated) {
      return undefined
    }
    const generated = generatedResults.length === 1
      ? firstGenerated
      : {
          ...firstGenerated,
          css: generatedResults.map(item => item.css).join('\n'),
          rawCss: generatedResults.map(item => item.rawCss).join('\n'),
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
    const extraCss = splitTailwindV4GeneratedCss(rawSource, generated.rawCss)
    if (typeof extraCss === 'string') {
      let css = stripTailwindBanner(generated.css)
      if (generated.target === 'weapp') {
        css = inheritLegacyUnitConvertedDeclarations(css, rawSource)
      }
      if (extraCss.trim().length > 0) {
        const cleanedExtraCss = removeTailwindSourceDirectives(extraCss)
        if (cleanedExtraCss.trim().length > 0) {
          const extraSource = generated.target === 'weapp'
            ? removeUnsupportedMiniProgramAtRules(cleanedExtraCss)
            : cleanedExtraCss
          if (extraSource.trim().length === 0) {
            return {
              css: finalizeMiniProgramGeneratorCss(css, generated.target),
              target: generated.target,
              source: 'generator',
              dependencies: generated.dependencies,
            }
          }
          if (generated.target === 'weapp') {
            const { css: userCss } = await styleHandler(extraSource, {
              ...generatorStyleOptions,
              ...cssUserHandlerOptions,
            })
            css = createCssAppend(css, removeUnsupportedMiniProgramAtRules(userCss))
          }
          else {
            css = createCssAppend(css, extraSource)
          }
        }
      }
      if (generated.target === 'weapp') {
        css = await appendLegacyCompatCss(
          css,
          rawSource,
          generated.target,
          styleHandler,
          cssHandlerOptions,
          generatorStyleOptions,
        )
        css = await appendLegacyContainerCompatCss(
          css,
          rawSource,
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
        css: finalizeMiniProgramGeneratorCss(css, generated.target),
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
      css = inheritLegacyUnitConvertedDeclarations(css, rawSource)
    }
    css = await appendLegacyCompatCss(
      css,
      rawSource,
      generated.target,
      styleHandler,
      cssHandlerOptions,
      generatorStyleOptions,
    )
    css = await appendLegacyContainerCompatCss(
      css,
      rawSource,
      file,
      runtime,
      configuredContainerCompat,
      generated.target,
      styleHandler,
      cssHandlerOptions,
      generatorStyleOptions,
    )
    return {
      css: finalizeMiniProgramGeneratorCss(css, generated.target),
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
