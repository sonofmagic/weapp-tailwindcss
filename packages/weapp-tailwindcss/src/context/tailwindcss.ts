import type { TailwindcssUserConfig } from 'tailwindcss-patch'
import type { InternalUserDefinedOptions } from '@/types'
import path from 'node:path'
import process from 'node:process'
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

function pickEnvBasedir(): string | undefined {
  for (const key of ENV_BASEDIR_KEYS) {
    const value = process.env[key]
    if (value && path.isAbsolute(value)) {
      return value
    }
  }
  return undefined
}

export function resolveTailwindcssBasedir(basedir?: string) {
  const envBasedir = pickEnvBasedir()
  const anchor = envBasedir ?? process.cwd()

  if (basedir && basedir.trim().length > 0) {
    if (path.isAbsolute(basedir)) {
      return path.normalize(basedir)
    }
    return path.resolve(anchor, basedir)
  }

  if (envBasedir) {
    return path.normalize(envBasedir)
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

  const defaultTailwindcssConfig: TailwindcssUserConfig = {
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
      tailwindcss: defuOverrideArray<TailwindcssUserConfig, TailwindcssUserConfig[]>(
        tailwindcss,
        defaultTailwindcssConfig,
      ),
      tailwindcssPatcherOptions,
    },
  )
}
