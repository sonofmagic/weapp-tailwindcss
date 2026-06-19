import type { TailwindcssRuntimeFactoryOptions } from '@/tailwindcss/v4'
import type { InternalUserDefinedOptions } from '@/types'
import { logger } from '@weapp-tailwindcss/logger'
import { findWorkspaceRoot } from '@/context/workspace'
import {
  createTailwindcssRuntimeForBase,
  groupCssEntriesByBase,
  guessBasedirFromEntries,
  normalizeCssEntries,
  tryCreateMultiTailwindcssRuntime,
} from '@/tailwindcss/v4'
import { omitUndefined } from '@/utils/object'
import { resolveTailwindcssBasedir } from './tailwindcss/basedir'
import { detectImplicitCssEntries } from './tailwindcss/rax'

export function createTailwindcssRuntimeFromContext(ctx: InternalUserDefinedOptions) {
  const {
    tailwindcssBasedir,
    supportCustomLengthUnits,
    tailwindcss,
    tailwindcssRuntimeOptions,
    cssEntries: rawCssEntries,
    appType,
    arbitraryValues,
  } = ctx

  const absoluteCssEntryBasedir = guessBasedirFromEntries(rawCssEntries)
  const resolvedTailwindcssBasedir = resolveTailwindcssBasedir(tailwindcssBasedir, absoluteCssEntryBasedir)
  ctx.tailwindcssBasedir = resolvedTailwindcssBasedir
  logger.debug('tailwindcss basedir resolved: %s', resolvedTailwindcssBasedir)

  let normalizedCssEntries = normalizeCssEntries(rawCssEntries, resolvedTailwindcssBasedir)
  if (!normalizedCssEntries) {
    normalizedCssEntries = detectImplicitCssEntries(ctx.appType, resolvedTailwindcssBasedir)
  }
  if (normalizedCssEntries) {
    ctx.cssEntries = normalizedCssEntries
  }

  const runtimeOptions: TailwindcssRuntimeFactoryOptions = {
    tailwindcss,
    tailwindcssRuntimeOptions,
    supportCustomLengthUnits,
    appType,
    bareArbitraryValues: arbitraryValues?.bareArbitraryValues,
  }

  const workspaceRoot = findWorkspaceRoot(resolvedTailwindcssBasedir)
    ?? (absoluteCssEntryBasedir ? findWorkspaceRoot(absoluteCssEntryBasedir) : undefined)

  const groupedCssEntries = normalizedCssEntries
    ? groupCssEntriesByBase(normalizedCssEntries, omitUndefined({
        preferredBaseDir: resolvedTailwindcssBasedir,
        workspaceRoot,
      }))
    : undefined

  const multiRuntime = groupedCssEntries
    ? tryCreateMultiTailwindcssRuntime(groupedCssEntries, runtimeOptions)
    : undefined

  if (multiRuntime) {
    return multiRuntime
  }

  if (groupedCssEntries?.size === 1) {
    const firstGroup = groupedCssEntries.entries().next().value
    if (firstGroup) {
      const [baseDir, entries] = firstGroup
      return createTailwindcssRuntimeForBase(baseDir, entries, runtimeOptions)
    }
  }

  const effectiveCssEntries = normalizedCssEntries ?? rawCssEntries

  return createTailwindcssRuntimeForBase(
    resolvedTailwindcssBasedir,
    effectiveCssEntries,
    runtimeOptions,
  )
}

export { resolveTailwindcssBasedir }
