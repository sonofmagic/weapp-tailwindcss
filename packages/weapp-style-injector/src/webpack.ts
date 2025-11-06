import type { Compiler, sources, WebpackPluginInstance } from 'webpack'
import type { WeappStyleInjectorOptions } from './core'
import type { UniAppManualStyleConfig, UniAppSubPackageConfig } from './uni-app'
import { Buffer } from 'node:buffer'
import { createStyleInjector, PLUGIN_NAME } from './core'
import { createUniAppSubPackageImportResolver } from './uni-app'
import { mergePerFileResolvers } from './utils'

const WEBPACK_PLUGIN_NAME = `${PLUGIN_NAME}:webpack`

type WebpackSource = sources.Source

export interface WebpackWeappStyleInjectorOptions extends WeappStyleInjectorOptions {
  uniAppSubPackages?: UniAppSubPackageConfig | UniAppSubPackageConfig[]
  uniAppStyleScopes?: UniAppManualStyleConfig | UniAppManualStyleConfig[]
}

function createRawSource(compiler: Compiler, content: string): WebpackSource {
  const RawSource = compiler.webpack?.sources?.RawSource
  if (RawSource) {
    return new RawSource(content)
  }
  return {
    source: () => content,
    size: () => Buffer.byteLength(content),
  } as unknown as WebpackSource
}

function extractSourcePayload(assetSource: unknown): string | Uint8Array {
  if (assetSource && typeof (assetSource as { source?: unknown }).source === 'function') {
    return (assetSource as { source: () => string | Uint8Array }).source()
  }
  return assetSource as string | Uint8Array
}

export class WeappStyleInjectorWebpackPlugin implements WebpackPluginInstance {
  constructor(private readonly options: WebpackWeappStyleInjectorOptions = {}) {}

  apply(compiler: Compiler) {
    const {
      uniAppSubPackages,
      uniAppStyleScopes,
      perFileImports,
      ...restOptions
    } = this.options

    const perFileResolver = mergePerFileResolvers([
      typeof perFileImports === 'function' ? perFileImports : undefined,
      createUniAppSubPackageImportResolver(uniAppSubPackages, uniAppStyleScopes),
    ])

    const injector = createStyleInjector({
      ...restOptions,
      perFileImports: perFileResolver,
    })

    if (!injector.hasImports) {
      return
    }

    const processCompilationAssets = (compilation: any) => {
      const handleAsset = (name: string, getSource: () => string | Uint8Array, setSource: (content: string) => void) => {
        if (!injector.shouldProcess(name)) {
          return
        }

        const result = injector.inject(name, getSource())

        if (!result.changed) {
          return
        }

        setSource(result.content)
      }

      if (typeof compilation.getAssets === 'function' && typeof compilation.updateAsset === 'function') {
        const stage = compiler.webpack?.Compilation?.PROCESS_ASSETS_STAGE_SUMMARIZE
          ?? compiler.webpack?.Compilation?.PROCESS_ASSETS_STAGE_ADDITIONS
          ?? 0

        compilation.hooks.processAssets.tap(
          {
            name: WEBPACK_PLUGIN_NAME,
            stage,
          },
          () => {
            for (const asset of compilation.getAssets()) {
              handleAsset(
                asset.name,
                () => extractSourcePayload(asset.source),
                content => compilation.updateAsset(
                  asset.name,
                  () => createRawSource(compiler, content),
                ),
              )
            }
          },
        )

        return
      }

      // webpack < 5 的兜底方案
      compilation.hooks.optimizeAssets.tap(WEBPACK_PLUGIN_NAME, (assets: Record<string, unknown>) => {
        for (const [name, assetSource] of Object.entries(assets)) {
          handleAsset(
            name,
            () => extractSourcePayload(assetSource),
            (content) => {
              assets[name] = createRawSource(compiler, content)
            },
          )
        }
      })
    }

    compiler.hooks.thisCompilation.tap(WEBPACK_PLUGIN_NAME, processCompilationAssets)
  }
}

export function weappStyleInjectorWebpack(options: WebpackWeappStyleInjectorOptions = {}): WebpackPluginInstance {
  return new WeappStyleInjectorWebpackPlugin(options)
}

export default WeappStyleInjectorWebpackPlugin
