import type { TaroSubPackageConfig } from '../taro'
import type { WebpackObjectPluginInstance, WebpackWeappStyleInjectorOptions } from '../webpack'

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createTaroSubPackageImportResolver, resolveTaroSubPackages } from '../taro'
import { mergePerFileResolvers, toArray } from '../utils'
import { weappStyleInjectorWebpack } from '../webpack'

export interface WebpackTaroStyleInjectorOptions extends Omit<WebpackWeappStyleInjectorOptions, 'perFileImports'> {
  appConfigPath?: string | string[]
  subPackages?: TaroSubPackageConfig | TaroSubPackageConfig[]
  sourceFileName?: string | string[]
  outputName?: string
  files?: string | string[]
  include?: string | string[]
  exclude?: string | string[]
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
    perFileImports,
    ...rest
  } = options

  const configs = new Map<string, TaroSubPackageConfig>()

  for (const entry of toArray(subPackages)) {
    configs.set(path.resolve(entry.appConfigPath), entry)
  }

  const candidatePaths = appConfigPath
    ? toArray(appConfigPath).map(entry => path.resolve(entry))
    : resolveDefaultAppConfigPaths()

  for (const candidate of candidatePaths) {
    if (!configs.has(candidate) && fs.existsSync(candidate)) {
      const config: TaroSubPackageConfig = { appConfigPath: candidate }
      if (sourceFileName !== undefined) {
        config.sourceFileName = sourceFileName
      }
      if (outputName !== undefined) {
        config.outputName = outputName
      }
      if (files !== undefined) {
        config.files = files
      }
      if (include !== undefined) {
        config.include = include
      }
      if (exclude !== undefined) {
        config.exclude = exclude
      }
      configs.set(candidate, config)
    }
  }

  const entries = [...configs.values()]
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
    injectorOptions.generateSubpackageStyle = (context) => {
      const scope = resolvedSubPackages.find(entry => entry.root === context.root && entry.sourceAbsolutePath === context.sourcePath)
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
    injectorOptions.loadSubpackageTargetStyle = (_fileName, sourceAbsolutePath) => {
      if (!fs.existsSync(sourceAbsolutePath)) {
        return undefined
      }
      return fs.readFileSync(sourceAbsolutePath, 'utf8')
    }
  }

  return weappStyleInjectorWebpack(injectorOptions)
}
