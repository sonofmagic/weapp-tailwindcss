import type { TailwindcssPatcherFactoryOptions } from '@/tailwindcss/v4'
import type { InternalUserDefinedOptions } from '@/types'
import { logger } from '@weapp-tailwindcss/logger'
import { findWorkspaceRoot } from '@/context/workspace'
import {
  createPatcherForBase,
  groupCssEntriesByBase,
  guessBasedirFromEntries,
  normalizeCssEntries,
  tryCreateMultiTailwindcssPatcher,
} from '@/tailwindcss/v4'
import { resolveTailwindcssBasedir } from './tailwindcss/basedir'
import { detectImplicitCssEntries } from './tailwindcss/rax'

export function createTailwindcssPatcherFromContext(ctx: InternalUserDefinedOptions) {
  const {
    tailwindcssBasedir,
    supportCustomLengthUnitsPatch,
    tailwindcss,
    tailwindcssPatcherOptions,
    cssEntries: rawCssEntries,
    appType,
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

  const shouldAttachBase = Boolean(ctx.tailwindcssBasedir && normalizedCssEntries?.length)
  const tailwindcssWithBase = shouldAttachBase && tailwindcss?.v4 !== null
    ? {
        ...(tailwindcss ?? {}),
        v4: {
          ...(tailwindcss?.v4 ?? {}),
          base: tailwindcss?.v4?.base ?? resolvedTailwindcssBasedir,
        },
      }
    : tailwindcss

  const patcherOptions: TailwindcssPatcherFactoryOptions = {
    tailwindcss: tailwindcssWithBase,
    tailwindcssPatcherOptions,
    supportCustomLengthUnitsPatch,
    appType,
  }

  const workspaceRoot = findWorkspaceRoot(resolvedTailwindcssBasedir)
    ?? (absoluteCssEntryBasedir ? findWorkspaceRoot(absoluteCssEntryBasedir) : undefined)

  const groupedCssEntries = normalizedCssEntries
    ? groupCssEntriesByBase(normalizedCssEntries, {
        preferredBaseDir: resolvedTailwindcssBasedir,
        workspaceRoot,
      })
    : undefined

  const multiPatcher = groupedCssEntries
    ? tryCreateMultiTailwindcssPatcher(groupedCssEntries, patcherOptions)
    : undefined

  if (multiPatcher) {
    return multiPatcher
  }

  if (groupedCssEntries?.size === 1) {
    const firstGroup = groupedCssEntries.entries().next().value
    if (firstGroup) {
      const [baseDir, entries] = firstGroup
      return createPatcherForBase(baseDir, entries, patcherOptions)
    }
  }

  const effectiveCssEntries = normalizedCssEntries ?? rawCssEntries

  return createPatcherForBase(
    resolvedTailwindcssBasedir,
    effectiveCssEntries,
    patcherOptions,
  )
}

export { resolveTailwindcssBasedir }
