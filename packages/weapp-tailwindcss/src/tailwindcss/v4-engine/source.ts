import type { TailwindV4SourceOptions } from './types'
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

function readConfiguredV4Base(tailwindOptions: unknown) {
  const v4 = typeof tailwindOptions === 'object' && tailwindOptions !== null ? tailwindOptions : undefined
  if (typeof v4 !== 'object' || v4 === null) {
    return undefined
  }
  return (v4 as { configuredBase?: string }).configuredBase
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

export function resolveTailwindV4SourceOptionsFromPatcher(
  patcher: TailwindcssPatcherLike,
): TailwindV4SourceOptions {
  const projectRoot = getProjectRoot(patcher)
  const tailwindOptions = resolveTailwindcssOptions(patcher.options)
  const tailwindV4Options = readTailwindV4Options(patcher)
  const configDir = tailwindOptions?.config ? path.dirname(tailwindOptions.config) : undefined
  const configuredBase = readConfiguredV4Base(tailwindV4Options)
  const hasCssEntries = Boolean(tailwindV4Options?.cssEntries?.length)
  return omitUndefined({
    projectRoot,
    base: configuredBase ?? (hasCssEntries ? undefined : tailwindV4Options?.base),
    baseFallbacks: uniqueDefined([
      tailwindOptions?.cwd,
      configDir,
    ]),
    css: tailwindV4Options?.css,
    cssSources: tailwindV4Options?.cssSources,
    cssEntries: tailwindV4Options?.cssEntries,
    sources: tailwindV4Options?.sources,
    packageName: resolveTailwindCssImportTarget(patcher),
  }) as TailwindV4SourceOptions
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
