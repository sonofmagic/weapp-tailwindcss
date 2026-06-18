import type { TailwindV4SourceOptions, TailwindV4SourceOptionsWithSources } from './types'
import type { TailwindcssPatcherLike } from '@/types'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import {
  resolveTailwindV4Source as resolveEngineTailwindV4Source,
} from '@tailwindcss-mangle/engine'
import { postcss } from '@weapp-tailwindcss/postcss'
import { normalizeConfigDirective } from '@/bundlers/shared/generator-css/config-directive'
import { normalizeTailwindConfigDirectives, resolveCssEntrySource } from '@/bundlers/shared/generator-css/directives'
import { resolveTailwindcssOptions } from '@/tailwindcss/patcher-options'
import { omitUndefined } from '@/utils/object'

const require = createRequire(import.meta.url)

function isCssEntryPoint(file: string | undefined) {
  return typeof file === 'string'
    && path.basename(file) === 'index.css'
    && existsSync(file)
}

function resolvePackageCssEntryPoint(specifier: string) {
  try {
    const resolved = require.resolve(specifier)
    if (isCssEntryPoint(resolved)) {
      return resolved
    }
  }
  catch {
  }

  const packageName = specifier.replace(/\/index\.css$/, '')
  if (packageName !== 'tailwindcss') {
    return undefined
  }

  try {
    const packageJson = require.resolve(`${packageName}/package.json`)
    const cssEntry = path.resolve(path.dirname(packageJson), 'index.css')
    if (isCssEntryPoint(cssEntry)) {
      return cssEntry
    }
  }
  catch {
  }

  try {
    let current = path.dirname(require.resolve('@tailwindcss-mangle/engine'))
    while (true) {
      const cssEntry = path.resolve(current, '..', 'tailwindcss', 'index.css')
      if (isCssEntryPoint(cssEntry)) {
        return cssEntry
      }
      const parent = path.dirname(current)
      if (parent === current) {
        break
      }
      current = parent
    }
  }
  catch {
  }

  return undefined
}

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
    && !specifier.startsWith('#')
    && !specifier.includes('\\')
    && !/^[a-z][a-z\d+.-]*:/i.test(specifier)
}

function isPackageJsonImportSpecifier(specifier: string | undefined) {
  return typeof specifier === 'string' && specifier.startsWith('#')
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
  root.walkAtRules((rule) => {
    if (rule.name !== 'import' && rule.name !== 'reference') {
      return
    }
    const parsed = parseCssImportSpecifier(rule.params)
    if (!parsed || !importSpecifiers.has(parsed.specifier)) {
      return
    }
    const cssEntryPoint = resolvePackageCssEntryPoint(`${parsed.specifier}/index.css`)
    if (!cssEntryPoint) {
      return
    }

    rule.params = rule.params.replace(
      parsed.raw,
      quoteCssImportSpecifier(cssEntryPoint, parsed.quote),
    )
    changed = true
  })

  return changed ? root.toString() : css
}

function normalizeTailwindV4CssSources(
  cssSources: TailwindV4SourceOptions['cssSources'],
  packageName: string | undefined,
  projectRoot: string | undefined,
) {
  if (!cssSources?.length) {
    return cssSources
  }

  let changed = false
  const normalizedCssSources = cssSources.map((cssSource) => {
    const file = typeof cssSource.file === 'string' && cssSource.file.length > 0
      ? path.isAbsolute(cssSource.file)
        ? path.resolve(cssSource.file)
        : path.resolve(projectRoot ?? process.cwd(), cssSource.file)
      : undefined
    const base = typeof cssSource.base === 'string' && cssSource.base.length > 0
      ? path.isAbsolute(cssSource.base)
        ? path.resolve(cssSource.base)
        : path.resolve(projectRoot ?? process.cwd(), cssSource.base)
      : file
        ? path.dirname(file)
        : undefined
    if (typeof cssSource.css !== 'string') {
      if (file === cssSource.file && base === cssSource.base) {
        return cssSource
      }
      changed = true
      return {
        ...cssSource,
        ...(base === undefined ? {} : { base }),
        ...(file === undefined ? {} : { file }),
      }
    }
    const configBase = base ?? projectRoot ?? process.cwd()
    const css = normalizeTailwindV4CssPackageImports(
      normalizeTailwindConfigDirectives(cssSource.css, configBase),
      packageName,
    )
    if (css === cssSource.css && file === cssSource.file && base === cssSource.base) {
      return cssSource
    }
    changed = true
    return {
      ...cssSource,
      css,
      ...(base === undefined ? {} : { base }),
      ...(file === undefined ? {} : { file }),
    }
  })

  return changed ? normalizedCssSources : cssSources
}

function normalizeTailwindV4CssEntrySources(
  cssEntries: TailwindV4SourceOptions['cssEntries'],
  packageName: string | undefined,
) {
  if (!cssEntries?.length) {
    return undefined
  }

  const remainingCssEntries: string[] = []
  const cssSources: NonNullable<TailwindV4SourceOptions['cssSources']> = []
  for (const cssEntry of cssEntries) {
    const file = path.resolve(cssEntry)
    if (!existsSync(file)) {
      remainingCssEntries.push(cssEntry)
      continue
    }
    const base = path.dirname(file)
    const rawCss = readFileSync(file, 'utf8')
    const entrySource = resolveCssEntrySource(rawCss, base, {
      removeConfig: false,
    })
    const config = entrySource?.config && existsSync(entrySource.config)
      ? entrySource.config
      : entrySource?.configRequest && !path.isAbsolute(entrySource.configRequest) && !isPackageJsonImportSpecifier(entrySource.configRequest)
        ? path.resolve(base, entrySource.configRequest)
        : entrySource?.config
    const css = normalizeTailwindV4CssPackageImports(
      normalizeConfigDirective(rawCss, config),
      packageName,
    )
    cssSources.push({
      file,
      base,
      css,
      dependencies: [file],
    })
  }

  return {
    cssEntries: remainingCssEntries,
    cssSources,
  }
}

function normalizeTailwindV4SourceOptions(options: TailwindV4SourceOptions | undefined) {
  if (!options) {
    return options
  }

  const css = options.css === undefined
    ? undefined
    : normalizeTailwindV4CssPackageImports(options.css, options.packageName)
  const entrySources = normalizeTailwindV4CssEntrySources(options.cssEntries, options.packageName)
  const combinedCssSources = options.cssSources || entrySources?.cssSources
    ? [
        ...(options.cssSources ?? []),
        ...(entrySources?.cssSources ?? []),
      ]
    : undefined
  const cssSources = normalizeTailwindV4CssSources(
    combinedCssSources,
    options.packageName,
    options.projectRoot,
  )
  const cssEntries = entrySources?.cssEntries ?? options.cssEntries
  if (css === options.css && cssSources === options.cssSources && cssEntries === options.cssEntries) {
    return options
  }

  return {
    ...options,
    ...(css === undefined ? {} : { css }),
    ...(cssEntries === undefined ? {} : { cssEntries }),
    ...(cssSources === undefined ? {} : { cssSources }),
  }
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

function resolveEngineTailwindV4SourceOptions(patcher: TailwindcssPatcherLike): TailwindV4SourceOptions {
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
    ...resolveEngineTailwindV4SourceOptions(patcher),
    sources: tailwindV4Options?.sources,
  }) as TailwindV4SourceOptionsWithSources
}

export function resolveTailwindV4Source(options?: TailwindV4SourceOptions) {
  const normalizedOptions = normalizeTailwindV4SourceOptions(options)
  return resolveEngineTailwindV4Source(normalizedOptions)
}

export function resolveTailwindV4SourceFromPatchOptions(options?: {
  projectRoot?: string
  tailwindcss?: {
    cwd?: string
    packageName?: string
    config?: string
    v4?: TailwindV4SourceOptions
  }
}) {
  const projectRoot = options?.projectRoot ?? process.cwd()
  const tailwindOptions = options?.tailwindcss
  const v4Options = tailwindOptions?.v4
  return resolveTailwindV4Source({
    projectRoot,
    cwd: resolveBase(tailwindOptions?.cwd, projectRoot),
    packageName: tailwindOptions?.packageName ?? 'tailwindcss',
    ...(v4Options ?? {}),
  })
}

export async function resolveTailwindV4SourceFromPatcher(
  patcher: TailwindcssPatcherLike,
) {
  return resolveTailwindV4Source(resolveTailwindV4SourceOptionsFromPatcher(patcher))
}
