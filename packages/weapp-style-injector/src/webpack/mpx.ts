import type { MpxSubPackageConfig, MpxSubPackageStyleEntry } from '../mpx'
import type { WebpackObjectPluginInstance, WebpackWeappStyleInjectorOptions } from '../webpack'

import fs from 'node:fs'
import path from 'node:path'
import { resolveDefaultMpxAppPaths, resolveMpxSubPackages } from '../mpx'
import { toArray } from '../utils'
import { weappStyleInjectorWebpack } from '../webpack'

export type { MpxSubPackageConfig, MpxSubPackageStyleEntry } from '../mpx'

export interface WebpackMpxStyleInjectorOptions extends Omit<WebpackWeappStyleInjectorOptions, 'subpackageStyleScopes'> {
  appPath?: string | string[]
  sourceRoot?: string
  subPackages?: MpxSubPackageConfig | MpxSubPackageConfig[]
  sourceFileName?: string | string[]
  outputName?: string
  files?: string | string[]
  include?: string | string[]
  exclude?: string | string[]
  styleEntries?: MpxSubPackageStyleEntry | MpxSubPackageStyleEntry[]
}

function createDefaultAppStyleEntry(options: {
  files?: string | string[]
  include?: string | string[]
  exclude?: string | string[]
}): MpxSubPackageStyleEntry {
  const entry: MpxSubPackageStyleEntry = {}
  if (options.files !== undefined) {
    entry.files = options.files
  }
  if (options.include !== undefined) {
    entry.include = options.include
  }
  if (options.exclude !== undefined) {
    entry.exclude = options.exclude
  }
  return entry
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
    styleEntries,
    ...rest
  } = options

  const configs = new Map<string, MpxSubPackageConfig>()

  for (const entry of toArray(subPackages)) {
    configs.set(path.resolve(entry.appPath), entry)
  }

  const candidatePaths = appPath
    ? toArray(appPath).map(entry => path.resolve(entry))
    : resolveDefaultMpxAppPaths()

  for (const candidate of candidatePaths) {
    if (!configs.has(candidate) && fs.existsSync(candidate)) {
      const config: MpxSubPackageConfig = { appPath: candidate }
      if (sourceRoot !== undefined) {
        config.sourceRoot = sourceRoot
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
      if (styleEntries !== undefined) {
        config.styleEntries = styleEntries
      }
      else if (sourceFileName === undefined) {
        config.styleEntries = createDefaultAppStyleEntry({ files, include, exclude })
      }
      configs.set(candidate, config)
    }
  }

  const resolvedSubPackages = [...configs.values()].flatMap(resolveMpxSubPackages)
  const injectorOptions: WebpackWeappStyleInjectorOptions = {
    ...rest,
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
