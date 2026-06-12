import type { TailwindV4GenerateOptions, TailwindV4ResolvedSource, TailwindV4SourcePattern } from '../types'
import path from 'node:path'
import { postcss } from '@weapp-tailwindcss/postcss'
import { resolveCssSourceEntries, resolveTailwindSourceEntry } from '@/tailwindcss/source-scan'

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
  '**/package-lock.json',
  '**/pnpm-lock.yaml',
  '**/bun.lockb',
  '**/.gitignore',
  '**/.env',
  '**/.env.*',
]

function parseImportSourceParam(params: string) {
  const match = /\bsource\(\s*(none|(['"])(.*?)\2)\s*\)/.exec(params)
  if (!match) {
    return undefined
  }
  return {
    none: match[1] === 'none',
    sourcePath: match[3],
  }
}

function parseCssImportSpecifier(params: string) {
  const value = params.trim()
  const quoted = /^(['"])(.*?)\1/.exec(value)
  if (quoted) {
    return quoted[2]
  }

  const url = /^url\(\s*(?:(['"])(.*?)\1|([^'")\s]+))\s*\)/.exec(value)
  return url?.[2] ?? url?.[3]
}

function isTailwindCssImport(params: string) {
  const specifier = parseCssImportSpecifier(params)
  return specifier === 'tailwindcss'
    || specifier?.startsWith('tailwindcss/')
    || specifier?.replaceAll('\\', '/').endsWith('/tailwindcss/index.css')
}

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

async function resolveCssDefinedScanSources(source: Pick<TailwindV4ResolvedSource, 'base' | 'css' | 'dependencies'>): Promise<TailwindV4ResolvedScanSources | undefined> {
  let importSourceBase: string | undefined
  let hasSourceNone = false
  const from = source.dependencies[0]
  let root: postcss.Root
  try {
    root = postcss.parse(source.css, { from })
  }
  catch {
    return undefined
  }

  root.walkAtRules((rule) => {
    if (rule.name === 'import') {
      if (!isTailwindCssImport(rule.params)) {
        return
      }
      const sourceParam = parseImportSourceParam(rule.params)
      if (sourceParam?.none) {
        hasSourceNone = true
      }
      if (sourceParam?.sourcePath) {
        importSourceBase = resolveSourceBase(source.base, sourceParam.sourcePath)
      }
    }
  })

  const sourcePatterns = await resolveCssSourceEntries(root, source.base, '**/*')
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
