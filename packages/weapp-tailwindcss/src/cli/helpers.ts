import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { findWorkspaceRoot } from '@/context/workspace'
import { logger } from '@/logger'
import { getTailwindcssPackageInfo } from '@/tailwindcss'

export function readStringOption(flag: string, value: unknown): string | undefined {
  if (value == null) {
    return undefined
  }
  if (typeof value !== 'string') {
    throw new TypeError(`Option "--${flag}" expects a string value.`)
  }
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    throw new TypeError(`Option "--${flag}" expects a non-empty value.`)
  }
  return trimmed
}

export function readStringArrayOption(flag: string, value: unknown): string[] | undefined {
  if (value == null) {
    return undefined
  }

  if (Array.isArray(value)) {
    const normalized = value
      .filter(entry => entry != null)
      .map((entry) => {
        if (typeof entry !== 'string') {
          throw new TypeError(`Option "--${flag}" expects string values.`)
        }
        const trimmed = entry.trim()
        if (!trimmed) {
          throw new TypeError(`Option "--${flag}" expects non-empty values.`)
        }
        return trimmed
      })

    return normalized.length > 0 ? normalized : undefined
  }

  const normalized = readStringOption(flag, value)
  return normalized ? [normalized] : undefined
}

export function normalizeTokenFormat(format: string) {
  switch (format) {
    case 'json':
    case 'lines':
    case 'grouped-json':
      return format
    default:
      return 'json'
  }
}

export function normalizeExtractFormat(format: string | undefined): 'json' | 'lines' | undefined {
  if (!format) {
    return undefined
  }
  if (format === 'json' || format === 'lines') {
    return format
  }
  return undefined
}

export function toBoolean(value: unknown, fallback: boolean) {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    if (value === 'true') {
      return true
    }
    if (value === 'false') {
      return false
    }
  }
  if (value == null) {
    return fallback
  }
  return Boolean(value)
}

export function resolveCliCwd(value: unknown): string | undefined {
  const raw = readStringOption('cwd', value)
  if (!raw) {
    return undefined
  }
  return path.isAbsolute(raw) ? path.normalize(raw) : path.resolve(process.cwd(), raw)
}

/**
 * Resolve default working directory for `weapp-tw patch`.
 * Prefer explicit env overrides to avoid cross-package INIT_CWD pollution.
 */
function normalizeCandidatePath(baseDir: string, candidate: string | undefined) {
  if (!candidate) {
    return undefined
  }
  return path.isAbsolute(candidate) ? path.normalize(candidate) : path.resolve(baseDir, candidate)
}

function detectTailwindWorkspace(paths: string[]) {
  for (const candidate of paths) {
    try {
      const info = getTailwindcssPackageInfo({ paths: [candidate] })
      if (info?.rootPath) {
        return candidate
      }
    }
    catch {
      // ignore resolution errors and continue probing other candidates
    }
  }
  return undefined
}

export function resolvePatchDefaultCwd(currentCwd = process.cwd()) {
  const baseDir = path.normalize(currentCwd)
  const explicitCwd = normalizeCandidatePath(baseDir, process.env.WEAPP_TW_PATCH_CWD)
  if (explicitCwd) {
    return explicitCwd
  }

  const workspaceRoot = findWorkspaceRoot(baseDir)
  const initCwd = normalizeCandidatePath(baseDir, process.env.INIT_CWD)
  const localPrefix = normalizeCandidatePath(baseDir, process.env.npm_config_local_prefix)

  const candidates = [
    baseDir,
    workspaceRoot,
    initCwd,
    localPrefix,
  ].filter(Boolean) as string[]

  const detected = detectTailwindWorkspace([...new Set(candidates)])
  if (detected) {
    return detected
  }

  return initCwd ?? localPrefix ?? workspaceRoot ?? baseDir
}

export async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true })
}

function handleCliError(error: unknown) {
  if (error instanceof Error) {
    logger.error(error.message)
    if (error.stack && process.env.WEAPP_TW_DEBUG === '1') {
      logger.error(error.stack)
    }
  }
  else {
    logger.error(String(error))
  }
}

export function commandAction<T extends unknown[]>(handler: (...args: T) => Promise<void>) {
  return async (...args: T) => {
    try {
      await handler(...args)
    }
    catch (error) {
      handleCliError(error)
      process.exitCode = 1
    }
  }
}
