import { Buffer } from 'node:buffer'
import path from 'node:path'
import { ensurePosix, normalizeRelativeImport } from './utils'

export type SubpackageStyleFramework = 'uni-app' | 'taro' | string
export type SubpackageStyleBundler = 'vite' | 'webpack' | string

export interface SubpackageStyleGenerateContext {
  root: string
  sourcePath: string
  sourceFiles: string[]
  pageStyleFiles: string[]
  outputFileName: string
  styleExt: string
  framework: SubpackageStyleFramework
  bundler: SubpackageStyleBundler
}

export type SubpackageStyleGenerator = (
  context: SubpackageStyleGenerateContext,
) => string | Uint8Array | null | undefined | Promise<string | Uint8Array | null | undefined>

export interface ResolvedSubpackageStyleScope {
  root: string
  sourceRelativePath: string
  sourceAbsolutePath: string
  outputName: string
  preprocess: boolean
  framework: SubpackageStyleFramework
  sourceFiles?: string[]
  generate?: SubpackageStyleGenerator
}

export interface ResolvedSubpackageStyleAsset {
  scope: ResolvedSubpackageStyleScope
  outputFileName: string
  styleExt: string
  pageStyleFiles: string[]
}

export function normalizeOutputName(value: string): string {
  const basename = path.posix.basename(ensurePosix(value))
  const ext = path.posix.extname(basename)
  const name = ext ? basename.slice(0, -ext.length) : basename

  return name || 'index'
}

export function isLikelyStyleAssetSource(source: string | Uint8Array | undefined): boolean {
  if (typeof source === 'undefined') {
    return true
  }

  const content = (typeof source === 'string' ? source : Buffer.from(source).toString('utf8')).trimStart()

  return content.length === 0 || (!content.startsWith('<') && !content.startsWith('{'))
}

export function getSubpackageStyleAssetExt(fileName: string, source: string | Uint8Array | undefined): string | undefined {
  const normalized = ensurePosix(fileName)
  const ext = path.posix.extname(normalized)

  if (!ext || ext === '.json' || !isLikelyStyleAssetSource(source)) {
    return undefined
  }

  return ext
}

export function isFileInSubpackageScope(fileName: string, scope: ResolvedSubpackageStyleScope): boolean {
  const normalized = ensurePosix(fileName)

  return normalized.startsWith(`${scope.root}/`)
}

export function resolveSubpackageOutputFileName(scope: ResolvedSubpackageStyleScope, styleExt: string): string {
  return ensurePosix(path.posix.join(scope.root, `${scope.outputName}${styleExt}`))
}

export function shouldInjectSubpackageStyleImport(
  fileName: string,
  source: string | Uint8Array | undefined,
  scope: ResolvedSubpackageStyleScope,
): boolean {
  if (!isFileInSubpackageScope(fileName, scope)) {
    return false
  }

  const styleExt = getSubpackageStyleAssetExt(fileName, source)
  if (!styleExt) {
    return false
  }

  const normalized = ensurePosix(fileName)
  return normalized !== resolveSubpackageOutputFileName(scope, styleExt)
}

export function resolveSubpackageStyleImport(fileName: string, scope: ResolvedSubpackageStyleScope): string | undefined {
  const normalized = ensurePosix(fileName)
  const styleExt = path.posix.extname(normalized)
  if (!styleExt) {
    return undefined
  }

  const outputFileName = resolveSubpackageOutputFileName(scope, styleExt)
  const relativePath = path.posix.relative(path.posix.dirname(normalized), outputFileName)

  if (!relativePath || relativePath === '.') {
    return undefined
  }

  return normalizeRelativeImport(relativePath)
}

export function collectSubpackageStyleAssets(
  scopes: ResolvedSubpackageStyleScope[],
  assets: Array<{ fileName: string, source?: string | Uint8Array }>,
): ResolvedSubpackageStyleAsset[] {
  const collected = new Map<string, ResolvedSubpackageStyleAsset>()

  for (const asset of assets) {
    const normalizedFileName = ensurePosix(asset.fileName)
    const styleExt = getSubpackageStyleAssetExt(normalizedFileName, asset.source)
    if (!styleExt) {
      continue
    }

    for (const scope of scopes) {
      if (!shouldInjectSubpackageStyleImport(normalizedFileName, asset.source, scope)) {
        continue
      }

      const outputFileName = resolveSubpackageOutputFileName(scope, styleExt)
      const key = `${scope.root}::${outputFileName}`
      const existing = collected.get(key)

      if (existing) {
        existing.pageStyleFiles.push(normalizedFileName)
      }
      else {
        collected.set(key, {
          scope,
          outputFileName,
          styleExt,
          pageStyleFiles: [normalizedFileName],
        })
      }
    }
  }

  return [...collected.values()]
}
