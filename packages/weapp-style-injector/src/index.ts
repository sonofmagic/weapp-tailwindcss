import type { Plugin } from 'vite'
import { Buffer } from 'node:buffer'
import micromatch from 'micromatch'

export type GlobPattern = string

export interface WeappStyleInjectorOptions {
  include?: GlobPattern | GlobPattern[]
  exclude?: GlobPattern | GlobPattern[]
  imports?: string[]
  dedupe?: boolean
}

const PLUGIN_NAME = 'weapp-style-injector'
const DEFAULT_INCLUDE = ['**/*.wxss', '**/*.css']

function toArray<T>(value: T | T[] | undefined): T[] {
  if (typeof value === 'undefined') {
    return []
  }
  return Array.isArray(value) ? value : [value]
}

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
  return typeof source === 'string'
    ? source
    : Buffer.from(source).toString('utf8')
}

export function weappStyleInjector(options: WeappStyleInjectorOptions = {}): Plugin {
  const includePatterns = toArray(options.include ?? DEFAULT_INCLUDE)
  const excludePatterns = toArray(options.exclude)
  const imports = toArray(options.imports)
  const dedupe = options.dedupe !== false

  const shouldProcess = (fileName: string) => {
    if (includePatterns.length > 0 && !includePatterns.some(pattern => micromatch.isMatch(fileName, pattern))) {
      return false
    }
    if (excludePatterns.length > 0 && excludePatterns.some(pattern => micromatch.isMatch(fileName, pattern))) {
      return false
    }
    return true
  }

  return {
    name: PLUGIN_NAME,
    apply: 'build',
    enforce: 'post',
    async generateBundle(_, bundle) {
      if (imports.length === 0) {
        return
      }

      const normalizedImports = Array.from(
        new Set(
          imports
            .map(createImportStatement)
            .filter(Boolean),
        ),
      )

      if (normalizedImports.length === 0) {
        return
      }

      for (const [fileName, output] of Object.entries(bundle)) {
        if (output.type !== 'asset') {
          continue
        }
        if (!shouldProcess(fileName)) {
          continue
        }

        const originalSource = normalizeAssetSource(output.source ?? '')

        const statementsToInject: string[] = []
        for (const statement of normalizedImports) {
          if (!dedupe || !hasImportStatement(originalSource, statement)) {
            statementsToInject.push(statement)
          }
        }

        if (statementsToInject.length === 0) {
          continue
        }

        const prefix = `${statementsToInject.join('\n')}`
        const separator = originalSource.length > 0 ? '\n' : ''
        output.source = `${prefix}${separator}${originalSource}`
      }
    },
  }
}

export default weappStyleInjector
