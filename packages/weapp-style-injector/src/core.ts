import { Buffer } from 'node:buffer'
import micromatch from 'micromatch'
import { toArray } from './utils'

export type GlobPattern = string

export type PerFileImportResolver = (fileName: string) => GlobPattern | GlobPattern[] | null | undefined

export interface WeappStyleInjectorOptions {
  include?: GlobPattern | GlobPattern[]
  exclude?: GlobPattern | GlobPattern[]
  imports?: string[]
  perFileImports?: PerFileImportResolver
  dedupe?: boolean
}

export interface InjectionResult {
  changed: boolean
  content: string
}

export interface StyleInjector {
  hasImports: boolean
  shouldProcess: (fileName: string) => boolean
  inject: (fileName: string, source: string | Uint8Array) => InjectionResult
}

export const PLUGIN_NAME = 'weapp-style-injector'
export const DEFAULT_INCLUDE = ['**/*.wxss', '**/*.css']

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function createImportStatement(entry: string): string {
  const trimmed = entry.trim()
  if (trimmed.length === 0) {
    return ''
  }
  if (/^@import\s+/i.test(trimmed)) {
    return trimmed.endsWith(';') ? trimmed : `${trimmed};`
  }
  return `@import "${trimmed}";`
}

function hasImportStatement(source: string, entry: string): boolean {
  const trimmed = entry.trim()
  if (trimmed.length === 0) {
    return true
  }
  if (/^@import\s+/i.test(trimmed)) {
    const normalized = trimmed.endsWith(';') ? trimmed : `${trimmed};`
    return source.includes(normalized)
  }
  const escaped = escapeRegExp(trimmed)
  const importPattern = new RegExp(`@import\\s+(?:url\\()?['"]${escaped}['"]\\)?`, 'i')
  return importPattern.test(source)
}

function normalizeAssetSource(source: string | Uint8Array): string {
  if (typeof source === 'undefined') {
    return ''
  }
  return typeof source === 'string'
    ? source
    : Buffer.from(source).toString('utf8')
}

export function createStyleInjector(options: WeappStyleInjectorOptions = {}): StyleInjector {
  const includePatterns = toArray(options.include ?? DEFAULT_INCLUDE)
  const excludePatterns = toArray(options.exclude)
  const imports = toArray(options.imports)
  const dedupe = options.dedupe !== false
  const perFileImportsResolver = options.perFileImports
  const perFileCache = new Map<string, string[]>()

  const shouldProcess = (fileName: string) => {
    if (includePatterns.length > 0 && !includePatterns.some(pattern => micromatch.isMatch(fileName, pattern))) {
      return false
    }
    if (excludePatterns.length > 0 && excludePatterns.some(pattern => micromatch.isMatch(fileName, pattern))) {
      return false
    }
    return true
  }

  const normalizedImports = Array.from(
    new Set(
      imports
        .map(createImportStatement)
        .filter(Boolean),
    ),
  )

  const hasImports = normalizedImports.length > 0 || typeof perFileImportsResolver === 'function'

  const resolvePerFileImports = (fileName: string) => {
    if (typeof perFileImportsResolver !== 'function') {
      return []
    }

    if (perFileCache.has(fileName)) {
      return perFileCache.get(fileName)!
    }

    const resolved = toArray(perFileImportsResolver(fileName))
      .map(createImportStatement)
      .filter(Boolean)

    const unique = Array.from(new Set(resolved))
    perFileCache.set(fileName, unique)
    return unique
  }

  const inject = (fileName: string, source: string | Uint8Array): InjectionResult => {
    const originalSource = normalizeAssetSource(source)

    if (!hasImports) {
      return {
        changed: false,
        content: originalSource,
      }
    }

    const perFileImports = resolvePerFileImports(fileName)
    const combinedImports = perFileImports.length > 0
      ? Array.from(new Set([...normalizedImports, ...perFileImports]))
      : normalizedImports

    const statementsToInject = dedupe
      ? combinedImports.filter(statement => !hasImportStatement(originalSource, statement))
      : combinedImports

    if (statementsToInject.length === 0) {
      return {
        changed: false,
        content: originalSource,
      }
    }

    const prefix = statementsToInject.join('\n')
    const separator = originalSource.length > 0 ? '\n' : ''

    return {
      changed: true,
      content: `${prefix}${separator}${originalSource}`,
    }
  }

  return {
    hasImports,
    shouldProcess,
    inject,
  }
}
