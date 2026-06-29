import { Buffer } from 'node:buffer'
import path from 'node:path'
import micromatch from 'micromatch'
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
  sourceModules?: ResolvedSubpackageTargetSourceModule[]
  targetFiles?: string[]
  targetSourceFiles?: ResolvedSubpackageTargetSourceFile[]
  files?: string[]
  include?: string | string[]
  exclude?: string | string[]
  sourceInclude?: string | string[]
  sourceExclude?: string | string[]
  generate?: SubpackageStyleGenerator
}

export interface ResolvedSubpackageStyleAsset {
  scope: ResolvedSubpackageStyleScope
  outputFileName: string
  styleExt: string
  pageStyleFiles: string[]
}

export interface ResolvedSubpackageTargetStyleAsset {
  scope: ResolvedSubpackageStyleScope
  fileName: string
  styleExt: string
  sourceAbsolutePath?: string
}

export interface ResolvedSubpackageTargetSourceFile {
  fileName: string
  sourceAbsolutePath: string
}

export interface ResolvedSubpackageTargetSourceModule {
  fileName: string
  styleFileName: string
  sourceAbsolutePath: string
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

export function isSupportedStyleExt(ext: string): boolean {
  return ['.css', '.wxss', '.acss', '.jxss', '.qss', '.ttss'].includes(ext)
}

export function isFileInSubpackageScope(fileName: string, scope: ResolvedSubpackageStyleScope): boolean {
  const normalized = ensurePosix(fileName)

  return normalized.startsWith(`${scope.root}/`)
}

function normalizeScopeFile(scope: ResolvedSubpackageStyleScope, fileName: string): string {
  const normalized = ensurePosix(fileName)
  return normalized.startsWith(`${scope.root}/`)
    ? normalized
    : ensurePosix(path.posix.join(scope.root, normalized))
}

function withoutExt(fileName: string): string {
  const ext = path.posix.extname(fileName)
  return ext ? fileName.slice(0, -ext.length) : fileName
}

function normalizePattern(scope: ResolvedSubpackageStyleScope, pattern: string): string {
  const normalized = ensurePosix(pattern)
  if (normalized.startsWith(`${scope.root}/`) || normalized.startsWith('!') || normalized.startsWith('**/')) {
    return normalized
  }
  return ensurePosix(path.posix.join(scope.root, normalized))
}

export function isFileMatchedBySubpackageScope(
  fileName: string,
  scope: ResolvedSubpackageStyleScope,
): boolean {
  const normalized = ensurePosix(fileName)
  if (!isFileInSubpackageScope(normalized, scope)) {
    return false
  }

  const includePatterns = scope.include
    ? (Array.isArray(scope.include) ? scope.include : [scope.include]).map(pattern => normalizePattern(scope, pattern))
    : []
  if (includePatterns.length > 0 && !includePatterns.some(pattern => micromatch.isMatch(normalized, pattern))) {
    return false
  }

  const excludePatterns = scope.exclude
    ? (Array.isArray(scope.exclude) ? scope.exclude : [scope.exclude]).map(pattern => normalizePattern(scope, pattern))
    : []
  if (excludePatterns.length > 0 && excludePatterns.some(pattern => micromatch.isMatch(normalized, pattern))) {
    return false
  }

  if (scope.files && scope.files.length > 0) {
    const targetFiles = new Set(scope.files.map(file => normalizeScopeFile(scope, file)))
    const targetStems = new Set([...targetFiles].map(withoutExt))
    if (!targetFiles.has(normalized) && !targetStems.has(withoutExt(normalized))) {
      return false
    }
  }

  return true
}

export function isSourceFileMatchedBySubpackageScope(
  fileName: string,
  scope: ResolvedSubpackageStyleScope,
): boolean {
  const normalized = ensurePosix(fileName)
  if (!isFileInSubpackageScope(normalized, scope)) {
    return false
  }

  const includePatterns = scope.sourceInclude
    ? (Array.isArray(scope.sourceInclude) ? scope.sourceInclude : [scope.sourceInclude]).map(pattern => normalizePattern(scope, pattern))
    : []
  if (includePatterns.length > 0 && !includePatterns.some(pattern => micromatch.isMatch(normalized, pattern))) {
    return false
  }

  const excludePatterns = scope.sourceExclude
    ? (Array.isArray(scope.sourceExclude) ? scope.sourceExclude : [scope.sourceExclude]).map(pattern => normalizePattern(scope, pattern))
    : []
  if (excludePatterns.length > 0 && excludePatterns.some(pattern => micromatch.isMatch(normalized, pattern))) {
    return false
  }

  return true
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
  if (!isFileMatchedBySubpackageScope(fileName, scope)) {
    return false
  }

  const styleExt = getSubpackageStyleAssetExt(fileName, source)
  if (!styleExt) {
    return false
  }

  const normalized = ensurePosix(fileName)
  if (normalized === resolveSubpackageOutputFileName(scope, styleExt)) {
    return false
  }

  return true
}

function inferStyleExtFromAssets(assets: Array<{ fileName: string, source?: string | Uint8Array }>): string | undefined {
  for (const asset of assets) {
    const ext = getSubpackageStyleAssetExt(asset.fileName, asset.source)
    if (ext && isSupportedStyleExt(ext)) {
      return ext
    }
  }
  return undefined
}

function inferStyleExtFromScopeSource(scope: ResolvedSubpackageStyleScope): string | undefined {
  const sourceExt = path.posix.extname(ensurePosix(scope.sourceRelativePath))
  if (sourceExt && isSupportedStyleExt(sourceExt)) {
    return sourceExt
  }

  for (const sourceFile of scope.targetSourceFiles ?? []) {
    const ext = path.posix.extname(ensurePosix(sourceFile.fileName))
    if (ext && isSupportedStyleExt(ext)) {
      return ext
    }
  }

  return undefined
}

function inferStyleExtFromTarget(fileName: string): string | undefined {
  const ext = path.posix.extname(ensurePosix(fileName))
  return isSupportedStyleExt(ext) ? ext : undefined
}

function isTargetSourceAsset(fileName: string): boolean {
  const ext = path.posix.extname(ensurePosix(fileName))
  return [
    '.json',
    '.wxml',
    '.axml',
    '.swan',
    '.ttml',
    '.qml',
    '.jxml',
    '.ksml',
    '.xml',
  ].includes(ext)
}

function toTargetStyleFileName(fileName: string, styleExt: string): string {
  const normalized = ensurePosix(fileName)
  const ext = path.posix.extname(normalized)
  return ext ? `${normalized.slice(0, -ext.length)}${styleExt}` : `${normalized}${styleExt}`
}

function resolveTargetSourceFile(
  scope: ResolvedSubpackageStyleScope,
  styleFileName: string,
): ResolvedSubpackageTargetSourceFile | undefined {
  const normalizedStyleFileName = ensurePosix(styleFileName)
  const normalizedStyleStem = withoutExt(normalizedStyleFileName)

  for (const sourceFile of scope.targetSourceFiles ?? []) {
    const normalizedSourceFileName = normalizeScopeFile(scope, sourceFile.fileName)
    if (
      normalizedSourceFileName === normalizedStyleFileName
      || withoutExt(normalizedSourceFileName) === normalizedStyleStem
    ) {
      return sourceFile
    }
  }

  return undefined
}

export function isSourceModuleTargetFile(
  scope: ResolvedSubpackageStyleScope,
  fileName: string,
): boolean {
  const normalized = ensurePosix(fileName)
  const normalizedStem = withoutExt(normalized)
  return Boolean((scope.sourceModules ?? []).some((sourceFile) => {
    const styleFileName = normalizeScopeFile(scope, sourceFile.styleFileName)
    return styleFileName === normalizedStem
  }))
}

export function isMatchedSourceModuleTargetFile(
  scope: ResolvedSubpackageStyleScope,
  fileName: string,
): boolean {
  const normalized = ensurePosix(fileName)
  const normalizedStem = withoutExt(normalized)
  return Boolean((scope.sourceModules ?? []).some((sourceFile) => {
    const styleFileName = normalizeScopeFile(scope, sourceFile.styleFileName)
    return styleFileName === normalizedStem && isSourceFileMatchedBySubpackageScope(sourceFile.fileName, scope)
  }))
}

function collectScopeOutputStems(
  scope: ResolvedSubpackageStyleScope,
  scopes: ResolvedSubpackageStyleScope[],
  styleExt: string,
): Set<string> {
  return new Set(
    scopes
      .filter(item => item.root === scope.root)
      .map(item => withoutExt(resolveSubpackageOutputFileName(item, styleExt))),
  )
}

export function isSubpackageStyleOutputFile(
  fileName: string,
  scope: ResolvedSubpackageStyleScope,
  scopes: ResolvedSubpackageStyleScope[],
): boolean {
  const normalized = ensurePosix(fileName)
  const styleExt = path.posix.extname(normalized)
  if (!styleExt) {
    return false
  }

  return collectScopeOutputStems(scope, scopes, styleExt).has(withoutExt(normalized))
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
      const outputStems = collectScopeOutputStems(scope, scopes, styleExt)
      if (outputStems.has(withoutExt(normalizedFileName))) {
        continue
      }
      if (!scope.sourceInclude && !scope.sourceExclude && isSourceModuleTargetFile(scope, normalizedFileName)) {
        continue
      }
      if ((scope.sourceInclude || scope.sourceExclude) && !isMatchedSourceModuleTargetFile(scope, normalizedFileName)) {
        continue
      }
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

export function collectSubpackageTargetStyleAssets(
  scopes: ResolvedSubpackageStyleScope[],
  assets: Array<{ fileName: string, source?: string | Uint8Array }>,
): ResolvedSubpackageTargetStyleAsset[] {
  const existingAssets = new Set(assets.map(asset => ensurePosix(asset.fileName)))
  const emitted = new Map<string, ResolvedSubpackageTargetStyleAsset>()

  for (const scope of scopes) {
    const scopedAssets = assets.filter(asset => isFileInSubpackageScope(asset.fileName, scope))
    const scopedTargetSourceAssets = scopedAssets.filter(asset => isTargetSourceAsset(asset.fileName))
    const styleExt = inferStyleExtFromAssets(scopedAssets)
      ?? (scopedTargetSourceAssets.length > 0 ? '.wxss' : inferStyleExtFromScopeSource(scope))
      ?? '.wxss'
    const targetFiles = new Set<string>()

    if (!scope.sourceInclude && !scope.sourceExclude) {
      for (const file of scope.targetFiles ?? scope.files ?? []) {
        targetFiles.add(normalizeScopeFile(scope, file))
      }
    }
    for (const sourceModule of scope.sourceModules ?? []) {
      if (isSourceFileMatchedBySubpackageScope(sourceModule.fileName, scope)) {
        targetFiles.add(normalizeScopeFile(scope, `${sourceModule.styleFileName}${styleExt}`))
      }
    }

    for (const asset of scopedAssets) {
      const normalized = ensurePosix(asset.fileName)
      if (!isTargetSourceAsset(normalized)) {
        continue
      }
      const outputStems = collectScopeOutputStems(scope, scopes, styleExt)
      if (outputStems.has(withoutExt(normalized))) {
        continue
      }
      if (!isFileMatchedBySubpackageScope(normalized, scope)) {
        continue
      }
      const targetStyleExt = inferStyleExtFromTarget(normalized) ?? styleExt
      const styleFileName = toTargetStyleFileName(normalized, targetStyleExt)
      if (isFileMatchedBySubpackageScope(styleFileName, scope)) {
        targetFiles.add(styleFileName)
      }
    }

    for (const fileName of targetFiles) {
      const normalized = normalizeScopeFile(scope, fileName)
      const targetStyleExt = inferStyleExtFromTarget(normalized) ?? styleExt
      const styleFileName = toTargetStyleFileName(normalized, targetStyleExt)
      const isSourceModuleTarget = isSourceModuleTargetFile(scope, styleFileName)
      if (existingAssets.has(styleFileName)) {
        continue
      }
      if (styleFileName === resolveSubpackageOutputFileName(scope, targetStyleExt)) {
        continue
      }
      if (!isSourceModuleTarget && !isFileMatchedBySubpackageScope(styleFileName, scope)) {
        continue
      }
      const emittedAsset: ResolvedSubpackageTargetStyleAsset = {
        scope,
        fileName: styleFileName,
        styleExt: targetStyleExt,
      }
      const sourceAbsolutePath = resolveTargetSourceFile(scope, styleFileName)?.sourceAbsolutePath
      if (sourceAbsolutePath !== undefined) {
        emittedAsset.sourceAbsolutePath = sourceAbsolutePath
      }
      emitted.set(styleFileName, emittedAsset)
    }
  }

  return [...emitted.values()]
}
