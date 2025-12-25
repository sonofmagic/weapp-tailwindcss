import type { UniAppStyleScopeInput, UniAppSubPackageConfig } from '../uni-app'
import type { WebpackWeappStyleInjectorOptions } from '../webpack'

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { splitUniAppStyleScopes } from '../uni-app'
import { toArray } from '../utils'
import { weappStyleInjectorWebpack } from '../webpack'

export interface WebpackUniAppStyleInjectorOptions extends Omit<WebpackWeappStyleInjectorOptions, 'uniAppSubPackages'> {
  pagesJsonPath?: string | string[]
  subPackages?: UniAppSubPackageConfig | UniAppSubPackageConfig[]
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

export function StyleInjector(options: WebpackUniAppStyleInjectorOptions = {}) {
  const {
    pagesJsonPath,
    subPackages,
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
      configs.set(candidate, config)
    }
  }

  const entries = configs.size > 0 ? Array.from(configs.values()) : undefined
  const manualEntries = manualStyleScopes.length > 0 ? manualStyleScopes : undefined

  const injectorOptions: WebpackWeappStyleInjectorOptions = {
    ...rest,
  }
  if (entries !== undefined) {
    injectorOptions.uniAppSubPackages = entries
  }
  if (manualEntries !== undefined) {
    injectorOptions.uniAppStyleScopes = manualEntries
  }

  return weappStyleInjectorWebpack(injectorOptions)
}
