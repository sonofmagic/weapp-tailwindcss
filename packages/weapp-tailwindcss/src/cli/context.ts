import type { TailwindcssPatchOptions } from 'tailwindcss-patch'
import type { UserDefinedOptions } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { getCompilerContext } from '@/context'
import { defuOverrideArray } from '@/utils'

function mergeTailwindcssPatcherOptions(
  overrides: TailwindcssPatchOptions,
  current: TailwindcssPatchOptions | undefined,
): TailwindcssPatchOptions {
  if (!current) {
    return overrides
  }
  return defuOverrideArray<TailwindcssPatchOptions, TailwindcssPatchOptions[]>(overrides, current)
}

export function resolveEntry(entry: string, cwd: string | undefined) {
  if (path.isAbsolute(entry)) {
    return path.normalize(entry)
  }
  const base = cwd ?? process.cwd()
  return path.normalize(path.resolve(base, entry))
}

export function buildTailwindcssPatcherOptions(
  overrides: Partial<TailwindcssPatchOptions> | undefined,
): TailwindcssPatchOptions | undefined {
  if (!overrides) {
    return undefined
  }
  const filtered: Partial<TailwindcssPatchOptions> = {}
  if (overrides.cwd) {
    filtered.cwd = overrides.cwd
  }
  if (overrides.output) {
    const output: NonNullable<TailwindcssPatchOptions['output']> = {}
    if (overrides.output.file) {
      output.file = overrides.output.file
    }
    if (overrides.output.format) {
      output.format = overrides.output.format
    }
    if (Object.keys(output).length > 0) {
      filtered.output = output
    }
  }
  return Object.keys(filtered).length > 0 ? filtered as TailwindcssPatchOptions : undefined
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
    const cwdOptions: TailwindcssPatchOptions = { cwd: resolvedCwd }
    const current = userOptions.tailwindcssPatcherOptions as TailwindcssPatchOptions | undefined
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
