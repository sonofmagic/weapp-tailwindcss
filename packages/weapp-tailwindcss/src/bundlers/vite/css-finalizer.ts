import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { OutputAsset, OutputBundle } from 'rollup'
import type { Plugin, ResolvedConfig } from 'vite'
import type { InternalUserDefinedOptions } from '@/types'
import path from 'node:path'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { collectGeneratorCandidatesFromSources } from '../shared/generator-candidates'
import { generateCssByGenerator, hasTailwindGeneratedCssMarkers, hasTailwindSourceDirectives } from '../shared/generator-css'

interface CssFinalizerContext {
  opts: InternalUserDefinedOptions
  runtimeState: {
    twPatcher: InternalUserDefinedOptions['twPatcher']
    patchPromise: Promise<void>
  }
  ensureRuntimeClassSet: (force?: boolean) => Promise<Set<string>>
  isCssAssetProcessed: (asset: OutputAsset, file?: string) => boolean
  markCssAssetProcessed: (asset: OutputAsset, file?: string) => void
  debug: (format: string, ...args: unknown[]) => void
  getResolvedConfig: () => ResolvedConfig | undefined
  recordCssAssetResult?: (file: string, css: string) => void
  getRecordedGeneratorCandidates?: () => Set<string> | undefined
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
    majorVersion,
  }
}

function shouldGenerateCssByGenerator(
  opts: InternalUserDefinedOptions,
  file: string,
  rawSource: string,
  processed: boolean,
) {
  if (hasTailwindGeneratedCssMarkers(rawSource) || hasTailwindSourceDirectives(rawSource)) {
    return true
  }
  return processed && shouldFinalizeProcessedCssAsset(opts, file)
}

function shouldFinalizeProcessedCssAsset(
  opts: InternalUserDefinedOptions,
  file: string,
) {
  const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(opts.generator)
  return generatorOptions.mode === 'force'
    && opts.mainCssChunkMatcher(file, opts.appType)
}

export function createViteCssFinalizerOutputPlugin(context: CssFinalizerContext): Plugin {
  return {
    name: 'weapp-tailwindcss:adaptor:css-finalizer',
    generateBundle: {
      order: 'post',
      async handler(_options, bundle: OutputBundle) {
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
        } = context
        const resolvedConfig = getResolvedConfig()
        if (resolvedConfig?.command !== 'build') {
          return
        }

        const entries = Object.entries(bundle)
          .filter(([, output]): output is OutputAsset =>
            output.type === 'asset'
            && opts.cssMatcher(output.fileName)
            && (
              !isCssAssetProcessed(output, output.fileName)
              || shouldFinalizeProcessedCssAsset(opts, output.fileName)
            ),
          )

        if (entries.length === 0) {
          return
        }

        await runtimeState.patchPromise
        const runtime = getRecordedGeneratorCandidates?.() ?? await ensureRuntimeClassSet()
        const generatorRuntime = await collectGeneratorCandidatesFromSources(
          Object.entries(bundle)
            .filter(([, output]) => output.type === 'asset' || output.type === 'chunk')
            .filter(([file]) => opts.htmlMatcher(file) || opts.jsMatcher(file) || opts.wxsMatcher(file))
            .map(([file, output]) => ({
              content: output.type === 'chunk' ? output.code : output.source.toString(),
              extension: path.extname(file).replace(/^\./, '') || (opts.htmlMatcher(file) ? 'html' : 'js'),
            })),
          runtime,
        )
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
          const generated = shouldGenerateCssByGenerator(opts, file, rawSource, processed)
            ? await generateCssByGenerator({
                opts,
                runtimeState,
                runtime: generatorRuntime,
                rawSource,
                file,
                cssHandlerOptions,
                cssUserHandlerOptions,
                styleHandler: opts.styleHandler,
                debug,
              })
            : undefined
          const nextCss = generated?.css ?? (await opts.styleHandler(rawSource, cssHandlerOptions)).css
          if (generated) {
            debug('css finalizer generated result: %s bytes=%d', file, nextCss.length)
            recordCssAssetResult?.(file, nextCss)
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
