import type { CssTokenSource } from './snapshotUtils'
import fs from 'node:fs/promises'
import fg from 'fast-glob'
import path from 'pathe'
import postcss from 'postcss'
import { createSourceCandidateCollector } from '../packages/weapp-tailwindcss/src/bundlers/vite/source-candidates'
import { readStaticConfigContent } from '../packages/weapp-tailwindcss/src/bundlers/vite/static-config-content'
import {
  expandTailwindSourceEntries,
  FULL_SOURCE_SCAN_PATTERN,
  normalizeLegacyContentEntries,
  resolveCssSourceEntries,
} from '../packages/weapp-tailwindcss/src/tailwindcss/source-scan'
import { replaceWxml } from '../packages/weapp-tailwindcss/src/wxml'

export interface TokenSourceFileReport {
  file: string
  count: number
  tokens: string[]
}

export interface TokenSourceCollection {
  tokenSources: Map<string, CssTokenSource>
  sourceReports: TokenSourceFileReport[]
}

export const TOKEN_SOURCE_FILE_PATTERN = FULL_SOURCE_SCAN_PATTERN
export const TOKEN_SOURCE_REPORT_FILE_PATTERN = '**/*.{vue,tsx,jsx,ts,js,mjs,cjs,wxml,ttml,axml,swan,xml,html,css,scss,sass,less,styl,stylus,pcss,postcss,sss}.json'
export const TOKEN_SOURCE_IGNORE_PATTERNS = [
  '**/.cache/**',
  '**/.git/**',
  '**/.tw-patch/**',
  '**/.vite/**',
  '**/config/**',
  '**/dist/**',
  '**/node_modules/**',
  '**/postcss.config.*',
  '**/tailwind.config.*',
  '**/unpackage/**',
  '**/vite.config.*',
  '**/webpack.config.*',
]

function toPosixPath(file: string) {
  return file.replace(/\\/g, '/')
}

function resolveConfigPath(base: string, configPath: string) {
  return path.isAbsolute(configPath) ? path.resolve(configPath) : path.resolve(base, configPath)
}

function parseConfigParam(params: string) {
  const value = params.trim()
  const match = /^(['"])(.+)\1$/.exec(value)
  return match?.[2]
}

async function collectConfigContentFiles(root: postcss.Root, base: string, projectRoot: string) {
  const files = new Set<string>()
  const configPaths = new Set<string>()
  root.walkAtRules('config', (rule) => {
    const configPath = parseConfigParam(rule.params)
    if (configPath) {
      configPaths.add(resolveConfigPath(base, configPath))
    }
  })

  for (const configPath of [...configPaths].sort()) {
    const staticContent = readStaticConfigContent(configPath)
    if (staticContent !== undefined) {
      const entries = normalizeLegacyContentEntries(staticContent, path.dirname(configPath), {
        relativeBase: path.dirname(configPath),
      })
      for (const file of await expandTailwindSourceEntries(entries, { ignore: TOKEN_SOURCE_IGNORE_PATTERNS })) {
        files.add(path.resolve(file))
      }
    }
  }

  if (files.size === 0) {
    const fallback = path.resolve(projectRoot, 'tailwind.config.js')
    const staticContent = readStaticConfigContent(fallback)
    if (staticContent !== undefined) {
      const entries = normalizeLegacyContentEntries(staticContent, projectRoot, {
        relativeBase: projectRoot,
      })
      for (const file of await expandTailwindSourceEntries(entries, { ignore: TOKEN_SOURCE_IGNORE_PATTERNS })) {
        files.add(path.resolve(file))
      }
    }
  }

  return files
}

async function collectCssEntrySourceFiles(projectRoot: string, cssFile: string, files: Set<string>) {
  const cssPath = path.resolve(projectRoot, cssFile)
  if (path.basename(cssPath) === 'tailwind-intellisense.css') {
    return
  }
  let css: string
  try {
    css = await fs.readFile(cssPath, 'utf8')
  }
  catch {
    return
  }

  if (!/@(?:import|config|source|tailwind)\b/.test(css) || !/tailwindcss|@tailwind|@source/.test(css)) {
    return
  }

  let root: postcss.Root
  try {
    root = postcss.parse(css)
  }
  catch {
    return
  }

  const base = path.dirname(cssPath)
  const sourceEntries = await resolveCssSourceEntries(root, base, TOKEN_SOURCE_FILE_PATTERN)
  const sourceFiles = await expandTailwindSourceEntries(sourceEntries, { ignore: TOKEN_SOURCE_IGNORE_PATTERNS })
  for (const file of sourceFiles) {
    files.add(path.resolve(file))
  }

  if (sourceFiles.length === 0) {
    for (const file of await collectConfigContentFiles(root, base, projectRoot)) {
      files.add(file)
    }
  }
}

async function collectScannedSourceFiles(projectRoot: string) {
  const resolvedProjectRoot = await fs.realpath(projectRoot).catch(() => path.resolve(projectRoot))
  const files = new Set<string>()
  const cssEntries = await fg('**/*.{css,scss,sass,less,styl,stylus,pcss,postcss}', {
    absolute: false,
    cwd: resolvedProjectRoot,
    ignore: TOKEN_SOURCE_IGNORE_PATTERNS,
    onlyFiles: true,
  })

  for (const cssEntry of cssEntries.sort()) {
    await collectCssEntrySourceFiles(resolvedProjectRoot, cssEntry, files)
  }

  if (files.size === 0) {
    for (const file of await collectConfigContentFiles(postcss.root(), resolvedProjectRoot, resolvedProjectRoot)) {
      files.add(file)
    }
  }

  if (files.size === 0) {
    const fallbackFiles = await fg(TOKEN_SOURCE_FILE_PATTERN, {
      absolute: true,
      cwd: resolvedProjectRoot,
      ignore: TOKEN_SOURCE_IGNORE_PATTERNS,
      onlyFiles: true,
    })
    for (const file of fallbackFiles) {
      files.add(path.resolve(file))
    }
  }

  return [...files]
    .filter(file => path.relative(resolvedProjectRoot, file) && !path.relative(resolvedProjectRoot, file).startsWith('..') && !path.isAbsolute(path.relative(resolvedProjectRoot, file)))
    .sort()
}

function createTokenSourceMap(classList: string[], sourceReports: TokenSourceFileReport[]) {
  const sourcesByToken = new Map<string, Set<string>>()
  for (const report of sourceReports) {
    for (const token of report.tokens) {
      let sources = sourcesByToken.get(token)
      if (!sources) {
        sources = new Set()
        sourcesByToken.set(token, sources)
      }
      sources.add(report.file)
    }
  }

  const tokenSources = new Map<string, CssTokenSource>()
  for (const token of [...classList].sort()) {
    const source: CssTokenSource = {
      token,
      sources: [...(sourcesByToken.get(token) ?? [])].sort(),
    }
    tokenSources.set(token, source)
    const escaped = replaceWxml(token)
    tokenSources.set(escaped, source)
    tokenSources.set(escaped.replaceAll('\\', ''), source)
  }
  return tokenSources
}

export async function collectTokenSourceReports(projectRoot: string, classList?: string[]): Promise<TokenSourceCollection | undefined> {
  if (!classList?.length) {
    return undefined
  }

  const resolvedProjectRoot = await fs.realpath(projectRoot).catch(() => path.resolve(projectRoot))
  const classSet = new Set(classList)
  const collector = createSourceCandidateCollector()
  const files = await collectScannedSourceFiles(resolvedProjectRoot)

  const sourceReports: TokenSourceFileReport[] = []
  for (const absolutePath of files) {
    const normalizedSourceFile = toPosixPath(path.relative(resolvedProjectRoot, absolutePath))
    const source = await fs.readFile(absolutePath, 'utf8')
    await collector.sync(absolutePath, source)
    const candidates = collector.values()
    const tokens = [...candidates]
      .filter(token => classSet.has(token))
      .sort()
    sourceReports.push({
      file: normalizedSourceFile,
      count: tokens.length,
      tokens,
    })
    collector.remove(absolutePath)
  }

  return {
    tokenSources: createTokenSourceMap(classList, sourceReports),
    sourceReports,
  }
}

export function formatTokenSourceFileReport(report: TokenSourceFileReport) {
  return `${JSON.stringify({
    file: report.file,
    count: report.count,
    tokens: report.tokens,
  }, null, 2)}\n`
}
