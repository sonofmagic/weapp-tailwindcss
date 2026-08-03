import type { SubpackageStyleRules } from '../subpackage'
import type { TaroSubPackageConfig } from '../taro'
import type { WebpackObjectPluginInstance, WebpackWeappStyleInjectorOptions } from '../webpack'

import path from 'node:path'
import process from 'node:process'
import {
  assignDefined,
  collectPresetConfigs,
  createStyleRuleTargets,
  createSyncScopeGenerator,
  loadSubpackageTargetStyle,
} from '../preset-resolution'
import { createTaroSubPackageImportResolver, resolveTaroSubPackages } from '../taro'
import { mergePerFileResolvers } from '../utils'
import { weappStyleInjectorWebpack } from '../webpack'

export type { SubpackageStyleRule, SubpackageStyleRules } from '../subpackage'
export type { TaroSubPackageConfig } from '../taro'

export interface WebpackTaroStyleInjectorOptions extends Omit<WebpackWeappStyleInjectorOptions, 'perFileImports'> {
  appConfigPath?: string | string[]
  subPackages?: TaroSubPackageConfig | TaroSubPackageConfig[]
  sourceFileName?: string | string[]
  outputName?: string
  files?: string | string[]
  include?: string | string[]
  exclude?: string | string[]
  rules?: SubpackageStyleRules
  perFileImports?: WebpackWeappStyleInjectorOptions['perFileImports']
}

function resolveDefaultAppConfigPaths(): string[] {
  const cwd = process.cwd()
  return [
    path.resolve(cwd, 'src/app.config.ts'),
    path.resolve(cwd, 'src/app.config.js'),
    path.resolve(cwd, 'src/app.config.json'),
    path.resolve(cwd, 'app.config.ts'),
    path.resolve(cwd, 'app.config.js'),
    path.resolve(cwd, 'app.config.json'),
  ]
}

export function StyleInjector(options: WebpackTaroStyleInjectorOptions = {}): WebpackObjectPluginInstance {
  const {
    appConfigPath,
    subPackages,
    sourceFileName,
    outputName,
    files,
    include,
    exclude,
    rules,
    perFileImports,
    ...rest
  } = options

  const entries = collectPresetConfigs<TaroSubPackageConfig>({
    explicitConfigs: subPackages,
    requestedPaths: appConfigPath,
    defaultPaths: resolveDefaultAppConfigPaths(),
    getConfigPath: config => config.appConfigPath,
    createDiscoveredConfig: (candidate) => {
      const config: TaroSubPackageConfig = {
        appConfigPath: candidate,
      }
      assignDefined(config, { sourceFileName, outputName, files, include, exclude })
      if (rules !== undefined) {
        config.rules = rules
      }
      else if (sourceFileName === undefined) {
        config.rules = [{ from: { ref: 'app.css' }, to: createStyleRuleTargets(files, include, exclude) }]
      }
      return config
    },
  })
  const taroResolver = createTaroSubPackageImportResolver(entries)
  const resolvedSubPackages = entries.flatMap(resolveTaroSubPackages)

  const injectorOptions: WebpackWeappStyleInjectorOptions = {
    ...rest,
  }
  const mergedResolver = mergePerFileResolvers([
    perFileImports,
    resolvedSubPackages.length > 0 ? undefined : taroResolver,
  ])
  if (mergedResolver !== undefined) {
    injectorOptions.perFileImports = mergedResolver
  }
  if (resolvedSubPackages.length > 0) {
    injectorOptions.subpackageStyleScopes = resolvedSubPackages
    injectorOptions.generateSubpackageStyle = createSyncScopeGenerator(resolvedSubPackages)
    injectorOptions.loadSubpackageTargetStyle = loadSubpackageTargetStyle
  }

  return weappStyleInjectorWebpack(injectorOptions)
}
