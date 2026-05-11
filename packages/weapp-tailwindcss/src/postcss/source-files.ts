import type { Result, Root } from 'postcss'
import type { TailwindV4CandidateSource } from '../generator'
import type { WeappTailwindcssPostcssPluginOptions } from '../postcss'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import { loadConfig } from 'tailwindcss-config'
import { extractValidCandidates } from 'tailwindcss-patch'
import { resolvePostcssBase, resolvePostcssProjectRoot } from './context'

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

export async function collectAutoTailwindCandidates(
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

export async function collectPostcssLocalSources(
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
  const sources: TailwindV4CandidateSource[] = await Promise.all(files.map(async file => ({
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
