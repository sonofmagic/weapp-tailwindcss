import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { PluginCreator, Result, Root } from 'postcss'
import type {
  TailwindV4CandidateSource,
  TailwindV4SourceOptions,
  WeappTailwindcssGenerateOptions,
  WeappTailwindcssGenerateResult,
  WeappTailwindcssGeneratorTarget,
  WeappTailwindcssGeneratorUserOptions,
} from './generator'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import fg from 'fast-glob'
import postcss from 'postcss'
import { loadConfig } from 'tailwindcss-config'
import { extractValidCandidates } from 'tailwindcss-patch'
import {
  createWeappTailwindcssGenerator,
  normalizeWeappTailwindcssGeneratorOptions,
  resolveTailwindV3Source,
  resolveTailwindV4Source,
} from './generator'
import {
  DEFAULT_TAILWINDCSS_GENERATOR_MAJOR_VERSION,
  readInstalledPackageMajorVersion,
} from './tailwindcss/version'

const PLUGIN_NAME = 'weapp-tailwindcss'
const POSTCSS_SOURCE_EXTENSIONS = [
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
  'vue',
  'mpx',
  'js',
  'jsx',
  'ts',
  'tsx',
]
const POSTCSS_SOURCE_PATTERN = `**/*.{${POSTCSS_SOURCE_EXTENSIONS.join(',')}}`

type LegacyContentFilePattern = string

interface LegacyContentObject {
  files?: LegacyContentConfig
  relative?: boolean
}

interface TailwindSourceEntry {
  base: string
  pattern: string
  negated: boolean
}

type LegacyContentConfig
  = | LegacyContentFilePattern
    | LegacyContentFilePattern[]
    | LegacyContentObject
    | Array<LegacyContentFilePattern | LegacyContentObject>

export interface WeappTailwindcssPostcssPluginOptions extends TailwindV4SourceOptions {
  generator?: WeappTailwindcssGeneratorUserOptions
  target?: WeappTailwindcssGeneratorTarget
  version?: 3 | 4
  config?: string
  postcssPlugin?: string
  candidates?: Iterable<string>
  scanSources?: WeappTailwindcssGenerateOptions['scanSources']
  sources?: TailwindV4CandidateSource[]
  styleOptions?: Partial<IStyleHandlerOptions>
}

function resolveInputFile(result: Result) {
  const from = result.opts.from
  if (typeof from !== 'string' || from.length === 0) {
    return undefined
  }
  return path.isAbsolute(from) ? from : path.resolve(process.cwd(), from)
}

function resolvePostcssBase(result: Result, options: WeappTailwindcssPostcssPluginOptions) {
  if (options.base) {
    return options.base
  }
  const inputFile = resolveInputFile(result)
  return inputFile ? path.dirname(inputFile) : process.cwd()
}

function resolvePostcssProjectRoot(result: Result, options: WeappTailwindcssPostcssPluginOptions) {
  if (options.projectRoot) {
    return options.projectRoot
  }
  const inputFile = resolveInputFile(result)
  return inputFile ? path.dirname(inputFile) : process.cwd()
}

function replaceRootCss(root: Root, css: string, result: Result) {
  const nextRoot = postcss.parse(css, {
    from: resolveInputFile(result),
  })
  root.removeAll()
  root.append(nextRoot.nodes)
}

function addDependencyMessages(result: Result, generated: WeappTailwindcssGenerateResult) {
  for (const file of generated.dependencies) {
    result.messages.push({
      type: 'dependency',
      plugin: PLUGIN_NAME,
      file,
    })
  }
}

function parseLocalSourceParam(params: string) {
  const value = params.trim()
  if (!value || value === 'none' || value.startsWith('not ') || value.startsWith('inline(')) {
    return
  }
  const match = /^(['"])(.+)\1$/.exec(value)
  return match?.[2]
}

function parseConfigParam(params: string) {
  const value = params.trim()
  const match = /^(['"])(.+)\1$/.exec(value)
  return match?.[2]
}

function parseSourceFileParam(params: string) {
  const value = params.trim()
  if (!value || value === 'none' || value.startsWith('inline(')) {
    return undefined
  }

  const negated = value.startsWith('not ')
  const sourceValue = negated ? value.slice(4).trim() : value
  const match = /^(['"])(.+)\1$/.exec(sourceValue)
  return match?.[2]
    ? {
        negated,
        sourcePath: match[2],
      }
    : undefined
}

function hasTailwindV4CssSyntax(root: Root) {
  let hasV4Syntax = false
  root.walkAtRules((rule) => {
    if (rule.name === 'theme' || rule.name === 'source' || rule.name === 'custom-variant') {
      hasV4Syntax = true
    }
    if (rule.name === 'import' && /(['"])tailwindcss\1/.test(rule.params)) {
      hasV4Syntax = true
    }
  })
  return hasV4Syntax
}

function resolvePostcssTailwindVersion(
  root: Root,
  result: Result,
  options: WeappTailwindcssPostcssPluginOptions,
) {
  const packageName = options.packageName ?? 'tailwindcss'
  const installedVersion = readInstalledPackageMajorVersion(packageName, resolvePostcssProjectRoot(result, options))
  if (installedVersion) {
    return installedVersion
  }
  if (options.version) {
    return options.version
  }
  if (packageName === '@tailwindcss/postcss' || packageName.includes('tailwindcss4')) {
    return 4
  }
  if (packageName.includes('tailwindcss3')) {
    return 3
  }
  if (hasTailwindV4CssSyntax(root)) {
    return 4
  }
  return DEFAULT_TAILWINDCSS_GENERATOR_MAJOR_VERSION
}

function getSourceExtension(file: string) {
  const extension = path.extname(file).slice(1)
  return extension || undefined
}

async function pathExistsAsDirectory(file: string) {
  try {
    return (await stat(file)).isDirectory()
  }
  catch {
    return false
  }
}

async function expandLocalSourceFiles(sourcePath: string, base: string) {
  const absoluteSource = path.isAbsolute(sourcePath) ? sourcePath : path.resolve(base, sourcePath)
  if (await pathExistsAsDirectory(absoluteSource)) {
    return fg(POSTCSS_SOURCE_PATTERN, {
      absolute: true,
      cwd: absoluteSource,
      onlyFiles: true,
    })
  }

  return fg(sourcePath, {
    absolute: true,
    cwd: base,
    onlyFiles: true,
  })
}

async function resolveTailwindSourceEntry(
  sourcePath: string,
  base: string,
  negated: boolean,
): Promise<TailwindSourceEntry> {
  const absoluteSource = path.isAbsolute(sourcePath) ? path.resolve(sourcePath) : path.resolve(base, sourcePath)
  if (await pathExistsAsDirectory(absoluteSource)) {
    return {
      base: absoluteSource,
      negated,
      pattern: POSTCSS_SOURCE_PATTERN,
    }
  }

  if (path.isAbsolute(sourcePath)) {
    return {
      base: path.dirname(absoluteSource),
      negated,
      pattern: path.basename(absoluteSource),
    }
  }

  return {
    base,
    negated,
    pattern: sourcePath,
  }
}

function collectConfigPaths(root: Root, base: string) {
  const configPaths: string[] = []
  root.walkAtRules('config', (rule) => {
    const configPath = parseConfigParam(rule.params)
    if (configPath) {
      configPaths.push(path.isAbsolute(configPath) ? configPath : path.resolve(base, configPath))
    }
  })
  return [...new Set(configPaths)]
}

function normalizeContentFiles(content: unknown): string[] {
  if (typeof content === 'string') {
    return [content]
  }
  if (Array.isArray(content)) {
    return content.flatMap(item => normalizeContentFiles(item))
  }
  if (typeof content === 'object' && content !== null && 'files' in content) {
    return normalizeContentFiles((content as LegacyContentObject).files)
  }
  return []
}

async function collectConfigContentFiles(root: Root, base: string) {
  const configPaths = collectConfigPaths(root, base)
  const files: string[] = []
  for (const configPath of configPaths) {
    const result = await loadConfig({
      config: configPath,
      cwd: path.dirname(configPath),
    })
    const contentFiles = normalizeContentFiles(result?.config.content)
    for (const contentFile of contentFiles) {
      files.push(...await expandLocalSourceFiles(contentFile, path.dirname(configPath)))
    }
  }
  return {
    configPaths,
    files: [...new Set(files)],
  }
}

async function collectAutoTailwindCandidates(
  root: Root,
  result: Result,
  options: WeappTailwindcssPostcssPluginOptions,
) {
  if (options.scanSources === false) {
    return new Set<string>()
  }

  const base = resolvePostcssBase(result, options)
  const projectRoot = resolvePostcssProjectRoot(result, options)
  const sourceEntryTasks: Array<Promise<TailwindSourceEntry>> = []
  const hasSourceNone = root.toString().includes('source(none)')

  if (!hasSourceNone) {
    sourceEntryTasks.push(Promise.resolve({
      base,
      negated: false,
      pattern: POSTCSS_SOURCE_PATTERN,
    }))
  }

  root.walkAtRules('source', (rule) => {
    const parsed = parseSourceFileParam(rule.params)
    if (!parsed) {
      return
    }
    sourceEntryTasks.push(
      resolveTailwindSourceEntry(parsed.sourcePath, base, parsed.negated),
    )
  })

  const sourceEntries = await Promise.all(sourceEntryTasks)
  if (sourceEntries.length === 0) {
    return new Set<string>()
  }

  const candidates = await extractValidCandidates({
    base,
    css: root.toString(),
    cwd: projectRoot,
    sources: sourceEntries,
  })

  return new Set(candidates)
}

async function collectPostcssLocalSources(
  root: Root,
  result: Result,
  options: WeappTailwindcssPostcssPluginOptions,
) {
  const base = resolvePostcssBase(result, options)
  const sourcePaths: string[] = []
  root.walkAtRules('source', (rule) => {
    const sourcePath = parseLocalSourceParam(rule.params)
    if (sourcePath) {
      sourcePaths.push(sourcePath)
    }
  })

  const configContentFiles = await collectConfigContentFiles(root, base)
  const files = [...new Set((await Promise.all(
    sourcePaths.map(sourcePath => expandLocalSourceFiles(sourcePath, base)),
  )).flat().concat(configContentFiles.files))]
  const sources = await Promise.all(files.map(async file => ({
    content: await readFile(file, 'utf8'),
    extension: getSourceExtension(file),
  })))

  return {
    files: [
      ...files,
      ...configContentFiles.configPaths,
    ],
    sources,
  }
}

function addSourceDependencyMessages(result: Result, files: string[]) {
  for (const file of files) {
    result.messages.push({
      type: 'dependency',
      plugin: PLUGIN_NAME,
      file,
    })
  }
}

function quoteCssString(value: string) {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
}

function toCssPath(value: string) {
  return value.replaceAll('\\', '/')
}

function prependConfigDirective(css: string, config: string | undefined) {
  if (!config || /@config\s+/.test(css)) {
    return css
  }
  return `@config "${quoteCssString(toCssPath(config))}";\n${css}`
}

export const weappTailwindcssPostcssPlugin: PluginCreator<WeappTailwindcssPostcssPluginOptions> = (options = {}) => {
  return {
    postcssPlugin: PLUGIN_NAME,
    async Once(root, { result }) {
      const {
        candidates,
        generator: userGeneratorOptions,
        scanSources,
        sources,
        styleOptions,
        target: legacyTarget,
        ...sourceOptions
      } = options
      const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(userGeneratorOptions)
      if (generatorOptions.mode === 'off') {
        return
      }
      const tailwindVersion = resolvePostcssTailwindVersion(root, result, options)

      const [collectedSources, autoCandidates] = await Promise.all([
        collectPostcssLocalSources(root, result, options),
        collectAutoTailwindCandidates(root, result, options),
      ])
      const generatorConfig = generatorOptions.config ?? options.config
      const source = tailwindVersion === 3
        ? await resolveTailwindV3Source({
            config: generatorConfig,
            css: sourceOptions.css ?? root.toString(),
            base: resolvePostcssBase(result, options),
            cwd: resolvePostcssProjectRoot(result, options),
            projectRoot: resolvePostcssProjectRoot(result, options),
            packageName: options.packageName,
            postcssPlugin: options.postcssPlugin,
          })
        : await resolveTailwindV4Source({
            ...sourceOptions,
            css: prependConfigDirective(sourceOptions.css ?? root.toString(), generatorConfig),
            base: resolvePostcssBase(result, options),
            projectRoot: resolvePostcssProjectRoot(result, options),
          })
      const generator = createWeappTailwindcssGenerator(source)
      const generateOptions: WeappTailwindcssGenerateOptions = {
        candidates: new Set([
          ...autoCandidates,
          ...(candidates ?? []),
        ]),
        scanSources: scanSources ?? false,
        sources: [
          ...collectedSources.sources,
          ...(sources ?? []),
        ],
        styleOptions: {
          ...generatorOptions.styleOptions,
          ...styleOptions,
        },
        tailwindcssV3Compatibility: generatorOptions.tailwindcssV3Compatibility,
        target: legacyTarget ?? generatorOptions.target,
      }
      const generated = await generator.generate(generateOptions)

      replaceRootCss(root, generated.css, result)
      addDependencyMessages(result, generated)
      addSourceDependencyMessages(result, collectedSources.files)
      result.messages.push({
        type: 'weapp-tailwindcss:generated',
        plugin: PLUGIN_NAME,
        target: generated.target,
        classSet: generated.classSet,
        rawCss: generated.rawCss,
      })
    },
  }
}

weappTailwindcssPostcssPlugin.postcss = true

export default weappTailwindcssPostcssPlugin
