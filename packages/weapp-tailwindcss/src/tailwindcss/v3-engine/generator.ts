import type { Config } from 'tailwindcss'
import type {
  TailwindV3CandidateSource,
  TailwindV3Engine,
  TailwindV3GenerateOptions,
  TailwindV3ResolvedSource,
} from './types'
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
  return ensureTailwindcssRuntimePatch(patcher, {
    clearRequireCache: true,
  })
}

export function createTailwindV3Engine(source: TailwindV3ResolvedSource): TailwindV3Engine {
  const runtimeReadyPromise = createRuntimeReadyPromise(source)

  async function generate(options: TailwindV3GenerateOptions = {}) {
    await runtimeReadyPromise

    const {
      styleOptions,
      target = 'weapp',
    } = options
    const tailwindcss = loadTailwindcssPlugin(source)
    const tailwindConfig = createTailwindConfig(source, options)
    const result = await postcss([
      tailwindcss(tailwindConfig),
    ]).process(source.css, {
      from: undefined,
    })
    const rawCss = result.css
    const css = await transformTailwindV3CssByTarget(rawCss, target, styleOptions)
    const dependencies = collectDependencyMessages(result)
    for (const dependency of source.dependencies) {
      dependencies.add(dependency)
    }
    const classSet = collectClassSet(tailwindcss)

    return {
      css,
      rawCss,
      classSet,
      rawCandidates: new Set(options.candidates ?? []),
      dependencies: [...dependencies],
      sources: [],
      root: null,
      target,
      version: 3 as const,
    }
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
