import type { Plugin } from 'vite'
import type { WeappStyleInjectorOptions } from './core'
import type { UniAppManualStyleConfig, UniAppSubPackageConfig } from './uni-app'
import { createStyleInjector, PLUGIN_NAME } from './core'
import { createUniAppSubPackageImportResolver } from './uni-app'
import { mergePerFileResolvers } from './utils'

export interface ViteWeappStyleInjectorOptions extends WeappStyleInjectorOptions {
  uniAppSubPackages?: UniAppSubPackageConfig | UniAppSubPackageConfig[]
  uniAppStyleScopes?: UniAppManualStyleConfig | UniAppManualStyleConfig[]
}

export function weappStyleInjector(options: ViteWeappStyleInjectorOptions = {}): Plugin {
  const {
    uniAppSubPackages,
    uniAppStyleScopes,
    perFileImports,
    ...restOptions
  } = options

  const perFileResolver = mergePerFileResolvers([
    typeof perFileImports === 'function' ? perFileImports : undefined,
    createUniAppSubPackageImportResolver(uniAppSubPackages, uniAppStyleScopes),
  ])

  const injector = createStyleInjector({
    ...restOptions,
    perFileImports: perFileResolver,
  })

  return {
    name: PLUGIN_NAME,
    apply: 'build',
    enforce: 'post',
    async generateBundle(_, bundle) {
      if (!injector.hasImports) {
        return
      }

      for (const [fileName, output] of Object.entries(bundle)) {
        if (output.type !== 'asset') {
          continue
        }
        if (!injector.shouldProcess(fileName)) {
          continue
        }

        const source = typeof output.source === 'undefined' ? '' : output.source
        const result = injector.inject(fileName, source)

        if (!result.changed) {
          continue
        }

        output.source = result.content
      }
    },
  }
}

export default weappStyleInjector
