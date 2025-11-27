import type { TailwindcssPatchOptions } from 'tailwindcss-patch'
import type { CreateTailwindcssPatcherOptions } from '@/tailwindcss/patcher'
import type { InternalUserDefinedOptions, TailwindcssPatcherLike } from '@/types'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { logger } from '@weapp-tailwindcss/logger'
import { findNearestPackageRoot, findWorkspacePackageDir, findWorkspaceRoot } from '@/context/workspace'
import { createTailwindcssPatcher } from '@/tailwindcss'
import { defuOverrideArray } from '@/utils'

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

type TailwindUserOptions = NonNullable<TailwindcssPatchOptions['tailwind']>

interface LegacyTailwindcssPatcherOptionsLike {
  patch?: {
    basedir?: string
    cwd?: string
    tailwindcss?: TailwindUserOptions & {
      v4?: {
        base?: string
        cssEntries?: string[]
      }
    }
    [key: string]: unknown
  }
  [key: string]: unknown
}

type ModernTailwindcssPatchOptionsLike = TailwindcssPatchOptions

function isLegacyTailwindcssPatcherOptions(
  options: TailwindcssPatchOptions | LegacyTailwindcssPatcherOptionsLike | undefined,
): options is LegacyTailwindcssPatcherOptionsLike {
  return typeof options === 'object' && options !== null && 'patch' in options
}

function isModernTailwindcssPatchOptions(
  options: TailwindcssPatchOptions | LegacyTailwindcssPatcherOptionsLike | undefined,
): options is ModernTailwindcssPatchOptionsLike {
  return typeof options === 'object' && options !== null && !('patch' in options)
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

function guessBasedirFromEntries(entries?: string[]) {
  if (!entries) {
    return undefined
  }
  for (const entry of entries) {
    if (typeof entry !== 'string') {
      continue
    }
    const trimmed = entry.trim()
    if (!trimmed || !path.isAbsolute(trimmed)) {
      continue
    }
    const entryDir = path.dirname(trimmed)
    const resolved = findNearestPackageRoot(entryDir) ?? entryDir
    if (resolved) {
      return resolved
    }
  }
  return undefined
}

function normalizeCssEntries(entries: string[] | undefined, anchor: string): string[] | undefined {
  if (!entries || entries.length === 0) {
    return undefined
  }

  const normalized = new Set<string>()
  for (const entry of entries) {
    if (typeof entry !== 'string') {
      continue
    }
    const trimmed = entry.trim()
    if (trimmed.length === 0) {
      continue
    }
    const resolved = path.isAbsolute(trimmed)
      ? path.normalize(trimmed)
      : path.normalize(path.resolve(anchor, trimmed))
    normalized.add(resolved)
  }

  return normalized.size > 0 ? [...normalized] : undefined
}

function groupCssEntriesByBase(entries: string[]) {
  const groups = new Map<string, string[]>()
  for (const entry of entries) {
    const baseDir = path.normalize(path.dirname(entry))
    const bucket = groups.get(baseDir)
    if (bucket) {
      bucket.push(entry)
    }
    else {
      groups.set(baseDir, [entry])
    }
  }
  return groups
}

function overrideTailwindcssPatcherOptionsForBase(
  options: TailwindcssPatchOptions | LegacyTailwindcssPatcherOptionsLike | undefined,
  baseDir: string,
  cssEntries: string[],
) {
  if (!options) {
    return options
  }

  if (isLegacyTailwindcssPatcherOptions(options)) {
    const patchOptions = options.patch
    if (!patchOptions) {
      return options
    }
    const nextPatch = {
      ...patchOptions,
      basedir: baseDir,
      cwd: patchOptions.cwd ?? baseDir,
    }
    if (patchOptions.tailwindcss) {
      nextPatch.tailwindcss = {
        ...patchOptions.tailwindcss,
        v4: {
          ...(patchOptions.tailwindcss.v4 ?? {}),
          base: baseDir,
          cssEntries,
        },
      }
    }
    return {
      ...options,
      patch: nextPatch,
    }
  }

  if (!isModernTailwindcssPatchOptions(options)) {
    return options
  }

  if (!options.tailwind) {
    return options
  }

  return {
    ...options,
    tailwind: {
      ...options.tailwind,
      v4: {
        ...(options.tailwind.v4 ?? {}),
        base: baseDir,
        cssEntries,
      },
    },
  }
}

interface TailwindcssPatcherFactoryOptions {
  tailwindcss?: TailwindUserOptions
  tailwindcssPatcherOptions?: CreateTailwindcssPatcherOptions['tailwindcssPatcherOptions']
  supportCustomLengthUnitsPatch: InternalUserDefinedOptions['supportCustomLengthUnitsPatch']
  appType: InternalUserDefinedOptions['appType']
}

function createPatcherForBase(
  baseDir: string,
  cssEntries: string[] | undefined,
  options: TailwindcssPatcherFactoryOptions,
) {
  const {
    tailwindcss,
    tailwindcssPatcherOptions,
    supportCustomLengthUnitsPatch,
    appType,
  } = options

  const defaultTailwindcssConfig: TailwindUserOptions = {
    cwd: baseDir,
    v2: {
      cwd: baseDir,
    },
    v3: {
      cwd: baseDir,
    },
    v4: {
      base: baseDir,
      cssEntries,
    },
  }

  if (cssEntries?.length && (tailwindcss == null || tailwindcss.version == null)) {
    defaultTailwindcssConfig.version = 4
  }

  const mergedTailwindOptions = defuOverrideArray<TailwindUserOptions, TailwindUserOptions[]>(
    (tailwindcss ?? {}) as TailwindUserOptions,
    defaultTailwindcssConfig,
  )

  if (!mergedTailwindOptions.v4) {
    mergedTailwindOptions.v4 = {
      base: baseDir,
      cssEntries: cssEntries ?? [],
    }
  }
  else {
    mergedTailwindOptions.v4.base = baseDir
    if (cssEntries?.length) {
      mergedTailwindOptions.v4.cssEntries = cssEntries
    }
    else if (!mergedTailwindOptions.v4.cssEntries) {
      mergedTailwindOptions.v4.cssEntries = []
    }
  }

  const patchedOptions = overrideTailwindcssPatcherOptionsForBase(
    tailwindcssPatcherOptions,
    baseDir,
    cssEntries ?? [],
  )

  return createTailwindcssPatcher({
    basedir: baseDir,
    cacheDir: appType === 'mpx' ? 'node_modules/tailwindcss-patch/.cache' : undefined,
    supportCustomLengthUnitsPatch: supportCustomLengthUnitsPatch ?? true,
    tailwindcss: mergedTailwindOptions,
    tailwindcssPatcherOptions: patchedOptions,
  })
}

function createMultiTailwindcssPatcher(patchers: TailwindcssPatcherLike[]): TailwindcssPatcherLike {
  if (patchers.length <= 1) {
    return patchers[0]
  }

  type PatchResult = Awaited<ReturnType<TailwindcssPatcherLike['patch']>>

  const [first] = patchers
  const multiPatcher: TailwindcssPatcherLike = {
    packageInfo: first?.packageInfo,
    majorVersion: first?.majorVersion,
    options: first?.options,
    async patch() {
      let exposeContext: PatchResult['exposeContext']
      let extendLengthUnits: PatchResult['extendLengthUnits']
      for (const patcher of patchers) {
        const result = await patcher.patch()
        if (result?.exposeContext && exposeContext == null) {
          exposeContext = result.exposeContext
        }
        if (result?.extendLengthUnits && extendLengthUnits == null) {
          extendLengthUnits = result.extendLengthUnits
        }
      }
      return {
        exposeContext,
        extendLengthUnits,
      }
    },
    async getClassSet() {
      const aggregated = new Set<string>()
      for (const patcher of patchers) {
        const current = await patcher.getClassSet()
        for (const className of current) {
          aggregated.add(className)
        }
      }
      return aggregated
    },
    async extract(options) {
      const aggregatedSet = new Set<string>()
      const aggregatedList: string[] = []
      let filename: string | undefined
      for (const patcher of patchers) {
        const result = await patcher.extract(options)
        if (!result) {
          continue
        }
        if (filename === undefined && result.filename) {
          filename = result.filename
        }
        if (result.classList) {
          for (const className of result.classList) {
            if (!aggregatedSet.has(className)) {
              aggregatedList.push(className)
            }
            aggregatedSet.add(className)
          }
        }
        if (result.classSet) {
          for (const className of result.classSet) {
            aggregatedSet.add(className)
          }
        }
      }
      return {
        classList: aggregatedList,
        classSet: aggregatedSet,
        filename,
      }
    },
  }

  if (patchers.every(patcher => typeof patcher.getClassSetSync === 'function')) {
    multiPatcher.getClassSetSync = () => {
      const aggregated = new Set<string>()
      for (const patcher of patchers) {
        const current = patcher.getClassSetSync?.()
        if (!current) {
          continue
        }
        for (const className of current) {
          aggregated.add(className)
        }
      }
      return aggregated
    }
  }

  return multiPatcher
}

function tryCreateMultiTailwindcssPatcher(
  groups: Map<string, string[]>,
  options: TailwindcssPatcherFactoryOptions,
) {
  if (groups.size <= 1) {
    return undefined
  }

  logger.debug('detected multiple Tailwind CSS entry bases: %O', [...groups.keys()])
  const patchers: TailwindcssPatcherLike[] = []
  for (const [baseDir, entries] of groups) {
    patchers.push(createPatcherForBase(baseDir, entries, options))
  }
  return createMultiTailwindcssPatcher(patchers)
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

  const normalizedCssEntries = normalizeCssEntries(rawCssEntries, resolvedTailwindcssBasedir)
  if (normalizedCssEntries) {
    ctx.cssEntries = normalizedCssEntries
  }

  const patcherOptions: TailwindcssPatcherFactoryOptions = {
    tailwindcss,
    tailwindcssPatcherOptions,
    supportCustomLengthUnitsPatch,
    appType,
  }

  const groupedCssEntries = normalizedCssEntries
    ? groupCssEntriesByBase(normalizedCssEntries)
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
