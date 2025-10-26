import type { TailwindcssPatchOptions } from 'tailwindcss-patch'
import type { InternalUserDefinedOptions } from '@/types'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { logger } from '@weapp-tailwindcss/logger'
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

export function resolveTailwindcssBasedir(basedir?: string) {
  const envBasedirResult = pickEnvBasedir()
  const envBasedir = envBasedirResult?.value
  const envBasedirKey = envBasedirResult?.key
  const envBasedirIsGeneric = envBasedirKey ? GENERIC_ENV_BASEDIR_KEYS.has(envBasedirKey) : false
  const packageEnvBasedir = pickPackageEnvBasedir()
  const shouldDetectCaller = !envBasedir || envBasedirIsGeneric
  const callerBasedir = shouldDetectCaller ? detectCallerBasedir() : undefined
  const anchor = envBasedir ?? packageEnvBasedir ?? callerBasedir ?? process.cwd()
  if (process.env.WEAPP_TW_DEBUG_STACK === '1') {
    logger.debug('resolveTailwindcssBasedir anchor %O', {
      basedir,
      envBasedir,
      envBasedirKey,
      envBasedirIsGeneric,
      packageEnvBasedir,
      callerBasedir,
      npm_package_json: process.env.npm_package_json,
      cwd: process.cwd(),
      anchor,
    })
  }

  if (basedir && basedir.trim().length > 0) {
    if (path.isAbsolute(basedir)) {
      return path.normalize(basedir)
    }
    return path.resolve(anchor, basedir)
  }

  if (envBasedir && !envBasedirIsGeneric) {
    return path.normalize(envBasedir)
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

  if (envBasedir) {
    return path.normalize(envBasedir)
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
      // ignore
    }
  }

  return path.normalize(process.cwd())
}

export function createTailwindcssPatcherFromContext(ctx: InternalUserDefinedOptions) {
  const {
    tailwindcssBasedir,
    supportCustomLengthUnitsPatch,
    tailwindcss,
    tailwindcssPatcherOptions,
    cssEntries,
    appType,
  } = ctx

  const resolvedTailwindcssBasedir = resolveTailwindcssBasedir(tailwindcssBasedir)
  ctx.tailwindcssBasedir = resolvedTailwindcssBasedir
  logger.debug('tailwindcss basedir resolved: %s', resolvedTailwindcssBasedir)

  type TailwindUserOptions = NonNullable<TailwindcssPatchOptions['tailwind']>

  const defaultTailwindcssConfig: TailwindUserOptions = {
    cwd: resolvedTailwindcssBasedir,
    v2: {
      cwd: resolvedTailwindcssBasedir,
    },
    v3: {
      cwd: resolvedTailwindcssBasedir,
    },
    v4: {
      base: resolvedTailwindcssBasedir,
      cssEntries,
    },
  }

  if (cssEntries?.length && (tailwindcss == null || tailwindcss.version == null)) {
    defaultTailwindcssConfig.version = 4
  }

  return createTailwindcssPatcher(
    {
      basedir: resolvedTailwindcssBasedir,
      cacheDir: appType === 'mpx' ? 'node_modules/tailwindcss-patch/.cache' : undefined,
      supportCustomLengthUnitsPatch: supportCustomLengthUnitsPatch ?? true,
      tailwindcss: defuOverrideArray<TailwindUserOptions, TailwindUserOptions[]>(
        (tailwindcss ?? {}) as TailwindUserOptions,
        defaultTailwindcssConfig,
      ),
      tailwindcssPatcherOptions,
    },
  )
}
