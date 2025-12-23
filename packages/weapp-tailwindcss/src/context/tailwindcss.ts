import type { TailwindcssPatcherFactoryOptions } from '@/tailwindcss/v4'
import type { AppType, InternalUserDefinedOptions } from '@/types'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { logger } from '@weapp-tailwindcss/logger'
import { findWorkspacePackageDir, findWorkspaceRoot } from '@/context/workspace'
import {
  createPatcherForBase,
  groupCssEntriesByBase,
  guessBasedirFromEntries,
  normalizeCssEntries,
  tryCreateMultiTailwindcssPatcher,
} from '@/tailwindcss/v4'

const ENV_BASEDIR_KEYS = [
  'WEAPP_TAILWINDCSS_BASEDIR',
  'WEAPP_TAILWINDCSS_BASE_DIR',
  'TAILWINDCSS_BASEDIR',
  'TAILWINDCSS_BASE_DIR',
  'UNI_INPUT_DIR',
  'UNI_INPUT_ROOT',
  'UNI_CLI_ROOT',
  'UNI_APP_INPUT_DIR',
  'INIT_CWD',
  'PWD',
] as const

type EnvBasedirKey = typeof ENV_BASEDIR_KEYS[number]

const GENERIC_ENV_BASEDIR_KEYS = new Set<EnvBasedirKey>(['INIT_CWD', 'PWD'])

interface EnvBasedirResult {
  key: EnvBasedirKey
  value: string
}

function pickEnvBasedir(): EnvBasedirResult | undefined {
  for (const key of ENV_BASEDIR_KEYS) {
    const value = process.env[key]
    if (value && path.isAbsolute(value)) {
      return { key, value }
    }
  }
  return undefined
}

function pickPackageEnvBasedir(): string | undefined {
  const packageJsonPath = process.env.npm_package_json
  if (packageJsonPath) {
    const packageDir = path.dirname(packageJsonPath)
    if (packageDir && path.isAbsolute(packageDir)) {
      return packageDir
    }
  }
  const localPrefix = process.env.npm_config_local_prefix
  if (localPrefix && path.isAbsolute(localPrefix)) {
    return localPrefix
  }
  return undefined
}

function detectCallerBasedir(): string | undefined {
  const stack = new Error('resolveTailwindcssBasedir stack probe').stack
  if (!stack) {
    return undefined
  }
  if (process.env.WEAPP_TW_DEBUG_STACK === '1') {
    logger.debug('caller stack: %s', stack)
  }
  const lines = stack.split('\n')
  for (const line of lines) {
    const match = line.match(/\(([^)]+)\)/u) ?? line.match(/at\s+(\S.*)$/u)
    const location = match?.[1]
    if (!location) {
      continue
    }
    let filePath = location
    if (filePath.startsWith('file://')) {
      try {
        filePath = fileURLToPath(filePath)
      }
      catch {
        continue
      }
    }
    const [candidate] = filePath.split(':')
    const resolvedPath = path.isAbsolute(filePath) ? filePath : candidate
    if (!path.isAbsolute(resolvedPath)) {
      continue
    }
    if (resolvedPath.includes('node_modules') && resolvedPath.includes('weapp-tailwindcss')) {
      continue
    }
    try {
      return path.dirname(resolvedPath)
    }
    catch {
      continue
    }
  }
  return undefined
}

export function resolveTailwindcssBasedir(basedir?: string, fallback?: string) {
  const envBasedirResult = pickEnvBasedir()
  const envBasedir = envBasedirResult?.value
  const envBasedirKey = envBasedirResult?.key
  const envBasedirIsGeneric = envBasedirKey ? GENERIC_ENV_BASEDIR_KEYS.has(envBasedirKey) : false
  const packageEnvBasedir = pickPackageEnvBasedir()
  const shouldDetectCaller = !envBasedir || envBasedirIsGeneric
  const callerBasedir = shouldDetectCaller ? detectCallerBasedir() : undefined
  const cwd = process.cwd()
  const anchor = envBasedir ?? packageEnvBasedir ?? fallback ?? callerBasedir ?? cwd
  const resolveRelative = (value: string) => path.isAbsolute(value)
    ? path.normalize(value)
    : path.normalize(path.resolve(anchor, value))
  if (process.env.WEAPP_TW_DEBUG_STACK === '1') {
    logger.debug('resolveTailwindcssBasedir anchor %O', {
      basedir,
      envBasedir,
      envBasedirKey,
      envBasedirIsGeneric,
      packageEnvBasedir,
      fallback,
      callerBasedir,
      npm_package_json: process.env.npm_package_json,
      cwd,
      anchor,
    })
  }

  if (basedir && basedir.trim().length > 0) {
    return resolveRelative(basedir)
  }

  if (envBasedir && !envBasedirIsGeneric) {
    return path.normalize(envBasedir)
  }

  if (fallback && fallback.trim().length > 0) {
    return resolveRelative(fallback)
  }

  if (packageEnvBasedir) {
    return path.normalize(packageEnvBasedir)
  }

  if (callerBasedir) {
    const normalizedCaller = path.normalize(callerBasedir)
    const librarySegment = `${path.sep}weapp-tailwindcss${path.sep}`
    if (!normalizedCaller.includes(librarySegment)) {
      return normalizedCaller
    }
  }

  const packageName = process.env.PNPM_PACKAGE_NAME
  if (packageName) {
    try {
      const anchorRequire = createRequire(path.join(anchor, '__resolve_tailwindcss_basedir__.cjs'))
      const packageJsonPath = anchorRequire.resolve(`${packageName}/package.json`)
      if (process.env.WEAPP_TW_DEBUG_STACK === '1') {
        logger.debug('package basedir resolved from PNPM_PACKAGE_NAME: %s', packageJsonPath)
      }
      return path.normalize(path.dirname(packageJsonPath))
    }
    catch {
      if (process.env.WEAPP_TW_DEBUG_STACK === '1') {
        logger.debug('failed to resolve package json for %s', packageName)
      }
      // 忽略解析失败，继续走兜底逻辑
      const workspaceRoot = findWorkspaceRoot(anchor)
      if (workspaceRoot) {
        const packageDir = findWorkspacePackageDir(workspaceRoot, packageName)
        if (packageDir) {
          return packageDir
        }
      }
    }
  }

  if (envBasedir) {
    return path.normalize(envBasedir)
  }

  return path.normalize(cwd)
}

function isRaxWorkspace(appType: AppType | undefined, baseDir: string): boolean {
  if (appType === 'rax') {
    return true
  }
  try {
    const pkgPath = path.join(baseDir, 'package.json')
    if (!existsSync(pkgPath)) {
      return false
    }
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as Record<string, any>
    const deps = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
    }
    if (deps['rax-app'] || deps.rax) {
      return true
    }
  }
  catch {
    return false
  }
  return false
}

function collectRaxStyleEntries(baseDir: string): string[] {
  const STYLE_CANDIDATES = [
    'src/global.css',
    'src/global.scss',
    'src/global.less',
    'src/global.sass',
    'src/global.styl',
    'src/global.stylus',
  ] as const
  const discovered: string[] = []
  for (const relative of STYLE_CANDIDATES) {
    const candidate = path.resolve(baseDir, relative)
    if (existsSync(candidate)) {
      discovered.push(path.normalize(candidate))
    }
  }
  return discovered
}

function detectImplicitCssEntries(appType: AppType | undefined, baseDir: string): string[] | undefined {
  const baseCandidates = new Set<string>()
  baseCandidates.add(path.normalize(baseDir))
  const envCandidates = [process.cwd(), process.env.INIT_CWD, process.env.PWD]
  for (const candidate of envCandidates) {
    if (candidate) {
      baseCandidates.add(path.normalize(candidate))
    }
  }

  for (const candidateBase of baseCandidates) {
    if (!isRaxWorkspace(appType, candidateBase)) {
      continue
    }
    const entries = collectRaxStyleEntries(candidateBase)
    if (entries.length) {
      return entries
    }
  }

  return undefined
}

export function createTailwindcssPatcherFromContext(ctx: InternalUserDefinedOptions) {
  const {
    tailwindcssBasedir,
    supportCustomLengthUnitsPatch,
    tailwindcss,
    tailwindcssPatcherOptions,
    cssEntries: rawCssEntries,
    appType,
  } = ctx

  const absoluteCssEntryBasedir = guessBasedirFromEntries(rawCssEntries)
  const resolvedTailwindcssBasedir = resolveTailwindcssBasedir(tailwindcssBasedir, absoluteCssEntryBasedir)
  ctx.tailwindcssBasedir = resolvedTailwindcssBasedir
  logger.debug('tailwindcss basedir resolved: %s', resolvedTailwindcssBasedir)

  let normalizedCssEntries = normalizeCssEntries(rawCssEntries, resolvedTailwindcssBasedir)
  if (!normalizedCssEntries) {
    normalizedCssEntries = detectImplicitCssEntries(ctx.appType, resolvedTailwindcssBasedir)
  }
  if (normalizedCssEntries) {
    ctx.cssEntries = normalizedCssEntries
  }

  const shouldAttachBase = Boolean(ctx.tailwindcssBasedir && normalizedCssEntries?.length)
  const tailwindcssWithBase = shouldAttachBase && tailwindcss?.v4 !== null
    ? {
        ...(tailwindcss ?? {}),
        v4: {
          ...(tailwindcss?.v4 ?? {}),
          base: tailwindcss?.v4?.base ?? resolvedTailwindcssBasedir,
        },
      }
    : tailwindcss

  const patcherOptions: TailwindcssPatcherFactoryOptions = {
    tailwindcss: tailwindcssWithBase,
    tailwindcssPatcherOptions,
    supportCustomLengthUnitsPatch,
    appType,
  }

  const workspaceRoot = findWorkspaceRoot(resolvedTailwindcssBasedir)
    ?? (absoluteCssEntryBasedir ? findWorkspaceRoot(absoluteCssEntryBasedir) : undefined)

  const groupedCssEntries = normalizedCssEntries
    ? groupCssEntriesByBase(normalizedCssEntries, {
        preferredBaseDir: resolvedTailwindcssBasedir,
        workspaceRoot,
      })
    : undefined

  const multiPatcher = groupedCssEntries
    ? tryCreateMultiTailwindcssPatcher(groupedCssEntries, patcherOptions)
    : undefined

  if (multiPatcher) {
    return multiPatcher
  }

  if (groupedCssEntries?.size === 1) {
    const firstGroup = groupedCssEntries.entries().next().value
    if (firstGroup) {
      const [baseDir, entries] = firstGroup
      return createPatcherForBase(baseDir, entries, patcherOptions)
    }
  }

  const effectiveCssEntries = normalizedCssEntries ?? rawCssEntries

  return createPatcherForBase(
    resolvedTailwindcssBasedir,
    effectiveCssEntries,
    patcherOptions,
  )
}
