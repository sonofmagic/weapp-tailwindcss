import type { UniAppStyleScopeInput, UniAppSubPackageConfig } from '../uni-app'
import type { WebpackObjectPluginInstance, WebpackWeappStyleInjectorOptions } from '../webpack'

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { resolveUniAppStyleScopes, splitUniAppStyleScopes } from '../uni-app'
import { toArray } from '../utils'
import { weappStyleInjectorWebpack } from '../webpack'

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
    ...rest
  } = options

  const configs = new Map<string, UniAppSubPackageConfig>()
  const { subPackages: scopedSubPackages, manual: manualStyleScopes } = splitUniAppStyleScopes(styleScopes)

  for (const entry of [...toArray(subPackages), ...scopedSubPackages]) {
    configs.set(path.resolve(entry.pagesJsonPath), entry)
  }

  const candidatePaths = pagesJsonPath
    ? toArray(pagesJsonPath).map(entry => path.resolve(entry))
    : resolveDefaultPagesJsonPaths()

  for (const candidate of candidatePaths) {
    if (!configs.has(candidate) && fs.existsSync(candidate)) {
      const config: UniAppSubPackageConfig = {
        pagesJsonPath: candidate,
      }
      if (indexFileName !== undefined) {
        config.indexFileName = indexFileName
      }
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

  const entries = configs.size > 0 ? [...configs.values()] : undefined
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
  }

  return weappStyleInjectorWebpack(injectorOptions)
}
