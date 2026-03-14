import type { TailwindCssPatchOptions } from 'tailwindcss-patch'
import type { UserDefinedOptions } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { getCompilerContext } from '@/context'
import { defuOverrideArray } from '@/utils'

function mergeTailwindcssPatcherOptions(
  overrides: TailwindCssPatchOptions,
  current: TailwindCssPatchOptions | undefined,
): TailwindCssPatchOptions {
  if (!current) {
    return overrides
  }
  return defuOverrideArray<TailwindCssPatchOptions, TailwindCssPatchOptions[]>(overrides, current)
}

export function resolveEntry(entry: string, cwd: string | undefined) {
  if (path.isAbsolute(entry)) {
    return path.normalize(entry)
  }
  const base = cwd ?? process.cwd()
  return path.normalize(path.resolve(base, entry))
}

export function buildTailwindcssPatcherOptions(
  overrides: Partial<TailwindCssPatchOptions> | undefined,
): TailwindCssPatchOptions | undefined {
  if (!overrides) {
    return undefined
  }
  const filtered: Partial<TailwindCssPatchOptions> = {}
  if (overrides.projectRoot || overrides.cwd) {
    filtered.projectRoot = overrides.projectRoot ?? overrides.cwd
  }
  const extract: NonNullable<TailwindCssPatchOptions['extract']> = {}
  if (overrides.extract) {
    if (overrides.extract.file) {
      extract.file = overrides.extract.file
    }
    if (overrides.extract.format) {
      extract.format = overrides.extract.format
    }
  }
  if (overrides.output) {
    if (!extract.file && overrides.output.file) {
      extract.file = overrides.output.file
    }
    if (!extract.format && overrides.output.format) {
      extract.format = overrides.output.format
    }
    if (overrides.output.enabled !== undefined) {
      extract.write = overrides.output.enabled
    }
    if (overrides.output.pretty !== undefined) {
      extract.pretty = overrides.output.pretty
    }
    if (overrides.output.removeUniversalSelector !== undefined) {
      extract.removeUniversalSelector = overrides.output.removeUniversalSelector
    }
  }
  if (Object.keys(extract).length > 0) {
    filtered.extract = extract
  }
  return Object.keys(filtered).length > 0 ? filtered as TailwindCssPatchOptions : undefined
}

export function createCliContext(
  overrides: Partial<UserDefinedOptions> | undefined,
  resolvedCwd: string | undefined,
) {
  const userOptions: UserDefinedOptions = {
    ...(overrides ?? {}),
  }

  if (resolvedCwd) {
    if (!userOptions.tailwindcssBasedir) {
      userOptions.tailwindcssBasedir = resolvedCwd
    }
    const cwdOptions: TailwindCssPatchOptions = { projectRoot: resolvedCwd }
    const current = userOptions.tailwindcssPatcherOptions as TailwindCssPatchOptions | undefined
    userOptions.tailwindcssPatcherOptions = mergeTailwindcssPatcherOptions(
      cwdOptions,
      current,
    )
  }

  return getCompilerContext(userOptions)
}

export function formatOutputPath(target: string, baseDir?: string) {
  const root = baseDir ?? process.cwd()
  const relative = path.relative(root, target)
  if (!relative) {
    return '.'
  }
  if (relative.startsWith('..')) {
    return path.normalize(target)
  }
  return relative.startsWith('.') ? relative : `.${path.sep}${relative}`
}
