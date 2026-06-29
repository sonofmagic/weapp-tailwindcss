import type { Plugin } from 'vite'
import type { WeappStyleInjectorOptions } from './core'
import type { ResolvedSubpackageStyleScope, SubpackageStyleGenerateContext } from './subpackage'
import type { UniAppManualStyleConfig, UniAppSubPackageConfig } from './uni-app'
import { createStyleInjector, PLUGIN_NAME } from './core'
import {
  collectSubpackageStyleAssets,
  collectSubpackageTargetStyleAssets,
  isMatchedSourceModuleTargetFile,
  isSourceModuleTargetFile,
  isSubpackageStyleOutputFile,
  resolveSubpackageStyleImport,
  shouldInjectSubpackageStyleImport,
} from './subpackage'
import { createUniAppSubPackageImportResolver } from './uni-app'
import { mergePerFileResolvers } from './utils'

export interface ViteWeappStyleInjectorOptions extends WeappStyleInjectorOptions {
  uniAppSubPackages?: UniAppSubPackageConfig | UniAppSubPackageConfig[]
  uniAppStyleScopes?: UniAppManualStyleConfig | UniAppManualStyleConfig[]
  subpackageStyleScopes?: ResolvedSubpackageStyleScope[]
  generateSubpackageStyle?: (context: SubpackageStyleGenerateContext) => string | Uint8Array | null | undefined | Promise<string | Uint8Array | null | undefined>
  loadSubpackageTargetStyle?: (fileName: string, sourceAbsolutePath: string) => string | Uint8Array | null | undefined | Promise<string | Uint8Array | null | undefined>
}

export function weappStyleInjector(options: ViteWeappStyleInjectorOptions = {}): Plugin {
  const {
    uniAppSubPackages,
    uniAppStyleScopes,
    perFileImports,
    subpackageStyleScopes,
    generateSubpackageStyle,
    loadSubpackageTargetStyle,
    ...restOptions
  } = options

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

  return {
    name: PLUGIN_NAME,
    apply: 'build',
    enforce: 'post',
    generateBundle: {
      order: 'post',
      async handler(_, bundle) {
        const readAssets = () => Object.entries(bundle)
          .filter(([, output]) => output.type === 'asset')
          .map(([fileName, output]) => {
            const asset: { fileName: string, source?: string | Uint8Array } = { fileName }
            if (output.type === 'asset' && typeof output.source !== 'undefined') {
              asset.source = output.source
            }
            return asset
          })

        const targetAssets = collectSubpackageTargetStyleAssets(subpackageStyleScopes ?? [], readAssets())

        for (const asset of targetAssets) {
          if (bundle[asset.fileName]) {
            continue
          }
          const source = asset.sourceAbsolutePath && loadSubpackageTargetStyle
            ? await loadSubpackageTargetStyle(asset.fileName, asset.sourceAbsolutePath)
            : undefined
          bundle[asset.fileName] = {
            type: 'asset',
            fileName: asset.fileName,
            name: asset.fileName,
            source: source ?? '',
          }
        }

        const styleAssets = readAssets()
          .filter(asset => injector.shouldProcess(asset.fileName))

        const subpackageAssets = collectSubpackageStyleAssets(subpackageStyleScopes ?? [], styleAssets)

        for (const asset of subpackageAssets) {
          const generator = asset.scope.generate ?? generateSubpackageStyle
          if (!generator) {
            continue
          }

          const generated = await generator({
            root: asset.scope.root,
            sourcePath: asset.scope.sourceAbsolutePath,
            sourceFiles: asset.scope.sourceFiles ?? [asset.scope.sourceAbsolutePath],
            pageStyleFiles: asset.pageStyleFiles,
            outputFileName: asset.outputFileName,
            styleExt: asset.styleExt,
            framework: asset.scope.framework,
            bundler: 'vite',
          })

          if (generated == null) {
            continue
          }

          const existing = bundle[asset.outputFileName]
          if (existing?.type === 'asset') {
            existing.source = generated
          }
          else {
            this.emitFile({
              type: 'asset',
              fileName: asset.outputFileName,
              source: generated,
            })
          }
        }

        if (!injector.hasImports && (!subpackageStyleScopes || subpackageStyleScopes.length === 0)) {
          return
        }

        for (const [fileName, output] of Object.entries(bundle)) {
          if (output.type !== 'asset') {
            continue
          }
          if (!injector.shouldProcess(fileName)) {
            continue
          }
          if (subpackageStyleScopes?.some(scope => isSubpackageStyleOutputFile(fileName, scope, subpackageStyleScopes))) {
            continue
          }

          const source = typeof output.source === 'undefined' ? '' : output.source
          const subpackageImports = subpackageStyleScopes
            ? subpackageStyleScopes.flatMap((scope) => {
                if (isSubpackageStyleOutputFile(fileName, scope, subpackageStyleScopes)) {
                  return []
                }
                if (!scope.sourceInclude && !scope.sourceExclude && isSourceModuleTargetFile(scope, fileName)) {
                  return []
                }
                if ((scope.sourceInclude || scope.sourceExclude) && !isMatchedSourceModuleTargetFile(scope, fileName)) {
                  return []
                }
                if (!shouldInjectSubpackageStyleImport(fileName, source, scope)) {
                  return []
                }
                const resolved = resolveSubpackageStyleImport(fileName, scope)
                return resolved ? [resolved] : []
              })
            : []

          const result = subpackageImports.length > 0
            ? createStyleInjector({
                ...injectorOptions,
                imports: subpackageImports,
              }).inject(fileName, source)
            : injector.inject(fileName, source)

          if (!result.changed) {
            continue
          }

          output.source = result.content
        }
      },
    },
  }
}

export default weappStyleInjector
