import type { Result, Root } from 'postcss'
import type { TailwindV4CandidateSource } from '../generator'
import type { WeappTailwindcssPostcssPluginOptions } from '../postcss'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { loadConfig } from 'tailwindcss-config'
import { extractValidCandidates } from 'tailwindcss-patch'
import {
  collectCssInlineSourceCandidates,
  createSourceScanPattern,
  expandTailwindSourceEntries,
  normalizeLegacyContentEntries,
  parseConfigParam,
  resolveCssSourceEntries,
} from '@/tailwindcss/source-scan'
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
const POSTCSS_SOURCE_PATTERN = createSourceScanPattern(POSTCSS_SOURCE_EXTENSIONS)

function getSourceExtension(file: string) {
  const extension = path.extname(file).slice(1)
  return extension || undefined
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

function resolveOptionConfigPath(config: string | undefined, base: string) {
  if (!config) {
    return undefined
  }
  return path.isAbsolute(config) ? config : path.resolve(base, config)
}

async function collectConfigContentFiles(root: Root, base: string, options: WeappTailwindcssPostcssPluginOptions) {
  const configPaths = [...new Set([
    ...(resolveOptionConfigPath(options.config, base) ? [resolveOptionConfigPath(options.config, base)!] : []),
    ...collectConfigPaths(root, base),
  ])]
  const files: string[] = []
  for (const configPath of configPaths) {
    const result = await loadConfig({
      config: configPath,
      cwd: path.dirname(configPath),
    })
    const contentEntries = normalizeLegacyContentEntries(result?.config.content, path.dirname(configPath))
    files.push(...await expandTailwindSourceEntries(contentEntries))
  }
  return {
    configPaths,
    files: [...new Set(files)],
  }
}

async function collectConfiguredContentEntries(root: Root, base: string, options: WeappTailwindcssPostcssPluginOptions) {
  const configPath = resolveOptionConfigPath(options.config, base) ?? collectConfigPaths(root, base)[0]
  if (!configPath) {
    return []
  }
  const resolvedConfigPath = path.isAbsolute(configPath) ? configPath : path.resolve(base, configPath)
  const result = await loadConfig({
    config: resolvedConfigPath,
    cwd: path.dirname(resolvedConfigPath),
  })
  return normalizeLegacyContentEntries(result?.config.content, path.dirname(resolvedConfigPath))
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
  const sourceEntries = []
  const hasSourceNone = root.toString().includes('source(none)')
  const inlineCandidates = collectCssInlineSourceCandidates(root)
  const configuredContentEntries = options.version === 3
    ? await collectConfiguredContentEntries(root, base, options)
    : []

  if (configuredContentEntries.length > 0) {
    sourceEntries.push(...configuredContentEntries)
  }
  else if (!hasSourceNone) {
    sourceEntries.push({
      base,
      negated: false,
      pattern: POSTCSS_SOURCE_PATTERN,
    })
  }

  sourceEntries.push(...await resolveCssSourceEntries(root, base, POSTCSS_SOURCE_PATTERN))
  const candidates = sourceEntries.length === 0
    ? []
    : await extractValidCandidates({
        base,
        css: root.toString(),
        cwd: projectRoot,
        sources: sourceEntries,
      })

  return new Set([
    ...candidates.filter(candidate => !inlineCandidates.excluded.has(candidate)),
    ...inlineCandidates.included,
  ])
}

export async function collectPostcssLocalSources(
  root: Root,
  result: Result,
  options: WeappTailwindcssPostcssPluginOptions,
) {
  const base = resolvePostcssBase(result, options)
  const sourceEntries = await resolveCssSourceEntries(root, base, POSTCSS_SOURCE_PATTERN)

  const configContentFiles = await collectConfigContentFiles(root, base, options)
  const files = [...new Set([
    ...await expandTailwindSourceEntries(sourceEntries),
    ...configContentFiles.files,
  ])]
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
