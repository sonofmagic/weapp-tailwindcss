import type { TailwindcssPatchOptions } from 'tailwindcss-patch'
import type { CreateTailwindcssPatcherOptions } from '@/tailwindcss/patcher'
import type { InternalUserDefinedOptions, TailwindcssPatcherLike } from '@/types'
import { logger } from '@weapp-tailwindcss/logger'
import { createTailwindcssPatcher } from '@/tailwindcss/patcher'
import { defuOverrideArray } from '@/utils'
import { createMultiTailwindcssPatcher } from './multi-patcher'
import { overrideTailwindcssPatcherOptionsForBase } from './patcher-options'

export { groupCssEntriesByBase, guessBasedirFromEntries, normalizeCssEntries } from './css-entries'
export { createMultiTailwindcssPatcher } from './multi-patcher'

type TailwindUserOptions = NonNullable<TailwindcssPatchOptions['tailwind']>

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

  if (hasCssEntries && (tailwindcss == null || tailwindcss.version == null)) {
    defaultTailwindcssConfig.version = 4
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
    || (tailwindcssPatcherOptions as any)?.tailwind?.packageName
    || (tailwindcssPatcherOptions as any)?.patch?.tailwindcss?.packageName
  const configuredVersion = tailwindcss?.version
    || (tailwindcssPatcherOptions as any)?.tailwind?.version
    || (tailwindcssPatcherOptions as any)?.patch?.tailwindcss?.version
    || mergedTailwindOptions.version

  const isTailwindcss4Package = (packageName: string | undefined) => Boolean(
    packageName
    && (packageName === 'tailwindcss4' || packageName === '@tailwindcss/postcss' || packageName.includes('tailwindcss4')),
  )

  const isV4 = configuredVersion === 4
    || mergedTailwindOptions.version === 4
    || isTailwindcss4Package(configuredPackageName ?? mergedTailwindOptions.packageName)

  const tailwindPackageConfigured = Boolean(configuredPackageName)
  const shouldPatchV4PostcssPackage = isV4 && !tailwindPackageConfigured
  const packageCandidates = new Set<string>()
  if (shouldPatchV4PostcssPackage) {
    packageCandidates.add('@tailwindcss/postcss')
  }
  packageCandidates.add(
    mergedTailwindOptions.packageName ?? configuredPackageName ?? 'tailwindcss',
  )

  const patchers = Array.from(packageCandidates).map((packageName) => {
    const tailwindOptionsForPackage: TailwindUserOptions = {
      ...mergedTailwindOptions,
      packageName,
    }
    return createTailwindcssPatcher({
      basedir: baseDir,
      supportCustomLengthUnitsPatch: supportCustomLengthUnitsPatch ?? true,
      tailwindcss: tailwindOptionsForPackage,
      tailwindcssPatcherOptions: patchedOptions,
    })
  })

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
