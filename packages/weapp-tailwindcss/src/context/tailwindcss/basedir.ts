import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { logger } from '@weapp-tailwindcss/logger'
import { findWorkspacePackageDir, findWorkspaceRoot } from '@/context/workspace'

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
