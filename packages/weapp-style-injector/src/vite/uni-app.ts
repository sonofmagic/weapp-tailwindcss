import type { ResolvedConfig } from 'vite'
import type { ResolvedSubPackage, UniAppStyleScopeInput, UniAppSubPackageConfig } from '../uni-app'

import type { ViteWeappStyleInjectorOptions } from '../vite'
import fs from 'node:fs'

import path from 'node:path'
import process from 'node:process'
import { preprocessCSS } from 'vite'
import { resolveUniAppStyleScopes, splitUniAppStyleScopes } from '../uni-app'
import { toArray } from '../utils'
import weappStyleInjector from '../vite'

export interface ViteUniAppStyleInjectorOptions extends Omit<ViteWeappStyleInjectorOptions, 'uniAppSubPackages'> {
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

export function StyleInjector(options: ViteUniAppStyleInjectorOptions = {}) {
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
      configs.set(candidate, {
        pagesJsonPath: candidate,
        indexFileName,
      })
    }
  }

  const entries = configs.size > 0 ? Array.from(configs.values()) : undefined
  const manualEntries = manualStyleScopes.length > 0 ? manualStyleScopes : undefined
  const resolvedSubPackages = resolveUniAppStyleScopes(entries, manualEntries)

  const plugins = [
    weappStyleInjector({
      ...rest,
      uniAppSubPackages: entries,
      uniAppStyleScopes: manualEntries,
    }),
  ]

  if (resolvedSubPackages.length > 0) {
    plugins.unshift(createUniAppSubPackageIndexEmitter(resolvedSubPackages))
  }

  return plugins.length === 1 ? plugins[0] : plugins
}

function createUniAppSubPackageIndexEmitter(subPackages: ResolvedSubPackage[]) {
  const existing = [...subPackages]
  if (existing.length === 0) {
    return {
      name: 'weapp-style-injector:uni-app-sub-packages',
      apply: 'build',
    }
  }

  let resolvedConfig: ResolvedConfig | undefined
  const processedSourceCache = new Map<string, string>()
  const outputCache = new Map<string, string>()

  return {
    name: 'weapp-style-injector:uni-app-sub-packages',
    apply: 'build' as const,
    configResolved(config) {
      resolvedConfig = config
    },
    async generateBundle(_, bundle) {
      for (const entry of existing) {
        const sourcePath = entry.sourceAbsolutePath
        if (!fs.existsSync(sourcePath)) {
          continue
        }

        const fileName = entry.indexRelativePath
        let processedSource = outputCache.get(fileName)

        if (typeof processedSource === 'undefined') {
          const cacheKey = `${sourcePath}::${entry.preprocess !== false ? '1' : '0'}`
          processedSource = processedSourceCache.get(cacheKey)

          if (typeof processedSource === 'undefined') {
            let rawSource: string
            try {
              rawSource = await fs.promises.readFile(sourcePath, 'utf8')
            }
            catch {
              continue
            }

            if (entry.preprocess !== false && resolvedConfig) {
              try {
                const result = await preprocessCSS(rawSource, sourcePath, resolvedConfig)
                processedSource = result.code
              }
              catch (error) {
                throw Object.assign(
                  new Error(`[weapp-style-injector] Failed to preprocess "${sourcePath}": ${(error as Error).message}`),
                  { cause: error },
                )
              }
            }
            else {
              processedSource = rawSource
            }

            processedSourceCache.set(cacheKey, processedSource)
          }

          outputCache.set(fileName, processedSource)
        }

        const existingAsset = bundle[fileName]
        if (existingAsset && existingAsset.type === 'asset') {
          existingAsset.source = processedSource
          continue
        }

        bundle[fileName] = {
          type: 'asset',
          name: fileName,
          fileName,
          source: processedSource,
        }
      }
    },
  }
}
