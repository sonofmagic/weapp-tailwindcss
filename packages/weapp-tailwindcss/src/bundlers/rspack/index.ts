import type { WebpackCssImportRewriteLoaderOptions } from '../webpack/loaders/runtime-registry'
import path from 'node:path'
import { WeappTailwindcss, weappTailwindcssPackageDir } from '../webpack'

export { WeappTailwindcss, weappTailwindcss, weappTailwindcssPackageDir }

const weappTailwindcss = WeappTailwindcss

type RspackUseItem = string | {
  loader?: string
  options?: unknown
  [key: string]: unknown
}

interface RspackRuleLike {
  oneOf?: unknown[]
  rules?: unknown[]
  use?: RspackUseItem | RspackUseItem[]
  [key: string]: unknown
}

export interface PatchRspackCssImportRewriteLoaderOptions {
  loader?: string
  options?: WebpackCssImportRewriteLoaderOptions
}

export interface PatchRspackConfigOptions {
  /**
   * 注入 weapp-tailwindcss CSS 入口 loader。默认开启。
   */
  cssImportRewriteLoader?: boolean | PatchRspackCssImportRewriteLoaderOptions
  /**
   * 是否移除 Rspack/Rsbuild 内置 Lightning CSS loader。默认保留。
   */
  removeLightningCssLoader?: boolean
}

export interface RspackConfigLike {
  module?: {
    rules?: unknown[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

const CSS_IMPORT_REWRITE_LOADER_NAME = 'weapp-tw-css-import-rewrite-loader'
const LIGHTNING_CSS_LOADER_NAME = 'builtin:lightningcss-loader'
const CSS_LOADER_NAME = 'css-loader'
const POSTCSS_LOADER_NAME = 'postcss-loader'

function isRuleLike(value: unknown): value is RspackRuleLike {
  return typeof value === 'object' && value !== null
}

function normalizeUse(use: RspackRuleLike['use']): RspackUseItem[] | undefined {
  if (Array.isArray(use)) {
    return use
  }
  if (use === undefined) {
    return undefined
  }
  return [use]
}

function getLoaderName(item: RspackUseItem | undefined) {
  if (typeof item === 'string') {
    return item
  }
  return item?.loader
}

function includesLoaderName(item: RspackUseItem | undefined, name: string) {
  return getLoaderName(item)?.includes(name) === true
}

function createCssImportRewriteLoaderEntry(options: PatchRspackCssImportRewriteLoaderOptions): RspackUseItem {
  return {
    loader: options.loader ?? path.resolve(__dirname, `./${CSS_IMPORT_REWRITE_LOADER_NAME}.js`),
    ...(options.options === undefined ? {} : { options: options.options }),
  }
}

function resolveCssImportRewriteOptions(
  options: PatchRspackConfigOptions,
): PatchRspackCssImportRewriteLoaderOptions | undefined {
  const cssImportRewriteLoader = options.cssImportRewriteLoader ?? true
  if (cssImportRewriteLoader === false) {
    return undefined
  }
  return cssImportRewriteLoader === true ? {} : cssImportRewriteLoader
}

function patchRuleUse(rule: RspackRuleLike, options: PatchRspackConfigOptions) {
  let use = normalizeUse(rule.use)
  if (!use) {
    return
  }

  if (options.removeLightningCssLoader) {
    use = use.filter(item => !includesLoaderName(item, LIGHTNING_CSS_LOADER_NAME))
  }

  const cssImportRewriteOptions = resolveCssImportRewriteOptions(options)
  if (cssImportRewriteOptions) {
    const existingIndex = use.findIndex(item => includesLoaderName(item, CSS_IMPORT_REWRITE_LOADER_NAME))
    const existing = existingIndex === -1 ? undefined : use.splice(existingIndex, 1)[0]
    const anchorIndex = use.findIndex(item => includesLoaderName(item, LIGHTNING_CSS_LOADER_NAME))
    const fallbackAnchorIndex = anchorIndex === -1
      ? use.findIndex(item => includesLoaderName(item, CSS_LOADER_NAME) || includesLoaderName(item, POSTCSS_LOADER_NAME))
      : anchorIndex
    if (fallbackAnchorIndex !== -1) {
      const loaderEntry = existing ?? createCssImportRewriteLoaderEntry(cssImportRewriteOptions)
      use.splice(fallbackAnchorIndex + 1, 0, loaderEntry)
    }
  }

  rule.use = use
}

function walkRspackRule(rule: unknown, options: PatchRspackConfigOptions) {
  if (!isRuleLike(rule)) {
    return
  }

  patchRuleUse(rule, options)

  if (Array.isArray(rule.oneOf)) {
    rule.oneOf.forEach(item => walkRspackRule(item, options))
  }
  if (Array.isArray(rule.rules)) {
    rule.rules.forEach(item => walkRspackRule(item, options))
  }
}

export function patchRspackConfig(config: RspackConfigLike, options: PatchRspackConfigOptions = {}) {
  for (const rule of config.module?.rules ?? []) {
    walkRspackRule(rule, options)
  }
  return config
}
