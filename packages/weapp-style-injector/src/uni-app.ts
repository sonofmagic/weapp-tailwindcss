import type { PerFileImportResolver } from './core'
import type { ResolvedSubpackageStyleScope, ResolvedSubpackageTargetSourceFile, ResolvedSubpackageTargetSourceModule, SubpackageStyleGenerator } from './subpackage'

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import {
  ensurePosix,
  normalizeRelativeImport,
  normalizeRoot,
  toArray,
} from './utils'

const LEADING_DOTS_SLASHES_RE = /^[./\\]+/

export interface UniAppSubPackageConfig {
  pagesJsonPath: string
  sourceFileName?: string | string[]
  outputName?: string
  files?: string | string[]
  include?: string | string[]
  exclude?: string | string[]
  generate?: SubpackageStyleGenerator
  styleEntries?: UniAppSubPackageStyleEntry | UniAppSubPackageStyleEntry[]
  /**
   * @deprecated Use sourceFileName instead.
   */
  indexFileName?: string | string[]
  preprocess?: boolean
}

export interface UniAppSubPackageStyleEntry {
  sourceFileName: string
  outputName?: string
  files?: string | string[]
  include?: string | string[]
  exclude?: string | string[]
  sourceInclude?: string | string[]
  sourceExclude?: string | string[]
  generate?: SubpackageStyleGenerator
  preprocess?: boolean
}

export interface UniAppManualStyleConfig {
  style: string
  scope: string | string[]
  files?: string | string[]
  include?: string | string[]
  exclude?: string | string[]
  outputName?: string
  generate?: SubpackageStyleGenerator
  output?: string
  preprocess?: boolean
}

export type UniAppStyleScopeInput
  = | UniAppSubPackageConfig
    | (UniAppManualStyleConfig & { type?: 'manual' })
    | (UniAppSubPackageConfig & { type?: 'sub-packages' })

export type ResolvedSubPackage = ResolvedSubpackageStyleScope

function stripJsonComments(input: string): string {
  let output = ''
  let insideString = false
  let insideSingleLineComment = false
  let insideMultiLineComment = false

  for (let i = 0; i < input.length; i++) {
    const current = input[i]
    const next = input[i + 1]

    if (insideSingleLineComment) {
      if (current === '\n') {
        insideSingleLineComment = false
        output += current
      }
      continue
    }

    if (insideMultiLineComment) {
      if (current === '*' && next === '/') {
        insideMultiLineComment = false
        i++
      }
      continue
    }

    if (current === '"' && input[i - 1] !== '\\') {
      insideString = !insideString
      output += current
      continue
    }

    if (!insideString && current === '/' && next === '/') {
      insideSingleLineComment = true
      i++
      continue
    }

    if (!insideString && current === '/' && next === '*') {
      insideMultiLineComment = true
      i++
      continue
    }

    output += current
  }

  return output
}

function safeReadJsonFile(filePath: string): Record<string, unknown> | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    const sanitized = stripJsonComments(raw)
    return JSON.parse(sanitized)
  }
  catch {
    return null
  }
}

const FALLBACK_INDEX_FILE_NAMES = [
  'index.wxss',
  'index.css',
  'index.scss',
  'index.sass',
  'index.less',
  'index.styl',
  'index.stylus',
]

function normalizeCandidateList(candidate: UniAppSubPackageConfig['sourceFileName']): string[] {
  const list = candidate
    ? toArray(candidate)
    : FALLBACK_INDEX_FILE_NAMES

  return list
    .map(entry => entry?.trim())
    .filter((entry): entry is string => Boolean(entry && entry.length > 0))
}

function resolveOutputName(fileName: string, outputName?: string): string {
  if (outputName) {
    return path.posix.basename(ensurePosix(outputName), path.posix.extname(outputName))
  }

  return path.basename(fileName, path.extname(fileName))
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
  const normalized = ensurePosix(raw).replace(LEADING_DOTS_SLASHES_RE, '')
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

function resolveSubPackages(config: UniAppSubPackageConfig): ResolvedSubPackage[] {
  const pagesJsonPath = path.resolve(config.pagesJsonPath)

  if (!fs.existsSync(pagesJsonPath) || !fs.statSync(pagesJsonPath).isFile()) {
    return []
  }

  const data = safeReadJsonFile(pagesJsonPath)
  if (!data) {
    return []
  }

  const subPackages = Array.isArray((data as { subPackages?: unknown }).subPackages)
    ? (data as { subPackages: Array<{ root?: string, pages?: unknown }> }).subPackages
    : []

  const baseDir = path.dirname(pagesJsonPath)
  const entries = toArray(config.styleEntries)
  const styleEntries = entries.length > 0
    ? entries
    : [{
        sourceFileName: normalizeCandidateList(config.sourceFileName ?? config.indexFileName),
        outputName: config.outputName,
        files: config.files,
        include: config.include,
        exclude: config.exclude,
        sourceInclude: undefined,
        sourceExclude: undefined,
        generate: config.generate,
        preprocess: config.preprocess,
      }]

  const resolved: ResolvedSubPackage[] = []

  for (const entry of subPackages) {
    if (!entry?.root) {
      continue
    }

    const normalizedRoot = normalizeRoot(entry.root)
    if (!normalizedRoot) {
      continue
    }

    for (const styleEntry of styleEntries) {
      const candidates = normalizeCandidateList(styleEntry.sourceFileName)
      let matchedFileName: string | undefined
      let matchedAbsolutePath: string | undefined

      for (const candidate of candidates) {
        const indexAbsolutePath = path.resolve(baseDir, normalizedRoot, candidate)
        if (fs.existsSync(indexAbsolutePath) && fs.statSync(indexAbsolutePath).isFile()) {
          matchedFileName = candidate
          matchedAbsolutePath = indexAbsolutePath
          break
        }
      }

      if (!matchedFileName || !matchedAbsolutePath) {
        continue
      }

      const sourceRelativePath = ensurePosix(path.join(normalizedRoot, matchedFileName))

      const resolvedEntry: ResolvedSubPackage = {
        root: ensurePosix(normalizedRoot),
        sourceRelativePath,
        sourceAbsolutePath: matchedAbsolutePath,
        outputName: resolveOutputName(matchedFileName, styleEntry.outputName),
        preprocess: (styleEntry.preprocess ?? config.preprocess) !== false,
        framework: 'uni-app',
      }
      const componentStyleSourceFiles = resolveComponentStyleSourceFiles(normalizedRoot, baseDir)
      resolvedEntry.targetFiles = [
        ...resolvePageStyleFiles(entry),
        ...componentStyleSourceFiles.map(file => removeStyleExt(file.fileName)),
      ]
      resolvedEntry.targetSourceFiles = [
        ...resolvePageStyleSourceFiles(entry, baseDir),
        ...componentStyleSourceFiles,
      ]
      resolvedEntry.sourceModules = resolveSourceModules(normalizedRoot, baseDir)
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
      resolved.push(resolvedEntry)
    }
  }

  return resolved
}

export function createUniAppSubPackageImportResolver(
  configs: UniAppSubPackageConfig | UniAppSubPackageConfig[] | null | undefined,
  manualScopes?: UniAppManualStyleConfig | UniAppManualStyleConfig[] | null | undefined,
): PerFileImportResolver | undefined {
  const subPackages = resolveUniAppStyleScopes(configs, manualScopes)
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

function normalizeScopeRoot(root: string): string {
  return normalizeRoot(root)
}

function resolveManualStyleScopes(
  configs: UniAppManualStyleConfig | UniAppManualStyleConfig[] | null | undefined,
): ResolvedSubPackage[] {
  const cwd = process.cwd()
  const list = toArray(configs)
  if (list.length === 0) {
    return []
  }

  const resolved: ResolvedSubPackage[] = []

  for (const entry of list) {
    if (!entry?.style || !entry.scope) {
      continue
    }

    const scopeList = toArray(entry.scope)
      .map(scope => (typeof scope === 'string' ? normalizeScopeRoot(scope) : ''))
      .filter((scope): scope is string => Boolean(scope && scope.length > 0))

    if (scopeList.length === 0) {
      continue
    }

    const sourceAbsolutePath = path.resolve(cwd, entry.style)
    if (!fs.existsSync(sourceAbsolutePath) || !fs.statSync(sourceAbsolutePath).isFile()) {
      continue
    }

    const sourceRelativePath = ensurePosix(path.relative(cwd, sourceAbsolutePath))
    const normalizedBaseFileName = resolveOutputName(path.basename(entry.output ?? entry.style), entry.outputName)
    const trimmedOutput = entry.output
      ? ensurePosix(entry.output.replace(LEADING_DOTS_SLASHES_RE, ''))
      : null
    const normalizedOutputName = trimmedOutput ? resolveOutputName(trimmedOutput, entry.outputName) : null
    const preprocess = entry.preprocess !== false

    for (const scope of scopeList) {
      const resolvedEntry: ResolvedSubPackage = {
        root: ensurePosix(scope),
        sourceRelativePath,
        sourceAbsolutePath,
        outputName: normalizedOutputName ?? normalizedBaseFileName,
        preprocess,
        framework: 'uni-app',
      }
      if (entry.files !== undefined) {
        resolvedEntry.files = toArray(entry.files)
      }
      if (entry.include !== undefined) {
        resolvedEntry.include = entry.include
      }
      if (entry.exclude !== undefined) {
        resolvedEntry.exclude = entry.exclude
      }
      if (entry.generate) {
        resolvedEntry.generate = entry.generate
      }
      resolved.push(resolvedEntry)
    }
  }

  return resolved
}

export function resolveUniAppStyleScopes(
  subPackageConfigs: UniAppSubPackageConfig | UniAppSubPackageConfig[] | null | undefined,
  manualConfigs: UniAppManualStyleConfig | UniAppManualStyleConfig[] | null | undefined,
): ResolvedSubPackage[] {
  const resolvedSubPackages = toArray(subPackageConfigs).flatMap(resolveSubPackages)
  const resolvedManual = resolveManualStyleScopes(manualConfigs)

  if (resolvedSubPackages.length === 0 && resolvedManual.length === 0) {
    return []
  }

  const merged: ResolvedSubPackage[] = []
  const seen = new Set<string>()

  for (const entry of [...resolvedSubPackages, ...resolvedManual]) {
    const key = `${entry.root}||${entry.outputName}||${entry.sourceRelativePath}||${JSON.stringify(entry.files ?? null)}||${JSON.stringify(entry.include ?? null)}||${JSON.stringify(entry.exclude ?? null)}`
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    merged.push(entry)
  }

  return merged
}

export function splitUniAppStyleScopes(
  scopes: UniAppStyleScopeInput | UniAppStyleScopeInput[] | null | undefined,
): {
  subPackages: UniAppSubPackageConfig[]
  manual: UniAppManualStyleConfig[]
} {
  const list = toArray(scopes)
  const subPackages: UniAppSubPackageConfig[] = []
  const manual: UniAppManualStyleConfig[] = []

  for (const entry of list) {
    if (!entry || typeof entry !== 'object') {
      continue
    }

    if ('style' in entry) {
      const config: UniAppManualStyleConfig = {
        style: entry.style,
        scope: entry.scope,
      }
      if (entry.output !== undefined) {
        config.output = entry.output
      }
      if (entry.files !== undefined) {
        config.files = entry.files
      }
      if (entry.include !== undefined) {
        config.include = entry.include
      }
      if (entry.exclude !== undefined) {
        config.exclude = entry.exclude
      }
      if (entry.preprocess !== undefined) {
        config.preprocess = entry.preprocess
      }
      manual.push(config)
      continue
    }

    if ('pagesJsonPath' in entry) {
      const config: UniAppSubPackageConfig = {
        pagesJsonPath: entry.pagesJsonPath,
      }
      if (entry.indexFileName !== undefined) {
        config.indexFileName = entry.indexFileName
      }
      if (entry.sourceFileName !== undefined) {
        config.sourceFileName = entry.sourceFileName
      }
      if (entry.outputName !== undefined) {
        config.outputName = entry.outputName
      }
      if (entry.files !== undefined) {
        config.files = entry.files
      }
      if (entry.include !== undefined) {
        config.include = entry.include
      }
      if (entry.exclude !== undefined) {
        config.exclude = entry.exclude
      }
      if (entry.generate !== undefined) {
        config.generate = entry.generate
      }
      if (entry.preprocess !== undefined) {
        config.preprocess = entry.preprocess
      }
      if (entry.styleEntries !== undefined) {
        config.styleEntries = entry.styleEntries
      }
      subPackages.push(config)
    }
  }

  return {
    subPackages,
    manual,
  }
}
