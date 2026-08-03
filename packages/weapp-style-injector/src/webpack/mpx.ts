import type { MpxSubPackageConfig } from '../mpx'
import type { SubpackageStyleRules } from '../subpackage'
import type { WebpackObjectPluginInstance, WebpackWeappStyleInjectorOptions } from '../webpack'

import { resolveDefaultMpxAppPaths, resolveMpxSubPackages } from '../mpx'
import {
  assignDefined,
  collectPresetConfigs,
  createStyleRuleTargets,
  createSyncScopeGenerator,
  loadSubpackageTargetStyle,
} from '../preset-resolution'
import { weappStyleInjectorWebpack } from '../webpack'

export type { MpxSubPackageConfig } from '../mpx'
export type { SubpackageStyleRule, SubpackageStyleRules } from '../subpackage'

export interface WebpackMpxStyleInjectorOptions extends Omit<WebpackWeappStyleInjectorOptions, 'subpackageStyleScopes'> {
  appPath?: string | string[]
  sourceRoot?: string
  subPackages?: MpxSubPackageConfig | MpxSubPackageConfig[]
  sourceFileName?: string | string[]
  outputName?: string
  files?: string | string[]
  include?: string | string[]
  exclude?: string | string[]
  rules?: SubpackageStyleRules
}

export function StyleInjector(options: WebpackMpxStyleInjectorOptions = {}): WebpackObjectPluginInstance {
  const {
    appPath,
    sourceRoot,
    subPackages,
    sourceFileName,
    outputName,
    files,
    include,
    exclude,
    rules,
    ...rest
  } = options

  const configs = collectPresetConfigs<MpxSubPackageConfig>({
    explicitConfigs: subPackages,
    requestedPaths: appPath,
    defaultPaths: resolveDefaultMpxAppPaths(),
    getConfigPath: config => config.appPath,
    createDiscoveredConfig: (candidate) => {
      const config: MpxSubPackageConfig = {
        appPath: candidate,
      }
      assignDefined(config, { sourceRoot, sourceFileName, outputName, files, include, exclude })
      if (rules !== undefined) {
        config.rules = rules
      }
      else if (sourceFileName === undefined) {
        config.rules = [{ from: { ref: 'app.css' }, to: createStyleRuleTargets(files, include, exclude) }]
      }
      return config
    },
  })

  const resolvedSubPackages = configs.flatMap(resolveMpxSubPackages)
  const injectorOptions: WebpackWeappStyleInjectorOptions = {
    ...rest,
  }

  if (resolvedSubPackages.length > 0) {
    injectorOptions.subpackageStyleScopes = resolvedSubPackages
    injectorOptions.generateSubpackageStyle = createSyncScopeGenerator(resolvedSubPackages)
    injectorOptions.loadSubpackageTargetStyle = loadSubpackageTargetStyle
  }

  return weappStyleInjectorWebpack(injectorOptions)
}
