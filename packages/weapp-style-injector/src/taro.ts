import type { PerFileImportResolver } from './core'

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
  indexFileNames?: string | string[]
}

interface ResolvedSubPackage {
  root: string
  indexRelativePath: string
}

const DEFAULT_STYLE_FILENAMES = ['index.scss', 'index.css', 'index.less', 'index.sass', 'index.styl']

function stripImports(source: string): string {
  return source.replace(/^\s*import[\s\S]*?;$/gm, '')
}

function stripTypeAssertions(source: string): string {
  return source.replace(/\s+as\s+const/g, '')
}

function stripTypeDeclarations(source: string): string {
  return source.replace(/^\s*declare\s+[^\n]*\n?/gm, '')
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
      .replace(/export\s+default\s+defineAppConfig\s*\(/, 'module.exports = defineAppConfig(')
      .replace(/export\s+default\s+/, 'module.exports = ')

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

function resolveSubPackages(config: TaroSubPackageConfig): ResolvedSubPackage[] {
  const appConfigPath = path.resolve(config.appConfigPath)
  const appConfig = loadAppConfigModule(appConfigPath)

  if (!appConfig) {
    return []
  }

  // eslint-disable-next-line dot-notation
  const primary = ensureArray((appConfig as Record<string, unknown>)['subPackages'] as Array<{ root?: string }> | undefined)
  // eslint-disable-next-line dot-notation
  const secondary = ensureArray((appConfig as Record<string, unknown>)['subpackages'] as Array<{ root?: string }> | undefined)
  const subPackagesInput = [...primary, ...secondary]

  if (subPackagesInput.length === 0) {
    return []
  }

  const baseDir = path.dirname(appConfigPath)
  const styleFileNames = ensureArray(config.indexFileNames).flatMap(name => (typeof name === 'string' && name.length > 0 ? [name] : []))
  const styleCandidates = styleFileNames.length > 0 ? styleFileNames : DEFAULT_STYLE_FILENAMES

  const resolved: ResolvedSubPackage[] = []

  for (const entry of subPackagesInput) {
    if (!entry?.root) {
      continue
    }

    const normalizedRoot = normalizeRoot(entry.root)
    if (!normalizedRoot) {
      continue
    }

    const stylePath = styleCandidates
      .map(candidate => path.resolve(baseDir, normalizedRoot, candidate))
      .find(candidatePath => fs.existsSync(candidatePath))

    if (!stylePath) {
      continue
    }

    resolved.push({
      root: ensurePosix(normalizedRoot),
      indexRelativePath: ensurePosix(path.relative(baseDir, stylePath)),
    })
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
