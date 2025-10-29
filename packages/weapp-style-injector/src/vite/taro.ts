import type { TaroSubPackageConfig } from '../taro'
import type { ViteWeappStyleInjectorOptions } from '../vite'

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createTaroSubPackageImportResolver } from '../taro'
import { mergePerFileResolvers, toArray } from '../utils'
import weappStyleInjector from '../vite'

export interface ViteTaroStyleInjectorOptions extends Omit<ViteWeappStyleInjectorOptions, 'perFileImports'> {
  appConfigPath?: string | string[]
  subPackages?: TaroSubPackageConfig | TaroSubPackageConfig[]
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

export function weappStyleInjectorTaro(options: ViteTaroStyleInjectorOptions = {}) {
  const {
    appConfigPath,
    subPackages,
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
      configs.set(candidate, { appConfigPath: candidate })
    }
  }

  const taroResolver = createTaroSubPackageImportResolver(Array.from(configs.values()))

  return weappStyleInjector({
    ...rest,
    perFileImports: mergePerFileResolvers([perFileImports, taroResolver]),
  })
}

export default weappStyleInjectorTaro
