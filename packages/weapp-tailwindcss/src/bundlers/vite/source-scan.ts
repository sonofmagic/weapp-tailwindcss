import type { TailwindV4CssSource } from 'tailwindcss-patch'
import type { TailwindInlineSourceCandidates, TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { TailwindcssPatcherLike, UserDefinedOptions } from '@/types'
import { existsSync, readFileSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import fg from 'fast-glob'
import micromatch from 'micromatch'
import postcss from 'postcss'
import { loadConfig } from 'tailwindcss-config'
import {
  collectCssInlineSourceCandidates,
  createSourceScanPattern,
  normalizeLegacyContentEntries,
  parseConfigParam,
  resolveCssSourceEntries,
} from '@/tailwindcss/source-scan'
import { resolveTailwindV3SourceFromPatcher } from '@/tailwindcss/v3-engine'
import { resolveTailwindV4SourceFromPatcher, resolveTailwindV4SourceOptionsFromPatcher } from '@/tailwindcss/v4-engine'
import { readStaticConfigContent } from './static-config-content'

const VITE_SOURCE_CANDIDATE_EXTENSIONS = [
  'js',
  'jsx',
  'mjs',
  'cjs',
  'ts',
  'tsx',
  'mts',
  'cts',
  'vue',
  'uvue',
  'nvue',
  'svelte',
  'mpx',
  'html',
  'wxml',
  'axml',
  'jxml',
  'ksml',
  'ttml',
  'qml',
  'tyml',
  'xhsml',
  'swan',
  'css',
  'wxss',
  'acss',
  'jxss',
  'ttss',
  'qss',
  'tyss',
  'scss',
  'sass',
  'less',
  'styl',
  'stylus',
]
const VITE_SOURCE_CANDIDATE_PATTERN = createSourceScanPattern(VITE_SOURCE_CANDIDATE_EXTENSIONS)
const VITE_TAILWIND_CSS_ENTRY_PATTERN = '**/*.{css,less,sass,scss,styl,stylus,pcss,postcss}'
const tailwindV4CssEntriesCache = new Map<string, Promise<ResolvedTailwindV4CssEntries | undefined>>()

interface ConfigDependencySignature {
  file: string
  mtimeMs: number
  size: number
}

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

function isTailwindCssImport(params: string) {
  return /^\s*(['"])tailwindcss(?:\/[^'"]*)?\1/.test(params)
}

function resolveSourceBase(base: string, sourcePath: string) {
  return path.isAbsolute(sourcePath) ? sourcePath : path.resolve(base, sourcePath)
}

function resolveConfigPath(base: string, configPath: string) {
  if (path.isAbsolute(configPath)) {
    return path.resolve(configPath)
  }

  let current = path.resolve(base)
  while (true) {
    const candidate = path.resolve(current, configPath)
    if (existsSync(candidate)) {
      return candidate
    }
    const parent = path.dirname(current)
    if (parent === current) {
      break
    }
    current = parent
  }

  return path.resolve(base, configPath)
}

export interface ResolvedTailwindV4CssEntries {
  entries: TailwindSourceEntry[]
  explicit: boolean
  inlineCandidates: TailwindInlineSourceCandidates
  dependencies: string[]
}

export interface ResolvedViteSourceScan {
  dependencies?: string[] | undefined
  entries?: TailwindSourceEntry[] | undefined
  explicit?: boolean | undefined
  inlineCandidates?: TailwindInlineSourceCandidates | undefined
}

interface ResolveViteSourceScanOptions {
  root?: string | undefined
  outDir?: string | undefined
}

function createCssEntriesCacheKey(css: string, base: string, dependencies: ConfigDependencySignature[]) {
  return JSON.stringify({
    base: path.resolve(base),
    css,
    dependencies,
  })
}

function addSourceScanDependency(dependencies: Set<string>, file: string | undefined) {
  if (typeof file === 'string' && file.length > 0) {
    dependencies.add(path.resolve(file))
  }
}

function addSourceScanDependencies(dependencies: Set<string>, files: string[] | undefined) {
  for (const file of files ?? []) {
    addSourceScanDependency(dependencies, file)
  }
}

function createResolvedViteSourceScan(input: ResolvedViteSourceScan, dependencies: Set<string>): ResolvedViteSourceScan {
  return {
    ...input,
    ...(dependencies.size > 0 ? { dependencies: [...dependencies].sort() } : {}),
  }
}

async function statConfigDependency(file: string): Promise<ConfigDependencySignature> {
  try {
    const stats = await stat(file)
    return {
      file,
      mtimeMs: stats.mtimeMs,
      size: stats.size,
    }
  }
  catch {
    return {
      file,
      mtimeMs: -1,
      size: -1,
    }
  }
}

async function collectConfigDependencySignatures(root: postcss.Root, base: string) {
  const configPaths = new Set<string>()
  root.walkAtRules('config', (rule) => {
    const configPath = parseConfigParam(rule.params)
    if (configPath) {
      configPaths.add(resolveConfigPath(base, configPath))
    }
  })
  return Promise.all([...configPaths].sort().map(statConfigDependency))
}

export function mergeTailwindInlineSourceCandidates(
  allInlineCandidates: Array<TailwindInlineSourceCandidates | undefined>,
): TailwindInlineSourceCandidates | undefined {
  const merged: TailwindInlineSourceCandidates = {
    included: new Set(),
    excluded: new Set(),
  }
  for (const inlineCandidates of allInlineCandidates) {
    if (!inlineCandidates) {
      continue
    }
    for (const candidate of inlineCandidates.included) {
      if (!merged.excluded.has(candidate)) {
        merged.included.add(candidate)
      }
    }
    for (const candidate of inlineCandidates.excluded) {
      merged.excluded.add(candidate)
      merged.included.delete(candidate)
    }
  }
  return merged.included.size > 0 || merged.excluded.size > 0
    ? merged
    : undefined
}

async function resolveConfigContentEntries(root: postcss.Root, base: string) {
  const configPaths = new Set<string>()
  root.walkAtRules('config', (rule) => {
    const configPath = parseConfigParam(rule.params)
    if (configPath) {
      configPaths.add(resolveConfigPath(base, configPath))
    }
  })

  const entries: TailwindSourceEntry[] = []
  for (const configPath of configPaths) {
    const staticContent = readStaticConfigContent(configPath)
    if (staticContent !== undefined) {
      entries.push(...normalizeLegacyContentEntries(staticContent, path.dirname(configPath)))
      continue
    }
    try {
      const loaded = await loadConfig({
        config: configPath,
        cwd: path.dirname(configPath),
      })
      entries.push(...normalizeLegacyContentEntries(loaded?.config.content, path.dirname(configPath)))
    }
    catch {
      // 依赖收集只负责补充 watch 签名，配置有效性由 Tailwind 生成阶段校验。
    }
  }

  return {
    dependencies: [...configPaths],
    entries,
  }
}

export async function resolveTailwindV4EntriesFromCss(css: string, base: string): Promise<ResolvedTailwindV4CssEntries | undefined> {
  let root: postcss.Root
  try {
    root = postcss.parse(css)
  }
  catch {
    return undefined
  }

  let importSourceBase: string | undefined
  let hasSourceNone = false
  const [sourceEntries, configEntries] = await Promise.all([
    resolveCssSourceEntries(root, base, VITE_SOURCE_CANDIDATE_PATTERN),
    resolveConfigContentEntries(root, base),
  ])
  const entries = [
    ...configEntries.entries,
    ...sourceEntries,
  ]
  const inlineCandidates = collectCssInlineSourceCandidates(root)

  root.walkAtRules('import', (rule) => {
    if (!isTailwindCssImport(rule.params)) {
      return
    }
    const sourceParam = parseImportSourceParam(rule.params)
    if (sourceParam?.none) {
      hasSourceNone = true
    }
    if (sourceParam?.sourcePath) {
      importSourceBase = resolveSourceBase(base, sourceParam.sourcePath)
    }
  })

  if (importSourceBase) {
    return {
      entries: [
        {
          base: importSourceBase,
          negated: false,
          pattern: VITE_SOURCE_CANDIDATE_PATTERN,
        },
        ...entries,
      ],
      explicit: true,
      inlineCandidates,
      dependencies: configEntries.dependencies,
    }
  }

  if (hasSourceNone) {
    return {
      entries,
      explicit: true,
      inlineCandidates,
      dependencies: configEntries.dependencies,
    }
  }

  return entries.length > 0
    ? {
        entries,
        explicit: true,
        inlineCandidates,
        dependencies: configEntries.dependencies,
      }
    : inlineCandidates.included.size > 0 || inlineCandidates.excluded.size > 0
      ? {
          entries: [],
          explicit: true,
          inlineCandidates,
          dependencies: configEntries.dependencies,
        }
      : undefined
}

export async function resolveViteTailwindV4CssDependencies(css: string, base: string) {
  const resolved = await resolveTailwindV4EntriesFromCss(css, base)
  return resolved?.dependencies ?? []
}

function collectExistingCssEntries(options: UserDefinedOptions) {
  return [
    ...(options.cssEntries ?? []),
    ...(options.tailwindcss?.v4?.cssEntries ?? []),
    ...((options.tailwindcssPatcherOptions as any)?.tailwindcss?.v4?.cssEntries ?? []),
  ]
    .filter((item): item is string => typeof item === 'string' && item.length > 0)
    .map(item => path.resolve(item))
    .filter(item => existsSync(item))
}

async function pathExistsAsFile(file: string) {
  try {
    return (await stat(file)).isFile()
  }
  catch {
    return false
  }
}

export async function resolveTailwindV4EntriesFromCssCached(css: string, base: string) {
  let root: postcss.Root
  try {
    root = postcss.parse(css)
  }
  catch {
    return undefined
  }
  const cacheKey = createCssEntriesCacheKey(
    css,
    base,
    await collectConfigDependencySignatures(root, base),
  )
  const cached = tailwindV4CssEntriesCache.get(cacheKey)
  if (cached) {
    return cached
  }
  const task = resolveTailwindV4EntriesFromCss(css, base)
  tailwindV4CssEntriesCache.set(cacheKey, task)
  return task
}

export async function discoverTailwindV4CssEntries(root: string, outDir: string | undefined) {
  const resolvedRoot = path.resolve(root)
  const ignore = [
    '**/node_modules/**',
    '**/.git/**',
  ]
  const resolvedOutDir = outDir ? path.resolve(resolvedRoot, outDir) : undefined
  if (resolvedOutDir) {
    const relativeOutDir = path.relative(resolvedRoot, resolvedOutDir)
    if (relativeOutDir && !relativeOutDir.startsWith('..') && !path.isAbsolute(relativeOutDir)) {
      ignore.push(`${relativeOutDir.split(path.sep).join('/')}/**`)
    }
  }
  const candidates = await fg(VITE_TAILWIND_CSS_ENTRY_PATTERN, {
    absolute: true,
    cwd: resolvedRoot,
    ignore,
    onlyFiles: true,
    unique: true,
  })
  const entries: string[] = []
  for (const file of candidates) {
    if (!await pathExistsAsFile(file)) {
      continue
    }
    try {
      const css = readFileSync(file, 'utf8')
      if (css.includes('tailwindcss') || css.includes('@source') || css.includes('@config')) {
        const resolved = await resolveTailwindV4EntriesFromCssCached(css, path.dirname(file))
        if (resolved) {
          entries.push(file)
        }
      }
    }
    catch {
      // 自动发现只用于缩小 HMR 首轮扫描范围，读取失败时继续尝试其它入口。
    }
  }
  return entries
}

function collectConfiguredCssSources(options: UserDefinedOptions) {
  return [
    ...(options.tailwindcss?.v4?.cssSources ?? []),
    ...(((options.tailwindcssPatcherOptions as any)?.tailwindcss?.v4?.cssSources ?? []) as TailwindV4CssSource[]),
  ]
}

function resolveTailwindV4CssSourceBase(
  source: TailwindV4CssSource,
  fallbackBase: string,
) {
  if (typeof source.base === 'string' && source.base.length > 0) {
    return source.base
  }
  if (typeof source.file === 'string' && source.file.length > 0) {
    return path.dirname(source.file)
  }
  return fallbackBase
}

export async function resolveViteSourceScanEntries(
  options: UserDefinedOptions,
  patcher: TailwindcssPatcherLike,
  scanOptions: ResolveViteSourceScanOptions = {},
): Promise<ResolvedViteSourceScan | undefined> {
  if (patcher.majorVersion === 3) {
    const source = await resolveTailwindV3SourceFromPatcher(patcher)
    const contentEntries = normalizeLegacyContentEntries(source.configObject?.content, source.config ? path.dirname(source.config) : source.cwd)
    const dependencies = new Set<string>()
    addSourceScanDependency(dependencies, source.config)
    return contentEntries.length > 0
      ? createResolvedViteSourceScan({ entries: contentEntries }, dependencies)
      : undefined
  }

  if (patcher.majorVersion === 4) {
    const sourceOptions = resolveTailwindV4SourceOptionsFromPatcher(patcher)
    const cssEntries = collectExistingCssEntries(options)
    if (cssEntries.length === 0 && !sourceOptions.css && !sourceOptions.cssSources?.length) {
      const scanRoot = scanOptions.root
      const sourceProjectRoot = sourceOptions.projectRoot
      if (scanRoot && sourceProjectRoot && path.resolve(scanRoot) === path.resolve(sourceProjectRoot)) {
        const discoveredCssEntries = await discoverTailwindV4CssEntries(
          scanRoot,
          scanOptions.outDir,
        )
        cssEntries.push(...discoveredCssEntries)
      }
    }
    const entries: TailwindSourceEntry[] = []
    const cssInlineCandidates: TailwindInlineSourceCandidates[] = []
    const dependencies = new Set<string>()
    let explicit = false
    for (const cssEntry of cssEntries) {
      addSourceScanDependency(dependencies, cssEntry)
      const css = readFileSync(cssEntry, 'utf8')
      const resolved = await resolveTailwindV4EntriesFromCssCached(css, path.dirname(cssEntry))
      if (resolved) {
        entries.push(...resolved.entries)
        cssInlineCandidates.push(resolved.inlineCandidates)
        addSourceScanDependencies(dependencies, resolved.dependencies)
        explicit ||= resolved.explicit
      }
    }
    const inlineCandidates = mergeTailwindInlineSourceCandidates(cssInlineCandidates)
    if (entries.length > 0 || inlineCandidates || explicit) {
      return createResolvedViteSourceScan({
        entries: explicit ? entries : entries.length > 0 ? entries : undefined,
        explicit,
        inlineCandidates,
      }, dependencies)
    }

    if (typeof sourceOptions.css === 'string' && sourceOptions.css.length > 0) {
      const resolved = await resolveTailwindV4EntriesFromCssCached(sourceOptions.css, sourceOptions.base ?? sourceOptions.projectRoot ?? process.cwd())
      return resolved
        ? createResolvedViteSourceScan({
            entries: resolved.entries,
            explicit: resolved.explicit,
            inlineCandidates: resolved.inlineCandidates,
          }, new Set(resolved.dependencies))
        : undefined
    }

    const sourceOptionBase = sourceOptions.base ?? sourceOptions.projectRoot ?? process.cwd()
    for (const cssSource of [
      ...collectConfiguredCssSources(options),
      ...(sourceOptions.cssSources ?? []),
    ]) {
      if (typeof cssSource.css !== 'string' || cssSource.css.length === 0) {
        continue
      }
      addSourceScanDependency(dependencies, cssSource.file)
      addSourceScanDependencies(dependencies, cssSource.dependencies)
      const resolved = await resolveTailwindV4EntriesFromCssCached(
        cssSource.css,
        resolveTailwindV4CssSourceBase(cssSource, sourceOptionBase),
      )
      if (resolved) {
        entries.push(...resolved.entries)
        cssInlineCandidates.push(resolved.inlineCandidates)
        addSourceScanDependencies(dependencies, resolved.dependencies)
        explicit ||= resolved.explicit
      }
    }
    const cssSourceInlineCandidates = mergeTailwindInlineSourceCandidates(cssInlineCandidates)
    if (entries.length > 0 || cssSourceInlineCandidates || explicit) {
      return createResolvedViteSourceScan({
        entries: explicit ? entries : entries.length > 0 ? entries : undefined,
        explicit,
        inlineCandidates: cssSourceInlineCandidates,
      }, dependencies)
    }

    const source = await resolveTailwindV4SourceFromPatcher(patcher)
    addSourceScanDependency(dependencies, (source as { file?: string }).file)
    addSourceScanDependencies(dependencies, (source as { dependencies?: string[] }).dependencies)
    const resolved = await resolveTailwindV4EntriesFromCssCached(source.css, source.base)
    return resolved
      ? createResolvedViteSourceScan({
          entries: resolved.entries,
          explicit: resolved.explicit,
          inlineCandidates: resolved.inlineCandidates,
        }, new Set([...dependencies, ...resolved.dependencies]))
      : undefined
  }

  return undefined
}

function toPosixPath(value: string) {
  return value.split(path.sep).join('/')
}

function normalizeEntryPattern(entry: TailwindSourceEntry) {
  return path.isAbsolute(entry.pattern)
    ? toPosixPath(path.relative(path.resolve(entry.base), entry.pattern))
    : entry.pattern
}

export function createViteSourceScanMatcher(entries: TailwindSourceEntry[] | undefined) {
  if (!entries?.length) {
    return undefined
  }
  const positiveEntries = entries.filter(entry => !entry.negated)
  const negativeEntries = entries.filter(entry => entry.negated)
  if (positiveEntries.length === 0) {
    return () => false
  }

  return (file: string) => {
    const resolvedFile = path.resolve(file)
    const matchesPositive = positiveEntries.some((entry) => {
      const relative = toPosixPath(path.relative(path.resolve(entry.base), resolvedFile))
      return relative && !relative.startsWith('../') && !path.isAbsolute(relative) && micromatch.isMatch(relative, normalizeEntryPattern(entry))
    })
    if (!matchesPositive) {
      return false
    }
    return !negativeEntries.some((entry) => {
      const relative = toPosixPath(path.relative(path.resolve(entry.base), resolvedFile))
      return relative && !relative.startsWith('../') && !path.isAbsolute(relative) && micromatch.isMatch(relative, normalizeEntryPattern(entry))
    })
  }
}
