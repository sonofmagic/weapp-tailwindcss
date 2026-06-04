import type { TailwindV4SourceOptions, TailwindV4SourceOptionsWithSources } from './types'
import type { TailwindcssPatcherLike } from '@/types'
import path from 'node:path'
import process from 'node:process'
import postcss from 'postcss'
import {
  resolveTailwindV4Source as resolvePatchTailwindV4Source,
  resolveTailwindV4SourceFromPatchOptions,
} from 'tailwindcss-patch'
import { resolveTailwindcssOptions } from '@/tailwindcss/patcher-options'
import { omitUndefined } from '@/utils/object'

function isPostcssPluginImportTarget(value: string | undefined) {
  if (!value) {
    return false
  }
  return value === '@tailwindcss/postcss'
    || value.includes('/postcss')
}

function uniqueDefined(values: Array<string | undefined>) {
  return [...new Set(values.filter((value): value is string => typeof value === 'string' && value.length > 0))]
}

function getProjectRoot(patcher: TailwindcssPatcherLike) {
  return patcher.options?.projectRoot ?? process.cwd()
}

function resolveBase(value: string | undefined, fallback: string) {
  return value === undefined
    ? fallback
    : path.isAbsolute(value)
      ? path.resolve(value)
      : path.resolve(fallback, value)
}

function resolveConfigDir(config: string | undefined, projectRoot: string) {
  if (!config) {
    return undefined
  }
  const configPath = path.isAbsolute(config) ? config : path.resolve(projectRoot, config)
  return path.dirname(configPath)
}

function isBarePackageSpecifier(specifier: string) {
  return !specifier.startsWith('.')
    && !specifier.startsWith('/')
    && !specifier.includes('\\')
    && !/^[a-z][a-z\d+.-]*:/i.test(specifier)
}

function parseCssImportSpecifier(params: string) {
  const value = params.trim()
  const quoted = /^(['"])(.*?)\1/.exec(value)
  if (quoted) {
    const specifier = quoted[2]
    if (specifier === undefined) {
      return undefined
    }
    return {
      quote: quoted[1],
      raw: quoted[0],
      specifier,
    }
  }

  const url = /^url\(\s*(?:(['"])(.*?)\1|([^'")\s]+))\s*\)/.exec(value)
  if (!url) {
    return undefined
  }

  const specifier = url[2] ?? url[3]
  if (specifier === undefined) {
    return undefined
  }
  return {
    quote: url[1],
    raw: url[0],
    specifier,
  }
}

function quoteCssImportSpecifier(specifier: string, quote = '"') {
  return `${quote}${specifier.replaceAll('\\', '\\\\').replaceAll(quote, `\\${quote}`)}${quote}`
}

function createTailwindV4CssImportSpecifierSet(packageName: string | undefined) {
  const specifiers = new Set(['tailwindcss'])
  if (packageName && isBarePackageSpecifier(packageName)) {
    specifiers.add(packageName)
  }
  return specifiers
}

function normalizeTailwindV4CssPackageImports(css: string, packageName: string | undefined) {
  if (!css.includes('tailwindcss')) {
    return css
  }

  let root: postcss.Root
  try {
    root = postcss.parse(css)
  }
  catch {
    return css
  }

  const importSpecifiers = createTailwindV4CssImportSpecifierSet(packageName)
  let changed = false
  root.walkAtRules('import', (rule) => {
    const parsed = parseCssImportSpecifier(rule.params)
    if (!parsed || !importSpecifiers.has(parsed.specifier)) {
      return
    }

    rule.params = rule.params.replace(
      parsed.raw,
      quoteCssImportSpecifier(`${parsed.specifier}/index.css`, parsed.quote),
    )
    changed = true
  })

  return changed ? root.toString() : css
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

function readTailwindV4Options(patcher: TailwindcssPatcherLike) {
  const tailwindOptions = resolveTailwindcssOptions(patcher.options)
  return tailwindOptions?.v4 ?? (patcher.options as any)?.tailwind?.v4
}

function isRawTailwindcssPatchOptions(options: TailwindcssPatcherLike['options']) {
  return Boolean(options && 'tailwindcss' in options)
}

function resolvePatchTailwindV4SourceOptions(patcher: TailwindcssPatcherLike): TailwindV4SourceOptions {
  if (patcher.options) {
    const projectRoot = getProjectRoot(patcher)
    const tailwindOptions = resolveTailwindcssOptions(patcher.options)
    const tailwindV4Options = readTailwindV4Options(patcher)
    const cwd = resolveBase(tailwindOptions?.cwd, projectRoot)
    const configuredBase = (tailwindV4Options as { configuredBase?: string } | undefined)?.configuredBase
      ?? (isRawTailwindcssPatchOptions(patcher.options) ? tailwindV4Options?.base : undefined)
    const configDir = resolveConfigDir(tailwindOptions?.config, projectRoot)
    const baseFallbacks = uniqueDefined([
      configuredBase,
      cwd,
      projectRoot,
      configDir,
    ])
    return {
      projectRoot,
      cwd,
      ...(configuredBase === undefined ? {} : { base: configuredBase }),
      baseFallbacks,
      ...(tailwindV4Options?.css === undefined ? {} : { css: tailwindV4Options.css }),
      ...(tailwindV4Options?.cssSources === undefined ? {} : { cssSources: tailwindV4Options.cssSources }),
      ...(tailwindV4Options?.cssEntries === undefined ? {} : { cssEntries: tailwindV4Options.cssEntries }),
      packageName: resolveTailwindCssImportTarget(patcher),
    }
  }

  return {
    projectRoot: getProjectRoot(patcher),
    packageName: resolveTailwindCssImportTarget(patcher),
  }
}

export function resolveTailwindV4SourceOptionsFromPatcher(
  patcher: TailwindcssPatcherLike,
): TailwindV4SourceOptionsWithSources {
  const tailwindV4Options = readTailwindV4Options(patcher)
  return omitUndefined({
    ...resolvePatchTailwindV4SourceOptions(patcher),
    sources: tailwindV4Options?.sources,
  }) as TailwindV4SourceOptionsWithSources
}

export function resolveTailwindV4Source(options?: TailwindV4SourceOptions) {
  const normalizedOptions = options?.css === undefined
    ? options
    : {
        ...options,
        css: normalizeTailwindV4CssPackageImports(options.css, options.packageName),
      }
  return resolvePatchTailwindV4Source(normalizedOptions)
}

export async function resolveTailwindV4SourceFromPatcher(
  patcher: TailwindcssPatcherLike,
) {
  return resolveTailwindV4Source(resolveTailwindV4SourceOptionsFromPatcher(patcher))
}

export { resolveTailwindV4SourceFromPatchOptions }
