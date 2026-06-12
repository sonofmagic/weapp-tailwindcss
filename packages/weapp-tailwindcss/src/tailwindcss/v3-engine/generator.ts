import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type {
  TailwindV3CandidateSource,
  TailwindV3Engine,
  TailwindV3GenerateOptions,
  TailwindV3GenerateTarget,
  TailwindV3ResolvedSource,
} from './types'
import { createRequire } from 'node:module'
import postcss from 'postcss'
import {
  extractSourceCandidates,
  isBareArbitraryValuesEnabled,
  resolveBareArbitraryValueCandidate,
} from 'tailwindcss-patch'
import * as tailwindcssPatch from 'tailwindcss-patch'
import { hasCssMacroTailwindPlugin, withCssMacroStyleOptions } from '@/css-macro/auto'
import { omitUndefined } from '@/utils/object'
import { createIncrementalGenerateCacheKey } from './generator/cache-key'
import { createChangedContentEntries, createTailwindConfig, mergeGenerateCandidates, normalizeConfigObject } from './generator/content'
import { createRuntimeReadyPromise } from './generator/runtime-ready'
import { transformTailwindV3CssByTarget } from './miniprogram'

const incrementalGenerateCache = new Map<string, TailwindV3IncrementalGenerateCacheEntry>()

interface TailwindV3Context {
  classCache: Map<string, unknown>
  changedContent: unknown[]
  offsets: {
    sort: (rules: Array<[unknown, postcss.Node]>) => Array<[{ layer: string }, postcss.Node]>
  }
  ruleCache: Set<[unknown, postcss.Node]>
}

interface TailwindV3ProcessResult {
  css: string
  messages: Array<Record<string, unknown>>
}

interface TailwindV3Internals {
  createContext: (tailwindConfig: unknown, changedContent: unknown[], root: postcss.Root) => TailwindV3Context
  collapseAdjacentRules: (context: TailwindV3Context) => (root: postcss.Root, result: TailwindV3ProcessResult) => void
  collapseDuplicateDeclarations: (context: TailwindV3Context) => (root: postcss.Root, result: TailwindV3ProcessResult) => void
  escapeClassName: (className: string) => string
  generateRules: (candidates: Set<string>, context: TailwindV3Context) => Array<[unknown, postcss.Node]>
  processTailwindFeatures: (setupContext: unknown) => (root: postcss.Root, result: TailwindV3ProcessResult) => Promise<TailwindV3Context>
  resolveDefaultsAtRules: (context: TailwindV3Context) => (root: postcss.Root, result: TailwindV3ProcessResult) => void
  resolveConfig: (config: unknown) => unknown
  validateConfig: (config: unknown) => unknown
  notOnDemandCandidate: string
}

interface TailwindV3IncrementalGenerateCacheEntry {
  context: TailwindV3Context
  seenCandidates: Set<string>
  classSet: Set<string>
  css: string
  rawCss: string
  dependencies: string[]
  target: TailwindV3GenerateTarget
}

type TailwindV3PatchRawGenerator = (options: {
  cwd?: string
  packageName?: string
  css?: string
  candidates?: Iterable<string>
  sources?: TailwindV3CandidateSource[]
  config?: unknown
  directUtilitiesOnly?: boolean | 'auto'
}) => Promise<{
  css: string
  classSet: Set<string>
  context: TailwindV3Context
  dependencies: string[]
}>

const patchRawStyleGenerator = typeof (tailwindcssPatch as { generateTailwindV3RawStyle?: unknown }).generateTailwindV3RawStyle === 'function'
  ? (tailwindcssPatch as unknown as { generateTailwindV3RawStyle: TailwindV3PatchRawGenerator }).generateTailwindV3RawStyle
  : undefined

function normalizeBareArbitraryValueCandidate(
  candidate: string,
  bareArbitraryValues: TailwindV3GenerateOptions['bareArbitraryValues'],
) {
  return resolveBareArbitraryValueCandidate(candidate, bareArbitraryValues)?.canonicalCandidate ?? candidate
}

function normalizeBareArbitraryValueCandidates(
  candidates: Iterable<string>,
  bareArbitraryValues: TailwindV3GenerateOptions['bareArbitraryValues'],
) {
  const normalized = new Set<string>()
  const restoreCandidates = new Map<string, string>()
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeBareArbitraryValueCandidate(candidate, bareArbitraryValues)
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

async function collectSourceBareArbitraryValueCandidates(
  sources: TailwindV3CandidateSource[] | undefined,
  bareArbitraryValues: TailwindV3GenerateOptions['bareArbitraryValues'],
) {
  if (!isBareArbitraryValuesEnabled(bareArbitraryValues)) {
    return []
  }
  const candidates = new Set<string>()
  for (const source of sources ?? []) {
    for (const candidate of await extractSourceCandidates(source.content, source.extension ?? 'html', omitUndefined({ bareArbitraryValues }))) {
      if (resolveBareArbitraryValueCandidate(candidate, bareArbitraryValues)) {
        candidates.add(candidate)
      }
    }
  }
  return [...candidates]
}

function escapeCssClassSelector(className: string) {
  return className.replace(/[^\w-]/g, char => `\\${char}`)
}

function restoreBareArbitraryValueCssSelectors(
  css: string,
  originalCandidates: Iterable<string>,
  bareArbitraryValues: TailwindV3GenerateOptions['bareArbitraryValues'],
  escapeClassName: TailwindV3Internals['escapeClassName'],
) {
  if (!isBareArbitraryValuesEnabled(bareArbitraryValues)) {
    return css
  }
  let restored = css
  for (const originalCandidate of originalCandidates) {
    const canonical = resolveBareArbitraryValueCandidate(originalCandidate, bareArbitraryValues)?.canonicalCandidate
    if (canonical) {
      restored = restored.split(`.${escapeClassName(canonical)}`).join(`.${escapeCssClassSelector(originalCandidate)}`)
    }
  }
  return restored
}

function restoreBareArbitraryValueClassSet(
  classSet: Iterable<string>,
  originalCandidates: Iterable<string>,
  bareArbitraryValues: TailwindV3GenerateOptions['bareArbitraryValues'],
) {
  if (!isBareArbitraryValuesEnabled(bareArbitraryValues)) {
    return new Set(classSet)
  }
  const restored = new Set(classSet)
  for (const originalCandidate of originalCandidates) {
    const canonical = resolveBareArbitraryValueCandidate(originalCandidate, bareArbitraryValues)?.canonicalCandidate
    if (canonical && restored.has(canonical)) {
      restored.delete(canonical)
      restored.add(originalCandidate)
    }
  }
  return restored
}

function collectGeneratedCandidates(
  context: TailwindV3Context,
  candidates: Iterable<string>,
  restoreCandidates: ReadonlyMap<string, string>,
) {
  const classSet = new Set<string>()
  for (const candidate of candidates) {
    if (context.classCache.has(candidate)) {
      classSet.add(restoreCandidates.get(candidate) ?? candidate)
    }
  }
  return classSet
}

function hasRemovedCandidates(previousCandidates: Set<string>, nextCandidates: Set<string>) {
  for (const candidate of previousCandidates) {
    if (!nextCandidates.has(candidate)) {
      return true
    }
  }
  return false
}

function shouldAutoEnableCssMacro(source: TailwindV3ResolvedSource) {
  return hasCssMacroTailwindPlugin(normalizeConfigObject(source.configObject)?.plugins)
}

function resolveStyleOptions(source: TailwindV3ResolvedSource, options: Partial<IStyleHandlerOptions> | undefined) {
  return shouldAutoEnableCssMacro(source) ? withCssMacroStyleOptions(options) : options
}

function loadTailwindV3Internals(source: TailwindV3ResolvedSource): TailwindV3Internals {
  const requireFromProject = createRequire(`${source.cwd}/package.json`)
  const requireFromRuntime = createRequire(import.meta.url)
  const requireTailwind = (id: string) => {
    try {
      return requireFromProject(id) as Record<string, unknown>
    }
    catch {
      return requireFromRuntime(id) as Record<string, unknown>
    }
  }
  const collapseAdjacentRulesModule = requireTailwind(`${source.packageName}/lib/lib/collapseAdjacentRules`)
  const collapseDuplicateDeclarationsModule = requireTailwind(`${source.packageName}/lib/lib/collapseDuplicateDeclarations`)
  const escapeClassNameModule = requireTailwind(`${source.packageName}/lib/util/escapeClassName`)
  const generateRulesModule = requireTailwind(`${source.packageName}/lib/lib/generateRules`)
  const sharedStateModule = requireTailwind(`${source.packageName}/lib/lib/sharedState`)
  const setupContextUtils = requireTailwind(`${source.packageName}/lib/lib/setupContextUtils`)
  const processTailwindFeaturesModule = requireTailwind(`${source.packageName}/lib/processTailwindFeatures`)
  const resolveDefaultsAtRulesModule = requireTailwind(`${source.packageName}/lib/lib/resolveDefaultsAtRules`)
  const resolveConfigModule = requireTailwind(`${source.packageName}/lib/public/resolve-config`)
  const validateConfigModule = requireTailwind(`${source.packageName}/lib/util/validateConfig.js`)
  return {
    collapseAdjacentRules: (collapseAdjacentRulesModule['default'] ?? collapseAdjacentRulesModule) as TailwindV3Internals['collapseAdjacentRules'],
    collapseDuplicateDeclarations: (collapseDuplicateDeclarationsModule['default'] ?? collapseDuplicateDeclarationsModule) as TailwindV3Internals['collapseDuplicateDeclarations'],
    createContext: setupContextUtils['createContext'] as TailwindV3Internals['createContext'],
    escapeClassName: (escapeClassNameModule['default'] ?? escapeClassNameModule) as TailwindV3Internals['escapeClassName'],
    generateRules: generateRulesModule['generateRules'] as TailwindV3Internals['generateRules'],
    notOnDemandCandidate: String(sharedStateModule['NOT_ON_DEMAND'] ?? '*'),
    processTailwindFeatures: (processTailwindFeaturesModule['default'] ?? processTailwindFeaturesModule) as TailwindV3Internals['processTailwindFeatures'],
    resolveDefaultsAtRules: (resolveDefaultsAtRulesModule['default'] ?? resolveDefaultsAtRulesModule) as TailwindV3Internals['resolveDefaultsAtRules'],
    resolveConfig: (resolveConfigModule['default'] ?? resolveConfigModule) as TailwindV3Internals['resolveConfig'],
    validateConfig: validateConfigModule['validateConfig'] as TailwindV3Internals['validateConfig'],
  }
}

function isDirectUtilitiesOnlyCss(css: string) {
  return css.replace(/\s+/g, '') === '@tailwindutilities;'
}

function collectClassSet(context: TailwindV3Context) {
  const classSet = new Set<string>()
  for (const candidate of context.classCache.keys()) {
    if (String(candidate) !== '*') {
      classSet.add(candidate)
    }
  }
  return classSet
}

function collectDependencyMessages(result: TailwindV3ProcessResult) {
  const dependencies = new Set<string>()
  for (const message of result.messages) {
    const file = message['file']
    if (message['type'] === 'dependency' && typeof file === 'string') {
      dependencies.add(file)
    }
  }
  return dependencies
}

function sortCandidates(candidates: Iterable<string>) {
  return [...candidates].sort((a, z) => {
    if (a === z) {
      return 0
    }
    return a < z ? -1 : 1
  })
}

function appendUtilityRules(root: postcss.Root, context: TailwindV3Context, rules: Array<[unknown, postcss.Node]>) {
  const sortedRules = context.offsets.sort(rules)
  for (const [sort, rule] of sortedRules) {
    const tailwindRaw = rule.raws.tailwind as { parentLayer?: string } | undefined
    if (sort.layer === 'utilities' || (sort.layer === 'variants' && tailwindRaw?.parentLayer === 'utilities')) {
      root.append(rule.clone())
    }
  }
}

function appendDirectUtilityRules(root: postcss.Root, context: TailwindV3Context) {
  appendUtilityRules(root, context, [...context.ruleCache])
}

async function generateRawStyleWithPatch(
  generateSource: TailwindV3ResolvedSource,
  candidates: Set<string>,
  sources: TailwindV3CandidateSource[],
) {
  if (!patchRawStyleGenerator) {
    return undefined
  }

  try {
    return await patchRawStyleGenerator({
      cwd: generateSource.cwd,
      packageName: generateSource.packageName,
      css: generateSource.css,
      candidates,
      sources,
      config: createTailwindConfig(generateSource, {
        candidates,
        sources,
      }),
      directUtilitiesOnly: 'auto',
    })
  }
  catch (error: unknown) {
    if (isTailwindV3PatchModuleResolveError(error)) {
      return undefined
    }
    throw error
  }
}

function isTailwindV3PatchModuleResolveError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false
  }
  const maybeError = error as {
    code?: unknown
    message?: unknown
  }
  return maybeError.code === 'MODULE_NOT_FOUND'
    && typeof maybeError.message === 'string'
    && maybeError.message.includes(`${'/'}lib${'/'}public${'/'}resolve-config`)
}

export function createTailwindV3Engine(source: TailwindV3ResolvedSource): TailwindV3Engine {
  const runtimeReadyPromise = createRuntimeReadyPromise(source)
  let tailwindInternals: TailwindV3Internals | undefined

  async function generateOnce(
    generateSource: TailwindV3ResolvedSource,
    options: TailwindV3GenerateOptions = {},
  ) {
    await runtimeReadyPromise
    tailwindInternals ??= loadTailwindV3Internals(source)
    const internals = tailwindInternals

    const {
      styleOptions,
      target = 'weapp',
    } = options
    const resolvedStyleOptions = resolveStyleOptions(generateSource, styleOptions)
    const requestedCandidates = mergeGenerateCandidates(generateSource, options)
    for (const candidate of await collectSourceBareArbitraryValueCandidates(options.sources, options.bareArbitraryValues)) {
      requestedCandidates.add(candidate)
    }
    const normalizedCandidates = normalizeBareArbitraryValueCandidates(requestedCandidates, options.bareArbitraryValues)
    const tailwindOptions = {
      ...options,
      candidates: normalizedCandidates.candidates,
    }
    const tailwindConfig = internals.validateConfig(internals.resolveConfig(createTailwindConfig(generateSource, tailwindOptions)))
    const candidates = normalizedCandidates.candidates
    const changedContent = createChangedContentEntries(candidates, options.sources ?? [])
    const root = postcss.parse(generateSource.css, {
      from: undefined,
    })
    const result: TailwindV3ProcessResult = {
      css: '',
      messages: [],
    }
    let context: TailwindV3Context
    let rawCss: string
    let dependencies: Set<string>
    const patchGenerated = await generateRawStyleWithPatch(generateSource, candidates, options.sources ?? [])
    if (patchGenerated) {
      context = patchGenerated.context
      rawCss = restoreBareArbitraryValueCssSelectors(
        patchGenerated.css,
        requestedCandidates,
        options.bareArbitraryValues,
        internals.escapeClassName,
      )
      dependencies = new Set(patchGenerated.dependencies)
    }
    else {
      if (isDirectUtilitiesOnlyCss(generateSource.css)) {
        context = internals.createContext(tailwindConfig, changedContent, root)
        internals.generateRules(
          new Set(sortCandidates([internals.notOnDemandCandidate, ...candidates])),
          context,
        )
        root.removeAll()
        appendDirectUtilityRules(root, context)
        internals.resolveDefaultsAtRules(context)(root, result)
        internals.collapseAdjacentRules(context)(root, result)
        internals.collapseDuplicateDeclarations(context)(root, result)
      }
      else {
        const setupContext = () => {
          return (currentRoot: postcss.Root) => internals.createContext(tailwindConfig, changedContent, currentRoot)
        }
        context = await internals.processTailwindFeatures(setupContext)(root, result)
      }
      rawCss = restoreBareArbitraryValueCssSelectors(
        root.toString(),
        requestedCandidates,
        options.bareArbitraryValues,
        internals.escapeClassName,
      )
      dependencies = collectDependencyMessages(result)
    }
    const css = await transformTailwindV3CssByTarget(rawCss, target, resolvedStyleOptions)
    for (const dependency of generateSource.dependencies) {
      dependencies.add(dependency)
    }
    const classSet = restoreBareArbitraryValueClassSet(collectClassSet(context), requestedCandidates, options.bareArbitraryValues)

    return {
      css,
      rawCss,
      context,
      classSet,
      rawCandidates: requestedCandidates,
      dependencies: [...dependencies],
      sources: [],
      root: null,
      target,
      version: 3 as const,
    }
  }

  async function generateIncrementalMissingUtilities(
    context: TailwindV3Context,
    candidates: string[],
    target: TailwindV3GenerateTarget,
    styleOptions: Partial<IStyleHandlerOptions> | undefined,
    bareArbitraryValues: TailwindV3GenerateOptions['bareArbitraryValues'],
  ) {
    tailwindInternals ??= loadTailwindV3Internals(source)
    const internals = tailwindInternals
    const root = postcss.root()
    const result: TailwindV3ProcessResult = {
      css: '',
      messages: [],
    }
    const normalizedCandidates = normalizeBareArbitraryValueCandidates(candidates, bareArbitraryValues)
    const sortedCandidates = sortCandidates(normalizedCandidates.candidates)
    const rules = internals.generateRules(new Set(sortedCandidates), context)
    appendUtilityRules(root, context, rules)
    internals.resolveDefaultsAtRules(context)(root, result)
    internals.collapseAdjacentRules(context)(root, result)
    internals.collapseDuplicateDeclarations(context)(root, result)

    const rawCss = restoreBareArbitraryValueCssSelectors(
      root.toString(),
      candidates,
      bareArbitraryValues,
      internals.escapeClassName,
    )
    const css = await transformTailwindV3CssByTarget(rawCss, target, resolveStyleOptions(source, styleOptions))
    return {
      css,
      rawCss,
      classSet: collectGeneratedCandidates(context, sortedCandidates, normalizedCandidates.restoreCandidates),
      dependencies: collectDependencyMessages(result),
    }
  }

  async function generateWithIncrementalCache(options: TailwindV3GenerateOptions = {}) {
    if ((options.sources?.length ?? 0) > 0) {
      return generateOnce(source, options)
    }

    const target = options.target ?? 'weapp'
    const requestedCandidates = mergeGenerateCandidates(source, options)
    if (requestedCandidates.size === 0) {
      return generateOnce(source, options)
    }

    const styleOptions = resolveStyleOptions(source, options.styleOptions)
    const cacheKey = createIncrementalGenerateCacheKey(source, target, styleOptions, options.bareArbitraryValues)
    const cached = incrementalGenerateCache.get(cacheKey)
    if (cached) {
      if (hasRemovedCandidates(cached.seenCandidates, requestedCandidates)) {
        const generated = await generateOnce(source, options)
        incrementalGenerateCache.set(cacheKey, {
          context: generated.context,
          seenCandidates: new Set(requestedCandidates),
          classSet: new Set(generated.classSet),
          css: generated.css,
          rawCss: generated.rawCss,
          dependencies: generated.dependencies,
          target: generated.target,
        })
        return generated
      }

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
          sources: [],
          root: null,
          target: cached.target,
          version: 3 as const,
        }
      }

      const generated = await generateIncrementalMissingUtilities(
        cached.context,
        missingCandidates,
        target,
        styleOptions,
        options.bareArbitraryValues,
      )
      for (const candidate of missingCandidates) {
        cached.seenCandidates.add(candidate)
      }
      for (const className of generated.classSet) {
        cached.classSet.add(className)
      }
      cached.css = [cached.css, generated.css].filter(Boolean).join('\n')
      cached.rawCss = [cached.rawCss, generated.rawCss].filter(Boolean).join('\n')
      cached.dependencies = [...new Set([...cached.dependencies, ...generated.dependencies])]
      return {
        css: cached.css,
        rawCss: cached.rawCss,
        incrementalCss: generated.css,
        incrementalRawCss: generated.rawCss,
        classSet: new Set(cached.classSet),
        rawCandidates: new Set(cached.seenCandidates),
        dependencies: cached.dependencies,
        sources: [],
        root: null,
        target: cached.target,
        version: 3 as const,
      }
    }

    const generated = await generateOnce(source, options)
    incrementalGenerateCache.set(cacheKey, {
      context: generated.context,
      seenCandidates: new Set(requestedCandidates),
      classSet: new Set(generated.classSet),
      css: generated.css,
      rawCss: generated.rawCss,
      dependencies: generated.dependencies,
      target: generated.target,
    })
    return generated
  }

  async function generate(options: TailwindV3GenerateOptions = {}) {
    return options.incrementalCache
      ? generateWithIncrementalCache(options)
      : generateOnce(source, options)
  }

  return {
    source,
    async validateCandidates(candidates) {
      const result = await generate({
        candidates,
        incrementalCache: true,
        target: 'tailwind',
      })
      return result.classSet
    },
    generate,
  }
}
