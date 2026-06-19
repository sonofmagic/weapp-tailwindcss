import type { TailwindCssRuntimeOptions } from '@/tailwindcss/runtime-types'
import type { UserDefinedOptions } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { getCompilerContext } from '@/context'
import { defuOverrideArray } from '@/utils'

function mergeTailwindcssRuntimeOptions(
  overrides: TailwindCssRuntimeOptions,
  current: TailwindCssRuntimeOptions | undefined,
): TailwindCssRuntimeOptions {
  if (!current) {
    return overrides
  }
  return defuOverrideArray<TailwindCssRuntimeOptions, TailwindCssRuntimeOptions[]>(overrides, current)
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
    const cwdOptions: TailwindCssRuntimeOptions = { projectRoot: resolvedCwd }
    const current = userOptions.tailwindcssRuntimeOptions
    userOptions.tailwindcssRuntimeOptions = mergeTailwindcssRuntimeOptions(
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
