import type { UniAppSubPackageConfig } from '../uni-app'
import type { WebpackWeappStyleInjectorOptions } from '../webpack'

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { toArray } from '../utils'
import { weappStyleInjectorWebpack } from '../webpack'

export interface WebpackUniAppStyleInjectorOptions extends Omit<WebpackWeappStyleInjectorOptions, 'uniAppSubPackages'> {
  pagesJsonPath?: string | string[]
  subPackages?: UniAppSubPackageConfig | UniAppSubPackageConfig[]
  indexFileName?: string
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
    ...rest
  } = options

  const configs = new Map<string, UniAppSubPackageConfig>()

  for (const entry of toArray(subPackages)) {
    configs.set(path.resolve(entry.pagesJsonPath), entry)
  }

  const candidatePaths = pagesJsonPath
    ? toArray(pagesJsonPath).map(entry => path.resolve(entry))
    : resolveDefaultPagesJsonPaths()

  for (const candidate of candidatePaths) {
    if (!configs.has(candidate) && fs.existsSync(candidate)) {
      configs.set(candidate, {
        pagesJsonPath: candidate,
        indexFileName,
      })
    }
  }

  return weappStyleInjectorWebpack({
    ...rest,
    uniAppSubPackages: configs.size > 0 ? Array.from(configs.values()) : undefined,
  })
}
