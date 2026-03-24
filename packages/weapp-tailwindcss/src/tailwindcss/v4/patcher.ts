import type { TailwindCssPatchOptions } from 'tailwindcss-patch'
import type { CreateTailwindcssPatcherOptions } from '@/tailwindcss/patcher'
import type { InternalUserDefinedOptions, TailwindcssPatcherLike } from '@/types'
import { logger } from '@weapp-tailwindcss/logger'
import { createTailwindcssPatcher } from '@/tailwindcss/patcher'
import { defuOverrideArray } from '@/utils'
import { createMultiTailwindcssPatcher } from './multi-patcher'
import { overrideTailwindcssPatcherOptionsForBase } from './patcher-options'

export { groupCssEntriesByBase, guessBasedirFromEntries, normalizeCssEntries } from './css-entries'
export { createMultiTailwindcssPatcher } from './multi-patcher'

type TailwindUserOptions = NonNullable<TailwindCssPatchOptions['tailwindcss']>
const CONFIGURED_TAILWIND_VERSION_RE = /Configured tailwindcss\.version=\d+/u
const RESOLVED_TAILWIND_VERSION_RE = /resolved package ".+" is version /u

function isTailwindcss4Package(packageName: string | undefined) {
  return Boolean(
    packageName
    && (packageName === 'tailwindcss4' || packageName === '@tailwindcss/postcss' || packageName.includes('tailwindcss4')),
  )
}

function resolveExplicitTailwindVersion(
  configuredVersion: number | undefined,
  configuredPackageName: string | undefined,
) {
  if (typeof configuredVersion === 'number') {
    return configuredVersion
  }

  if (configuredPackageName === 'tailwindcss') {
    return 3
  }

  if (isTailwindcss4Package(configuredPackageName)) {
    return 4
  }

  return undefined
}

function hasOwnV4Signal(value: unknown) {
  return typeof value === 'object' && value !== null && 'v4' in value
}

function isTailwindVersionMismatchError(error: unknown) {
  return error instanceof Error
    && CONFIGURED_TAILWIND_VERSION_RE.test(error.message)
    && RESOLVED_TAILWIND_VERSION_RE.test(error.message)
}

export interface TailwindcssPatcherFactoryOptions {
  tailwindcss?: TailwindUserOptions
  tailwindcssPatcherOptions?: CreateTailwindcssPatcherOptions['tailwindcssPatcherOptions']
  supportCustomLengthUnitsPatch: InternalUserDefinedOptions['supportCustomLengthUnitsPatch']
  appType: InternalUserDefinedOptions['appType']
}

export function createPatcherForBase(
  baseDir: string,
  cssEntries: string[] | undefined,
  options: TailwindcssPatcherFactoryOptions,
) {
  const {
    tailwindcss,
    tailwindcssPatcherOptions,
    supportCustomLengthUnitsPatch,
  } = options

  const hasCssEntries = Boolean(cssEntries?.length)

  const defaultTailwindcssConfig: TailwindUserOptions = {
    cwd: baseDir,
    v2: {
      cwd: baseDir,
    },
    v3: {
      cwd: baseDir,
    },
    v4: hasCssEntries
      ? { cssEntries }
      : {
          base: baseDir,
          cssEntries,
        },
  }

  const mergedTailwindOptions = defuOverrideArray<TailwindUserOptions, TailwindUserOptions[]>(
    (tailwindcss ?? {}) as TailwindUserOptions,
    defaultTailwindcssConfig,
  )

  if (!mergedTailwindOptions.v4) {
    mergedTailwindOptions.v4 = hasCssEntries
      ? { cssEntries: cssEntries ?? [] }
      : {
          base: baseDir,
          cssEntries: cssEntries ?? [],
        }
  }
  else {
    if (!hasCssEntries && !mergedTailwindOptions.v4.base) {
      mergedTailwindOptions.v4.base = baseDir
    }

    if (hasCssEntries) {
      if (cssEntries?.length) {
        mergedTailwindOptions.v4.cssEntries = cssEntries
      }
      else if (!mergedTailwindOptions.v4.cssEntries) {
        mergedTailwindOptions.v4.cssEntries = []
      }
    }
    else if (!mergedTailwindOptions.v4.cssEntries) {
      mergedTailwindOptions.v4.cssEntries = cssEntries ?? []
    }
  }

  const patchedOptions = overrideTailwindcssPatcherOptionsForBase(
    tailwindcssPatcherOptions,
    baseDir,
    cssEntries ?? [],
  )

  const configuredPackageName = tailwindcss?.packageName
    || (tailwindcssPatcherOptions as any)?.tailwindcss?.packageName
    || (tailwindcssPatcherOptions as any)?.tailwind?.packageName
    || (tailwindcssPatcherOptions as any)?.patch?.tailwindcss?.packageName
  const configuredVersion = tailwindcss?.version
    || (tailwindcssPatcherOptions as any)?.tailwindcss?.version
    || (tailwindcssPatcherOptions as any)?.tailwind?.version
    || (tailwindcssPatcherOptions as any)?.patch?.tailwindcss?.version
    || mergedTailwindOptions.version
  const explicitTailwindVersion = resolveExplicitTailwindVersion(configuredVersion, configuredPackageName)

  const hasExplicitV4Signals = hasCssEntries
    || hasOwnV4Signal(tailwindcss)
    || hasOwnV4Signal((tailwindcssPatcherOptions as any)?.tailwindcss)
    || hasOwnV4Signal((tailwindcssPatcherOptions as any)?.tailwind)
    || hasOwnV4Signal((tailwindcssPatcherOptions as any)?.patch?.tailwindcss)

  const isV4 = explicitTailwindVersion === 3
    ? false
    : explicitTailwindVersion === 4
      || (explicitTailwindVersion === undefined && (
        mergedTailwindOptions.version === 4
        || isTailwindcss4Package(configuredPackageName ?? mergedTailwindOptions.packageName)
        || hasExplicitV4Signals
      ))

  const tailwindPackageConfigured = Boolean(configuredPackageName)
  const shouldPatchV4PostcssPackage = isV4 && !tailwindPackageConfigured
  const packageCandidates = new Set<string>()
  if (shouldPatchV4PostcssPackage) {
    packageCandidates.add('@tailwindcss/postcss')
  }
  packageCandidates.add(
    mergedTailwindOptions.packageName ?? configuredPackageName ?? 'tailwindcss',
  )

  const patchers: TailwindcssPatcherLike[] = []
  const packageCandidateList = [...packageCandidates]
  let firstVersionMismatchError: Error | undefined
  for (const packageName of packageCandidateList) {
    const tailwindOptionsForPackage: TailwindUserOptions = {
      ...mergedTailwindOptions,
      packageName,
    }
    try {
      patchers.push(createTailwindcssPatcher({
        basedir: baseDir,
        supportCustomLengthUnitsPatch: supportCustomLengthUnitsPatch ?? true,
        tailwindcss: tailwindOptionsForPackage,
        tailwindcssPatcherOptions: patchedOptions,
      }))
    }
    catch (error) {
      if (packageCandidateList.length > 1 && isTailwindVersionMismatchError(error)) {
        firstVersionMismatchError ??= error
        logger.warn('skip incompatible Tailwind package candidate "%s" for v4 patcher: %s', packageName, error.message)
        continue
      }
      throw error
    }
  }

  if (patchers.length === 0 && firstVersionMismatchError) {
    throw firstVersionMismatchError
  }

  return patchers.length === 1 ? patchers[0] : createMultiTailwindcssPatcher(patchers)
}

export function tryCreateMultiTailwindcssPatcher(
  groups: Map<string, string[]>,
  options: TailwindcssPatcherFactoryOptions,
) {
  if (groups.size <= 1) {
    return undefined
  }

  logger.debug('detected multiple Tailwind CSS entry bases: %O', [...groups.keys()])
  const patchers: TailwindcssPatcherLike[] = []
  for (const [baseDir, entries] of groups) {
    patchers.push(createPatcherForBase(baseDir, entries, options))
  }
  return createMultiTailwindcssPatcher(patchers)
}
