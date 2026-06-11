import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import path from 'node:path'
import { resolveProjectSourceFiles } from 'tailwindcss-patch'
import { toPosixPath } from '@/tailwindcss/source-scan'

const TAILWIND_V4_IGNORED_CONTENT_DIRS = [
  '.git',
  '.hg',
  '.jj',
  '.next',
  '.parcel-cache',
  '.pnpm-store',
  '.svelte-kit',
  '.svn',
  '.turbo',
  '.venv',
  '.vercel',
  '.yarn',
  '__pycache__',
  'node_modules',
  'venv',
]
const TAILWIND_V4_IGNORED_EXTENSIONS = [
  'css',
  'less',
  'postcss',
  'pcss',
  'lock',
  'sass',
  'scss',
  'styl',
  'stylus',
  'log',
  'wxss',
  'acss',
  'jxss',
  'ttss',
  'qss',
  'tyss',
]
const TAILWIND_V4_IGNORED_FILES = [
  'package-lock.json',
  'pnpm-lock.yaml',
  'bun.lockb',
  '.gitignore',
  '.env',
  '.env.*',
]

interface ResolveSourceCandidateScanFilesOptions {
  entries?: TailwindSourceEntry[] | undefined
  explicit?: boolean | undefined
  filter: (id: string) => boolean
  outDir?: string | undefined
  root: string
}

function resolveOutDirIgnorePattern(root: string, outDir: string | undefined) {
  if (!outDir) {
    return
  }
  const relative = path.relative(root, path.resolve(root, outDir))
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    return
  }
  return `${toPosixPath(relative)}/**`
}

function normalizeScanEntries(
  root: string,
  entries: TailwindSourceEntry[] | undefined,
  outDirIgnore: string | undefined,
) {
  const hasPositiveEntry = entries?.some(entry => !entry.negated) === true
  const scanEntries = entries?.length
    ? hasPositiveEntry
      ? entries
      : [
          {
            base: root,
            pattern: '**/*',
            negated: false,
          },
          ...entries,
        ]
    : undefined
  if (!outDirIgnore) {
    return scanEntries
  }
  return [
    ...(scanEntries ?? [{
      base: root,
      pattern: '**/*',
      negated: false,
    }]),
    {
      base: root,
      pattern: outDirIgnore,
      negated: true,
    },
  ]
}

function shouldApplyDefaultIgnoredSources(entries: TailwindSourceEntry[] | undefined) {
  return entries?.length === undefined
    ? false
    : entries.length > 0 && entries.every(entry => entry.negated)
}

function createDefaultIgnoredSources(
  root: string,
  outDirIgnore: string | undefined,
  entries: TailwindSourceEntry[] | undefined,
  explicit: boolean | undefined,
) {
  const shouldUseTailwindDefaults = !explicit || shouldApplyDefaultIgnoredSources(entries)
  const defaultIgnoredSources = shouldUseTailwindDefaults
    ? [
        ...TAILWIND_V4_IGNORED_CONTENT_DIRS.map(pattern => ({
          base: root,
          pattern: `**/${pattern}/**`,
          negated: true,
        })),
        ...TAILWIND_V4_IGNORED_EXTENSIONS.map(extension => ({
          base: root,
          pattern: `**/*.${extension}`,
          negated: true,
        })),
        ...TAILWIND_V4_IGNORED_FILES.map(pattern => ({
          base: root,
          pattern: `**/${pattern}`,
          negated: true,
        })),
      ]
    : []
  return [
    ...defaultIgnoredSources,
    ...(outDirIgnore
      ? [{
          base: root,
          pattern: outDirIgnore,
          negated: true,
        }]
      : []),
  ]
}

export function resolveSourceCandidateScanFiles(options: ResolveSourceCandidateScanFilesOptions) {
  const resolvedRoot = path.resolve(options.root)
  const outDirIgnore = resolveOutDirIgnorePattern(resolvedRoot, options.outDir)
  const scanEntries = normalizeScanEntries(resolvedRoot, options.entries, outDirIgnore)
  const ignoredSources = createDefaultIgnoredSources(resolvedRoot, outDirIgnore, options.entries, options.explicit)
  return resolveProjectSourceFiles({
    cwd: resolvedRoot,
    ...(scanEntries === undefined ? {} : { sources: scanEntries }),
    ...(ignoredSources.length > 0 ? { ignoredSources } : {}),
    filter: options.filter,
  })
}
