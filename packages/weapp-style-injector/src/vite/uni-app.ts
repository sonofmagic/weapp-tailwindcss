import type { UniAppSubPackageConfig } from '../uni-app'
import type { ViteWeappStyleInjectorOptions } from '../vite'

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { toArray } from '../utils'
import weappStyleInjector from '../vite'

export interface ViteUniAppStyleInjectorOptions extends Omit<ViteWeappStyleInjectorOptions, 'uniAppSubPackages'> {
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

export function StyleInjector(options: ViteUniAppStyleInjectorOptions = {}) {
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

  return weappStyleInjector({
    ...rest,
    uniAppSubPackages: configs.size > 0 ? Array.from(configs.values()) : undefined,
  })
}
