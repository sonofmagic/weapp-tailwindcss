import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type {
  TailwindV4DesignSystem,
  TailwindV4Engine,
  TailwindV4GenerateOptions,
  TailwindV4GenerateTarget,
  TailwindV4ResolvedSource,
  TailwindV4SourcePattern,
} from './types'
import fs from 'node:fs'
import path from 'node:path'
import postcss from 'postcss'
import { createTailwindV4Engine as createPatchTailwindV4Engine, extractRawCandidates } from 'tailwindcss-patch'
import { hasCssMacroTailwindV4Directive, withCssMacroStyleOptions } from '@/css-macro/auto'
import { resolveCssSourceEntries, resolveTailwindSourceEntry } from '@/tailwindcss/source-scan'
import { omitUndefined } from '@/utils/object'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from './candidates'
import { loadTailwindV4DesignSystem } from './design-system'
import { transformTailwindV4CssByTarget } from './miniprogram'
import { applyTailwindV3CompatibilityCss } from './tailwind-v3-compatibility'
import { createTailwindV4DefaultColorThemeCss } from './tailwind-v4-default-colors'

type TailwindV4ResolvedScanSources = TailwindV4GenerateOptions['scanSources']

const incrementalGenerateCache = new Map<string, TailwindV4IncrementalGenerateCacheEntry>()
const incrementalGenerateTaskCache = new Map<string, Promise<Awaited<ReturnType<TailwindV4Engine['generate']>>>>()
const BARE_RPX_TEXT_CANDIDATE_RE = /(^|:)text-\[([-+]?(?:\d+|\d*\.\d+)rpx)\](.*)$/u
const RPX_TEXT_LENGTH_SELECTOR_RE = /text-\\\[length\\:((?:\\[.+-]|[+\-.\d])+rpx)\\\]/g
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

interface TailwindV4IncrementalGenerateCacheEntry {
  seenCandidates: Set<string>
  classSet: Set<string>
  css: string
  rawCss: string
  customPropertyValues: Map<string, string>
  designSystemPromise: Promise<TailwindV4DesignSystem>
  dependencies: string[]
  sources: TailwindV4SourcePattern[]
  root: null | 'none' | {
    base: string
    pattern: string
  }
  target: TailwindV4GenerateTarget
}

interface TailwindV4IncrementalCacheSeedOptions {
  compatibleSource: TailwindV4ResolvedSource
  generated: Awaited<ReturnType<TailwindV4Engine['generate']>>
  requestedCandidates: Set<string>
  styleOptions: Partial<IStyleHandlerOptions> | undefined
  tailwindcssV3Compatibility: boolean | undefined
  target: TailwindV4GenerateTarget
}

function findLeadingImportInsertionIndex(css: string) {
  const importPattern = /(?:^|\n)\s*@import\b[^;]*;/g
  let insertionIndex = 0
  let match = importPattern.exec(css)
  while (match !== null) {
    insertionIndex = match.index + match[0].length
    match = importPattern.exec(css)
  }
  return insertionIndex
}

function applyMiniProgramTailwindV4DefaultColorCss(css: string) {
  const themeCss = createTailwindV4DefaultColorThemeCss()
  const insertionIndex = findLeadingImportInsertionIndex(css)
  if (insertionIndex === 0) {
    return `${themeCss}\n${css}`
  }
  return `${css.slice(0, insertionIndex)}\n${themeCss}\n${css.slice(insertionIndex)}`
}

function collectCandidates(candidates: Iterable<string> | undefined) {
  return new Set(candidates ?? [])
}

function normalizeRpxTextCandidate(candidate: string) {
  return candidate.replace(BARE_RPX_TEXT_CANDIDATE_RE, '$1text-[length:$2]$3')
}

function normalizeRpxTextCandidates(candidates: Iterable<string>) {
  const normalized = new Set<string>()
  const restoreCandidates = new Map<string, string>()
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeRpxTextCandidate(candidate)
    normalized.add(normalizedCandidate)
    if (normalizedCandidate !== candidate) {
      restoreCandidates.set(normalizedCandidate, candidate)
    }
  }
  return {
    candidates: normalized,
    restoreCandidates,
  }
}

function restoreRpxTextCandidates(candidates: Iterable<string>, restoreCandidates: ReadonlyMap<string, string>) {
  if (restoreCandidates.size === 0) {
    return new Set(candidates)
  }
  return new Set([...candidates].map(candidate => restoreCandidates.get(candidate) ?? candidate))
}

function normalizeCssEscapedRpxSelectorValue(value: string) {
  return value.replace(/\\([.+-])/g, '$1')
}

function restoreRpxTextCssSelectors(css: string, restoreCandidates: ReadonlyMap<string, string>) {
  if (restoreCandidates.size === 0 || !css.includes('text-\\[length\\:')) {
    return css
  }
  const restoredValues = new Set(
    [...restoreCandidates.keys()]
      .map((candidate) => {
        const match = BARE_RPX_TEXT_CANDIDATE_RE.exec(candidate.replace('[length:', '['))
        return match?.[2]
      })
      .filter((value): value is string => Boolean(value)),
  )
  return css.replace(RPX_TEXT_LENGTH_SELECTOR_RE, (match, value: string) => {
    return restoredValues.has(normalizeCssEscapedRpxSelectorValue(value)) ? `text-\\[${value}\\]` : match
  })
}

function createStableJson(value: unknown): string {
  if (value === undefined) {
    return 'undefined'
  }
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map(item => createStableJson(item)).join(',')}]`
  }
  return `{${Object.keys(value).sort().map((key) => {
    const record = value as Record<string, unknown>
    return `${JSON.stringify(key)}:${createStableJson(record[key])}`
  }).join(',')}}`
}

function createDependencyFingerprint(files: string[]) {
  return files.map((file) => {
    try {
      const stat = fs.statSync(file)
      return `${file}:${stat.size}:${stat.mtimeMs}`
    }
    catch {
      return `${file}:missing`
    }
  }).join('|')
}

function createIncrementalGenerateCacheKey(
  source: TailwindV4ResolvedSource,
  target: TailwindV4GenerateTarget,
  styleOptions: Partial<IStyleHandlerOptions> | undefined,
  tailwindcssV3Compatibility: boolean | undefined,
) {
  return [
    source.projectRoot,
    source.base,
    createStableJson(source.baseFallbacks),
    source.css,
    createDependencyFingerprint(source.dependencies),
    target,
    createStableJson(styleOptions),
    createStableJson(tailwindcssV3Compatibility),
  ].join('\0')
}

function createIncrementalGenerateTaskCacheKey(
  cacheKey: string,
  requestedCandidates: Set<string>,
  scanSources: TailwindV4GenerateOptions['scanSources'],
) {
  return [
    cacheKey,
    scanSources === true ? 'scan:1' : 'scan:0',
    [...requestedCandidates].sort().join('\n'),
  ].join('\0')
}

function runIncrementalGenerateTask(
  cacheKey: string,
  requestedCandidates: Set<string>,
  scanSources: TailwindV4GenerateOptions['scanSources'],
  task: () => Promise<Awaited<ReturnType<TailwindV4Engine['generate']>>>,
) {
  const taskKey = createIncrementalGenerateTaskCacheKey(cacheKey, requestedCandidates, scanSources)
  const cachedTask = incrementalGenerateTaskCache.get(taskKey)
  if (cachedTask) {
    return cachedTask
  }
  const promise = task()
  incrementalGenerateTaskCache.set(taskKey, promise)
  promise.finally(() => {
    if (incrementalGenerateTaskCache.get(taskKey) === promise) {
      incrementalGenerateTaskCache.delete(taskKey)
    }
  })
  return promise
}

function createIncrementalDesignSystemPromise(
  source: TailwindV4ResolvedSource,
  cacheKey: string,
) {
  const promise = loadTailwindV4DesignSystem(source)
  promise.catch(() => {
    const cached = incrementalGenerateCache.get(cacheKey)
    if (cached?.designSystemPromise === promise) {
      incrementalGenerateCache.delete(cacheKey)
    }
  })
  return promise
}

function createCompatibleSource(
  source: TailwindV4ResolvedSource,
  target: TailwindV4GenerateTarget,
  tailwindcssV3Compatibility: boolean | undefined,
) {
  const shouldApplyTailwindV3Compatibility = tailwindcssV3Compatibility ?? target === 'weapp'
  const filteredSourceCss = target === 'weapp'
    ? removeUnlayeredTailwindV4PreflightImports(source.css)
    : source.css
  const sourceCss = shouldApplyTailwindV3Compatibility
    ? applyTailwindV3CompatibilityCss(filteredSourceCss)
    : target === 'weapp'
      ? applyMiniProgramTailwindV4DefaultColorCss(filteredSourceCss)
      : filteredSourceCss
  const compatibleSourceCss = removeUnsupportedThemeVendorKeyframes(sourceCss)
  return compatibleSourceCss === source.css ? source : { ...source, css: compatibleSourceCss }
}

function resolveTargetCandidates(
  candidates: Iterable<string> | undefined,
  target: TailwindV4GenerateTarget,
) {
  const collected = collectCandidates(candidates)
  return target === 'weapp'
    ? filterUnsupportedMiniProgramTailwindV4Candidates(collected)
    : collected
}

function collectSeenCandidates(
  generated: Pick<Awaited<ReturnType<TailwindV4Engine['generate']>>, 'rawCandidates' | 'classSet'>,
  requestedCandidates: Set<string>,
) {
  return new Set([
    ...requestedCandidates,
    ...generated.rawCandidates,
    ...generated.classSet,
  ])
}

function createIncrementalStyleOptions(styleOptions: Partial<IStyleHandlerOptions> | undefined) {
  return {
    ...styleOptions,
    isMainChunk: false,
  }
}

function resolveStyleOptions(source: TailwindV4ResolvedSource, options: Partial<IStyleHandlerOptions> | undefined) {
  return hasCssMacroTailwindV4Directive(source.css) ? withCssMacroStyleOptions(options) : options
}

function collectCustomPropertyValues(css: string) {
  const values = new Map<string, string>()
  try {
    const root = postcss.parse(css)
    root.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) {
        values.set(decl.prop, decl.value.trim())
      }
    })
  }
  catch {
    // Ignore malformed cache context; the normal transformer will still process the current chunk.
  }
  return values
}

function mergeCustomPropertyValues(target: Map<string, string>, css: string) {
  for (const [prop, value] of collectCustomPropertyValues(css)) {
    target.set(prop, value)
  }
}

function seedIncrementalGenerateCache(options: TailwindV4IncrementalCacheSeedOptions) {
  const cacheKey = createIncrementalGenerateCacheKey(
    options.compatibleSource,
    options.target,
    options.styleOptions,
    options.tailwindcssV3Compatibility,
  )
  const customPropertyValues = collectCustomPropertyValues(options.compatibleSource.css)
  mergeCustomPropertyValues(customPropertyValues, options.generated.css)
  incrementalGenerateCache.set(cacheKey, {
    seenCandidates: collectSeenCandidates(options.generated, options.requestedCandidates),
    classSet: new Set(options.generated.classSet),
    css: options.generated.css,
    rawCss: options.generated.rawCss,
    customPropertyValues,
    designSystemPromise: createIncrementalDesignSystemPromise(options.compatibleSource, cacheKey),
    dependencies: options.generated.dependencies,
    sources: options.generated.sources,
    root: options.generated.root,
    target: options.generated.target,
  })
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

function parseCssImportSpecifier(params: string) {
  const value = params.trim()
  const quoted = /^(['"])(.*?)\1/.exec(value)
  if (quoted) {
    return quoted[2]
  }

  const url = /^url\(\s*(?:(['"])(.*?)\1|([^'")\s]+))\s*\)/.exec(value)
  return url?.[2] ?? url?.[3]
}

function isTailwindCssPreflightImport(params: string) {
  const specifier = parseCssImportSpecifier(params)
  return specifier === 'tailwindcss/preflight.css' || specifier === 'tailwindcss/preflight'
}

function hasImportLayerOption(params: string) {
  return /\blayer(?:\s*\(|\s*$)/.test(params)
}

function removeUnlayeredTailwindV4PreflightImports(css: string) {
  if (!css.includes('preflight')) {
    return css
  }

  let root: postcss.Root
  try {
    root = postcss.parse(css)
  }
  catch {
    return css
  }

  let changed = false
  root.walkAtRules('import', (rule) => {
    if (isTailwindCssPreflightImport(rule.params) && !hasImportLayerOption(rule.params)) {
      rule.remove()
      changed = true
    }
  })

  return changed ? root.toString() : css
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

async function resolveScanSources(
  source: TailwindV4ResolvedSource,
  scanSources: TailwindV4GenerateOptions['scanSources'],
) {
  if (scanSources !== true) {
    return scanSources
  }
  return await resolveCssDefinedScanSources(source) ?? false
}

function hasThemeParent(rule: postcss.AtRule) {
  let parent = rule.parent as postcss.Container | undefined
  while (parent) {
    if (parent.type === 'atrule' && (parent as postcss.AtRule).name === 'theme') {
      return true
    }
    parent = parent.parent as postcss.Container | undefined
  }
  return false
}

function isVendorPrefixedKeyframes(rule: postcss.AtRule) {
  return rule.name.startsWith('-') && rule.name.endsWith('keyframes')
}

function removeUnsupportedThemeVendorKeyframes(css: string) {
  if (!css.includes('@theme') || !css.includes('@-')) {
    return css
  }

  let root: postcss.Root
  try {
    root = postcss.parse(css)
  }
  catch {
    return css
  }

  let changed = false
  root.walkAtRules((rule) => {
    if (isVendorPrefixedKeyframes(rule) && hasThemeParent(rule)) {
      rule.remove()
      changed = true
    }
  })

  return changed ? root.toString() : css
}

export function createTailwindV4Engine(source: TailwindV4ResolvedSource): TailwindV4Engine {
  async function generateOnce(
    generateSource: TailwindV4ResolvedSource,
    options: TailwindV4GenerateOptions = {},
  ) {
    const {
      scanSources = true,
      styleOptions,
      tailwindcssV3Compatibility,
      target = 'weapp',
      ...patchOptions
    } = options
    const resolvedStyleOptions = resolveStyleOptions(generateSource, styleOptions)
    const compatibleSource = createCompatibleSource(generateSource, target, tailwindcssV3Compatibility)
    const engine = createPatchTailwindV4Engine(compatibleSource)
    const resolvedScanSources = await resolveScanSources(generateSource, scanSources)
    const filesystemCandidates = Array.isArray(resolvedScanSources)
      ? new Set(await extractRawCandidates(resolvedScanSources))
      : undefined
    const resolvedCandidates = resolveTargetCandidates(new Set([
      ...collectCandidates(patchOptions.candidates),
      ...(filesystemCandidates ?? []),
    ]), target)
    const normalizedCandidates = normalizeRpxTextCandidates(resolvedCandidates)
    const result = await engine.generate(omitUndefined({
      scanSources: false,
      ...patchOptions,
      candidates: normalizedCandidates.candidates,
    }))
    const rawCss = restoreRpxTextCssSelectors(result.css, normalizedCandidates.restoreCandidates)
    const css = await transformTailwindV4CssByTarget(rawCss, target, resolvedStyleOptions)

    return {
      ...result,
      classSet: restoreRpxTextCandidates(result.classSet, normalizedCandidates.restoreCandidates),
      rawCandidates: restoreRpxTextCandidates(result.rawCandidates, normalizedCandidates.restoreCandidates),
      css,
      rawCss,
      target,
    }
  }

  async function generateWithIncrementalCache(options: TailwindV4GenerateOptions = {}) {
    const target = options.target ?? 'weapp'
    const compatibleSource = createCompatibleSource(source, target, options.tailwindcssV3Compatibility)
    const requestedCandidates = resolveTargetCandidates(options.candidates, target)
    const styleOptions = resolveStyleOptions(source, options.styleOptions)

    if ((options.sources?.length ?? 0) > 0 || options.bareArbitraryValues !== undefined || Array.isArray(options.scanSources)) {
      return generateOnce(source, options)
    }

    const cacheKey = createIncrementalGenerateCacheKey(
      compatibleSource,
      target,
      styleOptions,
      options.tailwindcssV3Compatibility,
    )

    if (options.scanSources === true) {
      return runIncrementalGenerateTask(cacheKey, requestedCandidates, options.scanSources, async () => {
        const generated = await generateOnce(source, options)
        seedIncrementalGenerateCache({
          compatibleSource,
          generated,
          requestedCandidates,
          styleOptions: options.styleOptions,
          tailwindcssV3Compatibility: options.tailwindcssV3Compatibility,
          target,
        })
        return generated
      })
    }

    const cached = incrementalGenerateCache.get(cacheKey)
    if (cached) {
      const missingCandidates = [...requestedCandidates].filter(candidate => !cached.seenCandidates.has(candidate))
      if (missingCandidates.length === 0) {
        return {
          css: cached.css,
          rawCss: cached.rawCss,
          incrementalCss: '',
          incrementalRawCss: '',
          classSet: new Set(cached.classSet),
          rawCandidates: new Set(cached.seenCandidates),
          dependencies: cached.dependencies,
          sources: cached.sources,
          root: cached.root,
          target: cached.target,
        }
      }

      return runIncrementalGenerateTask(cacheKey, requestedCandidates, options.scanSources, async () => {
        const designSystem = await cached.designSystemPromise
        const normalizedMissing = normalizeRpxTextCandidates(missingCandidates)
        const normalizedMissingCandidates = [...normalizedMissing.candidates]
        const cssByCandidate = designSystem.candidatesToCss(normalizedMissingCandidates)
        const rawCssParts: string[] = []
        const classSet = new Set<string>()
        for (let index = 0; index < normalizedMissingCandidates.length; index += 1) {
          const candidate = normalizedMissingCandidates[index]
          const css = cssByCandidate[index]
          if (candidate && typeof css === 'string' && css.trim().length > 0) {
            rawCssParts.push(restoreRpxTextCssSelectors(css, normalizedMissing.restoreCandidates))
            classSet.add(normalizedMissing.restoreCandidates.get(candidate) ?? candidate)
          }
        }
        const rawCss = rawCssParts.join('\n')
        const incrementalCss = rawCss.length > 0
          ? await transformTailwindV4CssByTarget(rawCss, target, {
              ...createIncrementalStyleOptions(styleOptions),
              customPropertyValues: cached.customPropertyValues,
            } as Partial<IStyleHandlerOptions>)
          : ''

        for (const candidate of missingCandidates) {
          cached.seenCandidates.add(candidate)
        }
        for (const className of classSet) {
          cached.classSet.add(className)
        }
        cached.css = [cached.css, incrementalCss].filter(Boolean).join('\n')
        cached.rawCss = [cached.rawCss, rawCss].filter(Boolean).join('\n')
        mergeCustomPropertyValues(cached.customPropertyValues, incrementalCss)
        return {
          css: cached.css,
          rawCss: cached.rawCss,
          incrementalCss,
          incrementalRawCss: rawCss,
          classSet: new Set(cached.classSet),
          rawCandidates: new Set(cached.seenCandidates),
          dependencies: cached.dependencies,
          sources: cached.sources,
          root: cached.root,
          target: cached.target,
        }
      })
    }

    return runIncrementalGenerateTask(cacheKey, requestedCandidates, options.scanSources, async () => {
      const generated = await generateOnce(source, options)
      seedIncrementalGenerateCache({
        compatibleSource,
        generated,
        requestedCandidates,
        styleOptions,
        tailwindcssV3Compatibility: options.tailwindcssV3Compatibility,
        target,
      })
      return generated
    })
  }

  async function generate(options: TailwindV4GenerateOptions = {}) {
    return options.incrementalCache
      ? generateWithIncrementalCache(options)
      : generateOnce(source, options)
  }

  return {
    source,
    loadDesignSystem: createPatchTailwindV4Engine(source).loadDesignSystem,
    validateCandidates: createPatchTailwindV4Engine(source).validateCandidates,
    generate,
  }
}
