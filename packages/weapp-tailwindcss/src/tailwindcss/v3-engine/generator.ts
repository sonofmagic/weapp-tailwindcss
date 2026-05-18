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

interface TailwindcssPlugin {
  (config?: unknown): postcss.AcceptedPlugin
  contextRef?: {
    value: Array<{
      classCache?: Map<string, unknown>
    }>
  }
}

const runtimeReadyPromiseCache = new Map<string, Promise<void>>()
const incrementalGenerateCache = new Map<string, TailwindV3IncrementalGenerateCacheEntry>()

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

function createTailwindConfig(source: TailwindV3ResolvedSource, options: TailwindV3GenerateOptions) {
  const config = {
    ...(normalizeConfigObject(source.configObject) ?? {}),
  } as Config
  const rawEntries = createRawContentEntries(options.candidates ?? [], options.sources ?? [])
  config.content = mergeContent(config.content, rawEntries) as Config['content']
  return config
}

function loadTailwindcssPlugin(source: TailwindV3ResolvedSource): TailwindcssPlugin {
  const requireFromProject = createRequire(`${source.cwd}/package.json`)
  const requireFromRuntime = createRequire(import.meta.url)
  let plugin: TailwindcssPlugin | {
    default?: TailwindcssPlugin
  }
  try {
    plugin = requireFromProject(source.postcssPlugin) as TailwindcssPlugin | {
      default?: TailwindcssPlugin
    }
  }
  catch {
    plugin = requireFromRuntime(source.postcssPlugin) as TailwindcssPlugin | {
      default?: TailwindcssPlugin
    }
  }
  return typeof plugin === 'function' ? plugin : plugin.default as TailwindcssPlugin
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

function resetTailwindcssPluginContext(plugin: TailwindcssPlugin) {
  if (plugin.contextRef) {
    plugin.contextRef.value = []
  }
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

function collectClassSet(plugin: TailwindcssPlugin) {
  const classSet = new Set<string>()
  for (const context of plugin.contextRef?.value ?? []) {
    for (const candidate of context.classCache?.keys() ?? []) {
      if (String(candidate) !== '*') {
        classSet.add(candidate)
      }
    }
  }
  return classSet
}

function collectDependencyMessages(result: postcss.Result) {
  const dependencies = new Set<string>()
  for (const message of result.messages) {
    const file = message['file']
    if (message.type === 'dependency' && typeof file === 'string') {
      dependencies.add(file)
    }
  }
  return dependencies
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

  async function generateOnce(
    generateSource: TailwindV3ResolvedSource,
    options: TailwindV3GenerateOptions = {},
  ) {
    await runtimeReadyPromise

    const {
      styleOptions,
      target = 'weapp',
    } = options
    const tailwindcss = loadTailwindcssPlugin(generateSource)
    resetTailwindcssPluginContext(tailwindcss)
    const tailwindConfig = createTailwindConfig(generateSource, options)
    const result = await postcss([
      tailwindcss(tailwindConfig),
    ]).process(generateSource.css, {
      from: undefined,
    })
    const rawCss = result.css
    const css = await transformTailwindV3CssByTarget(rawCss, target, styleOptions)
    const dependencies = collectDependencyMessages(result)
    for (const dependency of generateSource.dependencies) {
      dependencies.add(dependency)
    }
    const classSet = collectClassSet(tailwindcss)

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
        target: 'tailwind',
      })
      return result.classSet
    },
    generate,
  }
}
