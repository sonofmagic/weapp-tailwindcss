import type { Result, Root } from 'postcss'
import type { TailwindCandidateSource, WeappTailwindcssPostcssPluginOptions } from './types'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { extractValidCandidates } from '@tailwindcss-mangle/engine'
import { loadConfig } from 'tailwindcss-config'
import {
  collectCssInlineSourceCandidates,
  createSourceScanPattern,
  DEFAULT_SOURCE_SCAN_EXTENSIONS,
  expandTailwindSourceEntries,
  normalizeLegacyContentEntries,
  parseConfigParam,
  resolveCssSourceEntries,
} from '../source-scan'
import { resolvePostcssBase, resolvePostcssProjectRoot } from './context'
import { hasTailwindApplyDirective, hasTailwindRootDirectives } from './directives'

const POSTCSS_SOURCE_PATTERN = createSourceScanPattern(DEFAULT_SOURCE_SCAN_EXTENSIONS)

function isTailwindV4ApplyOnlyCss(root: Root) {
  return hasTailwindApplyDirective(root.toString())
    && !hasTailwindRootDirectives(root, { importFallback: true })
}

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
    const contentEntries = normalizeLegacyContentEntries(result?.config.content, path.dirname(configPath), {
      relativeBase: path.dirname(configPath),
    })
    files.push(...await expandTailwindSourceEntries(contentEntries))
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
  const sourceEntries = []
  const hasSourceNone = root.toString().includes('source(none)')
  const shouldSkipAutoScan = isTailwindV4ApplyOnlyCss(root)
  const inlineCandidates = collectCssInlineSourceCandidates(root)

  if (!hasSourceNone && !shouldSkipAutoScan) {
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
    ...[...candidates].filter(candidate => !inlineCandidates.excluded.has(candidate)),
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
  const sources: TailwindCandidateSource[] = await Promise.all(files.map(async (file) => {
    const extension = getSourceExtension(file)
    return {
      content: await readFile(file, 'utf8'),
      ...(extension === undefined ? {} : { extension }),
    }
  }))

  return {
    files: [
      ...files,
      ...configContentFiles.configPaths,
    ],
    sources,
  }
}
