// @ts-nocheck
import type { Buffer } from 'node:buffer'
import type webpack from 'webpack'
import process from 'node:process'
import loaderUtils from 'loader-utils'
import { rewriteTailwindcssImportsInCode } from '@/bundlers/shared/css-imports'

interface CssImportRewriteLoaderOptions {
  rewriteCssImports?: {
    pkgDir: string
  }
}

function slash(p: string): string {
  return p.replace(/\\/g, '/')
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
  const rewritten = rewriteTailwindcssImportsInCode(source, slash(pkgDir), {
    join: joinPosixPath,
  })
  return rewritten ?? source
}

function transformSource(source: string | Buffer, options: CssImportRewriteLoaderOptions | undefined) {
  if (Buffer.isBuffer(source)) {
    return source
  }
  return applyCssImportRewrite(source, options)
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
  return transformSource(source, opt)
}

export default WeappTwCssImportRewriteLoader
