import type { sources as WebpackSources } from 'webpack'
import type { WebpackAssetCompilationLike } from './asset-emission-plan'
import type { SetupWebpackV5ProcessAssetsHookOptions } from './helpers'
import type { LinkedJsModuleResult } from '@/types'
import { AssetEmissionPlan } from '@/compiler'
import { resolveOutputSpecifier, toAbsoluteOutputPath } from '../../../shared/module-graph'
import { applyWebpackAssetEmissionPlan } from './asset-emission-plan'

export function createWebpackJsAssetModuleGraph(options: {
  compilation: {
    getAsset: (file: string) => { source: { source: () => unknown } } | undefined
  }
  compilerOptions: SetupWebpackV5ProcessAssetsHookOptions['options']
  entries: Array<[string, unknown]>
  outputDir: string
}) {
  const jsAssets = new Map<string, string>()
  for (const [file] of options.entries) {
    if (options.compilerOptions.jsMatcher(file) || options.compilerOptions.wxsMatcher(file)) {
      const absolute = toAbsoluteOutputPath(file, options.outputDir)
      jsAssets.set(absolute, file)
    }
  }
  const moduleGraphOptions = {
    resolve(specifier: string, importer: string) {
      return resolveOutputSpecifier(specifier, importer, options.outputDir, candidate => jsAssets.has(candidate))
    },
    load: (id: string) => {
      const assetName = jsAssets.get(id)
      if (!assetName) {
        return undefined
      }
      const asset = options.compilation.getAsset(assetName)
      if (!asset) {
        return undefined
      }
      const source = asset.source.source()
      return source == null ? '' : String(source)
    },
    filter(id: string) {
      return jsAssets.has(id)
    },
  }
  return {
    jsAssets,
    moduleGraphOptions,
  }
}

export function applyWebpackLinkedJsResults(options: {
  ConcatSource: new (code: string) => WebpackSources.Source
  compilation: Pick<WebpackAssetCompilationLike, 'getAsset' | 'updateAsset'>
  compilerOptions: SetupWebpackV5ProcessAssetsHookOptions['options']
  debug: SetupWebpackV5ProcessAssetsHookOptions['debug']
  jsAssets: ReadonlyMap<string, string>
  linked: Record<string, LinkedJsModuleResult> | undefined
}) {
  if (!options.linked) {
    return
  }
  const plan = new AssetEmissionPlan()
  const updates: Array<{ assetName: string, code: string, previous: string }> = []
  for (const [id, { code }] of Object.entries(options.linked)) {
    const assetName = options.jsAssets.get(id)
    if (!assetName) {
      continue
    }
    const asset = options.compilation.getAsset(assetName)
    if (!asset) {
      continue
    }
    const previousSource = asset.source.source()
    const previous = previousSource == null ? '' : String(previousSource)
    if (previous === code) {
      continue
    }
    plan.write(assetName, code)
    updates.push({ assetName, code, previous })
  }
  if (updates.length === 0) {
    return
  }
  applyWebpackAssetEmissionPlan(plan, {
    compilation: options.compilation,
    ConcatSource: options.ConcatSource,
    writeMode: 'update',
  })
  for (const { assetName, code, previous } of updates) {
    options.compilerOptions.onUpdate(assetName, previous, code)
    options.debug('js linked handle: %s', assetName)
  }
}
