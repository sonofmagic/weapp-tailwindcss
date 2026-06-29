import type { Plugin } from 'vite'
import type { TaroSubPackageConfig } from '../taro'
import type { ViteWeappStyleInjectorOptions } from '../vite'

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createStyleInjector } from '../core'
import { isFileMatchedBySubpackageScope, resolveSubpackageStyleImport, shouldInjectSubpackageStyleImport } from '../subpackage'
import { createTaroSubPackageImportResolver, resolveTaroSubPackages } from '../taro'
import { ensurePosix, mergePerFileResolvers, toArray } from '../utils'
import weappStyleInjector from '../vite'

export type { TaroSubPackageConfig } from '../taro'

export interface ViteTaroStyleInjectorOptions extends Omit<ViteWeappStyleInjectorOptions, 'perFileImports'> {
  appConfigPath?: string | string[]
  subPackages?: TaroSubPackageConfig | TaroSubPackageConfig[]
  sourceFileName?: string | string[]
  outputName?: string
  files?: string | string[]
  include?: string | string[]
  exclude?: string | string[]
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

const STYLE_ID_RE = /\.(?:css|scss|sass|less|styl|stylus)(?:[?#].*)?$/

function stripQuery(id: string): string {
  return id.split('?', 1)[0]?.split('#', 1)[0] ?? ''
}

function resolveSourceRoot(scope: ReturnType<typeof resolveTaroSubPackages>[number]) {
  const relativeDir = path.dirname(scope.sourceRelativePath)
  const depth = relativeDir === '.' ? 0 : relativeDir.split('/').length
  return path.resolve(path.dirname(scope.sourceAbsolutePath), ...Array.from<string>({ length: depth }).fill('..'))
}

function createTaroSourceStyleInjectorPlugin(
  resolvedSubPackages: ReturnType<typeof resolveTaroSubPackages>,
): {
  plugin: Plugin
  loadTargetStyle: NonNullable<ViteWeappStyleInjectorOptions['loadSubpackageTargetStyle']>
} | undefined {
  if (resolvedSubPackages.length === 0) {
    return undefined
  }

  const targetStyleSourceCache = new Map<string, string>()
  const scopes = resolvedSubPackages.map(scope => ({
    scope,
    sourceRoot: resolveSourceRoot(scope),
  }))

  const plugin: Plugin = {
    name: 'weapp-style-injector:taro-source-style',
    enforce: 'pre',
    async buildStart() {
      for (const scope of resolvedSubPackages) {
        for (const targetSourceFile of scope.targetSourceFiles ?? []) {
          this.addWatchFile(targetSourceFile.sourceAbsolutePath)
          if (!targetStyleSourceCache.has(targetSourceFile.sourceAbsolutePath) && fs.existsSync(targetSourceFile.sourceAbsolutePath)) {
            const source = await fs.promises.readFile(targetSourceFile.sourceAbsolutePath, 'utf8')
            targetStyleSourceCache.set(targetSourceFile.sourceAbsolutePath, source)
          }
        }
      }
    },
    transform(code, id) {
      const cleanId = stripQuery(id)
      if (!STYLE_ID_RE.test(cleanId)) {
        return undefined
      }

      for (const scope of resolvedSubPackages) {
        const targetSourceFile = (scope.targetSourceFiles ?? [])
          .find(entry => entry.sourceAbsolutePath === cleanId)
        if (targetSourceFile) {
          targetStyleSourceCache.set(targetSourceFile.sourceAbsolutePath, code)
        }
      }

      const imports: string[] = []

      for (const entry of scopes) {
        const relativeFileName = ensurePosix(path.relative(entry.sourceRoot, cleanId))
        if (relativeFileName.startsWith('../')) {
          continue
        }
        if (!isFileMatchedBySubpackageScope(relativeFileName, entry.scope)) {
          continue
        }
        if (!shouldInjectSubpackageStyleImport(relativeFileName, code, entry.scope)) {
          continue
        }
        const resolved = resolveSubpackageStyleImport(relativeFileName, entry.scope)
        if (resolved) {
          imports.push(resolved)
        }
      }

      if (imports.length === 0) {
        return undefined
      }

      const result = createStyleInjector({
        imports,
      }).inject(cleanId, code)

      if (!result.changed) {
        return undefined
      }

      return {
        code: result.content,
        map: null,
      }
    },
  }

  return {
    plugin,
    async loadTargetStyle(_fileName, sourceAbsolutePath) {
      return targetStyleSourceCache.get(sourceAbsolutePath)
    },
  }
}

export function StyleInjector(options: ViteTaroStyleInjectorOptions = {}) {
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

  const sourceStyleInjector = createTaroSourceStyleInjectorPlugin(resolvedSubPackages)
  if (sourceStyleInjector) {
    injectorOptions.loadSubpackageTargetStyle = sourceStyleInjector.loadTargetStyle
  }
  const bundleStyleInjector = weappStyleInjector(injectorOptions)

  return sourceStyleInjector
    ? [sourceStyleInjector.plugin, bundleStyleInjector]
    : bundleStyleInjector
}
