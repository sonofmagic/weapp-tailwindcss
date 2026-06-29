import type { PerFileImportResolver } from './core'
import type { ResolvedSubpackageStyleScope, SubpackageStyleGenerator } from './subpackage'

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
  generate?: SubpackageStyleGenerator
  /**
   * @deprecated Use sourceFileName instead.
   */
  indexFileName?: string | string[]
  preprocess?: boolean
}

export interface UniAppManualStyleConfig {
  style: string
  scope: string | string[]
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
    ? (data as { subPackages: Array<{ root?: string }> }).subPackages
    : []

  const baseDir = path.dirname(pagesJsonPath)
  const candidates = normalizeCandidateList(config.sourceFileName ?? config.indexFileName)

  const resolved: ResolvedSubPackage[] = []

  for (const entry of subPackages) {
    if (!entry?.root) {
      continue
    }

    const normalizedRoot = normalizeRoot(entry.root)
    if (!normalizedRoot) {
      continue
    }

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
      outputName: resolveOutputName(matchedFileName, config.outputName),
      preprocess: config.preprocess !== false,
      framework: 'uni-app',
    }
    if (config.generate) {
      resolvedEntry.generate = config.generate
    }
    resolved.push(resolvedEntry)
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
    const key = `${entry.root}||${entry.outputName}`
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
      if (entry.generate !== undefined) {
        config.generate = entry.generate
      }
      if (entry.preprocess !== undefined) {
        config.preprocess = entry.preprocess
      }
      subPackages.push(config)
    }
  }

  return {
    subPackages,
    manual,
  }
}
