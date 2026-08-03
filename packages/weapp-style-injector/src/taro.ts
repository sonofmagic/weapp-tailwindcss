import type { PerFileImportResolver } from './core'
import type { ResolvedSubpackageStyleScope, SubpackageStyleGenerator, SubpackageStyleRules } from './subpackage'

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import vm from 'node:vm'
import {
  normalizeSubpackageStyleRules,
} from './subpackage'
import {
  collectFrameworkTargets,
  createDefaultStyleEntry,
  resolveSubpackageStyleScopes,
} from './subpackage-resolution'
import {
  ensurePosix,
  normalizeRelativeImport,
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
  rules?: SubpackageStyleRules
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

export function resolveTaroSubPackages(config: TaroSubPackageConfig): ResolvedTaroSubPackage[] {
  const appConfigPath = path.resolve(config.appConfigPath)
  const appConfig = loadAppConfigModule(appConfigPath)

  if (!appConfig) {
    return []
  }

  const primary = toArray((appConfig as Record<string, unknown>)['subPackages'] as Array<{ root?: string, pages?: unknown }> | undefined)

  const secondary = toArray((appConfig as Record<string, unknown>)['subpackages'] as Array<{ root?: string, pages?: unknown }> | undefined)
  const subPackagesInput = [...primary, ...secondary]

  if (subPackagesInput.length === 0) {
    return []
  }

  const baseDir = path.dirname(appConfigPath)
  const entries = normalizeSubpackageStyleRules(config.rules)
  const styleRules: TaroSubPackageStyleEntry[] = entries.length > 0
    ? entries
    : [createDefaultStyleEntry<TaroSubPackageStyleEntry>(
        config,
        toArray(config.sourceFileName ?? config.indexFileNames),
      )]

  return resolveSubpackageStyleScopes({
    framework: 'taro',
    sourceRoot: baseDir,
    subPackages: subPackagesInput,
    styleEntries: styleRules,
    defaultStyleCandidates: DEFAULT_STYLE_FILENAMES,
    preprocess: config.preprocess,
    collectTargets: collectFrameworkTargets,
  })
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
