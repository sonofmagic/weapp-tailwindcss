// @ts-nocheck
import type { Buffer } from 'node:buffer'
import type webpack from 'webpack'
import type { AppType } from '@/types'
import process from 'node:process'
import { ensurePosix } from '@weapp-tailwindcss/shared'
import loaderUtils from 'loader-utils'
import { rewriteTailwindcssImportsInCode } from '@/bundlers/shared/css-imports'

interface CssImportRewriteLoaderOptions {
  rewriteCssImports?: {
    pkgDir: string
    appType?: AppType
  }
}

function joinPosixPath(base: string, subpath: string) {
  if (base.endsWith('/')) {
    return `${base}${subpath}`
  }
  return `${base}/${subpath}`
}

function applyCssImportRewrite(source: string, options: CssImportRewriteLoaderOptions | undefined) {
  const rewriteOptions = options?.rewriteCssImports
  const pkgDir = rewriteOptions?.pkgDir
  if (!pkgDir) {
    return source
  }
  const rewritten = rewriteTailwindcssImportsInCode(
    source,
    ensurePosix(pkgDir),
    {
      join: joinPosixPath,
      appType: rewriteOptions.appType,
    },
  )
  return rewritten ?? source
}

export function transformCssImportRewriteSource(
  source: string | Buffer,
  options: CssImportRewriteLoaderOptions | undefined,
) {
  const isBuffer = Buffer.isBuffer(source)
  const input = isBuffer ? source.toString('utf-8') : source
  const rewritten = applyCssImportRewrite(input, options)
  // If unchanged, return original to preserve type.
  if (rewritten === input) {
    return source
  }
  if (process.env.WEAPP_TW_LOADER_DEBUG) {
    // eslint-disable-next-line no-console
    console.log('[weapp-tw-css-import-rewrite-loader] rewritten import', {
      before: input.slice(0, 80),
      after: rewritten.slice(0, 80),
    })
  }
  return rewritten
}

const WeappTwCssImportRewriteLoader: webpack.LoaderDefinitionFunction<CssImportRewriteLoaderOptions> = function (
  this: webpack.LoaderContext<any>,
  source: string | Buffer,
) {
  if (process.env.WEAPP_TW_LOADER_DEBUG) {
    // eslint-disable-next-line no-console
    console.log('[weapp-tw-css-import-rewrite-loader] executing for', this.resourcePath)
  }
  const opt = loaderUtils.getOptions(this)
  return transformCssImportRewriteSource(source, opt)
}

export default WeappTwCssImportRewriteLoader
