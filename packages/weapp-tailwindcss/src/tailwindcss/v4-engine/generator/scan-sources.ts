import type { TailwindV4GenerateOptions, TailwindV4ResolvedSource, TailwindV4SourcePattern } from '../types'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { postcss } from '@weapp-tailwindcss/postcss'
import { resolveCssSourceEntries, resolveTailwindSourceEntry } from '@/tailwindcss/source-scan'
import { isTailwindCssImport, parseImportSourceParam } from '../css-import'

type TailwindV4ResolvedScanSources = TailwindV4GenerateOptions['scanSources']

const TAILWIND_V4_DEFAULT_IGNORED_SOURCE_PATTERNS = [
  '**/.git/**',
  '**/.hg/**',
  '**/.jj/**',
  '**/.next/**',
  '**/.parcel-cache/**',
  '**/.pnpm-store/**',
  '**/.svelte-kit/**',
  '**/.svn/**',
  '**/.turbo/**',
  '**/.venv/**',
  '**/.vercel/**',
  '**/.yarn/**',
  '**/__pycache__/**',
  '**/node_modules/**',
  '**/venv/**',
  '**/*.less',
  '**/*.lock',
  '**/*.sass',
  '**/*.scss',
  '**/*.styl',
  '**/*.log',
  '**/tailwind.config.js',
  '**/tailwind.config.cjs',
  '**/tailwind.config.mjs',
  '**/tailwind.config.ts',
  '**/tailwind.config.cts',
  '**/tailwind.config.mts',
  '**/tailwind.config.*.js',
  '**/tailwind.config.*.cjs',
  '**/tailwind.config.*.mjs',
  '**/tailwind.config.*.ts',
  '**/tailwind.config.*.cts',
  '**/tailwind.config.*.mts',
  '**/package-lock.json',
  '**/pnpm-lock.yaml',
  '**/bun.lockb',
  '**/.gitignore',
  '**/.env',
  '**/.env.*',
]

function resolveSourceBase(base: string, sourcePath: string) {
  return path.isAbsolute(sourcePath) ? sourcePath : path.resolve(base, sourcePath)
}

function createDefaultIgnoredScanSources(base: string) {
  return TAILWIND_V4_DEFAULT_IGNORED_SOURCE_PATTERNS.map(pattern => ({
    base,
    pattern,
    negated: true,
  }))
}

function normalizeCssDefinedScanSources(base: string, entries: TailwindV4SourcePattern[]) {
  return entries.length > 0 && entries.every(entry => entry.negated)
    ? [
        {
          base,
          pattern: '**/*',
          negated: false,
        },
        ...entries,
      ]
    : entries
}

function resolveDefaultSourceBase(source: Pick<TailwindV4ResolvedSource, 'base'> & Partial<Pick<TailwindV4ResolvedSource, 'projectRoot' | 'cwd'>>) {
  return source.projectRoot ?? source.cwd ?? source.base
}

async function resolveCssDefinedScanSources(source: Pick<TailwindV4ResolvedSource, 'base' | 'css' | 'dependencies'> & Partial<Pick<TailwindV4ResolvedSource, 'projectRoot' | 'cwd'>>): Promise<TailwindV4ResolvedScanSources | undefined> {
  let importSourceBase: string | undefined
  let hasSourceNone = false
  let hasTailwindImport = false
  const sourcePatterns: TailwindV4SourcePattern[] = []
  const definitions: Array<{ css: string, base: string, from?: string }> = [{
    css: source.css,
    base: source.base,
    from: source.dependencies[0],
  }]
  for (const dependency of source.dependencies.slice(1)) {
    if (!existsSync(dependency)) {
      continue
    }
    try {
      definitions.push({
        css: readFileSync(dependency, 'utf8'),
        base: path.dirname(dependency),
        from: dependency,
      })
    }
    catch {
    }
  }
  for (const definition of definitions) {
    let root: postcss.Root
    try {
      root = postcss.parse(definition.css, { from: definition.from })
    }
    catch {
      continue
    }
    root.walkAtRules((rule) => {
      if (rule.name !== 'import' || !isTailwindCssImport(rule.params)) {
        return
      }
      hasTailwindImport = true
      const sourceParam = parseImportSourceParam(rule.params)
      if (sourceParam?.none) {
        hasSourceNone = true
      }
      if (sourceParam?.sourcePath) {
        importSourceBase = resolveSourceBase(definition.base, sourceParam.sourcePath)
      }
    })
    sourcePatterns.push(...await resolveCssSourceEntries(root, definition.base, '**/*'))
  }
  if (!importSourceBase) {
    if (sourcePatterns.length > 0) {
      return [
        ...normalizeCssDefinedScanSources(source.base, sourcePatterns),
        ...createDefaultIgnoredScanSources(source.base),
      ]
    }
    if (hasSourceNone) {
      return false
    }
    if (hasTailwindImport) {
      const defaultBase = resolveDefaultSourceBase(source)
      return [
        await resolveTailwindSourceEntry('.', defaultBase, false, '**/*'),
        ...createDefaultIgnoredScanSources(defaultBase),
      ]
    }
    return undefined
  }

  return [
    await resolveTailwindSourceEntry('.', importSourceBase, false, '**/*'),
    ...sourcePatterns,
    ...createDefaultIgnoredScanSources(importSourceBase),
  ]
}

export async function resolveScanSources(
  source: TailwindV4ResolvedSource,
  scanSources: TailwindV4GenerateOptions['scanSources'],
) {
  if (scanSources !== true) {
    return scanSources
  }
  return await resolveCssDefinedScanSources(source) ?? false
}

export function resolveCompiledSourceRoot(source: Pick<TailwindV4ResolvedSource, 'base' | 'css'>) {
  let root: null | 'none' | { base: string, pattern: string } = null
  try {
    postcss.parse(source.css).walkAtRules('import', (rule) => {
      if (!isTailwindCssImport(rule.params)) {
        return
      }
      const sourceParam = parseImportSourceParam(rule.params)
      if (sourceParam?.none) {
        root = 'none'
        return false
      }
      if (sourceParam?.sourcePath) {
        root = {
          base: source.base,
          pattern: sourceParam.sourcePath,
        }
        return false
      }
    })
  }
  catch {
  }
  return root
}
