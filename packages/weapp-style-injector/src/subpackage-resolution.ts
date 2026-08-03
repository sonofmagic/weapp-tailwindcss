import type {
  ResolvedSubpackageStyleScope,
  ResolvedSubpackageTargetSourceFile,
  ResolvedSubpackageTargetSourceModule,
  SubpackageStyleFramework,
  SubpackageStyleGenerator,
} from './subpackage'

import fs from 'node:fs'
import path from 'node:path'
import { ensurePosix, normalizeRoot, toArray } from './utils'

export interface SharedSubpackageEntry {
  root?: string
  pages?: unknown
}

export interface SharedStyleEntry {
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
  preprocess?: boolean | undefined
}

interface SubpackageTargets {
  targetFiles?: string[]
  targetSourceFiles?: ResolvedSubpackageTargetSourceFile[]
  sourceModules?: ResolvedSubpackageTargetSourceModule[]
}

interface ResolveSubpackageScopesOptions<Entry extends SharedStyleEntry> {
  framework: SubpackageStyleFramework
  sourceRoot: string
  subPackages: SharedSubpackageEntry[]
  styleEntries: Entry[]
  defaultStyleCandidates: string[]
  preprocess?: boolean | undefined
  collectTargets?: (root: string, entry: SharedSubpackageEntry, sourceRoot: string) => SubpackageTargets
  normalizeStyleCandidates?: (value: string | string[] | undefined) => string[]
  resolveOutputName?: (stylePath: string, outputName: string | undefined) => string
  resolveSourceRelativePath?: (root: string, candidate: string, stylePath: string) => string
  isStyleFile?: (filePath: string) => boolean
}

const LEADING_DOTS_SLASHES_RE = /^[./\\]+/
const SOURCE_MODULE_RE = /\.[^.]+\.(?:vue|tsx|jsx|ts|js)$/

function normalizePagePath(value: unknown): string | undefined {
  const raw = typeof value === 'string'
    ? value
    : value && typeof value === 'object' && 'path' in value && typeof (value as { path?: unknown }).path === 'string'
      ? (value as { path: string }).path
      : undefined
  if (!raw) {
    return undefined
  }
  const normalized = ensurePosix(raw).replace(LEADING_DOTS_SLASHES_RE, '')
  return normalized.length > 0 ? normalized : undefined
}

function resolvePageStyleFiles(entry: SharedSubpackageEntry): string[] {
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
  entry: SharedSubpackageEntry,
  sourceRoot: string,
): ResolvedSubpackageTargetSourceFile[] {
  const root = entry.root ? normalizeRoot(entry.root) : ''
  if (!root || !Array.isArray(entry.pages)) {
    return []
  }

  return entry.pages
    .map(normalizePagePath)
    .filter((page): page is string => Boolean(page))
    .flatMap((page) => {
      const sourceAbsolutePath = path.resolve(sourceRoot, root, `${page}.css`)
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
  sourceRoot: string,
): ResolvedSubpackageTargetSourceFile[] {
  const componentsDir = path.resolve(sourceRoot, root, 'components')
  return walkFiles(componentsDir, fileName => fileName.endsWith('.css')).map(sourceAbsolutePath => ({
    fileName: ensurePosix(path.relative(sourceRoot, sourceAbsolutePath)),
    sourceAbsolutePath,
  }))
}

function resolveSourceModules(
  root: string,
  sourceRoot: string,
): ResolvedSubpackageTargetSourceModule[] {
  const directories = [
    path.resolve(sourceRoot, root, 'pages'),
    path.resolve(sourceRoot, root, 'components'),
  ]
  return directories.flatMap(directory =>
    walkFiles(directory, fileName => SOURCE_MODULE_RE.test(fileName)).map((sourceAbsolutePath) => {
      const fileName = ensurePosix(path.relative(sourceRoot, sourceAbsolutePath))
      return {
        fileName,
        styleFileName: removeStyleExt(fileName),
        sourceAbsolutePath,
      }
    }),
  )
}

function resolveReferenceOutputName(fileName: string): string {
  const normalized = ensurePosix(fileName)
  return path.posix.basename(normalized, path.posix.extname(normalized)) || 'app'
}

function shouldUseAppStyleReference(styleEntry: SharedStyleEntry): boolean {
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
  resolvedEntry: ResolvedSubpackageStyleScope,
  styleEntry: SharedStyleEntry,
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

export function createDefaultStyleEntry<Entry extends SharedStyleEntry>(
  config: SharedStyleEntry,
  sourceFileName: string[],
): Entry {
  const entry: SharedStyleEntry = { sourceFileName }
  for (const key of ['outputName', 'files', 'include', 'exclude', 'generate', 'preprocess'] as const) {
    if (config[key] !== undefined) {
      entry[key] = config[key] as never
    }
  }
  return entry as Entry
}

export function collectPageTargets(
  _root: string,
  entry: SharedSubpackageEntry,
  sourceRoot: string,
): SubpackageTargets {
  return {
    targetFiles: resolvePageStyleFiles(entry),
    targetSourceFiles: resolvePageStyleSourceFiles(entry, sourceRoot),
  }
}

export function collectFrameworkTargets(
  root: string,
  entry: SharedSubpackageEntry,
  sourceRoot: string,
): SubpackageTargets {
  const componentStyleSourceFiles = resolveComponentStyleSourceFiles(root, sourceRoot)
  return {
    targetFiles: [
      ...resolvePageStyleFiles(entry),
      ...componentStyleSourceFiles.map(file => removeStyleExt(file.fileName)),
    ],
    targetSourceFiles: [
      ...resolvePageStyleSourceFiles(entry, sourceRoot),
      ...componentStyleSourceFiles,
    ],
    sourceModules: resolveSourceModules(root, sourceRoot),
  }
}

export function resolveSubpackageStyleScopes<Entry extends SharedStyleEntry>(
  options: ResolveSubpackageScopesOptions<Entry>,
): ResolvedSubpackageStyleScope[] {
  const resolved: ResolvedSubpackageStyleScope[] = []

  for (const subPackage of options.subPackages) {
    const root = subPackage.root ? normalizeRoot(subPackage.root) : ''
    if (!root) {
      continue
    }
    const targets = options.collectTargets?.(root, subPackage, options.sourceRoot) ?? {}

    for (const styleEntry of options.styleEntries) {
      if (shouldUseAppStyleReference(styleEntry)) {
        const referenceFileName = ensurePosix(styleEntry.referenceFileName ?? 'app.css')
        const resolvedEntry: ResolvedSubpackageStyleScope = {
          root: ensurePosix(root),
          sourceRelativePath: referenceFileName,
          sourceAbsolutePath: path.resolve(options.sourceRoot, referenceFileName),
          referenceFileName,
          outputName: styleEntry.outputName ?? resolveReferenceOutputName(referenceFileName),
          preprocess: false,
          framework: options.framework,
          ...targets,
        }
        applyStyleEntryOptions(resolvedEntry, styleEntry)
        resolved.push(resolvedEntry)
        continue
      }

      const configuredCandidates: string[] = options.normalizeStyleCandidates
        ? options.normalizeStyleCandidates(styleEntry.sourceFileName)
        : toArray(styleEntry.sourceFileName)
            .filter((candidate: unknown): candidate is string => typeof candidate === 'string' && candidate.length > 0)
      const candidates = configuredCandidates.length > 0
        ? configuredCandidates
        : options.defaultStyleCandidates
      const matchedStyle = candidates
        .map((candidate: string) => ({
          candidate,
          stylePath: path.resolve(options.sourceRoot, root, candidate),
        }))
        .find(({ stylePath }) => options.isStyleFile?.(stylePath) ?? fs.existsSync(stylePath))
      if (!matchedStyle) {
        continue
      }

      const { candidate, stylePath } = matchedStyle
      const defaultOutputName = path.basename(stylePath, path.extname(stylePath))
      const resolvedEntry: ResolvedSubpackageStyleScope = {
        root: ensurePosix(root),
        sourceRelativePath: options.resolveSourceRelativePath?.(root, candidate, stylePath)
          ?? ensurePosix(path.relative(options.sourceRoot, stylePath)),
        sourceAbsolutePath: stylePath,
        outputName: options.resolveOutputName?.(stylePath, styleEntry.outputName)
          ?? styleEntry.outputName
          ?? defaultOutputName,
        preprocess: (styleEntry.preprocess ?? options.preprocess) !== false,
        framework: options.framework,
        ...targets,
      }
      applyStyleEntryOptions(resolvedEntry, styleEntry)
      resolved.push(resolvedEntry)
    }
  }

  return resolved
}
