import type {
  ResolvedSubpackageStyleScope,
  SubpackageStyleGenerateContext,
  SubpackageStyleRuleTargets,
} from './subpackage'

import fs from 'node:fs'
import path from 'node:path'
import { toArray } from './utils'

interface CollectPresetConfigsOptions<Config> {
  explicitConfigs: Config | Config[] | null | undefined
  requestedPaths: string | string[] | null | undefined
  defaultPaths: string[]
  getConfigPath: (config: Config) => string
  createDiscoveredConfig: (filePath: string) => Config
}

function findScope(
  scopes: ResolvedSubpackageStyleScope[],
  context: SubpackageStyleGenerateContext,
) {
  return scopes.find(scope => scope.root === context.root && scope.sourceAbsolutePath === context.sourcePath)
}

export function collectPresetConfigs<Config>(
  options: CollectPresetConfigsOptions<Config>,
): Config[] {
  const configs = new Map<string, Config>()
  for (const config of toArray(options.explicitConfigs)) {
    configs.set(path.resolve(options.getConfigPath(config)), config)
  }

  const candidatePaths = options.requestedPaths
    ? toArray(options.requestedPaths).map((filePath: string) => path.resolve(filePath))
    : options.defaultPaths
  for (const candidate of candidatePaths) {
    if (!configs.has(candidate) && fs.existsSync(candidate)) {
      configs.set(candidate, options.createDiscoveredConfig(candidate))
    }
  }
  return [...configs.values()]
}

export function assignDefined<Config extends object>(
  config: Config,
  values: { [Key in keyof Config]?: Config[Key] | undefined },
) {
  for (const key of Object.keys(values) as Array<keyof Config>) {
    const value = values[key]
    if (value !== undefined) {
      config[key] = value
    }
  }
  return config
}

export function createStyleRuleTargets(
  files: string | string[] | undefined,
  include: string | string[] | undefined,
  exclude: string | string[] | undefined,
): SubpackageStyleRuleTargets {
  return assignDefined<SubpackageStyleRuleTargets>({}, { files, include, exclude })
}

export function createSyncScopeGenerator(scopes: ResolvedSubpackageStyleScope[]) {
  return (context: SubpackageStyleGenerateContext) => {
    const scope = findScope(scopes, context)
    if (!scope) {
      return undefined
    }
    if (scope.generate) {
      return scope.generate(context)
    }
    if (!fs.existsSync(scope.sourceAbsolutePath)) {
      return undefined
    }
    return fs.readFileSync(scope.sourceAbsolutePath, 'utf8')
  }
}

export function createAsyncScopeGenerator(scopes: ResolvedSubpackageStyleScope[]) {
  return async (context: SubpackageStyleGenerateContext) => {
    const scope = findScope(scopes, context)
    if (!scope) {
      return undefined
    }
    if (scope.generate) {
      return scope.generate(context)
    }
    if (!fs.existsSync(scope.sourceAbsolutePath)) {
      return undefined
    }
    return fs.promises.readFile(scope.sourceAbsolutePath, 'utf8')
  }
}

export function loadSubpackageTargetStyle(_fileName: string, sourceAbsolutePath: string) {
  if (!fs.existsSync(sourceAbsolutePath)) {
    return undefined
  }
  return fs.readFileSync(sourceAbsolutePath, 'utf8')
}
