import type { ResolvedSubpackageStyleScope, SubpackageStyleGenerator, SubpackageStyleRules } from './subpackage'

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { normalizeSubpackageStyleRules } from './subpackage'
import {
  collectPageTargets,
  createDefaultStyleEntry,
  resolveSubpackageStyleScopes,
} from './subpackage-resolution'
import { toArray } from './utils'

export interface MpxSubPackageConfig {
  appPath: string
  sourceRoot?: string
  sourceFileName?: string | string[]
  outputName?: string
  files?: string | string[]
  include?: string | string[]
  exclude?: string | string[]
  generate?: SubpackageStyleGenerator
  rules?: SubpackageStyleRules
  preprocess?: boolean
}

export interface MpxSubPackageStyleEntry {
  sourceFileName?: string | string[]
  appStyle?: boolean
  referenceFileName?: string
  outputName?: string
  files?: string | string[]
  include?: string | string[]
  exclude?: string | string[]
  sourceInclude?: string | string[]
  sourceExclude?: string | string[]
  generate?: SubpackageStyleGenerator
  preprocess?: boolean
}

export type ResolvedMpxSubPackage = ResolvedSubpackageStyleScope

const DEFAULT_STYLE_FILENAMES = ['index.css', 'index.wxss', 'index.scss', 'index.less', 'index.sass', 'index.styl']
const SCRIPT_RE = /<script([^>]*)>([\s\S]*?)<\/script>/gi
const JSON_SCRIPT_TYPE_RE = /\btype=["']application\/json["']/i

function extractJsonScript(source: string): string | undefined {
  SCRIPT_RE.lastIndex = 0
  for (let match = SCRIPT_RE.exec(source); match; match = SCRIPT_RE.exec(source)) {
    if (JSON_SCRIPT_TYPE_RE.test(match[1] ?? '')) {
      return match[2]
    }
  }
  return undefined
}

function loadAppConfig(filePath: string): Record<string, unknown> | null {
  const resolvedPath = path.resolve(filePath)
  if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
    return null
  }

  try {
    const raw = fs.readFileSync(resolvedPath, 'utf8')
    const jsonSource = resolvedPath.endsWith('.mpx')
      ? extractJsonScript(raw)
      : raw
    if (!jsonSource) {
      return null
    }
    return JSON.parse(jsonSource) as Record<string, unknown>
  }
  catch {
    return null
  }
}

export function resolveMpxSubPackages(config: MpxSubPackageConfig): ResolvedMpxSubPackage[] {
  const appPath = path.resolve(config.appPath)
  const appConfig = loadAppConfig(appPath)

  if (!appConfig) {
    return []
  }

  const primary = toArray((appConfig as Record<string, unknown>)['subPackages'] as Array<{ root?: string, pages?: unknown }> | undefined)
  const secondary = toArray((appConfig as Record<string, unknown>)['subpackages'] as Array<{ root?: string, pages?: unknown }> | undefined)
  const subPackagesInput = [...primary, ...secondary]

  if (subPackagesInput.length === 0) {
    return []
  }

  const sourceRoot = path.resolve(config.sourceRoot ?? path.dirname(appPath))
  const entries = normalizeSubpackageStyleRules(config.rules)
  const styleRules: MpxSubPackageStyleEntry[] = entries.length > 0
    ? entries
    : [createDefaultStyleEntry<MpxSubPackageStyleEntry>(config, toArray(config.sourceFileName))]

  return resolveSubpackageStyleScopes({
    framework: 'mpx',
    sourceRoot,
    subPackages: subPackagesInput,
    styleEntries: styleRules,
    defaultStyleCandidates: DEFAULT_STYLE_FILENAMES,
    preprocess: config.preprocess,
    collectTargets: collectPageTargets,
  })
}

export function resolveDefaultMpxAppPaths(): string[] {
  const cwd = process.cwd()
  return [
    path.resolve(cwd, 'src/app.mpx'),
    path.resolve(cwd, 'app.mpx'),
    path.resolve(cwd, 'src/app.json'),
    path.resolve(cwd, 'app.json'),
  ]
}
