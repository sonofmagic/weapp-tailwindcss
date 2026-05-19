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
import { createTailwindV4Engine as createPatchTailwindV4Engine } from 'tailwindcss-patch'
import { omitUndefined } from '@/utils/object'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from './candidates'
import { loadTailwindV4DesignSystem } from './design-system'
import { transformTailwindV4CssByTarget } from './miniprogram'
import { applyTailwindV3CompatibilityCss } from './tailwind-v3-compatibility'
import { createTailwindV4DefaultColorThemeCss } from './tailwind-v4-default-colors'

type TailwindV4ScanSourcePatterns = Exclude<NonNullable<TailwindV4GenerateOptions['scanSources']>, boolean>
type TailwindV4ResolvedScanSources = TailwindV4GenerateOptions['scanSources']

const incrementalGenerateCache = new Map<string, TailwindV4IncrementalGenerateCacheEntry>()
const incrementalGenerateTaskCache = new Map<string, Promise<Awaited<ReturnType<TailwindV4Engine['generate']>>>>()

interface TailwindV4IncrementalGenerateCacheEntry {
  seenCandidates: Set<string>
  classSet: Set<string>
  css: string
  rawCss: string
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

function seedIncrementalGenerateCache(options: TailwindV4IncrementalCacheSeedOptions) {
  const cacheKey = createIncrementalGenerateCacheKey(
    options.compatibleSource,
    options.target,
    options.styleOptions,
    options.tailwindcssV3Compatibility,
  )
  incrementalGenerateCache.set(cacheKey, {
    seenCandidates: collectSeenCandidates(options.generated, options.requestedCandidates),
    classSet: new Set(options.generated.classSet),
    css: options.generated.css,
    rawCss: options.generated.rawCss,
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

function parseSourceFileParam(params: string) {
  const value = params.trim()
  if (!value || value === 'none' || value.startsWith('inline(')) {
    return undefined
  }

  const negated = value.startsWith('not ')
  const sourceValue = negated ? value.slice(4).trim() : value
  if (sourceValue.startsWith('inline(')) {
    return undefined
  }

  const match = /^(['"])(.+)\1$/.exec(sourceValue)
  return match?.[2]
    ? {
        negated,
        pattern: match[2],
      }
    : undefined
}

function resolveSourceBase(base: string, sourcePath: string) {
  return path.isAbsolute(sourcePath) ? sourcePath : path.resolve(base, sourcePath)
}

function resolveCssDefinedScanSources(source: TailwindV4ResolvedSource): TailwindV4ResolvedScanSources | undefined {
  let importSourceBase: string | undefined
  let hasSourceNone = false
  const sourcePatterns: TailwindV4ScanSourcePatterns = []
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
      return
    }

    if (rule.name !== 'source') {
      return
    }

    const sourcePattern = parseSourceFileParam(rule.params)
    if (!sourcePattern) {
      return
    }

    sourcePatterns.push({
      base: source.base,
      negated: sourcePattern.negated,
      pattern: sourcePattern.pattern,
    })
  })

  if (!importSourceBase) {
    if (hasSourceNone) {
      return sourcePatterns.length > 0 ? sourcePatterns : false
    }
    return undefined
  }

  return [
    {
      base: importSourceBase,
      negated: false,
      pattern: '**/*',
    },
    ...sourcePatterns,
  ]
}

function resolveScanSources(
  source: TailwindV4ResolvedSource,
  scanSources: TailwindV4GenerateOptions['scanSources'],
) {
  if (scanSources !== true) {
    return scanSources
  }
  return resolveCssDefinedScanSources(source) ?? scanSources
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
    const compatibleSource = createCompatibleSource(generateSource, target, tailwindcssV3Compatibility)
    const candidates = resolveTargetCandidates(patchOptions.candidates, target)
    const engine = createPatchTailwindV4Engine(compatibleSource)
    const result = await engine.generate(omitUndefined({
      scanSources: resolveScanSources(compatibleSource, scanSources),
      ...patchOptions,
      candidates,
    }))
    const rawCss = result.css
    const css = await transformTailwindV4CssByTarget(rawCss, target, styleOptions)

    return {
      ...result,
      css,
      rawCss,
      target,
    }
  }

  async function generateWithIncrementalCache(options: TailwindV4GenerateOptions = {}) {
    const target = options.target ?? 'weapp'
    const compatibleSource = createCompatibleSource(source, target, options.tailwindcssV3Compatibility)
    const requestedCandidates = resolveTargetCandidates(options.candidates, target)

    if ((options.sources?.length ?? 0) > 0 || options.bareArbitraryValues !== undefined || Array.isArray(options.scanSources)) {
      return generateOnce(source, options)
    }

    const cacheKey = createIncrementalGenerateCacheKey(
      compatibleSource,
      target,
      options.styleOptions,
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
        const cssByCandidate = designSystem.candidatesToCss(missingCandidates)
        const rawCssParts: string[] = []
        const classSet = new Set<string>()
        for (let index = 0; index < missingCandidates.length; index += 1) {
          const candidate = missingCandidates[index]
          const css = cssByCandidate[index]
          if (candidate && typeof css === 'string' && css.trim().length > 0) {
            rawCssParts.push(css)
            classSet.add(candidate)
          }
        }
        const rawCss = rawCssParts.join('\n')
        const css = rawCss.length > 0
          ? await transformTailwindV4CssByTarget(rawCss, target, options.styleOptions)
          : ''

        for (const candidate of missingCandidates) {
          cached.seenCandidates.add(candidate)
        }
        for (const className of classSet) {
          cached.classSet.add(className)
        }
        cached.css = [cached.css, css].filter(Boolean).join('\n')
        cached.rawCss = [cached.rawCss, rawCss].filter(Boolean).join('\n')
        return {
          css: cached.css,
          rawCss: cached.rawCss,
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
        styleOptions: options.styleOptions,
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
