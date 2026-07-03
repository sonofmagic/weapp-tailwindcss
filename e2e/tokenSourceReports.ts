import type { TailwindSourceEntry } from '../packages/weapp-tailwindcss/src/tailwindcss/source-scan'
import type { CssTokenSource } from './snapshotUtils'
import fs from 'node:fs/promises'
import fg from 'fast-glob'
import path from 'pathe'
import postcss from 'postcss'
import { loadConfig } from '../packages/tailwindcss-config/src/index'
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

async function loadConfigContent(configPath: string) {
  const staticContent = readStaticConfigContent(configPath)
  if (staticContent !== undefined) {
    return staticContent
  }

  try {
    const loaded = await loadConfig({
      config: configPath,
      cwd: path.dirname(configPath),
    })
    return loaded?.config.content
  }
  catch {
    return undefined
  }
}

function parseTailwindDirectiveRoot(css: string) {
  try {
    return postcss.parse(css)
  }
  catch {
    const root = postcss.root()
    for (const match of css.matchAll(/@(import|config|source|tailwind)\b([^;]*)(?:;|$)/g)) {
      const directive = match[0].trim().replace(/;$/, '')
      if (!directive.startsWith('@')) {
        continue
      }
      const withoutAt = directive.slice(1)
      const nameMatch = /^[\w-]+/.exec(withoutAt)
      const name = nameMatch?.[0]
      if (!name) {
        continue
      }
      const params = withoutAt.slice(name.length).trim()
      root.append(postcss.atRule({
        name,
        params,
      }))
    }
    return root
  }
}

function collectApplyTokens(source: string, classSet: Set<string>) {
  const tokens = new Set<string>()
  for (const match of source.matchAll(/@apply\s+([^;{}]+)/g)) {
    const params = match[1]?.trim()
    if (!params) {
      continue
    }
    for (const token of params.split(/\s+/)) {
      if (classSet.has(token)) {
        tokens.add(token)
      }
    }
  }
  return tokens
}

async function collectConfigContentEntries(root: postcss.Root, base: string, projectRoot: string) {
  const entries: TailwindSourceEntry[] = []
  const configPaths = new Set<string>()
  root.walkAtRules('config', (rule) => {
    const configPath = parseConfigParam(rule.params)
    if (configPath) {
      configPaths.add(resolveConfigPath(base, configPath))
    }
  })

  for (const configPath of [...configPaths].sort()) {
    const content = await loadConfigContent(configPath)
    if (content !== undefined) {
      entries.push(...normalizeLegacyContentEntries(content, path.dirname(configPath), {
        relativeBase: path.dirname(configPath),
      }))
    }
  }

  if (entries.length === 0) {
    const fallback = path.resolve(projectRoot, 'tailwind.config.js')
    const content = await loadConfigContent(fallback)
    if (content !== undefined) {
      entries.push(...normalizeLegacyContentEntries(content, projectRoot, {
        relativeBase: projectRoot,
      }))
    }
  }

  return entries
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

  const root = parseTailwindDirectiveRoot(css)
  const base = path.dirname(cssPath)
  const [sourceEntries, configEntries] = await Promise.all([
    resolveCssSourceEntries(root, base, TOKEN_SOURCE_FILE_PATTERN),
    collectConfigContentEntries(root, base, projectRoot),
  ])
  const sourceFiles = await expandTailwindSourceEntries([...configEntries, ...sourceEntries], { ignore: TOKEN_SOURCE_IGNORE_PATTERNS })
  for (const file of sourceFiles) {
    files.add(path.resolve(file))
  }
  files.add(cssPath)
}

async function collectScannedSourceFiles(projectRoot: string) {
  const resolvedProjectRoot = await fs.realpath(projectRoot).catch(() => path.resolve(projectRoot))
  const files = new Set<string>()
  const cssEntries = await fg('**/*.{css,scss,sass,less,styl,stylus,pcss,postcss,vue,mpx}', {
    absolute: false,
    cwd: resolvedProjectRoot,
    ignore: TOKEN_SOURCE_IGNORE_PATTERNS,
    onlyFiles: true,
  })

  for (const cssEntry of cssEntries.sort()) {
    await collectCssEntrySourceFiles(resolvedProjectRoot, cssEntry, files)
  }

  if (files.size === 0) {
    const configEntries = await collectConfigContentEntries(postcss.root(), resolvedProjectRoot, resolvedProjectRoot)
    for (const file of await expandTailwindSourceEntries(configEntries, { ignore: TOKEN_SOURCE_IGNORE_PATTERNS })) {
      files.add(path.resolve(file))
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
    for (const token of collectApplyTokens(source, classSet)) {
      tokens.push(token)
    }
    tokens.sort()
    const uniqueTokens = [...new Set(tokens)]
    if (uniqueTokens.length > 0) {
      sourceReports.push({
        file: normalizedSourceFile,
        count: uniqueTokens.length,
        tokens: uniqueTokens,
      })
    }
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
