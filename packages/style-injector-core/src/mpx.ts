import type { ResolvedSubpackageStyleScope, ResolvedSubpackageTargetSourceFile, SubpackageStyleGenerator } from './subpackage'

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { ensurePosix, normalizeRoot, toArray } from './utils'

export interface MpxSubPackageConfig {
  appPath: string
  sourceRoot?: string
  sourceFileName?: string | string[]
  outputName?: string
  files?: string | string[]
  include?: string | string[]
  exclude?: string | string[]
  generate?: SubpackageStyleGenerator
  styleEntries?: MpxSubPackageStyleEntry | MpxSubPackageStyleEntry[]
  preprocess?: boolean
}

export interface MpxSubPackageStyleEntry {
  sourceFileName: string
  outputName?: string
  files?: string | string[]
  include?: string | string[]
  exclude?: string | string[]
  generate?: SubpackageStyleGenerator
  preprocess?: boolean
}

export type ResolvedMpxSubPackage = ResolvedSubpackageStyleScope

const DEFAULT_STYLE_FILENAMES = ['index.css', 'index.wxss', 'index.scss', 'index.less', 'index.sass', 'index.styl']
const SCRIPT_RE = /<script([^>]*)>([\s\S]*?)<\/script>/gi
const JSON_SCRIPT_TYPE_RE = /\btype=["']application\/json["']/i

function extractJsonScript(source: string): string | undefined {
  SCRIPT_RE.lastIndex = 0
  for (let match = SCRIPT_RE.exec(source); match; match = SCRIPT_RE.exec(source)) {
    if (JSON_SCRIPT_TYPE_RE.test(match[1] ?? '')) {
      return match[2]
    }
  }
  return undefined
}

function loadAppConfig(filePath: string): Record<string, unknown> | null {
  const resolvedPath = path.resolve(filePath)
  if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
    return null
  }

  try {
    const raw = fs.readFileSync(resolvedPath, 'utf8')
    const jsonSource = resolvedPath.endsWith('.mpx')
      ? extractJsonScript(raw)
      : raw
    if (!jsonSource) {
      return null
    }
    return JSON.parse(jsonSource) as Record<string, unknown>
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

export function resolveMpxSubPackages(config: MpxSubPackageConfig): ResolvedMpxSubPackage[] {
  const appPath = path.resolve(config.appPath)
  const appConfig = loadAppConfig(appPath)

  if (!appConfig) {
    return []
  }

  const primary = ensureArray((appConfig as Record<string, unknown>)['subPackages'] as Array<{ root?: string, pages?: unknown }> | undefined)
  const secondary = ensureArray((appConfig as Record<string, unknown>)['subpackages'] as Array<{ root?: string, pages?: unknown }> | undefined)
  const subPackagesInput = [...primary, ...secondary]

  if (subPackagesInput.length === 0) {
    return []
  }

  const sourceRoot = path.resolve(config.sourceRoot ?? path.dirname(appPath))
  const entries = toArray(config.styleEntries)
  const styleEntries = entries.length > 0
    ? entries
    : [{
        sourceFileName: ensureArray(config.sourceFileName),
        outputName: config.outputName,
        files: config.files,
        include: config.include,
        exclude: config.exclude,
        generate: config.generate,
        preprocess: config.preprocess,
      }]

  const resolved: ResolvedMpxSubPackage[] = []

  for (const entry of subPackagesInput) {
    if (!entry?.root) {
      continue
    }

    const normalizedRoot = normalizeRoot(entry.root)
    if (!normalizedRoot) {
      continue
    }

    for (const styleEntry of styleEntries) {
      const styleFileNames = ensureArray(styleEntry.sourceFileName).flatMap(name => (typeof name === 'string' && name.length > 0 ? [name] : []))
      const styleCandidates = styleFileNames.length > 0 ? styleFileNames : DEFAULT_STYLE_FILENAMES
      const stylePath = styleCandidates
        .map(candidate => path.resolve(sourceRoot, normalizedRoot, candidate))
        .find(candidatePath => fs.existsSync(candidatePath))

      if (!stylePath) {
        continue
      }

      const resolvedEntry: ResolvedMpxSubPackage = {
        root: ensurePosix(normalizedRoot),
        sourceRelativePath: ensurePosix(path.relative(sourceRoot, stylePath)),
        sourceAbsolutePath: stylePath,
        outputName: styleEntry.outputName ?? path.basename(stylePath, path.extname(stylePath)),
        preprocess: (styleEntry.preprocess ?? config.preprocess) !== false,
        framework: 'mpx',
        targetFiles: resolvePageStyleFiles(entry),
        targetSourceFiles: resolvePageStyleSourceFiles(entry, sourceRoot),
      }
      if (toArray(styleEntry.files).length > 0) {
        resolvedEntry.files = toArray(styleEntry.files)
      }
      if (styleEntry.include !== undefined) {
        resolvedEntry.include = styleEntry.include
      }
      if (styleEntry.exclude !== undefined) {
        resolvedEntry.exclude = styleEntry.exclude
      }
      if (styleEntry.generate) {
        resolvedEntry.generate = styleEntry.generate
      }
      resolved.push(resolvedEntry)
    }
  }

  return resolved
}

export function resolveDefaultMpxAppPaths(): string[] {
  const cwd = process.cwd()
  return [
    path.resolve(cwd, 'src/app.mpx'),
    path.resolve(cwd, 'app.mpx'),
    path.resolve(cwd, 'src/app.json'),
    path.resolve(cwd, 'app.json'),
  ]
}
