import type { TailwindcssPatcherOptions } from 'tailwindcss-patch'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import process from 'node:process'
import { getConfig } from '@tailwindcss-mangle/config'
import path from 'pathe'
import prettier from 'prettier'
import { TailwindcssPatcher } from 'tailwindcss-patch'
import { removeWxmlId } from '../packages/weapp-tailwindcss/test/util'

export {
  removeWxmlId,
}

export async function loadCss(p: string) {
  const css = await fs.readFile(p, 'utf8')
  const code = await prettier.format(css, {
    parser: 'css',
    tabWidth: 2,
    useTabs: false,
    semi: false,
    singleQuote: true,
    endOfLine: 'lf',
    trailingComma: 'none',
    printWidth: 180,
    bracketSameLine: true,
    htmlWhitespaceSensitivity: 'ignore',
  })
  return code
}

export interface ProjectEntry {
  name: string
  projectPath: string
  cssFile: string
  url?: string
  skipOpenAutomator?: boolean
}

export function wait(ts = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined)
    }, ts)
  })
}

export function projectFilter(x: ProjectEntry[]) {
  return x
}

export function formatWxml(wxml: string) {
  return prettier.format(wxml, {
    parser: 'html',
    tabWidth: 2,
    useTabs: false,
    semi: false,
    singleQuote: true,
    endOfLine: 'lf',
    trailingComma: 'none',
    printWidth: 180,
    bracketSameLine: true,
    htmlWhitespaceSensitivity: 'ignore',
  })
}

export function twExtract(root: string) {
  let task = extractionTasks.get(root)
  if (!task) {
    task = runTwExtract(root)
    extractionTasks.set(root, task)
  }
  return task
}

export async function resolveSnapshotFile(testDir: string, suite: string, projectName: string, fileName: string) {
  const snapshotDir = path.resolve(testDir, '__snapshots__', suite, projectName)
  await fs.mkdir(snapshotDir, { recursive: true })
  return path.resolve(snapshotDir, fileName)
}

type NormalizedPatchOptions = NonNullable<TailwindcssPatcherOptions['patch']>

interface ExtractionResult {
  classList?: string[]
  output?: {
    filename?: string
    loose?: boolean
  }
}

const extractionTasks = new Map<string, Promise<ExtractionResult | undefined>>()

async function runTwExtract(root: string): Promise<ExtractionResult | undefined> {
  const { config } = await getConfig(root)
  if (!config) {
    return undefined
  }

  const patchOptions = normalizePatchOptions(root, config.patch)
  const outputOptions = patchOptions.output
    ? {
        filename: patchOptions.output.filename,
        loose: patchOptions.output.loose,
      }
    : undefined

  const fallbackOutputFilename = path.resolve(root, '.tw-patch/tw-class-list.json')
  const effectiveOutput = outputOptions ?? { filename: fallbackOutputFilename }

  if (process.env.E2E_FORCE_EXTRACT !== 'true') {
    const cachedClassList = await readClassListFromFile(effectiveOutput?.filename)
    if (cachedClassList) {
      return {
        classList: cachedClassList,
        output: effectiveOutput,
      }
    }
  }

  const packageJsonPath = path.resolve(root, 'package.json')
  let packageName: string | undefined
  try {
    const pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf8')) as { name?: string } | undefined
    packageName = typeof pkg?.name === 'string' && pkg.name.length > 0 ? pkg.name : undefined
  }
  catch {
    packageName = undefined
  }

  const previousEnv = {
    npm_package_json: process.env.npm_package_json,
    PNPM_PACKAGE_NAME: process.env.PNPM_PACKAGE_NAME,
    INIT_CWD: process.env.INIT_CWD,
  }

  if (await exists(packageJsonPath)) {
    process.env.npm_package_json = packageJsonPath
  }
  else {
    delete process.env.npm_package_json
  }
  if (packageName) {
    process.env.PNPM_PACKAGE_NAME = packageName
  }
  else {
    delete process.env.PNPM_PACKAGE_NAME
  }
  process.env.INIT_CWD = root

  const twPatcher = new TailwindcssPatcher({
    patch: patchOptions,
  })

  if (process.env.E2E_DEBUG_PATCH === '1') {
    console.log('[e2e] Tailwind patch options for %s: %o', root, patchOptions.tailwindcss)
  }

  const originalCwd = process.cwd()
  try {
    if (originalCwd !== root) {
      process.chdir(root)
    }
    const result = await twPatcher.extract({ write: false })
    return {
      classList: result?.classList,
      output: effectiveOutput,
    }
  }
  finally {
    if (previousEnv.npm_package_json !== undefined) {
      process.env.npm_package_json = previousEnv.npm_package_json
    }
    else {
      delete process.env.npm_package_json
    }
    if (previousEnv.PNPM_PACKAGE_NAME !== undefined) {
      process.env.PNPM_PACKAGE_NAME = previousEnv.PNPM_PACKAGE_NAME
    }
    else {
      delete process.env.PNPM_PACKAGE_NAME
    }
    if (previousEnv.INIT_CWD !== undefined) {
      process.env.INIT_CWD = previousEnv.INIT_CWD
    }
    else {
      delete process.env.INIT_CWD
    }
    if (process.cwd() !== originalCwd) {
      process.chdir(originalCwd)
    }
  }
}

function normalizePatchOptions(root: string, patchOptions: NormalizedPatchOptions | undefined): NormalizedPatchOptions {
  const resolved: NormalizedPatchOptions = {
    ...(patchOptions ?? {}),
  }

  resolved.cwd = resolved.cwd ?? root
  resolved.basedir = resolved.basedir ?? root

  const resolvePaths = new Set(
    [
      ...(resolved.resolve?.paths ?? []),
      root,
    ].map(entry => normalizePath(root, entry)),
  )

  resolved.resolve = {
    ...resolved.resolve,
    paths: Array.from(resolvePaths),
  }

  if (resolved.output?.filename) {
    resolved.output = {
      ...resolved.output,
      filename: normalizePath(root, resolved.output.filename),
    }
  }

  if (resolved.cache && typeof resolved.cache === 'object') {
    resolved.cache = {
      ...resolved.cache,
      dir: resolved.cache.dir ? normalizePath(root, resolved.cache.dir) : resolved.cache.dir,
      cwd: resolved.cache.cwd ? normalizePath(root, resolved.cache.cwd) : resolved.cache.cwd,
      file: resolved.cache.file ? normalizePath(root, resolved.cache.file) : resolved.cache.file,
    }
  }

  let tw = resolved.tailwindcss ? { ...resolved.tailwindcss } : undefined

  if (tw) {
    if (typeof tw.config === 'string') {
      tw.config = normalizePath(root, tw.config)
    }

    if (tw.v4) {
      const v4 = { ...tw.v4 }
      if (Array.isArray(v4.cssEntries)) {
        v4.cssEntries = v4.cssEntries.map(entry => normalizePath(root, entry))
      }
      if (typeof v4.css === 'string') {
        v4.css = normalizePath(root, v4.css)
      }
      if (typeof v4.base === 'string') {
        v4.base = normalizePath(root, v4.base)
      }
      if (Array.isArray(v4.sources)) {
        v4.sources = v4.sources.map((source) => {
          if (source && typeof source.base === 'string') {
            return {
              ...source,
              base: normalizePath(root, source.base),
            }
          }
          return source
        })
      }
      tw.v4 = v4
    }
  }

  const tailwindInfo = resolveTailwindInfo(root, resolved)
  if (tailwindInfo) {
    tw = tw ? { ...tw } : {}
    if (tw.version === undefined) {
      tw.version = tailwindInfo.major
    }
    if (tw.postcssPlugin === undefined) {
      tw.postcssPlugin = tailwindInfo.pluginPath ?? (tailwindInfo.major >= 4 ? '@tailwindcss/postcss' : 'tailwindcss')
    }
    resolved.tailwindcss = tw
    resolved.tailwind = { ...tw }
  }
  else if (tw) {
    resolved.tailwindcss = tw
    resolved.tailwind = { ...tw }
  }
  else {
    delete (resolved as any).tailwind
  }

  return resolved
}

async function readClassListFromFile(filename: string | undefined) {
  if (!filename) {
    return undefined
  }
  try {
    const content = await fs.readFile(filename, 'utf8')
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed : undefined
  }
  catch (error: any) {
    if (error?.code && (error.code === 'ENOENT' || error.code === 'EPERM')) {
      return undefined
    }
    throw error
  }
}

function normalizePath(root: string, target: string) {
  return path.isAbsolute(target) ? target : path.resolve(root, target)
}

async function exists(target: string) {
  try {
    await fs.access(target)
    return true
  }
  catch {
    return false
  }
}

interface TailwindInfo {
  major: number
  pluginPath?: string
}

function resolveTailwindInfo(root: string, options: NormalizedPatchOptions): TailwindInfo | null {
  const packageName = typeof options.packageName === 'string' && options.packageName.length > 0 ? options.packageName : 'tailwindcss'
  const requireFromRoot = createRequire(path.join(root, 'package.json'))
  try {
    const pkgJson = requireFromRoot(`${packageName}/package.json`) as { version?: string }
    const version = pkgJson?.version
    if (!version) {
      return null
    }
    const major = Number.parseInt(version.split('.')[0] ?? '', 10)
    if (Number.isNaN(major)) {
      return null
    }
    const pluginName = major >= 4 ? '@tailwindcss/postcss' : packageName
    let pluginPath: string | undefined
    try {
      pluginPath = requireFromRoot.resolve(pluginName)
    }
    catch {
      pluginPath = undefined
    }
    return {
      major,
      pluginPath,
    }
  }
  catch {
    return null
  }
}
