import type { PerFileImportResolver } from './core'
import type { ResolvedSubpackageStyleScope, ResolvedSubpackageTargetSourceFile, ResolvedSubpackageTargetSourceModule, SubpackageStyleGenerator } from './subpackage'

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import vm from 'node:vm'
import {
  ensurePosix,
  normalizeRelativeImport,
  normalizeRoot,
  toArray,
} from './utils'

export interface TaroSubPackageConfig {
  appConfigPath: string
  sourceFileName?: string | string[]
  outputName?: string
  files?: string | string[]
  include?: string | string[]
  exclude?: string | string[]
  generate?: SubpackageStyleGenerator
  styleEntries?: TaroSubPackageStyleEntry | TaroSubPackageStyleEntry[]
  /**
   * @deprecated Use sourceFileName instead.
   */
  indexFileNames?: string | string[]
  preprocess?: boolean
}

export interface TaroSubPackageStyleEntry {
  sourceFileName?: string | string[]
  appStyle?: boolean
  referenceFileName?: string
  outputName?: string
  files?: string | string[]
  include?: string | string[]
  exclude?: string | string[]
  sourceInclude?: string | string[]
  sourceExclude?: string | string[]
  generate?: SubpackageStyleGenerator
  preprocess?: boolean
}

export type ResolvedTaroSubPackage = ResolvedSubpackageStyleScope

const DEFAULT_STYLE_FILENAMES = ['index.scss', 'index.css', 'index.less', 'index.sass', 'index.styl']

const IMPORT_LINE_RE = /^\s*import[\s\S]*?;$/gm
const AS_CONST_RE = /\s+as\s+const/g
const DECLARE_LINE_RE = /^\s*declare\s+[^\n]*\n?/gm
const EXPORT_DEFAULT_DEFINE_APP_CONFIG_RE = /export\s+default\s+defineAppConfig\s*\(/
const EXPORT_DEFAULT_RE = /export\s+default\s+/

function stripImports(source: string): string {
  IMPORT_LINE_RE.lastIndex = 0
  return source.replace(IMPORT_LINE_RE, '')
}

function stripTypeAssertions(source: string): string {
  AS_CONST_RE.lastIndex = 0
  return source.replace(AS_CONST_RE, '')
}

function stripTypeDeclarations(source: string): string {
  DECLARE_LINE_RE.lastIndex = 0
  return source.replace(DECLARE_LINE_RE, '')
}

function loadAppConfigModule(filePath: string): Record<string, unknown> | null {
  const resolvedPath = path.resolve(filePath)

  if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
    return null
  }

  const ext = path.extname(resolvedPath).toLowerCase()

  if (ext === '.json') {
    try {
      return JSON.parse(fs.readFileSync(resolvedPath, 'utf8'))
    }
    catch {
      return null
    }
  }

  try {
    const raw = fs.readFileSync(resolvedPath, 'utf8')
    const withoutImports = stripImports(raw)
    const withoutDeclarations = stripTypeDeclarations(withoutImports)
    const sanitized = stripTypeAssertions(withoutDeclarations)
      .replace(EXPORT_DEFAULT_DEFINE_APP_CONFIG_RE, 'module.exports = defineAppConfig(')
      .replace(EXPORT_DEFAULT_RE, 'module.exports = ')

    const context = {
      module: { exports: {} as unknown },
      exports: {} as Record<string, unknown>,
      defineAppConfig: (config: Record<string, unknown>) => config,
      require,
      __dirname: path.dirname(resolvedPath),
      __filename: resolvedPath,
      process,
      console,
    }

    const script = new vm.Script(`'use strict';\n${sanitized}`, {
      filename: resolvedPath,
    })

    script.runInNewContext(context)

    const exported = (context.module.exports ?? context.exports) as Record<string, unknown>

    if (exported && typeof exported === 'object' && 'default' in exported) {
      return (exported as { default: Record<string, unknown> }).default
    }

    return exported
  }
  catch {
    return null
  }
}

function ensureArray<T>(value: T | T[] | undefined): T[] {
  return Array.isArray(value) ? value : (typeof value === 'undefined' ? [] : [value])
}

function normalizePagePath(value: unknown): string | undefined {
  const raw = typeof value === 'string'
    ? value
    : value && typeof value === 'object' && 'path' in value && typeof (value as { path?: unknown }).path === 'string'
      ? (value as { path: string }).path
      : undefined
  if (!raw) {
    return undefined
  }
  const normalized = ensurePosix(raw).replace(/^[./\\]+/, '')
  return normalized.length > 0 ? normalized : undefined
}

function resolvePageStyleFiles(entry: { root?: string, pages?: unknown }): string[] {
  const root = entry.root ? normalizeRoot(entry.root) : ''
  if (!root || !Array.isArray(entry.pages)) {
    return []
  }
  return entry.pages
    .map(normalizePagePath)
    .filter((page): page is string => Boolean(page))
    .map(page => ensurePosix(path.posix.join(root, page)))
}

function resolvePageStyleSourceFiles(
  entry: { root?: string, pages?: unknown },
  baseDir: string,
): ResolvedSubpackageTargetSourceFile[] {
  const root = entry.root ? normalizeRoot(entry.root) : ''
  if (!root || !Array.isArray(entry.pages)) {
    return []
  }

  return entry.pages
    .map(normalizePagePath)
    .filter((page): page is string => Boolean(page))
    .flatMap((page) => {
      const sourceAbsolutePath = path.resolve(baseDir, root, `${page}.css`)
      if (!fs.existsSync(sourceAbsolutePath) || !fs.statSync(sourceAbsolutePath).isFile()) {
        return []
      }
      return [{
        fileName: ensurePosix(path.posix.join(root, `${page}.css`)),
        sourceAbsolutePath,
      }]
    })
}

function removeStyleExt(fileName: string): string {
  const ext = path.posix.extname(fileName)
  return ext ? fileName.slice(0, -ext.length) : fileName
}

function walkFiles(directory: string, predicate: (fileName: string) => boolean): string[] {
  if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
    return []
  }

  const files: string[] = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkFiles(absolutePath, predicate))
    }
    else if (entry.isFile() && predicate(entry.name)) {
      files.push(absolutePath)
    }
  }
  return files
}

function resolveComponentStyleSourceFiles(
  root: string,
  baseDir: string,
): ResolvedSubpackageTargetSourceFile[] {
  const componentsDir = path.resolve(baseDir, root, 'components')
  return walkFiles(componentsDir, fileName => fileName.endsWith('.css')).map((sourceAbsolutePath) => {
    const fileName = ensurePosix(path.relative(baseDir, sourceAbsolutePath))
    return {
      fileName,
      sourceAbsolutePath,
    }
  })
}

function resolveSourceModules(
  root: string,
  baseDir: string,
): ResolvedSubpackageTargetSourceModule[] {
  const directories = [
    path.resolve(baseDir, root, 'pages'),
    path.resolve(baseDir, root, 'components'),
  ]
  return directories.flatMap(directory =>
    walkFiles(directory, fileName => /\.[^.]+\.(?:vue|tsx|jsx|ts|js)$/.test(fileName)).map((sourceAbsolutePath) => {
      const fileName = ensurePosix(path.relative(baseDir, sourceAbsolutePath))
      const styleFileName = removeStyleExt(fileName)
      return {
        fileName,
        styleFileName,
        sourceAbsolutePath,
      }
    }),
  )
}

function resolveReferenceOutputName(fileName: string): string {
  const normalized = ensurePosix(fileName)
  return path.posix.basename(normalized, path.posix.extname(normalized)) || 'app'
}

function shouldUseAppStyleReference(styleEntry: TaroSubPackageStyleEntry): boolean {
  return (
    styleEntry.appStyle === true
    || Boolean(styleEntry.referenceFileName)
    || (
      styleEntry.sourceFileName === undefined
      && styleEntry.outputName === undefined
      && styleEntry.generate === undefined
      && (
        Object.keys(styleEntry).length === 0
        || styleEntry.preprocess !== undefined
        || styleEntry.files !== undefined
        || styleEntry.include !== undefined
        || styleEntry.exclude !== undefined
        || styleEntry.sourceInclude !== undefined
        || styleEntry.sourceExclude !== undefined
      )
    )
  )
}

function applyStyleEntryOptions(
  resolvedEntry: ResolvedTaroSubPackage,
  styleEntry: TaroSubPackageStyleEntry,
) {
  if (toArray(styleEntry.files).length > 0) {
    resolvedEntry.files = toArray(styleEntry.files)
  }
  if (styleEntry.include !== undefined) {
    resolvedEntry.include = styleEntry.include
  }
  if (styleEntry.exclude !== undefined) {
    resolvedEntry.exclude = styleEntry.exclude
  }
  if (styleEntry.sourceInclude !== undefined) {
    resolvedEntry.sourceInclude = styleEntry.sourceInclude
  }
  if (styleEntry.sourceExclude !== undefined) {
    resolvedEntry.sourceExclude = styleEntry.sourceExclude
  }
  if (styleEntry.generate) {
    resolvedEntry.generate = styleEntry.generate
  }
}

function createDefaultStyleEntry(config: TaroSubPackageConfig): TaroSubPackageStyleEntry {
  const entry: TaroSubPackageStyleEntry = {
    sourceFileName: ensureArray(config.sourceFileName ?? config.indexFileNames),
  }
  if (config.outputName !== undefined) {
    entry.outputName = config.outputName
  }
  if (config.files !== undefined) {
    entry.files = config.files
  }
  if (config.include !== undefined) {
    entry.include = config.include
  }
  if (config.exclude !== undefined) {
    entry.exclude = config.exclude
  }
  if (config.generate !== undefined) {
    entry.generate = config.generate
  }
  if (config.preprocess !== undefined) {
    entry.preprocess = config.preprocess
  }
  return entry
}

export function resolveTaroSubPackages(config: TaroSubPackageConfig): ResolvedTaroSubPackage[] {
  const appConfigPath = path.resolve(config.appConfigPath)
  const appConfig = loadAppConfigModule(appConfigPath)

  if (!appConfig) {
    return []
  }

  const primary = ensureArray((appConfig as Record<string, unknown>)['subPackages'] as Array<{ root?: string, pages?: unknown }> | undefined)

  const secondary = ensureArray((appConfig as Record<string, unknown>)['subpackages'] as Array<{ root?: string, pages?: unknown }> | undefined)
  const subPackagesInput = [...primary, ...secondary]

  if (subPackagesInput.length === 0) {
    return []
  }

  const baseDir = path.dirname(appConfigPath)
  const entries = toArray(config.styleEntries)
  const styleEntries: TaroSubPackageStyleEntry[] = entries.length > 0
    ? entries
    : [createDefaultStyleEntry(config)]

  const resolved: ResolvedTaroSubPackage[] = []

  for (const entry of subPackagesInput) {
    if (!entry?.root) {
      continue
    }

    const normalizedRoot = normalizeRoot(entry.root)
    if (!normalizedRoot) {
      continue
    }

    for (const styleEntry of styleEntries) {
      const componentStyleSourceFiles = resolveComponentStyleSourceFiles(normalizedRoot, baseDir)

      if (shouldUseAppStyleReference(styleEntry)) {
        const referenceFileName = ensurePosix(styleEntry.referenceFileName ?? 'app.css')
        const resolvedEntry: ResolvedTaroSubPackage = {
          root: ensurePosix(normalizedRoot),
          sourceRelativePath: referenceFileName,
          sourceAbsolutePath: path.resolve(baseDir, referenceFileName),
          referenceFileName,
          outputName: styleEntry.outputName ?? resolveReferenceOutputName(referenceFileName),
          preprocess: false,
          framework: 'taro',
        }
        resolvedEntry.targetFiles = [
          ...resolvePageStyleFiles(entry),
          ...componentStyleSourceFiles.map(file => removeStyleExt(file.fileName)),
        ]
        resolvedEntry.targetSourceFiles = [
          ...resolvePageStyleSourceFiles(entry, baseDir),
          ...componentStyleSourceFiles,
        ]
        resolvedEntry.sourceModules = resolveSourceModules(normalizedRoot, baseDir)
        applyStyleEntryOptions(resolvedEntry, styleEntry)
        resolved.push(resolvedEntry)
        continue
      }

      const styleFileNames = ensureArray(styleEntry.sourceFileName).flatMap(name => (typeof name === 'string' && name.length > 0 ? [name] : []))
      const styleCandidates = styleFileNames.length > 0 ? styleFileNames : DEFAULT_STYLE_FILENAMES
      const stylePath = styleCandidates
        .map(candidate => path.resolve(baseDir, normalizedRoot, candidate))
        .find(candidatePath => fs.existsSync(candidatePath))

      if (!stylePath) {
        continue
      }

      const resolvedEntry: ResolvedTaroSubPackage = {
        root: ensurePosix(normalizedRoot),
        sourceRelativePath: ensurePosix(path.relative(baseDir, stylePath)),
        sourceAbsolutePath: stylePath,
        outputName: styleEntry.outputName ?? path.basename(stylePath, path.extname(stylePath)),
        preprocess: (styleEntry.preprocess ?? config.preprocess) !== false,
        framework: 'taro',
      }
      resolvedEntry.targetFiles = [
        ...resolvePageStyleFiles(entry),
        ...componentStyleSourceFiles.map(file => removeStyleExt(file.fileName)),
      ]
      resolvedEntry.targetSourceFiles = [
        ...resolvePageStyleSourceFiles(entry, baseDir),
        ...componentStyleSourceFiles,
      ]
      resolvedEntry.sourceModules = resolveSourceModules(normalizedRoot, baseDir)
      applyStyleEntryOptions(resolvedEntry, styleEntry)
      resolved.push(resolvedEntry)
    }
  }

  return resolved
}

export function createTaroSubPackageImportResolver(
  configs: TaroSubPackageConfig | TaroSubPackageConfig[] | null | undefined,
): PerFileImportResolver | undefined {
  const list = toArray(configs)
  if (list.length === 0) {
    return undefined
  }

  const subPackages = list.flatMap(resolveTaroSubPackages)
  if (subPackages.length === 0) {
    return undefined
  }

  return (fileName: string) => {
    const normalizedFileName = ensurePosix(fileName)
    const directory = ensurePosix(path.posix.dirname(normalizedFileName))

    const imports: string[] = []

    for (const subPackage of subPackages) {
      if (!normalizedFileName.startsWith(`${subPackage.root}/`)) {
        continue
      }

      const ext = path.posix.extname(normalizedFileName)
      if (!ext) {
        continue
      }

      const indexRelativePath = ensurePosix(path.posix.join(subPackage.root, `${subPackage.outputName}${ext}`))
      if (normalizedFileName === indexRelativePath) {
        continue
      }

      const relativePath = path.posix.relative(directory, indexRelativePath)
      if (!relativePath || relativePath === '.') {
        continue
      }

      imports.push(normalizeRelativeImport(relativePath))
    }

    return imports
  }
}
