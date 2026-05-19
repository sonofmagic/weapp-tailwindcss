import type { TailwindV4CssSource } from 'tailwindcss-patch'
import type webpack from 'webpack'
import type { AppType } from '@/types'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import process from 'node:process'
import { inspect } from 'node:util'
import { ensurePosix } from '@weapp-tailwindcss/shared'
import loaderUtils from 'loader-utils'
import { rewriteTailwindcssImportsInCode } from '@/bundlers/shared/css-imports'
import { hasTailwindRootDirectives, normalizeTailwindSourceForGenerator } from '@/bundlers/shared/generator-css/directives'

interface CssImportRewriteLoaderOptions {
  tailwindcssImportRewrite?: {
    pkgDir: string
    appType?: AppType
    registerCssSource?: (source: TailwindV4CssSource) => Promise<void> | void
  }
}

const getLoaderOptions = (loaderUtils as unknown as {
  getOptions: (context: webpack.LoaderContext<CssImportRewriteLoaderOptions>) => CssImportRewriteLoaderOptions | undefined
}).getOptions

function joinPosixPath(base: string, subpath: string) {
  if (base.endsWith('/')) {
    return `${base}${subpath}`
  }
  return `${base}/${subpath}`
}

function applyCssImportRewrite(source: string, options: CssImportRewriteLoaderOptions | undefined) {
  const rewriteOptions = options?.tailwindcssImportRewrite
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

function isPackageJsonImportRequest(request: string) {
  return request.startsWith('#')
}

function toRootRelativeConfigPath(configPath: string, rootContext: string | undefined) {
  if (!rootContext) {
    return ensurePosix(configPath)
  }
  const relative = ensurePosix(path.relative(rootContext, configPath))
  return relative.startsWith('.') ? relative : `./${relative}`
}

function normalizeCssConfigDirectives(source: string, resourcePath?: string, rootContext?: string) {
  if (!resourcePath) {
    return source
  }
  const base = path.dirname(resourcePath)
  return source.replace(/@config\s+(["'])(.+?)\1\s*;?/g, (full, quote: string, request: string) => {
    if (path.isAbsolute(request) || isPackageJsonImportRequest(request)) {
      return full
    }
    const resolved = path.resolve(base, request)
    return `@config ${quote}${toRootRelativeConfigPath(resolved, rootContext)}${quote};`
  })
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
  if (process.env['WEAPP_TW_LOADER_DEBUG']) {
    process.stdout.write(`[weapp-tw-css-import-rewrite-loader] rewritten import ${inspect({
      before: input.slice(0, 80),
      after: rewritten.slice(0, 80),
    })}\n`)
  }
  return rewritten
}

const WeappTwCssImportRewriteLoader: webpack.LoaderDefinitionFunction<CssImportRewriteLoaderOptions> = function (
  this: webpack.LoaderContext<CssImportRewriteLoaderOptions>,
  source: string | Buffer,
) {
  if (process.env['WEAPP_TW_LOADER_DEBUG']) {
    process.stdout.write(`[weapp-tw-css-import-rewrite-loader] executing for ${this.resourcePath}\n`)
  }
  const opt = getLoaderOptions(this)
  const input = Buffer.isBuffer(source) ? source.toString('utf-8') : source
  const registerTask = typeof input === 'string' && hasTailwindRootDirectives(input, { importFallback: true })
    ? opt?.tailwindcssImportRewrite?.registerCssSource?.({
        file: this.resourcePath,
        css: normalizeCssConfigDirectives(
          normalizeTailwindSourceForGenerator(input, { importFallback: true }),
          this.resourcePath,
          this.rootContext,
        ),
      })
    : undefined
  const transform = () => {
    const transformed = transformCssImportRewriteSource(source, opt)
    if (typeof transformed === 'string') {
      return normalizeCssConfigDirectives(transformed, this.resourcePath, this.rootContext)
    }
    return transformed
  }
  if (registerTask && typeof (registerTask as PromiseLike<void>).then === 'function') {
    return Promise.resolve(registerTask).then(transform)
  }
  return transform()
}

export default WeappTwCssImportRewriteLoader
