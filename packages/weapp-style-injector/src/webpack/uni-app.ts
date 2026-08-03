import type { SubpackageStyleRules } from '../subpackage'
import type { UniAppStyleScopeInput, UniAppSubPackageConfig } from '../uni-app'
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
import { resolveUniAppStyleScopes, splitUniAppStyleScopes } from '../uni-app'
import { weappStyleInjectorWebpack } from '../webpack'

export type { SubpackageStyleRule, SubpackageStyleRules } from '../subpackage'
export type { UniAppStyleScopeInput, UniAppSubPackageConfig } from '../uni-app'

export interface WebpackUniAppStyleInjectorOptions extends Omit<WebpackWeappStyleInjectorOptions, 'uniAppSubPackages'> {
  pagesJsonPath?: string | string[]
  subPackages?: UniAppSubPackageConfig | UniAppSubPackageConfig[]
  sourceFileName?: string | string[]
  outputName?: string
  files?: string | string[]
  include?: string | string[]
  exclude?: string | string[]
  indexFileName?: string | string[]
  styleScopes?: UniAppStyleScopeInput | UniAppStyleScopeInput[]
  rules?: SubpackageStyleRules
}

function resolveDefaultPagesJsonPaths(): string[] {
  const cwd = process.cwd()
  return [
    path.resolve(cwd, 'src/pages.json'),
    path.resolve(cwd, 'pages.json'),
  ]
}

export function StyleInjector(options: WebpackUniAppStyleInjectorOptions = {}): WebpackObjectPluginInstance {
  const {
    pagesJsonPath,
    subPackages,
    sourceFileName,
    outputName,
    files,
    include,
    exclude,
    indexFileName,
    styleScopes,
    rules,
    ...rest
  } = options

  const { subPackages: scopedSubPackages, manual: manualStyleScopes } = splitUniAppStyleScopes(styleScopes)
  const configs = collectPresetConfigs<UniAppSubPackageConfig>({
    explicitConfigs: [...(Array.isArray(subPackages) ? subPackages : subPackages ? [subPackages] : []), ...scopedSubPackages],
    requestedPaths: pagesJsonPath,
    defaultPaths: resolveDefaultPagesJsonPaths(),
    getConfigPath: config => config.pagesJsonPath,
    createDiscoveredConfig: (candidate) => {
      const config: UniAppSubPackageConfig = {
        pagesJsonPath: candidate,
      }
      assignDefined(config, { indexFileName, sourceFileName, outputName, files, include, exclude })
      if (rules !== undefined) {
        config.rules = rules
      }
      else if (sourceFileName === undefined && indexFileName === undefined) {
        config.rules = [{ from: { ref: 'app.css' }, to: createStyleRuleTargets(files, include, exclude) }]
      }
      return config
    },
  })

  const entries = configs.length > 0 ? configs : undefined
  const manualEntries = manualStyleScopes.length > 0 ? manualStyleScopes : undefined
  const resolvedSubPackages = resolveUniAppStyleScopes(entries, manualEntries)

  const injectorOptions: WebpackWeappStyleInjectorOptions = {
    ...rest,
  }
  if (entries !== undefined) {
    injectorOptions.uniAppSubPackages = entries
  }
  if (manualEntries !== undefined) {
    injectorOptions.uniAppStyleScopes = manualEntries
  }
  if (resolvedSubPackages.length > 0) {
    injectorOptions.subpackageStyleScopes = resolvedSubPackages
    injectorOptions.generateSubpackageStyle = createSyncScopeGenerator(resolvedSubPackages)
    injectorOptions.loadSubpackageTargetStyle = loadSubpackageTargetStyle
  }

  return weappStyleInjectorWebpack(injectorOptions)
}
