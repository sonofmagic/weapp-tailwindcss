import type {
  ILengthUnitsPatchOptions,
  TailwindContentTokenReport,
  TailwindcssExtractOptions,
  TailwindcssExtractResult,
  TailwindCssPatchOptions,
} from './patcher-types'
import type { TailwindcssPatcherLike } from '@/types'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { extractProjectCandidatesWithPositions } from '@tailwindcss-mangle/engine'
import { logger } from '@weapp-tailwindcss/logger'
import { postcss } from '@weapp-tailwindcss/postcss'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import { findNearestPackageRoot } from '@/context/workspace'
import { omitUndefined } from '@/utils/object'
import { extractCandidatesFromSource } from './candidates'
import {
  normalizeExtendLengthUnits,
  normalizeTailwindcssPatcherOptions,
} from './patcher-options'
import {
  createDefaultResolvePaths,
  findTailwindConfig,
  resolveModuleFromPaths,
  resolveTailwindConfigFallback,
} from './patcher-resolve'
import { expandTailwindSourceEntries, resolveTailwindSourceEntry } from './source-scan'
import { resolveTailwindV3SourceFromPatcher } from './v3-engine'
import { resolveTailwindV4SourceFromPatcher } from './v4-engine'
import { DEFAULT_TAILWINDCSS_GENERATOR_MAJOR_VERSION } from './version'

const require = createRequire(import.meta.url)

type TailwindUserOptions = NonNullable<TailwindCssPatchOptions['tailwindcss']>
type TailwindCacheOptions = Exclude<NonNullable<TailwindCssPatchOptions['cache']>, boolean>
type TailwindApplyOptions = NonNullable<TailwindCssPatchOptions['apply']>

export interface CreateTailwindcssPatcherOptions {
  basedir?: string
  cacheDir?: string
  supportCustomLengthUnitsPatch?: boolean | ILengthUnitsPatchOptions
  tailwindcss?: TailwindUserOptions
  tailwindcssPatcherOptions?: TailwindCssPatchOptions
}

function createPackageInfo(tailwindOptions: TailwindUserOptions | undefined): TailwindcssPatcherLike['packageInfo'] {
  const packageName = tailwindOptions?.packageName ?? 'tailwindcss'
  const resolvePaths = tailwindOptions?.resolve?.paths
  let rootPath: string | undefined
  const cwdPackageJsonPath = tailwindOptions?.cwd
    ? path.join(tailwindOptions.cwd, 'package.json')
    : undefined
  if (cwdPackageJsonPath) {
    try {
      const packageJson = require(cwdPackageJsonPath) as { name?: string }
      if (packageJson.name === packageName) {
        rootPath = cwdPackageJsonPath
      }
    }
    catch {
    }
  }
  rootPath ??= resolveModuleFromPaths(`${packageName}/package.json`, resolvePaths ?? [])
  if (!rootPath) {
    for (const resolvePath of [tailwindOptions?.cwd, ...(resolvePaths ?? [])]) {
      if (!resolvePath) {
        continue
      }
      try {
        rootPath = createRequire(path.join(resolvePath, 'package.json')).resolve(`${packageName}/package.json`)
        break
      }
      catch {
      }
    }
  }
  if (rootPath) {
    const packageJsonPath = rootPath
    const packageRoot = path.dirname(packageJsonPath)
    try {
      const packageJson = require(packageJsonPath) as { version?: string }
      return {
        name: packageName,
        version: packageJson.version,
        rootPath: packageRoot,
        packageJsonPath,
        packageJson,
      }
    }
    catch {
      return {
        name: packageName,
        version: undefined,
        rootPath: packageRoot,
        packageJsonPath,
        packageJson: {},
      }
    }
  }

  const packageInfo = {
    name: packageName,
    version: undefined,
    rootPath: '',
    packageJsonPath: '',
    packageJson: {},
  } as TailwindcssPatcherLike['packageInfo']
  return packageInfo
}

function resolveMajorVersion(tailwindOptions: TailwindUserOptions | undefined, packageInfo: TailwindcssPatcherLike['packageInfo']) {
  if (tailwindOptions?.version === 2 || tailwindOptions?.version === 3 || tailwindOptions?.version === 4) {
    return tailwindOptions.version
  }

  const version = packageInfo.version
  if (version?.startsWith('4.')) {
    return 4
  }
  if (version?.startsWith('3.')) {
    return 3
  }
  if (version?.startsWith('2.')) {
    return 2
  }
  return DEFAULT_TAILWINDCSS_GENERATOR_MAJOR_VERSION
}

function createFallbackTailwindcssPatcher(options?: TailwindCssPatchOptions): TailwindcssPatcherLike {
  const packageInfo = createPackageInfo(options?.tailwindcss)

  return {
    packageInfo,
    majorVersion: resolveMajorVersion(options?.tailwindcss, packageInfo),
    options,
    async getClassSet() {
      return new Set<string>()
    },
    async extract(_options?: TailwindcssExtractOptions): TailwindcssExtractResult {
      const classSet = new Set<string>()
      return {
        classList: [],
        classSet,
      } as Awaited<TailwindcssExtractResult>
    },
    async collectContentTokens() {
      return {
        entries: [],
        filesScanned: 0,
        sources: [],
        skippedFiles: [],
      }
    },
  }
}

function findBalancedBlock(source: string, start: number) {
  const open = source[start]
  const close = open === '[' ? ']' : open === '{' ? '}' : undefined
  if (!close) {
    return undefined
  }

  let depth = 0
  let quote: '"' | '\'' | '`' | undefined
  let escaped = false
  for (let index = start; index < source.length; index++) {
    const char = source[index]
    if (quote) {
      if (escaped) {
        escaped = false
        continue
      }
      if (char === '\\') {
        escaped = true
        continue
      }
      if (char === quote) {
        quote = undefined
      }
      continue
    }

    if (char === '"' || char === '\'' || char === '`') {
      quote = char
      continue
    }
    if (char === open) {
      depth++
      continue
    }
    if (char === close) {
      depth--
      if (depth === 0) {
        return source.slice(start, index + 1)
      }
    }
  }
  return undefined
}

function findContentBlock(source: string) {
  const match = /\bcontent\s*:/.exec(source)
  if (!match) {
    return undefined
  }
  const start = match.index + match[0].length
  const blockStart = source.slice(start).search(/[{[]/)
  if (blockStart < 0) {
    return undefined
  }
  return findBalancedBlock(source, start + blockStart)
}

function readStringLiteral(input: string, start: number) {
  const quote = input[start]
  if (quote !== '"' && quote !== '\'' && quote !== '`') {
    return undefined
  }
  let value = ''
  let escaped = false
  for (let index = start + 1; index < input.length; index++) {
    const char = input[index]
    if (escaped) {
      value += char
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (char === quote) {
      return {
        value,
        end: index + 1,
      }
    }
    if (quote === '`' && char === '$' && input[index + 1] === '{') {
      return undefined
    }
    value += char
  }
  return undefined
}

function isStaticContentPattern(value: string) {
  if (value.length === 0) {
    return false
  }
  if (/\s/.test(value)) {
    return false
  }
  return value.startsWith('.')
    || value.startsWith('/')
    || value.startsWith('!')
    || value.includes('*')
    || value.includes('{')
}

async function readStaticTailwindV3Content(config: string | undefined) {
  if (!config) {
    return []
  }
  let code: string
  try {
    code = await readFile(config, 'utf8')
  }
  catch {
    return []
  }
  const block = findContentBlock(code)
  if (!block) {
    return []
  }
  const values: string[] = []
  for (let index = 0; index < block.length; index++) {
    const literal = readStringLiteral(block, index)
    if (!literal) {
      continue
    }
    if (isStaticContentPattern(literal.value)) {
      values.push(literal.value)
    }
    index = literal.end - 1
  }
  return values
}

function createEngineTailwindcssPatcher(options: TailwindCssPatchOptions): TailwindcssPatcherLike {
  const tailwindOptions = options.tailwindcss
  const packageInfo = createPackageInfo(tailwindOptions)
  const majorVersion = resolveMajorVersion(tailwindOptions, packageInfo)
  let classSetCache: Set<string> | undefined

  function applyClassSetFilter(classSet: Set<string>) {
    if (typeof options.filter !== 'function') {
      return classSet
    }
    return new Set([...classSet].filter(className => options.filter?.(className) !== false))
  }

  async function collectTailwindV3CandidateSources() {
    const source = await resolveTailwindV3SourceFromPatcher(patcher).catch(async () => {
      const cwd = tailwindOptions?.v3?.cwd ?? tailwindOptions?.cwd ?? options.projectRoot ?? process.cwd()
      const config = tailwindOptions?.v3?.config ?? tailwindOptions?.config
      return {
        version: 3 as const,
        projectRoot: options.projectRoot ?? cwd,
        cwd,
        base: cwd,
        css: '@tailwind utilities;',
        config,
        configObject: {
          content: await readStaticTailwindV3Content(config),
        },
        dependencies: [],
        packageName: tailwindOptions?.packageName ?? 'tailwindcss',
        postcssPlugin: tailwindOptions?.v3?.postcssPlugin ?? tailwindOptions?.postcssPlugin ?? 'tailwindcss',
      }
    })
    const content = source.configObject?.content
    const sources: Array<{ content: string, extension?: string | undefined }> = []
    const sourceEntries: Array<Awaited<ReturnType<typeof resolveTailwindSourceEntry>>> = []

    async function addContentPattern(pattern: string, base: string) {
      const negated = pattern.startsWith('!')
      sourceEntries.push(await resolveTailwindSourceEntry(
        negated ? pattern.slice(1) : pattern,
        base,
        negated,
      ))
    }

    async function visit(value: unknown, base = source.cwd) {
      if (Array.isArray(value)) {
        for (const item of value) {
          await visit(item, base)
        }
        return
      }
      if (typeof value === 'string') {
        await addContentPattern(value, base)
        return
      }
      if (value && typeof value === 'object') {
        const record = value as { raw?: unknown, extension?: unknown, files?: unknown }
        if (typeof record.raw === 'string') {
          sources.push({
            content: record.raw,
            extension: typeof record.extension === 'string' ? record.extension : 'html',
          })
          return
        }
        if (record.files !== undefined) {
          await visit(record.files, base)
        }
      }
    }

    await visit(content)

    const files = await expandTailwindSourceEntries(sourceEntries)
    await Promise.all(files.map(async (file) => {
      try {
        sources.push({
          content: await readFile(file, 'utf8'),
          extension: path.extname(file).slice(1) || 'html',
        })
      }
      catch {
        // 源文件可能在 watch 中被删除，跳过后续轮次会重新收集。
      }
    }))

    return {
      source,
      sources,
    }
  }

  async function collectClassSet() {
    if (majorVersion === 4) {
      const report = await collectContentTokens()
      const candidates = new Set((report.entries as Array<{ rawCandidate?: string } | string>).map((entry) => {
        return typeof entry === 'string' ? entry : entry.rawCandidate
      }).filter((entry): entry is string => typeof entry === 'string' && entry.length > 0))
      await collectTailwindV4CssCandidates(candidates)
      return applyClassSetFilter(candidates)
    }

    const { sources } = await collectTailwindV3CandidateSources()
    const candidates = new Set<string>()
    for (const source of sources) {
      for (const candidate of await extractCandidatesFromSource(source.content, source.extension ?? 'html')) {
        candidates.add(candidate)
      }
    }
    return applyClassSetFilter(candidates)
  }

  async function collectTailwindV4CssCandidates(candidates: Set<string>) {
    const source = await resolveTailwindV4SourceFromPatcher(patcher)
    const cssList = [
      source.css,
      ...(source.cssSources ?? []).map(cssSource => cssSource.css).filter((css): css is string => typeof css === 'string'),
    ]
    for (const css of cssList) {
      if (!css.includes('@apply')) {
        continue
      }
      try {
        const root = postcss.parse(css)
        root.walkAtRules('apply', (rule) => {
          for (const candidate of rule.params.split(/\s+/)) {
            const normalized = candidate.replace(/!important$/, '').trim()
            if (normalized) {
              candidates.add(normalized)
            }
          }
        })
      }
      catch {
      }
    }
  }

  async function collectContentTokens(): Promise<TailwindContentTokenReport> {
    if (majorVersion === 4) {
      const source = await resolveTailwindV4SourceFromPatcher(patcher)
      const report = await extractProjectCandidatesWithPositions({
        base: source.base,
        baseFallbacks: source.baseFallbacks,
        css: source.css,
        cwd: source.projectRoot,
        sources: source.sources,
      })
      return {
        entries: report.entries,
        filesScanned: report.filesScanned,
        sources: source.sources,
        skippedFiles: report.skippedFiles,
      }
    }

    const { sources } = await collectTailwindV3CandidateSources()
    const entries: string[] = []
    for (const source of sources) {
      entries.push(...await extractCandidatesFromSource(source.content, source.extension ?? 'html'))
    }
    return {
      entries,
      filesScanned: sources.length,
      sources,
      skippedFiles: [],
    }
  }

  async function extract(options?: TailwindcssExtractOptions): Promise<TailwindcssExtractResult> {
    let classSet = await collectClassSet()
    const filter = options?.removeUniversalSelector === true
      ? (className: string) => className !== '*'
      : undefined
    if (filter) {
      classSet = new Set([...classSet].filter(filter))
    }
    if (typeof options?.write === 'boolean') {
      // `@tailwindcss-mangle/engine` 不写补丁产物；保留参数兼容。
    }
    classSetCache = classSet
    return {
      classList: [...classSet],
      classSet,
    }
  }

  const patcher: TailwindcssPatcherLike = {
    packageInfo,
    majorVersion,
    options,
    async getClassSet() {
      if (majorVersion !== 4 && classSetCache) {
        return classSetCache
      }
      return (await extract({ write: false })).classSet
    },
    getClassSetSync() {
      return classSetCache ?? new Set<string>()
    },
    extract,
    collectContentTokens,
  }

  return patcher
}

let hasLoggedMissingTailwind = false

const TAILWINDCSS_NOT_FOUND_RE = /tailwindcss not found/i
const UNABLE_TO_LOCATE_TAILWINDCSS_RE = /unable to locate tailwind css package/i

export function createTailwindcssPatcher(options?: CreateTailwindcssPatcherOptions): TailwindcssPatcherLike {
  const { basedir, cacheDir, supportCustomLengthUnitsPatch, tailwindcss, tailwindcssPatcherOptions } = options || {}
  const cache: TailwindCacheOptions = {
    enabled: true,
    driver: 'memory',
  }
  const normalizedBasedir = basedir ? path.resolve(basedir) : undefined
  // 8.7+ 自带 context fingerprint，默认可安全共享缓存文件。
  // 这里优先维持包级缓存目录，避免把缓存散落到 src 等子目录。
  const cacheRoot = findNearestPackageRoot(normalizedBasedir) ?? normalizedBasedir ?? process.cwd()

  if (cacheDir) {
    if (path.isAbsolute(cacheDir)) {
      cache.dir = cacheDir
    }
    else if (normalizedBasedir) {
      cache.dir = path.resolve(normalizedBasedir, cacheDir)
    }
    else {
      cache.dir = path.resolve(process.cwd(), cacheDir)
    }
  }
  else {
    cache.dir = path.join(cacheRoot, 'node_modules', '.cache', '@tailwindcss-mangle', 'engine')
  }

  if (normalizedBasedir) {
    cache.cwd = normalizedBasedir
  }

  const resolvePaths = createDefaultResolvePaths(cache.cwd ?? normalizedBasedir ?? process.cwd())

  const normalizedUserOptions = normalizeTailwindcssPatcherOptions(tailwindcssPatcherOptions)

  const extendLengthUnits = normalizeExtendLengthUnits(supportCustomLengthUnitsPatch ?? true)

  const baseTailwindOptions = defuOverrideArray<TailwindUserOptions, Partial<TailwindUserOptions>[]>(
    (tailwindcss ?? {}) as TailwindUserOptions,
    omitUndefined({
      cwd: normalizedBasedir,
      resolve: {
        paths: resolvePaths,
      },
    }) as Partial<TailwindUserOptions>,
  )

  const configuredPackageName = tailwindcss?.packageName ?? normalizedUserOptions?.tailwindcss?.packageName
  baseTailwindOptions.packageName = configuredPackageName
    ?? baseTailwindOptions.packageName
    ?? 'tailwindcss'

  if (!baseTailwindOptions.postcssPlugin) {
    baseTailwindOptions.postcssPlugin = 'tailwindcss'
  }

  if (typeof baseTailwindOptions.postcssPlugin === 'string') {
    const resolvedPlugin = resolveModuleFromPaths(baseTailwindOptions.postcssPlugin, resolvePaths)
    if (resolvedPlugin) {
      baseTailwindOptions.postcssPlugin = resolvedPlugin
    }
  }

  const baseOptions: TailwindCssPatchOptions = omitUndefined({
    projectRoot: normalizedBasedir,
    cache,
    tailwindcss: baseTailwindOptions,
    apply: omitUndefined({
      exposeContext: true,
      extendLengthUnits,
    }) satisfies TailwindApplyOptions,
  }) as TailwindCssPatchOptions

  const mergedOptions = defuOverrideArray<TailwindCssPatchOptions, TailwindCssPatchOptions[]>(
    (normalizedUserOptions ?? {}) as TailwindCssPatchOptions,
    baseOptions,
  )
  const resolvedOptions = mergedOptions
  const resolvedTailwindOptions: TailwindUserOptions | undefined = resolvedOptions.tailwindcss

  if (resolvedTailwindOptions) {
    const existingResolve = resolvedTailwindOptions.resolve ?? {}
    const customPaths = Array.isArray(existingResolve.paths) && existingResolve.paths.length > 0
    const sourcePaths = customPaths ? [...(existingResolve.paths ?? []), ...resolvePaths] : resolvePaths
    resolvedTailwindOptions.resolve = {
      ...existingResolve,
      paths: [...new Set(sourcePaths)],
    }
    logger.debug('Tailwind resolve config %O', {
      packageName: resolvedTailwindOptions.packageName,
      version: resolvedTailwindOptions.version,
      resolve: resolvedTailwindOptions.resolve,
      cwd: resolvedTailwindOptions.cwd,
    })

    if (typeof resolvedTailwindOptions.postcssPlugin === 'string') {
      const resolvedPlugin = resolveModuleFromPaths(
        resolvedTailwindOptions.postcssPlugin,
        resolvedTailwindOptions.resolve?.paths ?? resolvePaths,
      )
      if (resolvedPlugin) {
        resolvedTailwindOptions.postcssPlugin = resolvedPlugin
      }
    }

    const searchRoots = new Set<string>()
    if (resolvedTailwindOptions.cwd) {
      searchRoots.add(resolvedTailwindOptions.cwd)
    }
    for (const resolvePath of resolvedTailwindOptions.resolve?.paths ?? []) {
      const parentDir = path.dirname(resolvePath)
      searchRoots.add(parentDir)
    }
    const configPath = findTailwindConfig(searchRoots)
    if (!resolvedTailwindOptions.config) {
      if (configPath) {
        resolvedTailwindOptions.config = configPath
      }
      else {
        const fallbackConfig = resolveTailwindConfigFallback(
          resolvedTailwindOptions.packageName,
          resolvedTailwindOptions.resolve.paths ?? resolvePaths,
        )
        if (fallbackConfig) {
          resolvedTailwindOptions.config = fallbackConfig
        }
      }
    }
    if (!resolvedTailwindOptions.cwd && configPath) {
      resolvedTailwindOptions.cwd = path.dirname(configPath)
    }
    resolvedOptions.tailwindcss = resolvedTailwindOptions
  }

  try {
    return createEngineTailwindcssPatcher(resolvedOptions)
  }
  catch (error) {
    const searchPaths = resolvedOptions.tailwindcss?.resolve?.paths
    if (error instanceof Error && TAILWINDCSS_NOT_FOUND_RE.test(error.message)) {
      if (!hasLoggedMissingTailwind) {
        logger.warn('Tailwind CSS 未安装，已跳过 Tailwind 运行时能力。若需使用 Tailwind 能力，请安装 tailwindcss。')
        hasLoggedMissingTailwind = true
      }
      return createFallbackTailwindcssPatcher(resolvedOptions)
    }
    if (error instanceof Error && UNABLE_TO_LOCATE_TAILWINDCSS_RE.test(error.message)) {
      logger.error('无法定位 Tailwind CSS 包 "%s"，已尝试路径: %O', resolvedOptions.tailwindcss?.packageName, searchPaths)
    }
    throw error
  }
}
