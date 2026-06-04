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
    const current = userOptions.tailwindcssPatcherOptions
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
