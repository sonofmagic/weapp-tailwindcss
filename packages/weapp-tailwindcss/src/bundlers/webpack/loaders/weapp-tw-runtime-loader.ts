// @ts-nocheck
import type { Buffer } from 'node:buffer'
import type webpack from 'webpack'
import loaderUtils from 'loader-utils'
import { rewriteTailwindcssImportsInCode } from '@/bundlers/shared/css-imports'

interface RuntimeLoaderOptions {
  getClassSet?: () => void | Promise<void>
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

function applyCssImportRewrite(source: string, options: RuntimeLoaderOptions | undefined) {
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

function transformSource(source: string | Buffer, options: RuntimeLoaderOptions | undefined) {
  if (Buffer.isBuffer(source)) {
    return source
  }
  return applyCssImportRewrite(source, options)
}

const WeappTwRuntimeAopLoader: webpack.LoaderDefinitionFunction<RuntimeLoaderOptions> = function (
  this: webpack.LoaderContext<any>,
  source: string | Buffer,
) {
  const opt = loaderUtils.getOptions(this) // 等同于 this.getCompilerContext()
  const maybePromise = opt?.getClassSet?.()
  if (maybePromise && typeof (maybePromise as PromiseLike<void>).then === 'function') {
    return Promise.resolve(maybePromise).then(() => transformSource(source, opt))
  }
  return transformSource(source, opt)
}

export default WeappTwRuntimeAopLoader
