// @ts-nocheck
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

const WeappTwRuntimeAopLoader: webpack.LoaderDefinitionFunction<RuntimeLoaderOptions> = function (
  this: webpack.LoaderContext<any>,
  source: string,
) {
  const opt = loaderUtils.getOptions(this) // 等同于 this.getCompilerContext()
  const maybePromise = opt?.getClassSet?.()
  if (maybePromise && typeof (maybePromise as PromiseLike<void>).then === 'function') {
    return Promise.resolve(maybePromise).then(() => applyCssImportRewrite(source, opt))
  }
  return applyCssImportRewrite(source, opt)
}

export default WeappTwRuntimeAopLoader
