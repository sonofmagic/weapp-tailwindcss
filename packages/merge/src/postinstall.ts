import type { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { getPackageInfoSync } from 'local-pkg'
import satisfies from 'semver/functions/satisfies.js'

const LOG_PREFIX = '[weapp-tailwindcss/merge]'
const FALLBACK_VARIANT = 'v4' as const
const EXTENSIONS = ['cjs', 'd.cts', 'd.ts', 'js'] as const

type RuntimeVariant = 'v3' | 'v4'

interface EnvConfig {
  forcedVariant?: RuntimeVariant
  disableFallback: boolean
  strict: boolean
}

interface TailwindInfo {
  version: string
  rootPath: string
}

function printLine(message: string, stream: NodeJS.WritableStream) {
  stream.write(`${LOG_PREFIX} ${message}\n`)
}

function info(message: string) {
  printLine(message, process.stdout)
}

function warn(message: string) {
  printLine(message, process.stderr)
}

function error(message: string) {
  printLine(message, process.stderr)
}

function describeVariant(variant: RuntimeVariant): string {
  if (variant === 'v3') {
    return 'tailwind-merge@2 runtime (Tailwind CSS v3)'
  }

  return 'tailwind-merge@3 runtime (Tailwind CSS v4)'
}

function parseBooleanEnv(name: string): boolean {
  const value = process.env[name]
  if (!value) {
    return false
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
}

function parseVariantEnv(value: string | undefined): RuntimeVariant | undefined {
  if (!value) {
    return undefined
  }

  const normalized = value.trim().toLowerCase().replace(/^v/, '')
  if (normalized === '3') {
    return 'v3'
  }
  if (normalized === '4') {
    return 'v4'
  }

  warn(`Unknown runtime variant "${value}". Supported values are "v3" and "v4".`)
  return undefined
}

function readEnvConfig(): EnvConfig {
  const forcedVariantEnv = process.env.WEAPP_TW_MERGE_TARGET_VERSION ?? process.env.WEAPP_TW_MERGE_FORCE_VERSION
  const forcedVariant = parseVariantEnv(forcedVariantEnv)

  return {
    forcedVariant,
    disableFallback:
      parseBooleanEnv('WEAPP_TW_MERGE_DISABLE_FALLBACK')
      || parseBooleanEnv('WEAPP_TW_MERGE_NO_FALLBACK'),
    strict: parseBooleanEnv('WEAPP_TW_MERGE_STRICT'),
  }
}

function unique<T>(values: (T | undefined | null)[]): T[] {
  return Array.from(new Set(values.filter((value): value is T => value != null)))
}

function detectTailwindInfo(): TailwindInfo | undefined {
  const searchRoots = unique<string>([
    process.env.WEAPP_TW_MERGE_RESOLVE_ROOT,
    process.env.INIT_CWD,
    process.env.npm_config_local_prefix,
    process.env.PWD,
    process.cwd(),
  ])

  for (const root of searchRoots) {
    try {
      const info = getPackageInfoSync('tailwindcss', { paths: [root] })
      if (info?.version) {
        return {
          version: info.version,
          rootPath: info.rootPath,
        }
      }
    }
    catch {
      // ignore resolution errors and continue with other roots
    }
  }

  try {
    const info = getPackageInfoSync('tailwindcss')
    if (info?.version) {
      return {
        version: info.version,
        rootPath: info.rootPath,
      }
    }
  }
  catch {
    // ignore fallback failure
  }

  return undefined
}

type VariantResolution = {
  variant: RuntimeVariant
  reason: string
  detected: true
} | {
  variant?: undefined
  reason: string
  detected: false
}

function resolveVariant(env: EnvConfig, tailwindInfo: TailwindInfo | undefined): VariantResolution {
  if (env.forcedVariant) {
    return {
      variant: env.forcedVariant,
      reason: 'forced by environment',
      detected: true,
    }
  }

  if (tailwindInfo) {
    const target = satisfies(tailwindInfo.version, '^4.0.0-0') ? 'v4' : 'v3'
    return {
      variant: target,
      reason: `tailwindcss@${tailwindInfo.version}`,
      detected: true,
    }
  }

  return {
    reason: 'tailwindcss not found',
    detected: false,
  }
}

function readFile(pathname: string): Buffer {
  return fs.readFileSync(pathname)
}

function copyFileIfChanged(source: string, target: string): boolean {
  const sourceBuffer = readFile(source)

  if (fs.existsSync(target)) {
    try {
      const targetBuffer = readFile(target)
      if (targetBuffer.equals(sourceBuffer)) {
        return false
      }
    }
    catch {
      // if reading target fails we will attempt to overwrite it
    }
  }

  fs.writeFileSync(target, sourceBuffer)
  return true
}

function ensureVariant(distDir: string, variant: RuntimeVariant): {
  changedFiles: string[]
} {
  const changedFiles: string[] = []

  for (const ext of EXTENSIONS) {
    const source = path.resolve(distDir, `${variant}.${ext}`)
    if (!fs.existsSync(source)) {
      throw new Error(`Missing source file ${path.relative(process.cwd(), source)}`)
    }

    const target = path.resolve(distDir, `index.${ext}`)
    if (copyFileIfChanged(source, target)) {
      changedFiles.push(path.basename(target))
    }
  }

  return {
    changedFiles,
  }
}

function main() {
  const resolveDistDir = (): string => {
    if (typeof __dirname === 'string') {
      return path.resolve(__dirname, '../dist')
    }

    // Fallback for the ESM bundle or direct TS execution
    // eslint-disable-next-line no-new-func
    const getImportMetaUrl = new Function('return import.meta.url') as () => string
    return fileURLToPath(new URL('../dist/', getImportMetaUrl()))
  }

  const distDir = resolveDistDir()

  if (!fs.existsSync(distDir)) {
    warn('dist directory not found. Skipping runtime switch.')
    return
  }

  const envConfig = readEnvConfig()
  const tailwindInfo = detectTailwindInfo()
  const resolution = resolveVariant(envConfig, tailwindInfo)

  let targetVariant: RuntimeVariant

  if (!resolution.variant) {
    warn(`${resolution.reason}.`)
    if (envConfig.disableFallback) {
      warn('Fallback is disabled. Default entry will keep the bundled runtime.')
      warn('You can import "@weapp-tailwindcss/merge/v3" or "@weapp-tailwindcss/merge/v4" manually when needed.')
      return
    }
    targetVariant = FALLBACK_VARIANT
    info(`Fallback to ${describeVariant(targetVariant)}.`)
  }
  else {
    targetVariant = resolution.variant
    info(`Using ${describeVariant(targetVariant)} (${resolution.reason}).`)
  }

  try {
    const { changedFiles } = ensureVariant(distDir, targetVariant)
    if (changedFiles.length > 0) {
      info(`Updated entry files: ${changedFiles.join(', ')}`)
    }
    else {
      info('Entry files already match the requested runtime.')
    }
  }
  catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    error(`Failed to switch runtime to ${targetVariant}. ${message}`)

    if (envConfig.disableFallback || targetVariant === FALLBACK_VARIANT) {
      warn('Leaving existing files untouched. Import a specific runtime manually if required.')
    }
    else {
      try {
        const { changedFiles } = ensureVariant(distDir, FALLBACK_VARIANT)
        if (changedFiles.length > 0) {
          info(`Reverted to fallback runtime (${describeVariant(FALLBACK_VARIANT)}).`)
        }
        else {
          info('Fallback runtime was already in use. No changes applied.')
        }
      }
      catch (fallbackErr) {
        const fallbackMessage = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)
        error(`Failed to apply fallback runtime. ${fallbackMessage}`)
      }
    }

    if (envConfig.strict) {
      process.exitCode = process.exitCode ?? 1
    }
  }
}

main()
