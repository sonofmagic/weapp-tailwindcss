import type { TailwindcssPatchOptions } from 'tailwindcss-patch'
import type { CreateTailwindcssPatcherOptions } from '@/tailwindcss/patcher'
import type { InternalUserDefinedOptions, TailwindcssPatcherLike } from '@/types'
import path from 'node:path'
import { logger } from '@weapp-tailwindcss/logger'
import { findNearestPackageRoot } from '@/context/workspace'
import { createTailwindcssPatcher } from '@/tailwindcss/patcher'
import { defuOverrideArray } from '@/utils'

type TailwindUserOptions = NonNullable<TailwindcssPatchOptions['tailwind']>

interface LegacyTailwindcssPatcherOptionsLike {
  patch?: {
    basedir?: string
    cwd?: string
    tailwindcss?: TailwindUserOptions & {
      v4?: {
        base?: string
        cssEntries?: string[]
      }
    }
    [key: string]: unknown
  }
  [key: string]: unknown
}

type ModernTailwindcssPatchOptionsLike = TailwindcssPatchOptions

function isLegacyTailwindcssPatcherOptions(
  options: TailwindcssPatchOptions | LegacyTailwindcssPatcherOptionsLike | undefined,
): options is LegacyTailwindcssPatcherOptionsLike {
  return typeof options === 'object' && options !== null && 'patch' in options
}

function isModernTailwindcssPatchOptions(
  options: TailwindcssPatchOptions | LegacyTailwindcssPatcherOptionsLike | undefined,
): options is ModernTailwindcssPatchOptionsLike {
  return typeof options === 'object' && options !== null && !('patch' in options)
}

export function guessBasedirFromEntries(entries?: string[]) {
  if (!entries) {
    return undefined
  }
  for (const entry of entries) {
    if (typeof entry !== 'string') {
      continue
    }
    const trimmed = entry.trim()
    if (!trimmed || !path.isAbsolute(trimmed)) {
      continue
    }
    const entryDir = path.dirname(trimmed)
    const resolved = findNearestPackageRoot(entryDir) ?? entryDir
    if (resolved) {
      return resolved
    }
  }
  return undefined
}

export function normalizeCssEntries(entries: string[] | undefined, anchor: string): string[] | undefined {
  if (!entries || entries.length === 0) {
    return undefined
  }

  const normalized = new Set<string>()
  for (const entry of entries) {
    if (typeof entry !== 'string') {
      continue
    }
    const trimmed = entry.trim()
    if (trimmed.length === 0) {
      continue
    }
    const resolved = path.isAbsolute(trimmed)
      ? path.normalize(trimmed)
      : path.normalize(path.resolve(anchor, trimmed))
    normalized.add(resolved)
  }

  return normalized.size > 0 ? [...normalized] : undefined
}

interface GroupCssEntriesOptions {
  preferredBaseDir?: string
  workspaceRoot?: string
}

function isSubPath(parent: string | undefined, child: string | undefined) {
  if (!parent || !child) {
    return false
  }
  const relative = path.relative(parent, child)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

function resolveCssEntryBase(entryDir: string, options: GroupCssEntriesOptions): string {
  const normalizedDir = path.normalize(entryDir)
  const { preferredBaseDir, workspaceRoot } = options
  if (preferredBaseDir && isSubPath(preferredBaseDir, normalizedDir)) {
    return preferredBaseDir
  }
  if (workspaceRoot && isSubPath(workspaceRoot, normalizedDir)) {
    return workspaceRoot
  }
  const packageRoot = findNearestPackageRoot(normalizedDir)
  if (packageRoot) {
    return path.normalize(packageRoot)
  }
  return normalizedDir
}

export function groupCssEntriesByBase(entries: string[], options: GroupCssEntriesOptions = {}) {
  const normalizedOptions: GroupCssEntriesOptions = {
    preferredBaseDir: options.preferredBaseDir ? path.normalize(options.preferredBaseDir) : undefined,
    workspaceRoot: options.workspaceRoot ? path.normalize(options.workspaceRoot) : undefined,
  }
  const groups = new Map<string, string[]>()
  for (const entry of entries) {
    const entryDir = path.dirname(entry)
    const baseDir = resolveCssEntryBase(entryDir, normalizedOptions)
    const bucket = groups.get(baseDir)
    if (bucket) {
      bucket.push(entry)
    }
    else {
      groups.set(baseDir, [entry])
    }
  }
  return groups
}

function overrideTailwindcssPatcherOptionsForBase(
  options: TailwindcssPatchOptions | LegacyTailwindcssPatcherOptionsLike | undefined,
  baseDir: string,
  cssEntries: string[],
) {
  if (!options) {
    return options
  }

  if (isLegacyTailwindcssPatcherOptions(options)) {
    const patchOptions = options.patch
    if (!patchOptions) {
      return options
    }
    const nextPatch = {
      ...patchOptions,
      basedir: baseDir,
      cwd: patchOptions.cwd ?? baseDir,
    }
    if (patchOptions.tailwindcss) {
      nextPatch.tailwindcss = {
        ...patchOptions.tailwindcss,
        v4: {
          ...(patchOptions.tailwindcss.v4 ?? {}),
          base: baseDir,
          cssEntries,
        },
      }
    }
    return {
      ...options,
      patch: nextPatch,
    }
  }

  if (!isModernTailwindcssPatchOptions(options)) {
    return options
  }

  if (!options.tailwind) {
    return options
  }

  return {
    ...options,
    tailwind: {
      ...options.tailwind,
      v4: {
        ...(options.tailwind.v4 ?? {}),
        base: baseDir,
        cssEntries,
      },
    },
  }
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

  const defaultTailwindcssConfig: TailwindUserOptions = {
    cwd: baseDir,
    v2: {
      cwd: baseDir,
    },
    v3: {
      cwd: baseDir,
    },
    v4: {
      base: baseDir,
      cssEntries,
    },
  }

  if (cssEntries?.length && (tailwindcss == null || tailwindcss.version == null)) {
    defaultTailwindcssConfig.version = 4
  }

  const mergedTailwindOptions = defuOverrideArray<TailwindUserOptions, TailwindUserOptions[]>(
    (tailwindcss ?? {}) as TailwindUserOptions,
    defaultTailwindcssConfig,
  )

  if (!mergedTailwindOptions.v4) {
    mergedTailwindOptions.v4 = {
      base: baseDir,
      cssEntries: cssEntries ?? [],
    }
  }
  else {
    mergedTailwindOptions.v4.base = baseDir
    if (cssEntries?.length) {
      mergedTailwindOptions.v4.cssEntries = cssEntries
    }
    else if (!mergedTailwindOptions.v4.cssEntries) {
      mergedTailwindOptions.v4.cssEntries = []
    }
  }

  const patchedOptions = overrideTailwindcssPatcherOptionsForBase(
    tailwindcssPatcherOptions,
    baseDir,
    cssEntries ?? [],
  )

  return createTailwindcssPatcher({
    basedir: baseDir,
    supportCustomLengthUnitsPatch: supportCustomLengthUnitsPatch ?? true,
    tailwindcss: mergedTailwindOptions,
    tailwindcssPatcherOptions: patchedOptions,
  })
}

export function createMultiTailwindcssPatcher(patchers: TailwindcssPatcherLike[]): TailwindcssPatcherLike {
  if (patchers.length <= 1) {
    return patchers[0]
  }

  type PatchResult = Awaited<ReturnType<TailwindcssPatcherLike['patch']>>

  const [first] = patchers
  const multiPatcher: TailwindcssPatcherLike = {
    packageInfo: first?.packageInfo,
    majorVersion: first?.majorVersion,
    options: first?.options,
    async patch() {
      let exposeContext: PatchResult['exposeContext']
      let extendLengthUnits: PatchResult['extendLengthUnits']
      for (const patcher of patchers) {
        const result = await patcher.patch()
        if (result?.exposeContext && exposeContext == null) {
          exposeContext = result.exposeContext
        }
        if (result?.extendLengthUnits && extendLengthUnits == null) {
          extendLengthUnits = result.extendLengthUnits
        }
      }
      return {
        exposeContext,
        extendLengthUnits,
      }
    },
    async getClassSet() {
      const aggregated = new Set<string>()
      for (const patcher of patchers) {
        const current = await patcher.getClassSet()
        for (const className of current) {
          aggregated.add(className)
        }
      }
      return aggregated
    },
    async extract(options) {
      const aggregatedSet = new Set<string>()
      const aggregatedList: string[] = []
      let filename: string | undefined
      for (const patcher of patchers) {
        const result = await patcher.extract(options)
        if (!result) {
          continue
        }
        if (filename === undefined && result.filename) {
          filename = result.filename
        }
        if (result.classList) {
          for (const className of result.classList) {
            if (!aggregatedSet.has(className)) {
              aggregatedList.push(className)
            }
            aggregatedSet.add(className)
          }
        }
        if (result.classSet) {
          for (const className of result.classSet) {
            aggregatedSet.add(className)
          }
        }
      }
      return {
        classList: aggregatedList,
        classSet: aggregatedSet,
        filename,
      }
    },
  }

  if (patchers.every(patcher => typeof patcher.getClassSetSync === 'function')) {
    multiPatcher.getClassSetSync = () => {
      const aggregated = new Set<string>()
      for (const patcher of patchers) {
        const current = patcher.getClassSetSync?.()
        if (!current) {
          continue
        }
        for (const className of current) {
          aggregated.add(className)
        }
      }
      return aggregated
    }
  }

  return multiPatcher
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
