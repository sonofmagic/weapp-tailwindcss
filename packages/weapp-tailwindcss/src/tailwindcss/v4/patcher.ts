import type { TailwindCssPatchOptions } from 'tailwindcss-patch'
import type { CreateTailwindcssPatcherOptions } from '@/tailwindcss/patcher'
import type { InternalUserDefinedOptions, TailwindcssPatcherLike } from '@/types'
import { logger } from '@weapp-tailwindcss/logger'
import { createTailwindcssPatcher } from '@/tailwindcss/patcher'
import { readInstalledPackageMajorVersion } from '@/tailwindcss/version'
import { defuOverrideArray } from '@/utils'
import { omitUndefined } from '@/utils/object'
import { createMultiTailwindcssPatcher } from './multi-patcher'
import { overrideTailwindcssPatcherOptionsForBase } from './patcher-options'

export { groupCssEntriesByBase, guessBasedirFromEntries, normalizeCssEntries } from './css-entries'
export { createMultiTailwindcssPatcher } from './multi-patcher'

type TailwindUserOptions = NonNullable<TailwindCssPatchOptions['tailwindcss']>

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

  if (isTailwindcss4Package(configuredPackageName)) {
    return 4
  }

  return undefined
}

export interface TailwindcssPatcherFactoryOptions {
  tailwindcss?: TailwindUserOptions
  tailwindcssPatcherOptions?: CreateTailwindcssPatcherOptions['tailwindcssPatcherOptions']
  supportCustomLengthUnitsPatch: InternalUserDefinedOptions['supportCustomLengthUnitsPatch']
  appType: InternalUserDefinedOptions['appType']
  bareArbitraryValues?: InternalUserDefinedOptions['arbitraryValues']['bareArbitraryValues']
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
    bareArbitraryValues,
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
      ? omitUndefined({ cssEntries })
      : omitUndefined({
          base: baseDir,
          cssEntries,
        }),
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

  if (bareArbitraryValues !== undefined && bareArbitraryValues !== false) {
    mergedTailwindOptions.v4.bareArbitraryValues = bareArbitraryValues
  }

  const patchedOptions = overrideTailwindcssPatcherOptionsForBase(
    tailwindcssPatcherOptions,
    baseDir,
    cssEntries ?? [],
  )

  const configuredPackageName = tailwindcss?.packageName
    || (tailwindcssPatcherOptions as any)?.tailwindcss?.packageName
  const configuredVersion = tailwindcss?.version
    || (tailwindcssPatcherOptions as any)?.tailwindcss?.version
    || mergedTailwindOptions.version
  const explicitTailwindVersion = resolveExplicitTailwindVersion(configuredVersion, configuredPackageName)

  const packageNameForVersionDetection = configuredPackageName ?? mergedTailwindOptions.packageName ?? 'tailwindcss'
  const installedTailwindVersion = readInstalledPackageMajorVersion(packageNameForVersionDetection, baseDir)
  const resolvedTailwindVersion = installedTailwindVersion ?? explicitTailwindVersion
  const supportedResolvedTailwindVersion = resolvedTailwindVersion === 2 || resolvedTailwindVersion === 3 || resolvedTailwindVersion === 4
    ? resolvedTailwindVersion
    : undefined

  const tailwindOptionsForPackage: TailwindUserOptions = {
    ...mergedTailwindOptions,
    packageName: mergedTailwindOptions.packageName ?? configuredPackageName ?? 'tailwindcss',
  }
  if (supportedResolvedTailwindVersion) {
    tailwindOptionsForPackage.version = supportedResolvedTailwindVersion
  }

  return createTailwindcssPatcher(omitUndefined({
    basedir: baseDir,
    supportCustomLengthUnitsPatch: supportCustomLengthUnitsPatch ?? true,
    tailwindcss: tailwindOptionsForPackage,
    tailwindcssPatcherOptions: patchedOptions,
  }))
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
    const patcher = createPatcherForBase(baseDir, entries, options)
    if (patcher) {
      patchers.push(patcher)
    }
  }
  return createMultiTailwindcssPatcher(patchers)
}
