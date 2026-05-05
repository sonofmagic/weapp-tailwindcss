import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { OutputAsset, OutputBundle } from 'rollup'
import type { Plugin, ResolvedConfig } from 'vite'
import type { InternalUserDefinedOptions } from '@/types'
import { generateCssByGenerator, hasTailwindGeneratedCssMarkers } from '../shared/generator-css'

interface CssFinalizerContext {
  opts: InternalUserDefinedOptions
  runtimeState: {
    twPatcher: InternalUserDefinedOptions['twPatcher']
    patchPromise: Promise<void>
  }
  ensureRuntimeClassSet: (force?: boolean) => Promise<Set<string>>
  isCssAssetProcessed: (asset: OutputAsset) => boolean
  markCssAssetProcessed: (asset: OutputAsset) => void
  debug: (format: string, ...args: unknown[]) => void
  getResolvedConfig: () => ResolvedConfig | undefined
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
        } = context
        const resolvedConfig = getResolvedConfig()
        if (resolvedConfig?.command !== 'build') {
          return
        }

        const entries = Object.entries(bundle)
          .filter(([, output]): output is OutputAsset =>
            output.type === 'asset'
            && opts.cssMatcher(output.fileName)
            && !isCssAssetProcessed(output),
          )

        if (entries.length === 0) {
          return
        }

        await runtimeState.patchPromise
        const runtime = await ensureRuntimeClassSet()
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
          const generated = hasTailwindGeneratedCssMarkers(rawSource)
            ? await generateCssByGenerator({
                opts,
                runtimeState,
                runtime,
                rawSource,
                file,
                cssHandlerOptions,
                cssUserHandlerOptions,
                styleHandler: opts.styleHandler,
                debug,
              })
            : undefined
          const nextCss = generated?.css ?? (await opts.styleHandler(rawSource, cssHandlerOptions)).css
          output.source = nextCss
          markCssAssetProcessed(output)
          opts.onUpdate(file, rawSource, nextCss)
          debug('css finalizer handle: %s', file)
        }))
      },
    },
  }
}
