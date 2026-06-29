import type { TaroSubPackageConfig } from '../taro'
import type { ViteWeappStyleInjectorOptions } from '../vite'

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createTaroSubPackageImportResolver, resolveTaroSubPackages } from '../taro'
import { mergePerFileResolvers, toArray } from '../utils'
import weappStyleInjector from '../vite'

export interface ViteTaroStyleInjectorOptions extends Omit<ViteWeappStyleInjectorOptions, 'perFileImports'> {
  appConfigPath?: string | string[]
  subPackages?: TaroSubPackageConfig | TaroSubPackageConfig[]
  sourceFileName?: string | string[]
  outputName?: string
  perFileImports?: ViteWeappStyleInjectorOptions['perFileImports']
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

export function StyleInjector(options: ViteTaroStyleInjectorOptions = {}) {
  const {
    appConfigPath,
    subPackages,
    sourceFileName,
    outputName,
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
      configs.set(candidate, config)
    }
  }

  const entries = [...configs.values()]
  const taroResolver = createTaroSubPackageImportResolver(entries)
  const resolvedSubPackages = entries.flatMap(resolveTaroSubPackages)

  const injectorOptions: ViteWeappStyleInjectorOptions = {
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
    injectorOptions.generateSubpackageStyle = async (context) => {
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
      return fs.promises.readFile(scope.sourceAbsolutePath, 'utf8')
    }
  }

  return weappStyleInjector(injectorOptions)
}
