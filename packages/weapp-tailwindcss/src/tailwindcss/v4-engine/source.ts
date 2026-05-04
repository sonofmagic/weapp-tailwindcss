import type { TailwindV4ResolvedSource, TailwindV4SourceOptions } from './types'
import type { TailwindcssPatcherLike } from '@/types'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { resolveTailwindcssOptions } from '@/tailwindcss/patcher-options'

function toPosixPath(value: string) {
  return value.replaceAll('\\', '/')
}

function createCssImportSource(imports: string[]) {
  return imports.map(value => `@import "${toPosixPath(value)}";`).join('\n')
}

function isPostcssPluginImportTarget(value: string | undefined) {
  if (!value) {
    return false
  }
  return value === '@tailwindcss/postcss'
    || value === '@tailwindcss/postcss7-compat'
    || value.includes('/postcss')
}

function resolveMaybeAbsolute(base: string, value: string | undefined) {
  if (!value) {
    return undefined
  }
  return path.isAbsolute(value) ? path.normalize(value) : path.resolve(base, value)
}

function uniqueDefined(values: Array<string | undefined>) {
  return [...new Set(values.filter((value): value is string => typeof value === 'string' && value.length > 0))]
}

function normalizeCssEntries(entries: string[] | undefined, anchor: string) {
  if (!entries || entries.length === 0) {
    return []
  }
  return uniqueDefined(entries.map(entry => resolveMaybeAbsolute(anchor, entry)))
}

export async function resolveTailwindV4Source(options: TailwindV4SourceOptions = {}): Promise<TailwindV4ResolvedSource> {
  const projectRoot = path.resolve(options.projectRoot ?? options.base ?? process.cwd())
  const configuredBase = resolveMaybeAbsolute(projectRoot, options.base)
  const configuredFallbacks = uniqueDefined(options.baseFallbacks?.map(item => resolveMaybeAbsolute(projectRoot, item)) ?? [])

  if (typeof options.css === 'string' && options.css.length > 0) {
    const base = configuredBase ?? projectRoot
    return {
      projectRoot,
      base,
      baseFallbacks: uniqueDefined([
        ...configuredFallbacks,
        projectRoot,
      ].filter(item => item !== base)),
      css: options.css,
      dependencies: [],
    }
  }

  const cssEntries = normalizeCssEntries(options.cssEntries, projectRoot)
  if (cssEntries.length > 0) {
    const cssChunks: string[] = []
    const entryDirs: string[] = []
    const dependencies: string[] = []

    for (const entry of cssEntries) {
      try {
        cssChunks.push(await readFile(entry, 'utf8'))
        entryDirs.push(path.dirname(entry))
        dependencies.push(entry)
      }
      catch {
        dependencies.push(entry)
      }
    }

    if (cssChunks.length > 0) {
      const base = entryDirs[0] ?? configuredBase ?? projectRoot
      return {
        projectRoot,
        base,
        baseFallbacks: uniqueDefined([
          ...entryDirs.slice(1),
          ...configuredFallbacks,
          configuredBase,
          projectRoot,
        ].filter(item => item !== base)),
        css: cssChunks.join('\n'),
        dependencies,
      }
    }

    const base = configuredBase ?? projectRoot
    return {
      projectRoot,
      base,
      baseFallbacks: uniqueDefined([
        ...configuredFallbacks,
        projectRoot,
      ].filter(item => item !== base)),
      css: createCssImportSource(cssEntries),
      dependencies,
    }
  }

  const base = configuredBase ?? projectRoot
  return {
    projectRoot,
    base,
    baseFallbacks: uniqueDefined([
      ...configuredFallbacks,
      projectRoot,
    ].filter(item => item !== base)),
    css: createCssImportSource([options.packageName ?? 'tailwindcss']),
    dependencies: [],
  }
}

function getProjectRoot(patcher: TailwindcssPatcherLike) {
  return patcher.options?.projectRoot ?? process.cwd()
}

function resolveTailwindCssImportTarget(patcher: TailwindcssPatcherLike) {
  const tailwindOptions = resolveTailwindcssOptions(patcher.options)
  const configuredPackageName = tailwindOptions?.packageName
  if (
    typeof configuredPackageName === 'string'
    && configuredPackageName.length > 0
    && !isPostcssPluginImportTarget(configuredPackageName)
  ) {
    return configuredPackageName
  }

  const packageName = patcher.packageInfo?.name
  if (
    typeof packageName === 'string'
    && packageName.length > 0
    && !isPostcssPluginImportTarget(packageName)
  ) {
    return packageName
  }

  return 'tailwindcss'
}

export function resolveTailwindV4SourceOptionsFromPatcher(
  patcher: TailwindcssPatcherLike,
): TailwindV4SourceOptions {
  const projectRoot = getProjectRoot(patcher)
  const tailwindOptions = resolveTailwindcssOptions(patcher.options)
  const configDir = tailwindOptions?.config ? path.dirname(tailwindOptions.config) : undefined
  return {
    projectRoot,
    base: tailwindOptions?.v4?.base,
    baseFallbacks: uniqueDefined([
      tailwindOptions?.cwd,
      configDir,
    ]),
    css: tailwindOptions?.v4?.css,
    cssEntries: tailwindOptions?.v4?.cssEntries,
    packageName: resolveTailwindCssImportTarget(patcher),
  }
}

export async function resolveTailwindV4SourceFromPatcher(
  patcher: TailwindcssPatcherLike,
) {
  return resolveTailwindV4Source(resolveTailwindV4SourceOptionsFromPatcher(patcher))
}
