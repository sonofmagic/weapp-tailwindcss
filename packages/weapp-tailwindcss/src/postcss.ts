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
import {
  createWeappTailwindcssGenerator,
  normalizeWeappTailwindcssGeneratorOptions,
  resolveTailwindV4Source,
} from './generator'

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

type LegacyContentFilePattern = string

interface LegacyContentObject {
  files?: LegacyContentConfig
  relative?: boolean
}

type LegacyContentConfig
  = | LegacyContentFilePattern
    | LegacyContentFilePattern[]
    | LegacyContentObject
    | Array<LegacyContentFilePattern | LegacyContentObject>

export interface WeappTailwindcssPostcssPluginOptions extends TailwindV4SourceOptions {
  generator?: WeappTailwindcssGeneratorUserOptions
  target?: WeappTailwindcssGeneratorTarget
  candidates?: Iterable<string>
  sources?: TailwindV4CandidateSource[]
  styleOptions?: Partial<IStyleHandlerOptions>
}

function resolveInputFile(result: Result) {
  const from = result.opts.from
  return typeof from === 'string' && from.length > 0 ? from : undefined
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
    return fg(`**/*.{${POSTCSS_SOURCE_EXTENSIONS.join(',')}}`, {
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

export const weappTailwindcssPostcssPlugin: PluginCreator<WeappTailwindcssPostcssPluginOptions> = (options = {}) => {
  return {
    postcssPlugin: PLUGIN_NAME,
    async Once(root, { result }) {
      const {
        candidates,
        generator: userGeneratorOptions,
        sources,
        styleOptions,
        target: legacyTarget,
        ...sourceOptions
      } = options
      const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(userGeneratorOptions)
      if (generatorOptions.mode === 'off') {
        return
      }

      const collectedSources = await collectPostcssLocalSources(root, result, options)
      const source = await resolveTailwindV4Source({
        ...sourceOptions,
        css: sourceOptions.css ?? root.toString(),
        base: resolvePostcssBase(result, options),
        projectRoot: resolvePostcssProjectRoot(result, options),
      })
      const generator = createWeappTailwindcssGenerator(source)
      const generateOptions: WeappTailwindcssGenerateOptions = {
        candidates,
        sources: [
          ...collectedSources.sources,
          ...(sources ?? []),
        ],
        styleOptions: {
          ...generatorOptions.styleOptions,
          ...styleOptions,
        },
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
