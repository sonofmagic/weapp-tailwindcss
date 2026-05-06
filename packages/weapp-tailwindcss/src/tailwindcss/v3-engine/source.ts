import type { Config } from 'tailwindcss'
import type { TailwindV3ResolvedSource, TailwindV3SourceOptions } from './types'
import type { TailwindcssPatcherLike } from '@/types'
import path from 'node:path'
import process from 'node:process'
import postcss from 'postcss'
import { loadConfig } from 'tailwindcss-config'
import { resolveTailwindcssOptions } from '@/tailwindcss/patcher-options'

const DEFAULT_TAILWIND_V3_CSS = [
  '@tailwind base;',
  '@tailwind components;',
  '@tailwind utilities;',
].join('\n')

function parseConfigParam(params: string) {
  const value = params.trim()
  const match = /^(['"])(.+)\1$/.exec(value)
  return match?.[2]
}

function resolveOptionalPath(value: string | undefined, base: string) {
  if (!value) {
    return undefined
  }
  return path.isAbsolute(value) ? value : path.resolve(base, value)
}

function resolveCssConfig(css: string | undefined, base: string) {
  if (!css) {
    return {
      css,
      config: undefined,
    }
  }

  const root = postcss.parse(css)
  let config: string | undefined
  root.walkAtRules('config', (rule) => {
    const configPath = parseConfigParam(rule.params)
    if (!configPath) {
      return
    }
    if (!config) {
      config = resolveOptionalPath(configPath, base)
    }
    rule.remove()
  })

  return {
    config,
    css: root.toString(),
  }
}

function getProjectRoot(patcher: TailwindcssPatcherLike) {
  return patcher.options?.projectRoot ?? process.cwd()
}

function normalizeLoadedConfig(config: Config | undefined) {
  if (!config || typeof config !== 'object') {
    return config
  }
  const maybeDefault = (config as { default?: unknown }).default
  if (maybeDefault && typeof maybeDefault === 'object') {
    return maybeDefault as Config
  }
  return config
}

function resolveTailwindCssPackageName(patcher: TailwindcssPatcherLike) {
  const tailwindOptions = resolveTailwindcssOptions(patcher.options)
  return tailwindOptions?.packageName ?? patcher.packageInfo?.name ?? 'tailwindcss'
}

export async function resolveTailwindV3Source(
  options: TailwindV3SourceOptions = {},
): Promise<TailwindV3ResolvedSource> {
  const projectRoot = options.projectRoot ?? process.cwd()
  const base = options.base ?? options.cwd ?? projectRoot
  const cssConfig = resolveCssConfig(options.css, base)
  const config = resolveOptionalPath(options.config, base) ?? cssConfig.config
  const cwd = options.cwd ?? (config ? path.dirname(config) : projectRoot)
  const loaded = await loadConfig({
    config,
    cwd,
  })

  return {
    version: 3,
    projectRoot,
    cwd,
    base,
    css: cssConfig.css ?? options.css ?? DEFAULT_TAILWIND_V3_CSS,
    config: loaded?.filepath ?? config,
    configObject: normalizeLoadedConfig(loaded?.config as Config | undefined),
    dependencies: loaded?.filepath ? [loaded.filepath] : [],
    packageName: options.packageName ?? 'tailwindcss',
    postcssPlugin: options.postcssPlugin ?? options.packageName ?? 'tailwindcss',
  }
}

export function resolveTailwindV3SourceOptionsFromPatcher(
  patcher: TailwindcssPatcherLike,
): TailwindV3SourceOptions {
  const projectRoot = getProjectRoot(patcher)
  const tailwindOptions = resolveTailwindcssOptions(patcher.options)
  return {
    projectRoot,
    cwd: tailwindOptions?.v3?.cwd ?? tailwindOptions?.cwd ?? projectRoot,
    config: tailwindOptions?.v3?.config ?? tailwindOptions?.config,
    packageName: resolveTailwindCssPackageName(patcher),
    postcssPlugin: tailwindOptions?.v3?.postcssPlugin ?? tailwindOptions?.postcssPlugin,
  }
}

export function resolveTailwindV3SourceFromPatcher(
  patcher: TailwindcssPatcherLike,
) {
  return resolveTailwindV3Source(resolveTailwindV3SourceOptionsFromPatcher(patcher))
}
