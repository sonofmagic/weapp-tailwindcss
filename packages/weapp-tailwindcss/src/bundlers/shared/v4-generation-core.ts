import type { GenerateCssByGeneratorOptions, GenerateCssByGeneratorResult } from './generator-css'
import type { CompilationDependencyChange, CompilerShadowReport, CssStage, GenerationArtifact, SourceScope } from '@/compiler'
import type { InternalUserDefinedOptions } from '@/types'
import { consumeCompilationScopeChanges, createCompilerShadowReport, createCssFragment, createGenerationArtifact, mergeCompilationDependencyChanges, resolveCompilerMode } from '@/compiler'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { adaptGeneratedCssWithFrameworkPipeline, adaptGeneratedCssWithFrameworkRootPipeline, hasFrameworkPostcssOptions } from './framework-postcss'
import { generateCssByGenerator } from './generator-css'
import { preferScopedGeneratedCssRules } from './generator-css/scoped-rules'
import { resolvePostcssRequestOption } from './generator-css/source-resolver/postcss-source'
import { isVueScopedStyleRequest } from './style-requests'

export interface TailwindV4GenerationCoreInput extends GenerateCssByGeneratorOptions {
  compilationChanges?: CompilationDependencyChange[] | undefined
  frameworkPostcssOwner?: InternalUserDefinedOptions | undefined
  cssStage?: CssStage | undefined
  outputFile?: string | undefined
  onCompilerShadowReport?: ((report: CompilerShadowReport) => void) | undefined
  scope?: SourceScope | undefined
  sourceCandidates?: Set<string> | undefined
}

export interface TailwindV4GenerationCoreResult extends GenerateCssByGeneratorResult {
  artifact?: GenerationArtifact | undefined
  classSet: Set<string>
  dependencies: string[]
  metadata: NonNullable<GenerateCssByGeneratorResult['metadata']>
}

interface GenerationImplementationOptions {
  emitArtifact: boolean
  frameworkAdapter: 'legacy' | 'graph'
}

function resolveGenerationOptions(
  options: TailwindV4GenerationCoreInput,
  mode: ReturnType<typeof resolveCompilerMode>,
) {
  if (mode === 'legacy') {
    return options
  }
  const scopeId = options.scope?.id ?? options.outputFile ?? options.file
  const compilationChanges = mergeCompilationDependencyChanges(
    options.compilationChanges,
    consumeCompilationScopeChanges(options.runtimeState, scopeId),
  )
  if (compilationChanges.length === 0) {
    return options
  }
  return {
    ...options,
    compilationChanges,
    previousClassSet: undefined,
    previousCss: undefined,
  }
}

function createCoreArtifact(
  generated: GenerateCssByGeneratorResult,
  css: string,
  options: TailwindV4GenerationCoreInput,
): GenerationArtifact {
  const sourceId = generated.metadata?.file ?? options.file
  const scopeId = generated.metadata?.outputFile ?? options.outputFile ?? sourceId
  const scope = options.scope ?? {
    id: scopeId,
    kind: options.cssHandlerOptions.isMainChunk ? 'global' : 'component',
  }
  return createGenerationArtifact([
    createCssFragment({
      id: `${scopeId}:generated`,
      kind: 'tailwind',
      css,
      sourceId,
      scope,
      stage: 'adapted',
    }),
  ], {
    classSet: generated.classSet,
    rawCandidates: options.runtime,
    dependencies: generated.dependencies,
    sourceEntries: options.cssHandlerOptions.sourceOptions?.cssEntries ?? [],
    ...(generated.metadata?.revision === undefined ? {} : { revision: generated.metadata.revision }),
  })
}

async function generateTailwindV4CssWithImplementation(
  options: TailwindV4GenerationCoreInput,
  implementation: GenerationImplementationOptions,
): Promise<TailwindV4GenerationCoreResult | undefined> {
  const majorVersion = options.runtimeState.tailwindRuntime.majorVersion
  if (majorVersion !== 4) {
    throw new Error('weapp-tailwindcss 生成管线仅支持 Tailwind CSS v4。')
  }
  const frameworkPostcssOwner = options.frameworkPostcssOwner ?? options.opts
  const normalizedGeneratorOptions = normalizeWeappTailwindcssGeneratorOptions(options.opts.generator, {
    appType: options.opts.appType,
    platform: options.generatorPlatform ?? options.opts.cssOptions?.platform ?? options.opts.platform,
    tailwindcssMajorVersion: majorVersion,
    uniAppX: options.opts.uniAppX,
  })
  const shouldReplayFrameworkPostcss = options.cssStage === 'framework-processed'
    && hasFrameworkPostcssOptions(frameworkPostcssOwner)
    && normalizedGeneratorOptions.target === 'weapp'
  const scope = options.scope ?? {
    id: options.outputFile ?? options.file,
    kind: options.cssHandlerOptions.isMainChunk ? 'global' : 'component',
  }
  const generated = await generateCssByGenerator(
    shouldReplayFrameworkPostcss
      ? {
          ...options,
          compilation: implementation.frameworkAdapter === 'graph'
            ? {
                enabled: true,
                preserveDeletedCss: normalizedGeneratorOptions.hmr?.preserveDeletedCss ?? true,
                scope,
                ...(options.compilationChanges === undefined ? {} : { changes: options.compilationChanges }),
              }
            : undefined,
          deferCssAdaptation: true,
        }
      : {
          ...options,
          compilation: implementation.frameworkAdapter === 'graph'
            ? {
                enabled: true,
                preserveDeletedCss: normalizedGeneratorOptions.hmr?.preserveDeletedCss ?? true,
                scope,
                ...(options.compilationChanges === undefined ? {} : { changes: options.compilationChanges }),
              }
            : undefined,
        },
  )
  if (!generated) {
    return undefined
  }
  const adaptedCss = shouldReplayFrameworkPostcss
    ? await (implementation.frameworkAdapter === 'graph'
        ? adaptGeneratedCssWithFrameworkRootPipeline
        : adaptGeneratedCssWithFrameworkPipeline)(frameworkPostcssOwner, generated, {
        cssHandlerOptions: options.cssHandlerOptions,
        file: options.file,
        majorVersion,
        rawCandidates: options.runtime,
        styleHandler: options.styleHandler,
      })
    : generated.css
  const css = isVueScopedStyleRequest(resolvePostcssRequestOption(options.cssHandlerOptions))
    ? preferScopedGeneratedCssRules(adaptedCss)
    : adaptedCss
  const artifact = implementation.emitArtifact
    ? createCoreArtifact(generated, css, options)
    : undefined
  return {
    ...generated,
    ...(artifact ? { artifact } : {}),
    css,
    classSet: generated.classSet,
    dependencies: generated.dependencies,
    metadata: {
      file: options.file,
      majorVersion,
      outputFile: options.outputFile,
      ...(generated.metadata ?? {}),
    },
  }
}

export async function generateTailwindV4Css(
  options: TailwindV4GenerationCoreInput,
): Promise<TailwindV4GenerationCoreResult | undefined> {
  const mode = resolveCompilerMode()
  const generationOptions = resolveGenerationOptions(options, mode)
  if (mode === 'legacy') {
    return generateTailwindV4CssWithImplementation(generationOptions, {
      emitArtifact: false,
      frameworkAdapter: 'legacy',
    })
  }
  if (mode === 'graph') {
    return generateTailwindV4CssWithImplementation(generationOptions, {
      emitArtifact: true,
      frameworkAdapter: 'graph',
    })
  }

  const legacy = await generateTailwindV4CssWithImplementation(generationOptions, {
    emitArtifact: true,
    frameworkAdapter: 'legacy',
  })
  const graph = await generateTailwindV4CssWithImplementation(generationOptions, {
    emitArtifact: true,
    frameworkAdapter: 'graph',
  })
  const report = createCompilerShadowReport(
    generationOptions.file,
    legacy?.artifact,
    graph?.artifact,
  )
  generationOptions.onCompilerShadowReport?.(report)
  if (!report.equal) {
    generationOptions.debug('compiler shadow semantic mismatch: %s', generationOptions.file)
    generationOptions.debug('compiler shadow semantic report: %O', report)
  }
  return legacy
}
