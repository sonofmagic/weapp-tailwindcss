import type { Compiler, sources } from 'webpack'
import type { WeappStyleInjectorOptions } from './core'
import type { ResolvedSubpackageStyleScope, SubpackageStyleGenerator } from './subpackage'
import type { UniAppManualStyleConfig, UniAppSubPackageConfig } from './uni-app'
import { Buffer } from 'node:buffer'
import { createStyleInjector, PLUGIN_NAME } from './core'
import {
  collectSubpackageStyleAssets,
  collectSubpackageTargetStyleAssets,
  resolveSubpackageStyleImport,
  shouldInjectSubpackageStyleImport,
} from './subpackage'
import { createUniAppSubPackageImportResolver } from './uni-app'
import { mergePerFileResolvers } from './utils'

const WEBPACK_PLUGIN_NAME = `${PLUGIN_NAME}:webpack`

type WebpackSource = sources.Source
export interface WebpackObjectPluginInstance {
  apply: (compiler: Compiler) => void
}

export interface WebpackWeappStyleInjectorOptions extends WeappStyleInjectorOptions {
  uniAppSubPackages?: UniAppSubPackageConfig | UniAppSubPackageConfig[]
  uniAppStyleScopes?: UniAppManualStyleConfig | UniAppManualStyleConfig[]
  subpackageStyleScopes?: ResolvedSubpackageStyleScope[]
  generateSubpackageStyle?: SubpackageStyleGenerator
}

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return Boolean(value && typeof (value as Promise<unknown>).then === 'function')
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

export class WeappStyleInjectorWebpackPlugin implements WebpackObjectPluginInstance {
  constructor(private readonly options: WebpackWeappStyleInjectorOptions = {}) {}

  apply(compiler: Compiler) {
    const {
      uniAppSubPackages,
      uniAppStyleScopes,
      perFileImports,
      subpackageStyleScopes,
      generateSubpackageStyle,
      ...restOptions
    } = this.options

    const perFileResolver = mergePerFileResolvers([
      typeof perFileImports === 'function' ? perFileImports : undefined,
      subpackageStyleScopes && subpackageStyleScopes.length > 0
        ? undefined
        : createUniAppSubPackageImportResolver(uniAppSubPackages, uniAppStyleScopes),
    ])

    const injectorOptions: WeappStyleInjectorOptions = {
      ...restOptions,
    }
    if (perFileResolver !== undefined) {
      injectorOptions.perFileImports = perFileResolver
    }

    const injector = createStyleInjector(injectorOptions)

    if (!injector.hasImports && (!subpackageStyleScopes || subpackageStyleScopes.length === 0)) {
      return
    }

    const processCompilationAssets = (compilation: any) => {
      const getAssetList = (): Array<{ name: string, source: WebpackSource }> => {
        if (typeof compilation.getAssets === 'function') {
          return compilation.getAssets()
        }

        return Object.entries(compilation.assets ?? {}).map(([name, source]) => ({
          name,
          source: source as WebpackSource,
        }))
      }

      const setAsset = (name: string, content: string | Uint8Array) => {
        const normalizedContent = typeof content === 'string' ? content : Buffer.from(content).toString('utf8')
        const rawSource = createRawSource(compiler, normalizedContent)

        if (typeof compilation.updateAsset === 'function') {
          if (typeof compilation.getAsset === 'function' && compilation.getAsset(name)) {
            compilation.updateAsset(
              name,
              () => rawSource,
            )
          }
          else if (typeof compilation.emitAsset === 'function') {
            compilation.emitAsset(name, rawSource)
          }
          else {
            compilation.updateAsset(name, () => rawSource)
          }
        }
        else {
          compilation.assets[name] = rawSource
        }
      }

      const emitSubpackageAssets = () => {
        const allAssets = getAssetList()
          .map(asset => ({
            fileName: asset.name,
            source: extractSourcePayload(asset.source),
          }))
        const targetAssets = collectSubpackageTargetStyleAssets(subpackageStyleScopes ?? [], allAssets)

        for (const asset of targetAssets) {
          setAsset(asset.fileName, '')
        }

        const assets = getAssetList()
          .filter(asset => injector.shouldProcess(asset.name))
          .map(asset => ({
            fileName: asset.name,
            source: extractSourcePayload(asset.source),
          }))
        const subpackageAssets = collectSubpackageStyleAssets(subpackageStyleScopes ?? [], assets)

        for (const asset of subpackageAssets) {
          const generator = asset.scope.generate ?? generateSubpackageStyle
          if (!generator) {
            continue
          }

          const generated = generator({
            root: asset.scope.root,
            sourcePath: asset.scope.sourceAbsolutePath,
            sourceFiles: asset.scope.sourceFiles ?? [asset.scope.sourceAbsolutePath],
            pageStyleFiles: asset.pageStyleFiles,
            outputFileName: asset.outputFileName,
            styleExt: asset.styleExt,
            framework: asset.scope.framework,
            bundler: 'webpack',
          })

          if (isPromiseLike(generated)) {
            throw new TypeError('[weapp-style-injector] Webpack subpackage style generators must return synchronously.')
          }

          if (generated == null) {
            continue
          }

          setAsset(asset.outputFileName, generated)
        }
      }

      const handleAsset = (name: string, getSource: () => string | Uint8Array, setSource: (content: string) => void) => {
        if (!injector.shouldProcess(name)) {
          return
        }

        const source = getSource()
        const subpackageImports = subpackageStyleScopes
          ? subpackageStyleScopes.flatMap((scope) => {
              if (!shouldInjectSubpackageStyleImport(name, source, scope)) {
                return []
              }
              const resolved = resolveSubpackageStyleImport(name, scope)
              return resolved ? [resolved] : []
            })
          : []

        const result = subpackageImports.length > 0
          ? createStyleInjector({
              ...injectorOptions,
              imports: subpackageImports,
            }).inject(name, source)
          : injector.inject(name, source)

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
            emitSubpackageAssets()
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
        emitSubpackageAssets()
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

export function weappStyleInjectorWebpack(options: WebpackWeappStyleInjectorOptions = {}): WebpackObjectPluginInstance {
  return new WeappStyleInjectorWebpackPlugin(options)
}

export default WeappStyleInjectorWebpackPlugin
