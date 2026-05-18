import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { Config } from 'tailwindcss'
import type {
  TailwindV3CandidateSource,
  TailwindV3Engine,
  TailwindV3GenerateOptions,
  TailwindV3GenerateTarget,
  TailwindV3ResolvedSource,
} from './types'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import postcss from 'postcss'
import { createTailwindcssPatcher } from '@/tailwindcss/patcher'
import { ensureTailwindcssRuntimePatch } from '@/tailwindcss/runtime-patch'
import { transformTailwindV3CssByTarget } from './miniprogram'

const runtimeReadyPromiseCache = new Map<string, Promise<void>>()
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
  generateRules: (candidates: Set<string>, context: TailwindV3Context) => Array<[unknown, postcss.Node]>
  processTailwindFeatures: (setupContext: unknown) => (root: postcss.Root, result: TailwindV3ProcessResult) => Promise<TailwindV3Context>
  resolveDefaultsAtRules: (context: TailwindV3Context) => (root: postcss.Root, result: TailwindV3ProcessResult) => void
  resolveConfig: (config: unknown) => unknown
  validateConfig: (config: unknown) => unknown
  notOnDemandCandidate: string
}

interface TailwindV3IncrementalGenerateCacheEntry {
  seenCandidates: Set<string>
  classSet: Set<string>
  css: string
  rawCss: string
  dependencies: string[]
  target: TailwindV3GenerateTarget
}

interface LegacyContentObject {
  files?: unknown
  relative?: boolean
  extract?: unknown
  transform?: unknown
}

function isLegacyContentObject(value: unknown): value is LegacyContentObject {
  return typeof value === 'object' && value !== null && 'files' in value
}

function createRawContentEntries(candidates: Iterable<string>, sources: TailwindV3CandidateSource[]) {
  const entries: Array<{ raw: string, extension: string }> = []
  const candidateContent = [...candidates].join(' ')
  if (candidateContent.length > 0) {
    entries.push({
      raw: candidateContent,
      extension: 'html',
    })
  }
  for (const source of sources) {
    entries.push({
      raw: source.content,
      extension: source.extension ?? 'html',
    })
  }
  return entries
}

function createChangedContentEntries(candidates: Iterable<string>, sources: TailwindV3CandidateSource[]) {
  return createRawContentEntries(candidates, sources).map(entry => ({
    content: entry.raw,
    extension: entry.extension,
  }))
}

function collectCandidates(candidates: Iterable<string> | undefined) {
  return new Set(candidates ?? [])
}

function mergeContent(content: unknown, rawEntries: Array<{ raw: string, extension: string }>) {
  if (isLegacyContentObject(content)) {
    return {
      ...content,
      relative: content.relative ?? true,
      files: [
        ...([] as unknown[]).concat(content.files ?? []),
        ...rawEntries,
      ],
    }
  }

  return {
    relative: true,
    files: [
      ...([] as unknown[]).concat(content ?? []),
      ...rawEntries,
    ],
  }
}

function normalizeConfigObject(config: Config | undefined) {
  if (!config || typeof config !== 'object') {
    return config
  }
  const maybeDefault = (config as { default?: unknown }).default
  if (maybeDefault && typeof maybeDefault === 'object') {
    return maybeDefault as Config
  }
  return config
}

function hasExplicitContentInput(options: TailwindV3GenerateOptions) {
  return options.candidates !== undefined || options.sources !== undefined
}

function createExplicitContentConfig(rawEntries: Array<{ raw: string, extension: string }>) {
  return {
    relative: true,
    files: rawEntries,
  }
}

function createTailwindConfig(source: TailwindV3ResolvedSource, options: TailwindV3GenerateOptions) {
  const config = {
    ...(normalizeConfigObject(source.configObject) ?? {}),
  } as Config
  const rawEntries = createRawContentEntries(options.candidates ?? [], options.sources ?? [])
  config.content = hasExplicitContentInput(options)
    ? createExplicitContentConfig(rawEntries) as Config['content']
    : mergeContent(config.content, rawEntries) as Config['content']
  return config
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
    generateRules: generateRulesModule['generateRules'] as TailwindV3Internals['generateRules'],
    notOnDemandCandidate: String(sharedStateModule['NOT_ON_DEMAND'] ?? '*'),
    processTailwindFeatures: (processTailwindFeaturesModule['default'] ?? processTailwindFeaturesModule) as TailwindV3Internals['processTailwindFeatures'],
    resolveDefaultsAtRules: (resolveDefaultsAtRulesModule['default'] ?? resolveDefaultsAtRulesModule) as TailwindV3Internals['resolveDefaultsAtRules'],
    resolveConfig: (resolveConfigModule['default'] ?? resolveConfigModule) as TailwindV3Internals['resolveConfig'],
    validateConfig: validateConfigModule['validateConfig'] as TailwindV3Internals['validateConfig'],
  }
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
  source: TailwindV3ResolvedSource,
  target: TailwindV3GenerateTarget,
  styleOptions: Partial<IStyleHandlerOptions> | undefined,
) {
  return [
    source.packageName,
    source.postcssPlugin,
    source.cwd,
    source.config ?? 'config:missing',
    createDependencyFingerprint(source.dependencies),
    source.css,
    target,
    createStableJson(styleOptions),
  ].join('\0')
}

function createRuntimeReadyCacheKey(source: TailwindV3ResolvedSource, rootPath: string | undefined) {
  return [
    source.packageName,
    source.postcssPlugin,
    rootPath ?? 'missing',
    source.config ?? 'config:missing',
    source.cwd,
  ].join('\0')
}

function isTailwindImport(params: string, layer: string) {
  const trimmed = params.trim()
  return new RegExp(`^(?:url\\()?['"]tailwindcss/${layer}(?:\\.css)?['"]\\)?(?:\\s|$)`).test(trimmed)
}

function createUtilitiesOnlyCss(css: string) {
  try {
    const root = postcss.parse(css)
    root.walkAtRules((rule) => {
      if (rule.name === 'tailwind') {
        const layer = rule.params.trim()
        if (layer === 'base' || layer === 'components') {
          rule.remove()
        }
        return
      }
      if (rule.name === 'import' && (isTailwindImport(rule.params, 'base') || isTailwindImport(rule.params, 'components'))) {
        rule.remove()
        return
      }
      if (rule.name === 'layer') {
        const layer = rule.params.trim()
        if (layer === 'base' || layer === 'components') {
          rule.remove()
        }
      }
    })
    return root.toString()
  }
  catch {
    return css
      .replace(/@tailwind\s+(?:base|components)\s*;/g, '')
      .replace(/@import\s+(?:url\()?['"]tailwindcss\/(?:base|components)(?:\.css)?['"][^;]*;/g, '')
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

function appendDirectUtilityRules(root: postcss.Root, context: TailwindV3Context) {
  const sortedRules = context.offsets.sort([...context.ruleCache])
  for (const [sort, rule] of sortedRules) {
    const tailwindRaw = rule.raws.tailwind as { parentLayer?: string } | undefined
    if (sort.layer === 'utilities' || (sort.layer === 'variants' && tailwindRaw?.parentLayer === 'utilities')) {
      root.append(rule.clone())
    }
  }
}

function createRuntimeReadyPromise(source: TailwindV3ResolvedSource) {
  const patcher = createTailwindcssPatcher({
    basedir: source.cwd,
    supportCustomLengthUnitsPatch: true,
    tailwindcss: {
      ...(source.config === undefined ? {} : { config: source.config }),
      cwd: source.cwd,
      packageName: source.packageName,
      postcssPlugin: source.postcssPlugin,
      version: 3,
    },
  })
  const cacheKey = createRuntimeReadyCacheKey(source, patcher.packageInfo?.rootPath)
  const cached = runtimeReadyPromiseCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const task = ensureTailwindcssRuntimePatch(patcher, {
    clearRequireCache: true,
  }).catch((error) => {
    runtimeReadyPromiseCache.delete(cacheKey)
    throw error
  })
  runtimeReadyPromiseCache.set(cacheKey, task)
  return task
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
    const tailwindConfig = internals.validateConfig(internals.resolveConfig(createTailwindConfig(generateSource, options)))
    const changedContent = createChangedContentEntries(options.candidates ?? [], options.sources ?? [])
    const root = postcss.parse(generateSource.css, {
      from: undefined,
    })
    const result: TailwindV3ProcessResult = {
      css: '',
      messages: [],
    }
    let context: TailwindV3Context
    if (isDirectUtilitiesOnlyCss(generateSource.css)) {
      context = internals.createContext(tailwindConfig, changedContent, root)
      internals.generateRules(
        new Set(sortCandidates([internals.notOnDemandCandidate, ...collectCandidates(options.candidates)])),
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
    const rawCss = root.toString()
    const css = await transformTailwindV3CssByTarget(rawCss, target, styleOptions)
    const dependencies = collectDependencyMessages(result)
    for (const dependency of generateSource.dependencies) {
      dependencies.add(dependency)
    }
    const classSet = collectClassSet(context)

    return {
      css,
      rawCss,
      classSet,
      rawCandidates: collectCandidates(options.candidates),
      dependencies: [...dependencies],
      sources: [],
      root: null,
      target,
      version: 3 as const,
    }
  }

  async function generateWithIncrementalCache(options: TailwindV3GenerateOptions = {}) {
    if ((options.sources?.length ?? 0) > 0) {
      return generateOnce(source, options)
    }

    const target = options.target ?? 'weapp'
    const requestedCandidates = collectCandidates(options.candidates)
    const cacheKey = createIncrementalGenerateCacheKey(source, target, options.styleOptions)
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
          sources: [],
          root: null,
          target: cached.target,
          version: 3 as const,
        }
      }

      const utilitySource = {
        ...source,
        css: createUtilitiesOnlyCss(source.css),
      }
      const generated = await generateOnce(utilitySource, {
        ...options,
        candidates: missingCandidates,
      })
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
