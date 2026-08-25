import type { ConfiguredCssSourceEntry } from './configured-css-sources'
import type { RememberedCssSourcePlan, ResolveRememberedCssSourcePlanOptions } from './remembered-css-plan'
import type { RememberedCssSource } from './types'
import { normalizeOutputPathKey } from '../../shared/module-graph'
import { resolveRememberedCssSourcePlan } from './remembered-css-plan'
import {
  hasTailwindGenerationSource,
  resolveSourceStyleSourceFromOutputFile,
} from './sfc-style-source'
import { selectTailwindV4GenerationCssSourceForOutput } from './tailwind-v4-css-source'

export interface ResolveViteCssSourcePlanOptions extends ResolveRememberedCssSourcePlanOptions {
  configuredEntries: ConfiguredCssSourceEntry[]
  cwd: string | undefined
  getSourceStyleSource: ((file: string) => string | undefined) | undefined
  getSourceStyleSources: (() => Iterable<[string, string]>) | undefined
  inferenceSourceRoot: string | undefined
  isConfiguredSourceProcessed: (sourceFile: string) => boolean
  isConfiguredSourceUsed: (sourceFile: string) => boolean
  isCurrentRootMiniProgramStyleOutput: boolean
  projectRoot: string
  selectConfiguredRootSource: () => ConfiguredCssSourceEntry | undefined
  shouldKeepRootImportShell: (outputFile: string, rawSource: string) => boolean
}

export interface ViteCssSourcePlan extends RememberedCssSourcePlan {
  resolution:
    | 'remembered'
    | 'configured'
    | 'inferred'
    | 'temporary'
    | 'unresolved'
}

function hasTailwindPluginDirective(source: string) {
  return /@plugin\b/.test(source)
}

function createResolvedPlan(
  plan: RememberedCssSourcePlan,
  resolution: ViteCssSourcePlan['resolution'],
  source: RememberedCssSource,
  options: {
    forceNonMainChunk?: boolean
    usedConfiguredSourceFile?: string
  } = {},
): ViteCssSourcePlan {
  return {
    ...plan,
    forceNonMainChunk: options.forceNonMainChunk === true,
    hasUsableTailwindSource: true,
    outputFile: source.outputFile,
    resolution,
    resolvedFromTemporarySource: resolution === 'temporary',
    sources: [source],
    usedConfiguredSourceFiles: options.usedConfiguredSourceFile
      ? [normalizeOutputPathKey(options.usedConfiguredSourceFile)]
      : [],
  }
}

function finalizeSourcePlan(
  plan: ViteCssSourcePlan,
  options: ResolveViteCssSourcePlanOptions,
): ViteCssSourcePlan {
  if (!options.currentRawSourceHasExplicitScanContext) {
    return plan
  }
  const sources = plan.sources.filter(source =>
    source.rawSource.includes('@source') || source.rawSource.includes('@config'),
  )
  return sources.length === plan.sources.length
    ? plan
    : {
        ...plan,
        hasUsableTailwindSource: sources.length > 0 && plan.hasUsableTailwindSource,
        sources,
      }
}

export async function resolveViteCssSourcePlan(
  options: ResolveViteCssSourcePlanOptions,
): Promise<ViteCssSourcePlan> {
  const rememberedPlan = await resolveRememberedCssSourcePlan(options)
  if (rememberedPlan.hasUsableTailwindSource) {
    return finalizeSourcePlan({
      ...rememberedPlan,
      resolution: rememberedPlan.resolvedFromTemporarySource ? 'temporary' : 'remembered',
    }, options)
  }

  const configuredEntries = options.isCurrentRootMiniProgramStyleOutput
    && !hasTailwindGenerationSource(options.rawSource)
    ? options.configuredEntries.filter(entry => hasTailwindPluginDirective(entry.source))
    : options.configuredEntries
  if (
    options.isCurrentRootMiniProgramStyleOutput
    && (hasTailwindGenerationSource(options.rawSource) || configuredEntries.length > 0)
  ) {
    const source = selectTailwindV4GenerationCssSourceForOutput(
      options.outputFile,
      configuredEntries,
      options.rawSource,
      {
        cwd: options.cwd,
        outputRoot: options.outputRoot,
        projectRoot: options.projectRoot,
      },
    )
    if (source) {
      const outputFile = options.shouldKeepRootImportShell(options.outputFile, options.rawSource)
        ? options.resolveMatchedOutputFile(source.file) ?? options.outputFile
        : options.outputFile
      const shouldUseSource = (
        !options.isConfiguredSourceUsed(source.file)
        && !options.isConfiguredSourceProcessed(source.file)
      ) || normalizeOutputPathKey(outputFile) === normalizeOutputPathKey(options.outputFile)
      if (shouldUseSource) {
        options.debug(
          'source style source inferred from scoped configured tailwind v4 css source: %s -> %s',
          outputFile,
          source.file,
        )
        return finalizeSourcePlan(createResolvedPlan(rememberedPlan, 'configured', {
          outputFile,
          rawSource: source.source,
          sourceFile: source.file,
        }, {
          usedConfiguredSourceFile: source.file,
        }), options)
      }
    }
  }

  const configuredSourceEntries = options.configuredEntries.map(entry => [entry.file, entry.source] as const)
  const inferredSource = resolveSourceStyleSourceFromOutputFile(
    options.outputFile,
    options.snapshot,
    options.outputRoot,
    options.inferenceSourceRoot,
    options.getSourceStyleSource,
    options.getSourceStyleSources,
    configuredSourceEntries,
    options.debug,
  )
  const configuredRootSource = inferredSource ? undefined : options.selectConfiguredRootSource()
  const inferredRootSource = configuredRootSource
    ? {
        outputFile: options.outputFile,
        rawSource: configuredRootSource.source,
        sourceFile: configuredRootSource.file,
      }
    : undefined
  const originalSource = inferredSource
    ?? (options.outputFile === options.file
      ? undefined
      : resolveSourceStyleSourceFromOutputFile(
          options.file,
          options.snapshot,
          options.outputRoot,
          options.inferenceSourceRoot,
          options.getSourceStyleSource,
          options.getSourceStyleSources,
          configuredSourceEntries,
          options.debug,
        ))
        ?? inferredRootSource
  if (originalSource) {
    const outputFile = normalizeOutputPathKey(originalSource.outputFile)
      === normalizeOutputPathKey(options.outputFile)
      ? options.outputFile
      : options.resolveMatchedOutputFile(originalSource.sourceFile) ?? options.outputFile
    options.debug(
      'source style output resolved: %s -> %s from %s',
      options.outputFile,
      outputFile,
      originalSource.sourceFile,
    )
    return finalizeSourcePlan(createResolvedPlan(rememberedPlan, 'inferred', {
      ...originalSource,
      outputFile,
    }), options)
  }

  if (options.temporaryOutput && options.configuredEntries.length > 1) {
    const source = options.resolveTemporarySource(options.outputFile, options.rawSource)
    if (source) {
      const outputFile = options.shouldKeepCurrentRootOutput(source.sourceFile, options.outputFile)
        ? options.outputFile
        : options.resolveMatchedOutputFile(source.sourceFile) ?? source.outputFile
      options.debug(
        'source style source inferred from temporary configured tailwind v4 css source: %s -> %s',
        outputFile,
        source.sourceFile,
      )
      return finalizeSourcePlan(createResolvedPlan(rememberedPlan, 'temporary', {
        ...source,
        outputFile,
      }, {
        forceNonMainChunk: true,
        usedConfiguredSourceFile: source.sourceFile,
      }), options)
    }
    return finalizeSourcePlan({
      ...rememberedPlan,
      resolution: 'unresolved',
    }, options)
  }

  if (
    !options.isCurrentRootMiniProgramStyleOutput
    && hasTailwindGenerationSource(options.rawSource)
    && (options.originalSource.originalFileNames?.length ?? 0) === 0
  ) {
    const availableEntries = options.configuredEntries.filter(entry =>
      !options.isConfiguredSourceUsed(entry.file),
    )
    const source = selectTailwindV4GenerationCssSourceForOutput(
      options.outputFile,
      availableEntries,
      options.rawSource,
      {
        cwd: options.cwd,
        outputRoot: options.outputRoot,
        projectRoot: options.projectRoot,
      },
    )
    if (source && !options.isConfiguredSourceProcessed(source.file)) {
      const outputFile = options.resolveMatchedOutputFile(source.file) ?? options.outputFile
      options.debug(
        'source style source inferred from scoped configured tailwind v4 css source: %s -> %s',
        outputFile,
        source.file,
      )
      return finalizeSourcePlan(createResolvedPlan(rememberedPlan, 'configured', {
        outputFile,
        rawSource: source.source,
        sourceFile: source.file,
      }, {
        usedConfiguredSourceFile: source.file,
      }), options)
    }
  }

  return finalizeSourcePlan({
    ...rememberedPlan,
    resolution: 'unresolved',
  }, options)
}
