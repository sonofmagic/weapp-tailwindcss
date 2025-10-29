import type { PerFileImportResolver } from './core'

import fs from 'node:fs'
import path from 'node:path'
import {
  ensurePosix,
  normalizeRelativeImport,
  normalizeRoot,
  toArray,
} from './utils'

export interface UniAppSubPackageConfig {
  pagesJsonPath: string
  indexFileName?: string
}

interface ResolvedSubPackage {
  root: string
  indexRelativePath: string
}

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
  const indexFileName = config.indexFileName ?? 'index.css'

  const resolved: ResolvedSubPackage[] = []

  for (const entry of subPackages) {
    if (!entry?.root) {
      continue
    }

    const normalizedRoot = normalizeRoot(entry.root)
    if (!normalizedRoot) {
      continue
    }

    const indexAbsolutePath = path.resolve(baseDir, normalizedRoot, indexFileName)
    if (!fs.existsSync(indexAbsolutePath)) {
      continue
    }

    resolved.push({
      root: ensurePosix(normalizedRoot),
      indexRelativePath: ensurePosix(path.join(normalizedRoot, indexFileName)),
    })
  }

  return resolved
}

export function createUniAppSubPackageImportResolver(
  configs: UniAppSubPackageConfig | UniAppSubPackageConfig[] | null | undefined,
): PerFileImportResolver | undefined {
  const list = toArray(configs)
  if (list.length === 0) {
    return undefined
  }

  const subPackages = list.flatMap(resolveSubPackages)
  if (subPackages.length === 0) {
    return undefined
  }

  return (fileName: string) => {
    const normalizedFileName = ensurePosix(fileName)
    const directory = ensurePosix(path.posix.dirname(normalizedFileName))

    const imports: string[] = []

    for (const subPackage of subPackages) {
      if (normalizedFileName === subPackage.indexRelativePath) {
        continue
      }

      if (!normalizedFileName.startsWith(`${subPackage.root}/`)) {
        continue
      }

      const relativePath = path.posix.relative(directory, subPackage.indexRelativePath)
      if (!relativePath || relativePath === '.') {
        continue
      }

      imports.push(normalizeRelativeImport(relativePath))
    }

    return imports
  }
}
