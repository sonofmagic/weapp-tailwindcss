import type { TailwindV4SourceOptions } from './types'
import type { TailwindcssPatcherLike } from '@/types'
import path from 'node:path'
import process from 'node:process'
import {
  resolveTailwindV4Source as resolvePatchTailwindV4Source,
  resolveTailwindV4SourceFromPatchOptions,
} from 'tailwindcss-patch'
import { resolveTailwindcssOptions } from '@/tailwindcss/patcher-options'

function isPostcssPluginImportTarget(value: string | undefined) {
  if (!value) {
    return false
  }
  return value === '@tailwindcss/postcss'
    || value === '@tailwindcss/postcss7-compat'
    || value.includes('/postcss')
}

function uniqueDefined(values: Array<string | undefined>) {
  return [...new Set(values.filter((value): value is string => typeof value === 'string' && value.length > 0))]
}

function getProjectRoot(patcher: TailwindcssPatcherLike) {
  return patcher.options?.projectRoot ?? process.cwd()
}

function readConfiguredV4Base(tailwindOptions: ReturnType<typeof resolveTailwindcssOptions>) {
  const v4 = tailwindOptions?.v4
  if (typeof v4 !== 'object' || v4 === null) {
    return undefined
  }
  return (v4 as { configuredBase?: string }).configuredBase
}

function resolveTailwindCssImportTarget(patcher: TailwindcssPatcherLike) {
  const tailwindOptions = resolveTailwindcssOptions(patcher.options)
  const configuredPackageName = tailwindOptions?.packageName
  if (
    typeof configuredPackageName === 'string'
    && configuredPackageName.length > 0
    && !isPostcssPluginImportTarget(configuredPackageName)
  ) {
    return configuredPackageName
  }

  const packageName = patcher.packageInfo?.name
  if (
    typeof packageName === 'string'
    && packageName.length > 0
    && !isPostcssPluginImportTarget(packageName)
  ) {
    return packageName
  }

  return 'tailwindcss'
}

export function resolveTailwindV4SourceOptionsFromPatcher(
  patcher: TailwindcssPatcherLike,
): TailwindV4SourceOptions {
  const projectRoot = getProjectRoot(patcher)
  const tailwindOptions = resolveTailwindcssOptions(patcher.options)
  const configDir = tailwindOptions?.config ? path.dirname(tailwindOptions.config) : undefined
  const configuredBase = readConfiguredV4Base(tailwindOptions)
  const hasCssEntries = Boolean(tailwindOptions?.v4?.cssEntries?.length)
  return {
    projectRoot,
    base: configuredBase ?? (hasCssEntries ? undefined : tailwindOptions?.v4?.base),
    baseFallbacks: uniqueDefined([
      tailwindOptions?.cwd,
      configDir,
    ]),
    css: tailwindOptions?.v4?.css,
    cssEntries: tailwindOptions?.v4?.cssEntries,
    sources: tailwindOptions?.v4?.sources,
    packageName: resolveTailwindCssImportTarget(patcher),
  }
}

export function resolveTailwindV4Source(options?: TailwindV4SourceOptions) {
  return resolvePatchTailwindV4Source(options)
}

export async function resolveTailwindV4SourceFromPatcher(
  patcher: TailwindcssPatcherLike,
) {
  return resolvePatchTailwindV4Source(resolveTailwindV4SourceOptionsFromPatcher(patcher))
}

export { resolveTailwindV4SourceFromPatchOptions }
