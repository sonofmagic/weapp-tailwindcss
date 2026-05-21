import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { OutputAsset, OutputBundle, OutputChunk } from 'rollup'
import type { Plugin, ResolvedConfig } from 'vite'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { InternalUserDefinedOptions } from '@/types'
import { logger } from '@weapp-tailwindcss/logger'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from '@/tailwindcss/v4-engine/candidates'
import { generateCssByGenerator, hasTailwindGeneratedCssMarkers, hasTailwindSourceDirectives } from '../shared/generator-css'

interface CssFinalizerContext {
  opts: InternalUserDefinedOptions
  runtimeState: {
    twPatcher: InternalUserDefinedOptions['twPatcher']
    readyPromise: Promise<void>
  }
  ensureRuntimeClassSet: (force?: boolean) => Promise<Set<string>>
  isCssAssetProcessed: (asset: OutputAsset, file?: string) => boolean
  markCssAssetProcessed: (asset: OutputAsset, file?: string) => void
  debug: (format: string, ...args: unknown[]) => void
  getResolvedConfig: () => ResolvedConfig | undefined
  recordCssAssetResult?: (file: string, css: string) => void
  getRecordedGeneratorCandidates?: () => Set<string> | undefined
  getSourceCandidates?: () => Set<string>
  getSourceCandidatesForEntries?: ((entries: TailwindSourceEntry[] | undefined) => Set<string>) | undefined
  waitForSourceCandidateSyncs?: () => Promise<void>
  rememberMainCssSource?: (file: string, rawSource: string) => void
  getRememberedMainCssSource?: (file: string) => string | undefined
}

interface CssFinalizerThis {
  addWatchFile?: (id: string) => void
}

function isAddWatchFileInvalidRollupPhaseError(error: unknown) {
  const candidate = error as { code?: string, pluginCode?: string, message?: string }
  return candidate?.code === 'INVALID_ROLLUP_PHASE'
    || candidate?.pluginCode === 'INVALID_ROLLUP_PHASE'
    || candidate?.message?.includes('Cannot call "addWatchFile" after the build has finished.') === true
}

function registerGeneratorDependencies(ctx: CssFinalizerThis, dependencies: readonly string[] | undefined) {
  if (typeof ctx.addWatchFile !== 'function') {
    return
  }
  for (const dependency of dependencies ?? []) {
    try {
      ctx.addWatchFile(dependency)
    }
    catch (error) {
      if (isAddWatchFileInvalidRollupPhaseError(error)) {
        logger.debug('跳过生成模式依赖监听注册，当前 Rollup 阶段不允许 addWatchFile: %s', dependency)
        continue
      }
      throw error
    }
  }
}

function createCssHandlerOptions(
  opts: InternalUserDefinedOptions,
  majorVersion: number | undefined,
  file: string,
): IStyleHandlerOptions {
  return {
    isMainChunk: opts.mainCssChunkMatcher(file, opts.appType),
    postcssOptions: {
      options: {
        from: file,
      },
    },
    ...(majorVersion === undefined ? {} : { majorVersion }),
  }
}

function shouldGenerateCssByGenerator(
  opts: InternalUserDefinedOptions,
  file: string,
  rawSource: string,
  processed: boolean,
) {
  const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(opts.generator)
  if (generatorOptions.target === 'web') {
    return false
  }
  if (
    hasTailwindGeneratedCssMarkers(rawSource)
    || hasTailwindSourceDirectives(rawSource, { importFallback: generatorOptions.importFallback })
  ) {
    return true
  }
  if (opts.twPatcher.majorVersion === 3) {
    return false
  }
  return processed && shouldFinalizeProcessedCssAsset(opts, file)
}

function shouldFinalizeProcessedCssAsset(
  opts: InternalUserDefinedOptions,
  file: string,
) {
  return opts.mainCssChunkMatcher(file, opts.appType)
}

export function createViteCssFinalizerOutputPlugin(context: CssFinalizerContext): Plugin {
  return {
    name: 'weapp-tailwindcss:adaptor:css-finalizer',
    generateBundle: {
      order: 'post',
      async handler(this: CssFinalizerThis, _options, bundle: OutputBundle) {
        const {
          opts,
          runtimeState,
          ensureRuntimeClassSet,
          isCssAssetProcessed,
          markCssAssetProcessed,
          debug,
          getResolvedConfig,
          recordCssAssetResult,
          getRecordedGeneratorCandidates,
          getSourceCandidates,
          getSourceCandidatesForEntries,
          waitForSourceCandidateSyncs,
          rememberMainCssSource,
          getRememberedMainCssSource,
        } = context
        const resolvedConfig = getResolvedConfig()
        if (resolvedConfig?.command !== 'build') {
          return
        }

        const isCssOutputAssetEntry = (
          entry: [string, OutputAsset | OutputChunk],
        ): entry is [string, OutputAsset] => {
          const [, output] = entry
          return (
            output.type === 'asset'
            && opts.cssMatcher(output.fileName)
            && (
              !isCssAssetProcessed(output, output.fileName)
              || shouldFinalizeProcessedCssAsset(opts, output.fileName)
            )
          )
        }

        const entries = Object.entries(bundle).filter(isCssOutputAssetEntry)

        if (entries.length === 0) {
          return
        }

        await runtimeState.readyPromise
        await waitForSourceCandidateSyncs?.()
        const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(opts.generator)
        const runtime = getRecordedGeneratorCandidates?.() ?? getSourceCandidates?.() ?? await ensureRuntimeClassSet()
        const collectedGeneratorCandidates = new Set([
          ...runtime,
          ...(getSourceCandidates?.() ?? []),
        ])
        const generatorRuntime = runtimeState.twPatcher.majorVersion === 4 && generatorOptions.target === 'weapp'
          ? filterUnsupportedMiniProgramTailwindV4Candidates(collectedGeneratorCandidates)
          : collectedGeneratorCandidates
        await Promise.all(entries.map(async ([bundleFile, output]) => {
          const file = output.fileName || bundleFile
          const rawSource = output.source.toString()
          const cssHandlerOptions = createCssHandlerOptions(
            opts,
            runtimeState.twPatcher.majorVersion,
            file,
          )
          const cssUserHandlerOptions = {
            ...cssHandlerOptions,
            isMainChunk: false,
          }
          const processed = isCssAssetProcessed(output, file)
          const generatorRawSource = processed && cssHandlerOptions.isMainChunk
            ? getRememberedMainCssSource?.(file) ?? rawSource
            : rawSource
          const generated = shouldGenerateCssByGenerator(opts, file, generatorRawSource, processed)
            ? await generateCssByGenerator({
                opts,
                runtimeState,
                runtime: generatorRuntime,
                rawSource: generatorRawSource,
                file,
                cssHandlerOptions,
                cssUserHandlerOptions,
                getSourceCandidatesForEntries,
                styleHandler: opts.styleHandler,
                debug,
              })
            : undefined
          const nextCss = generated?.css ?? (await opts.styleHandler(rawSource, cssHandlerOptions)).css
          if (generated) {
            registerGeneratorDependencies(this, generated.dependencies)
            debug('css finalizer generated result: %s bytes=%d', file, nextCss.length)
            recordCssAssetResult?.(file, nextCss)
            if (cssHandlerOptions.isMainChunk) {
              rememberMainCssSource?.(file, generatorRawSource)
            }
          }
          output.source = nextCss
          markCssAssetProcessed(output, file)
          opts.onUpdate(file, rawSource, nextCss)
          debug('css finalizer handle: %s', file)
        }))
      },
    },
  }
}
