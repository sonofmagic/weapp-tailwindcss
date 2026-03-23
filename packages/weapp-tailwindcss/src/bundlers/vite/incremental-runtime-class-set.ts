import type { BundleSnapshot, BundleStateEntry } from './bundle-state'
import type { TailwindcssPatcherLike } from '@/types'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { extractRawCandidatesWithPositions, extractValidCandidates } from 'tailwindcss-patch'
import { createDebug } from '@/debug'
import { resolveTailwindcssOptions } from '@/tailwindcss/patcher-options'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'

const debug = createDebug('[vite:runtime-set] ')
const require = createRequire(import.meta.url)

type ExtractValidCandidatesOptions = Parameters<typeof extractValidCandidates>[0]
type ExtractValidCandidatesFn = (options?: ExtractValidCandidatesOptions) => Promise<string[]>
type ExtractRawCandidateResult = Awaited<ReturnType<typeof extractRawCandidatesWithPositions>>
type ExtractRawCandidatesFn = (content: string, extension?: string) => Promise<ExtractRawCandidateResult>
interface TailwindDesignSystem {
  parseCandidate: (candidate: string) => unknown[]
  candidatesToCss: (candidates: string[]) => Array<string | undefined>
}

export interface BundleRuntimeClassSetManager {
  sync: (patcher: TailwindcssPatcherLike, snapshot: BundleSnapshot) => Promise<Set<string>>
  reset: () => Promise<void>
}

interface CreateBundleRuntimeClassSetManagerOptions {
  extractCandidates?: ExtractValidCandidatesFn
  extractRawCandidates?: ExtractRawCandidatesFn
  tempRoot?: string
}

interface RuntimeValidationContext {
  base: string
  baseFallbacks: string[]
  css: string
  projectRoot: string
}

const EXTENSION_DOT_PREFIX_RE = /^\./
const VALIDATION_FILE_NAME = 'runtime-candidates.html'

let tailwindNodeModulePromise: Promise<{
  __unstable__loadDesignSystem: (css: string, options: { base: string }) => Promise<TailwindDesignSystem>
}> | undefined

function toPosixPath(value: string) {
  return value.replaceAll('\\', '/')
}

function createCssImportSource(imports: string[]) {
  return imports.map(value => `@import "${toPosixPath(value)}";`).join('\n')
}

function isPostcssPluginImportTarget(value: string | undefined) {
  if (!value) {
    return false
  }
  return value === '@tailwindcss/postcss'
    || value === '@tailwindcss/postcss7-compat'
    || value.includes('/postcss')
}

function resolveTailwindCssImportTarget(patcher: TailwindcssPatcherLike) {
  const tailwindOptions = resolveTailwindcssOptions(patcher.options)
  const cssEntries = tailwindOptions?.v4?.cssEntries?.filter((item): item is string => typeof item === 'string' && item.length > 0)
  if (cssEntries && cssEntries.length > 0) {
    return createCssImportSource(cssEntries)
  }

  const configuredPackageName = tailwindOptions?.packageName
  if (typeof configuredPackageName === 'string' && configuredPackageName.length > 0 && !isPostcssPluginImportTarget(configuredPackageName)) {
    return createCssImportSource([configuredPackageName])
  }

  const packageName = patcher.packageInfo?.name
  if (typeof packageName === 'string' && packageName.length > 0 && !isPostcssPluginImportTarget(packageName)) {
    return createCssImportSource([packageName])
  }

  return createCssImportSource(['tailwindcss'])
}

function getProjectRoot(patcher: TailwindcssPatcherLike) {
  return patcher.options?.projectRoot ?? process.cwd()
}

async function importTailwindNodeModule() {
  if (!tailwindNodeModulePromise) {
    tailwindNodeModulePromise = (async () => {
      try {
        const resolved = require.resolve('@tailwindcss/node')
        return await import(resolved)
      }
      catch {
        const tailwindcssPatchEntry = require.resolve('tailwindcss-patch')
        const resolved = require.resolve('@tailwindcss/node', {
          paths: [path.dirname(tailwindcssPatchEntry)],
        })
        return await import(resolved)
      }
    })()
  }
  return tailwindNodeModulePromise
}

function resolveMaybeAbsolute(base: string, value: string | undefined) {
  if (!value) {
    return undefined
  }
  return path.isAbsolute(value) ? value : path.resolve(base, value)
}

async function resolveTailwindCssSource(
  patcher: TailwindcssPatcherLike,
): Promise<RuntimeValidationContext> {
  const projectRoot = getProjectRoot(patcher)
  const tailwindOptions = resolveTailwindcssOptions(patcher.options)
  const configuredBase = resolveMaybeAbsolute(projectRoot, tailwindOptions?.v4?.base)
  const configDir = tailwindOptions?.config ? path.dirname(tailwindOptions.config) : undefined
  const sharedFallbacks = [
    configuredBase,
    projectRoot,
    tailwindOptions?.cwd,
    configDir,
  ].filter((item): item is string => typeof item === 'string' && item.length > 0)

  if (tailwindOptions?.v4?.css) {
    return {
      projectRoot,
      base: configuredBase ?? projectRoot,
      baseFallbacks: [...new Set(sharedFallbacks)],
      css: tailwindOptions.v4.css,
    }
  }

  const cssEntries = tailwindOptions?.v4?.cssEntries?.filter((item): item is string => typeof item === 'string' && item.length > 0) ?? []
  if (cssEntries.length > 0) {
    const resolvedEntries = cssEntries.map(entry => resolveMaybeAbsolute(projectRoot, entry) ?? entry)
    const cssChunks: string[] = []
    const entryDirs: string[] = []

    for (const entry of resolvedEntries) {
      try {
        cssChunks.push(await readFile(entry, 'utf8'))
        entryDirs.push(path.dirname(entry))
      }
      catch {
        // 忽略缺失 css entry，回退到其他 entry 或 import 方案。
      }
    }

    if (cssChunks.length > 0) {
      const base = entryDirs[0] ?? configuredBase ?? projectRoot
      const baseFallbacks = [...new Set([
        ...entryDirs.slice(1),
        ...sharedFallbacks,
      ].filter((item): item is string => typeof item === 'string' && item.length > 0 && item !== base))]

      return {
        projectRoot,
        base,
        baseFallbacks,
        css: cssChunks.join('\n'),
      }
    }
  }

  return {
    projectRoot,
    base: configuredBase ?? projectRoot,
    baseFallbacks: [...new Set(sharedFallbacks)],
    css: resolveTailwindCssImportTarget(patcher),
  }
}

function createExtractOptions(
  context: RuntimeValidationContext,
  tempRoot: string,
  pattern: string,
): ExtractValidCandidatesOptions {
  return {
    cwd: context.projectRoot,
    base: context.base,
    baseFallbacks: context.baseFallbacks,
    css: context.css,
    sources: [{
      base: tempRoot,
      pattern,
      negated: false,
    }],
  }
}

function createRuntimeEntries(snapshot: BundleSnapshot) {
  return snapshot.entries.filter(entry => entry.type === 'html' || entry.type === 'js')
}

function collectChangedRuntimeFiles(snapshot: BundleSnapshot) {
  return new Set<string>([
    ...snapshot.runtimeAffectingChangedByType.html,
    ...snapshot.runtimeAffectingChangedByType.js,
  ])
}

async function writeTempEntryFile(
  tempRoot: string,
  file: string,
  source: string,
) {
  const absoluteFile = path.join(tempRoot, file)
  await mkdir(path.dirname(absoluteFile), { recursive: true })
  await writeFile(absoluteFile, source, 'utf8')
  return file
}

function resolveEntryExtension(entry: BundleStateEntry) {
  const ext = path.extname(entry.file).replace(EXTENSION_DOT_PREFIX_RE, '')
  if (ext.length > 0) {
    return ext
  }
  return entry.type === 'html' ? 'html' : 'js'
}

function createCandidateValidationSource(candidates: Iterable<string>) {
  return [...new Set(candidates)].sort().join('\n')
}

function removeCandidateSet(
  candidateCountByClass: Map<string, number>,
  runtimeSet: Set<string>,
  candidates: Set<string>,
) {
  for (const className of candidates) {
    const count = candidateCountByClass.get(className)
    if (count == null) {
      continue
    }
    if (count <= 1) {
      candidateCountByClass.delete(className)
      runtimeSet.delete(className)
      continue
    }
    candidateCountByClass.set(className, count - 1)
  }
}

function addCandidateSet(
  candidateCountByClass: Map<string, number>,
  runtimeSet: Set<string>,
  candidates: Set<string>,
) {
  for (const className of candidates) {
    const nextCount = (candidateCountByClass.get(className) ?? 0) + 1
    candidateCountByClass.set(className, nextCount)
    runtimeSet.add(className)
  }
}

export function createBundleRuntimeClassSetManager(
  options: CreateBundleRuntimeClassSetManagerOptions = {},
): BundleRuntimeClassSetManager {
  const customExtractCandidates = options.extractCandidates
  const extractCandidates = customExtractCandidates ?? extractValidCandidates
  const extractRawCandidates = options.extractRawCandidates ?? extractRawCandidatesWithPositions
  const runtimeSet = new Set<string>()
  const candidateCountByClass = new Map<string, number>()
  const candidatesByFile = new Map<string, Set<string>>()
  const candidateValidityCache = new Map<string, boolean>()
  let runtimeSignature: string | undefined
  let resolvedTempRoot: string | undefined
  let validationContext: RuntimeValidationContext | undefined
  let designSystemPromise: Promise<TailwindDesignSystem> | undefined

  async function reset() {
    runtimeSet.clear()
    candidateCountByClass.clear()
    candidatesByFile.clear()
    candidateValidityCache.clear()
    runtimeSignature = undefined
    validationContext = undefined
    designSystemPromise = undefined
    if (resolvedTempRoot) {
      await rm(resolvedTempRoot, { recursive: true, force: true })
      resolvedTempRoot = undefined
    }
  }

  async function resolveValidationContextCached(patcher: TailwindcssPatcherLike) {
    if (!validationContext) {
      validationContext = await resolveTailwindCssSource(patcher)
    }
    return validationContext
  }

  async function loadDesignSystem(context: RuntimeValidationContext) {
    if (!designSystemPromise) {
      designSystemPromise = (async () => {
        const { __unstable__loadDesignSystem } = await importTailwindNodeModule()
        let lastError: unknown
        for (const base of [context.base, ...context.baseFallbacks]) {
          try {
            return await __unstable__loadDesignSystem(context.css, { base })
          }
          catch (error) {
            lastError = error
          }
        }
        throw lastError instanceof Error
          ? lastError
          : new Error('Failed to load Tailwind CSS design system for incremental runtime validation.')
      })()
    }
    return designSystemPromise
  }

  function populateCandidateValidityCacheFromDesignSystem(
    designSystem: TailwindDesignSystem,
    unknownCandidates: Set<string>,
  ) {
    const parsedCandidates = [...unknownCandidates].filter(candidate => designSystem.parseCandidate(candidate).length > 0)
    const cssByCandidate = parsedCandidates.length > 0
      ? designSystem.candidatesToCss(parsedCandidates)
      : []
    const validCandidates = new Set<string>()

    for (let index = 0; index < parsedCandidates.length; index += 1) {
      const candidate = parsedCandidates[index]
      const css = cssByCandidate[index]
      if (candidate && typeof css === 'string' && css.trim().length > 0) {
        validCandidates.add(candidate)
      }
    }

    for (const candidate of unknownCandidates) {
      candidateValidityCache.set(candidate, validCandidates.has(candidate))
    }
  }

  async function validateUnknownCandidates(
    patcher: TailwindcssPatcherLike,
    tempRoot: string,
    unknownCandidates: Set<string>,
  ) {
    if (unknownCandidates.size === 0) {
      return
    }

    const context = await resolveValidationContextCached(patcher)
    if (!customExtractCandidates) {
      try {
        const designSystem = await loadDesignSystem(context)
        populateCandidateValidityCacheFromDesignSystem(designSystem, unknownCandidates)
        return
      }
      catch (error) {
        debug('incremental design-system validation failed, fallback to extractValidCandidates: %O', error)
        designSystemPromise = undefined
      }
    }

    const source = createCandidateValidationSource(unknownCandidates)
    const pattern = await writeTempEntryFile(tempRoot, VALIDATION_FILE_NAME, source)
    const validCandidates = new Set(await extractCandidates(createExtractOptions(context, tempRoot, pattern)))

    for (const candidate of unknownCandidates) {
      candidateValidityCache.set(candidate, validCandidates.has(candidate))
    }
  }

  async function extractEntryRawCandidates(entry: BundleStateEntry) {
    const matches = await extractRawCandidates(entry.source, resolveEntryExtension(entry))
    const candidates = new Set<string>()
    for (const match of matches) {
      const candidate = match?.rawCandidate
      if (typeof candidate === 'string' && candidate.length > 0) {
        candidates.add(candidate)
      }
    }
    return candidates
  }

  async function sync(
    patcher: TailwindcssPatcherLike,
    snapshot: BundleSnapshot,
  ) {
    const nextSignature = getRuntimeClassSetSignature(patcher) ?? 'runtime:missing'
    const runtimeEntries = createRuntimeEntries(snapshot)
    const runtimeEntriesByFile = new Map(runtimeEntries.map(entry => [entry.file, entry]))
    const currentRuntimeFiles = new Set(runtimeEntriesByFile.keys())
    const fullRebuild = runtimeSignature !== nextSignature || candidatesByFile.size === 0

    if (runtimeSignature !== nextSignature) {
      debug('runtime signature changed, reset incremental runtime set: %s', nextSignature)
      await reset()
    }

    runtimeSignature = nextSignature

    const projectRoot = getProjectRoot(patcher)
    resolvedTempRoot = options.tempRoot ?? path.join(
      projectRoot,
      'node_modules',
      '.cache',
      'weapp-tailwindcss',
      'vite-runtime-set',
    )

    for (const [file, previousCandidates] of candidatesByFile) {
      if (currentRuntimeFiles.has(file)) {
        continue
      }
      removeCandidateSet(candidateCountByClass, runtimeSet, previousCandidates)
      candidatesByFile.delete(file)
    }

    const changedRuntimeFiles = fullRebuild
      ? [...runtimeEntriesByFile.keys()]
      : [...collectChangedRuntimeFiles(snapshot)]

    if (changedRuntimeFiles.length === 0) {
      return new Set(runtimeSet)
    }

    const rawCandidatesByFile = new Map<string, Set<string>>()
    const unknownCandidates = new Set<string>()

    await Promise.all(changedRuntimeFiles.map(async (file) => {
      const entry = runtimeEntriesByFile.get(file)
      if (!entry) {
        return
      }
      const candidates = await extractEntryRawCandidates(entry)
      rawCandidatesByFile.set(file, candidates)
      for (const candidate of candidates) {
        if (!candidateValidityCache.has(candidate)) {
          unknownCandidates.add(candidate)
        }
      }
    }))

    await validateUnknownCandidates(patcher, resolvedTempRoot!, unknownCandidates)

    let rawCandidateCount = 0

    for (const file of changedRuntimeFiles) {
      const nextRawCandidates = rawCandidatesByFile.get(file)
      const previousCandidates = candidatesByFile.get(file)
      if (previousCandidates) {
        removeCandidateSet(candidateCountByClass, runtimeSet, previousCandidates)
      }

      if (!nextRawCandidates || nextRawCandidates.size === 0) {
        candidatesByFile.delete(file)
        continue
      }

      rawCandidateCount += nextRawCandidates.size
      const nextCandidates = new Set(
        [...nextRawCandidates].filter(candidate => candidateValidityCache.get(candidate) === true),
      )

      if (nextCandidates.size === 0) {
        candidatesByFile.delete(file)
        continue
      }

      addCandidateSet(candidateCountByClass, runtimeSet, nextCandidates)
      candidatesByFile.set(file, nextCandidates)
    }

    debug(
      'incremental runtime set synced, changedFiles=%d rawCandidates=%d validateMisses=%d runtimeSize=%d trackedFiles=%d',
      changedRuntimeFiles.length,
      rawCandidateCount,
      unknownCandidates.size,
      runtimeSet.size,
      candidatesByFile.size,
    )

    return new Set(runtimeSet)
  }

  return {
    sync,
    reset,
  }
}
